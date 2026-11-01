import type { RealRun } from './state';

export interface RunError { code: 'unavailable' | 'not-configured' | 'invalid-output' | 'http' | 'rate-limited'; message: string }

// Calls the deployment's own /api/synthesize. Static-only builds (hosted file,
// repo preview) have no such endpoint: that surfaces as 'unavailable' and the
// UI says so instead of pretending to run.
export async function requestRealRun(runId: string): Promise<RealRun> {
    let res: Response;
    try {
        res = await fetch('/api/synthesize', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
    } catch {
        throw { code: 'unavailable', message: 'Could not reach the synthesis endpoint. This build looks static-only; real runs need the Vercel deployment with a provider key configured.' } as RunError;
    }
    let body: any = null;
    try { body = await res.json(); } catch { /* non-JSON error page */ }
    if (res.status === 404 || (res.status === 405 && !body)) {
        throw { code: 'unavailable', message: 'This deployment has no synthesis endpoint (static build). Real runs need the Vercel deployment with a provider key configured.' } as RunError;
    }
    if (res.status === 501) throw { code: 'not-configured', message: body?.detail ?? 'No provider key configured on this deployment.' } as RunError;
    if (res.status === 429) throw { code: 'rate-limited', message: body?.detail ?? 'Too many runs. Try again later.' } as RunError;
    if (res.status === 502) throw { code: 'invalid-output', message: `The provider returned output that failed validation. Nothing entered the queue. Detail: ${body?.detail ?? 'unknown'}` } as RunError;
    if (!res.ok) throw { code: 'http', message: `Synthesis endpoint returned HTTP ${res.status}.` } as RunError;

    const r = body?.run;
    if (!r || !Array.isArray(r.themes) || r.themes.length === 0 || typeof r.model !== 'string') {
        throw { code: 'invalid-output', message: 'Endpoint answered 200 but the run payload was malformed. Nothing entered the queue.' } as RunError;
    }
    return {
        id: runId,
        provider: String(r.provider),
        model: r.model,
        promptVersion: String(r.promptVersion ?? 'unknown'),
        params: r.params ?? {},
        ranAt: String(r.ranAt ?? new Date().toISOString()),
        usage: r.usage ?? null,
        validation: r.validation ?? { themes: r.themes.length, droppedCitations: 0, droppedThemes: 0 },
        themes: r.themes.map((t: any, i: number) => ({
            id: `${runId.toLowerCase()}-t${i + 1}`,
            title: String(t.title),
            summary: String(t.summary),
            citations: (t.citations ?? []).map(String),
            suggestion: t.suggestion,
        })),
    };
}
