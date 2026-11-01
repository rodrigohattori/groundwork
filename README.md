# Groundwork

Groundwork turns raw customer feedback into product decisions a PM can defend. AI proposes themes; every theme only exists with verbatim quotes behind it, and nothing becomes a signal until a person approves it.

This is a portfolio demo. It runs on a synthetic base of 73 feedback items about MAG +Cuidado, a real Brazilian insurance product (public product facts checked against the public page; every review is invented). It is not affiliated with or endorsed by MAG Seguros and uses no real customer data.

**Live demo:** https://groundwork-demo-pied.vercel.app

## What's inside

- **Review queue (the core).** Ten proposed themes from synthesis run R1. Open the evidence, check each quote, then approve, edit, merge or reject — every decision needs a reason and lands in the log.
- **Feedback base.** All 73 synthetic items, searchable and filterable by channel; every citation in the queue resolves back here.
- **Priorities.** Suggested impact/effort ordering with written rationale — a suggestion, never an auto-decision.
- **Decision log.** Every call and its reason, exportable as JSON. State persists locally (localStorage).
- **Evaluation.** R1 measured against a versioned gold answer key, including the errors: R1 invents one theme, duplicates another, misplaces a quote, and misses three real signals — one rare but severe.

## Honesty notes

- Run R1 is **simulated**: authored to contain realistic failure modes so the review workflow has something real to catch. It is labeled as simulated in the UI wherever it appears.
- `experiments/r2/` documents a real experiment: 4 attempts to run theme synthesis with small local instruct models (Qwen2.5 0.5B/1.5B GGUF via node-llama-cpp). These 4 attempts, with these models, prompts and resources, did not produce valid structured output. Raw completions and per-attempt parameters are included unmodified.
- Real runs (R3+) only exist when a provider key is configured server-side. On static builds the "Run new synthesis" button explains it cannot run instead of faking a result. A failed provider call adds nothing to the queue.

## Real synthesis (R3+)

`api/synthesize.ts` is a Vercel serverless endpoint that runs the same synthesis live. It is deliberately narrow:

- Accepts no user text; the request triggers a run over the fixed synthetic dataset only (the gold answer key is never sent to the model).
- The provider key lives in server-side env vars (`AI_PROVIDER` = `gemini` or `openai`, plus `GEMINI_API_KEY` or `OPENAI_API_KEY`; optional `AI_MODEL_*` overrides, optional `RUN_TOKEN` to lock the endpoint).
- Output is schema-validated before it enters the queue: themes with no valid citation are dropped, unknown feedback ids are dropped, and malformed or truncated output aborts the run with an error instead of being repaired by hand.
- Abuse limits: output-token cap, a best-effort per-IP rate limit, and the provider-side budget/free tier as the hard cap. Designed for a free tier with no billing attached, so abuse can exhaust quota but never spend money.
- Every run enters the queue labeled `Real run R3 · <model>` with full provenance (provider, model, parameters, timestamp, token usage) and is measured against the same answer key on the Evaluation page, with the gold mapping auto-computed from citation overlap (R1's mapping was hand-authored).

## Run it

```bash
npm install
npm run build
npm run serve   # http://localhost:8904
```

End-to-end interaction tests (headless Chrome via puppeteer-core, system Chrome required):

```bash
npm run serve &
npm test        # 27 checks: queue actions, evidence, filters, persistence, real-run failure handling, mobile viewport
```

## Stack

React 19 + TypeScript, react-router (hash routing), esbuild. One optional serverless endpoint for live synthesis (`api/`); no accounts, no tracking; review state lives in localStorage.
