// Groundwork real synthesis endpoint (run R3+).
// POST /api/synthesize - no request body content is used; the dataset is fixed
// and bundled. The provider key lives only in server-side env vars.
// Env: AI_PROVIDER = 'gemini' | 'openai'; GEMINI_API_KEY or OPENAI_API_KEY;
// optional AI_MODEL_GEMINI / AI_MODEL_OPENAI overrides; optional RUN_TOKEN
// (when set, callers must send header x-gw-run-token).
// Never fabricates a run: invalid or missing model output returns 502.

import { feedback } from '../src/data';

const PROMPT_VERSION = 'synth-v1';
const MAX_OUTPUT_TOKENS = 8192;
const RATE_LIMIT_PER_HOUR = 10;
const hits = new Map<string, number[]>(); // best-effort per warm instance

const SCHEMA = {
  type: 'object',
  properties: {
    themes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          summary: { type: 'string' },
          citations: { type: 'array', items: { type: 'string' } },
          suggestion: {
            type: 'object',
            properties: {
              impact: { type: 'string', enum: ['high', 'medium', 'low'] },
              effort: { type: 'string', enum: ['high', 'medium', 'low'] },
              rationale: { type: 'string' },
            },
            required: ['impact', 'effort', 'rationale'],
          },
        },
        required: ['title', 'summary', 'citations', 'suggestion'],
      },
    },
  },
  required: ['themes'],
};

const SYSTEM = [
  'You are the synthesis engine of Groundwork, a feedback-triage tool for product managers.',
  'You receive raw customer feedback items (in Portuguese, about a fictional Brazilian insurance product) and produce structured themes in English.',
  'Rules:',
  '- Every theme must cite only feedback ids that genuinely support it, and cite all items that support it.',
  '- Never invent an issue that is not present in the items.',
  '- Merge items that describe the same underlying issue, including near-duplicates by the same author.',
  '- Summary: 1-3 sentences, concrete, mentioning volume and channels.',
  '- Suggestion: impact and effort (high|medium|low) with a one-sentence rationale a PM could challenge.',
  '- Output only JSON matching the required schema.',
].join('\n');

function userPrompt(): string {
  const items = feedback.map((f) => ({ id: f.id, channel: f.channel, author: f.author, date: f.date, text: f.text }));
  return `Feedback items (${items.length}):\n${JSON.stringify(items)}\n\nProduce 8-12 themes.`;
}

export interface CleanTheme {
  title: string;
  summary: string;
  citations: string[];
  suggestion: { impact: string; effort: string; rationale: string };
}

// Returns validated themes, or throws with a detail message. Anything that
// cannot be proven to be model output in the right shape aborts the run.
export function validateThemes(raw: any): { themes: CleanTheme[]; droppedCitations: number; droppedThemes: number } {
  const validIds = new Set(feedback.map((f) => f.id));
  if (!raw || !Array.isArray(raw.themes)) throw new Error('output is not an object with a themes array');
  const themes: CleanTheme[] = [];
  let droppedCitations = 0;
  let droppedThemes = 0;
  for (const t of raw.themes) {
    if (!t || typeof t.title !== 'string' || typeof t.summary !== 'string' || !Array.isArray(t.citations)) { droppedThemes++; continue; }
    const citations = [...new Set<string>(t.citations.filter((c: any) => typeof c === 'string'))].filter((c) => {
      const ok = validIds.has(c);
      if (!ok) droppedCitations++;
      return ok;
    });
    if (citations.length === 0) { droppedThemes++; continue; }
    const s = t.suggestion ?? {};
    const lvl = (v: any) => (v === 'high' || v === 'medium' || v === 'low' ? v : 'medium');
    themes.push({
      title: t.title.slice(0, 200),
      summary: t.summary.slice(0, 1200),
      citations,
      suggestion: { impact: lvl(s.impact), effort: lvl(s.effort), rationale: typeof s.rationale === 'string' ? s.rationale.slice(0, 500) : '' },
    });
  }
  if (themes.length < 3) throw new Error(`only ${themes.length} usable theme(s) after validation`);
  return { themes, droppedCitations, droppedThemes };
}

async function callGemini(model: string, key: string): Promise<{ raw: any; usage: any }> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt() }] }],
      generationConfig: { responseMimeType: 'application/json', responseSchema: SCHEMA, maxOutputTokens: MAX_OUTPUT_TOKENS, temperature: 0.2 },
    }),
    signal: AbortSignal.timeout(55_000),
  });
  const body: any = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`gemini HTTP ${res.status}: ${JSON.stringify(body)?.slice(0, 300)}`);
  const text = body?.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? '').join('') ?? '';
  if (body?.candidates?.[0]?.finishReason === 'MAX_TOKENS') throw new Error('gemini output truncated at MAX_TOKENS');
  try { return { raw: JSON.parse(text), usage: body?.usageMetadata ?? null }; }
  catch { throw new Error('gemini returned non-JSON content'); }
}

async function callOpenAI(model: string, key: string): Promise<{ raw: any; usage: any }> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: userPrompt() },
      ],
      response_format: { type: 'json_schema', json_schema: { name: 'groundwork_synthesis', schema: SCHEMA, strict: true } },
      max_completion_tokens: MAX_OUTPUT_TOKENS,
      reasoning_effort: 'low', // Luna is a reasoning model; keep thinking budget small. No temperature param: reasoning models reject it.
    }),
    signal: AbortSignal.timeout(55_000),
  });
  const body: any = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`openai HTTP ${res.status}: ${JSON.stringify(body)?.slice(0, 300)}`);
  const msg = body?.choices?.[0]?.message;
  if (body?.choices?.[0]?.finish_reason === 'length') throw new Error('openai output truncated at max tokens');
  if (msg?.refusal) throw new Error(`openai refusal: ${String(msg.refusal).slice(0, 200)}`);
  try { return { raw: JSON.parse(msg?.content ?? ''), usage: body?.usage ?? null }; }
  catch { throw new Error('openai returned non-JSON content'); }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method-not-allowed' }); return; }

  const provider = (process.env.AI_PROVIDER ?? '').toLowerCase();
  const key = provider === 'gemini' ? process.env.GEMINI_API_KEY : provider === 'openai' ? process.env.OPENAI_API_KEY : undefined;
  if (!provider || !key) { res.status(501).json({ error: 'not-configured', detail: 'No provider key configured on this deployment. Set AI_PROVIDER and the provider API key as env vars.' }); return; }

  if (process.env.RUN_TOKEN && req.headers?.['x-gw-run-token'] !== process.env.RUN_TOKEN) {
    res.status(401).json({ error: 'run-token-required' }); return;
  }

  const ip = String(req.headers?.['x-forwarded-for'] ?? req.socket?.remoteAddress ?? 'unknown').split(',')[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 3_600_000);
  if (recent.length >= RATE_LIMIT_PER_HOUR) { res.status(429).json({ error: 'rate-limited', detail: 'Too many synthesis runs from this address. Try again later.' }); return; }
  recent.push(now); hits.set(ip, recent);

  const model = provider === 'gemini'
    ? (process.env.AI_MODEL_GEMINI ?? 'gemini-3.8-flash')
    : (process.env.AI_MODEL_OPENAI ?? 'gpt-6-luna');

  try {
    const { raw, usage } = provider === 'gemini' ? await callGemini(model, key) : await callOpenAI(model, key);
    const { themes, droppedCitations, droppedThemes } = validateThemes(raw);
    res.status(200).json({
      run: {
        provider,
        model,
        promptVersion: PROMPT_VERSION,
        params: provider === 'gemini'
          ? { temperature: 0.2, maxOutputTokens: MAX_OUTPUT_TOKENS, responseMimeType: 'application/json' }
          : { reasoning_effort: 'low', max_completion_tokens: MAX_OUTPUT_TOKENS, response_format: 'json_schema strict' },
        ranAt: new Date().toISOString(),
        usage,
        validation: { themes: themes.length, droppedCitations, droppedThemes },
        themes,
      },
    });
  } catch (err: any) {
    res.status(502).json({ error: 'invalid-output', detail: String(err?.message ?? err).slice(0, 500) });
  }
}
