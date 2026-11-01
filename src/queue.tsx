import React, { useState } from 'react';
import { type AITheme } from './data';
import { useGW, listAllThemes, type ListedTheme } from './state';
import { requestRealRun, type RunError } from './realrun';
import { Citation, Pill } from './components';
import { Button, TextInput, Callout, ChoiceChips } from './ui';

function ThemeCard({ theme, runLabel, mergeOptions }: { theme: AITheme; runLabel: string; mergeOptions: AITheme[] }) {
    const { state, mutate, reviewFor, log } = useGW();
    const review = reviewFor(theme.id);
    const [mode, setMode] = useState<'none' | 'reject' | 'edit' | 'merge'>('none');
    const [reason, setReason] = useState('');
    const [title, setTitle] = useState(review.title ?? theme.title);
    const [summary, setSummary] = useState(review.summary ?? theme.summary);
    const [mergeTarget, setMergeTarget] = useState('');
    const [showEvidence, setShowEvidence] = useState(false);

    if (review.status !== 'pending') {
        return <div className="theme is-done">
            <div className="theme-head">
                <h3>{review.title ?? theme.title}</h3>
                <Pill tone={review.status === 'approved' ? 'ok' : 'danger'}>{review.status === 'approved' ? 'Approved as signal' : 'Rejected'}</Pill>
            </div>
            {review.mergedInto && <p className="gw-note">Marked as duplicate of {review.mergedInto}.</p>}
            {review.reason && <p className="gw-note">Reason: {review.reason}</p>}
        </div>;
    }

    const commit = (status: 'approved' | 'rejected', action: string, why: string, extra?: Partial<typeof review>) => {
        mutate((s) => log({ kind: 'review', target: theme.id, action, reason: why }, {
            ...s,
            reviews: { ...s.reviews, [theme.id]: { ...reviewFor(theme.id), status, reason: why, ...extra } },
        }));
        setMode('none');
        setReason('');
    };

    const flagCitation = (itemId: string) => {
        mutate((s) => {
            const cur = reviewFor(theme.id);
            const flagged = cur.flagged.includes(itemId) ? cur.flagged.filter((f) => f !== itemId) : [...cur.flagged, itemId];
            return log({ kind: 'flag', target: theme.id, action: cur.flagged.includes(itemId) ? 'unflagged citation' : 'flagged citation', reason: itemId }, {
                ...s,
                reviews: { ...s.reviews, [theme.id]: { ...cur, flagged } },
            });
        });
    };

    const others = mergeOptions.filter((t) => t.id !== theme.id);
    const toggle = (m: 'reject' | 'edit' | 'merge') => setMode(mode === m ? 'none' : m);

    return <div className="theme">
        <div className="theme-head">
            <h3>{review.title ?? theme.title}</h3>
            <Pill tone={runLabel.startsWith('Real run') ? 'ok' : runLabel.startsWith('Simulated') ? 'muted' : 'ok'}>{runLabel}</Pill>
        </div>
        <p className="theme-summary">{review.summary ?? theme.summary}</p>
        <div className="gw-suggestion">
            <Pill tone="muted">Impact: {theme.suggestion.impact}</Pill>
            <Pill tone="muted">Effort: {theme.suggestion.effort}</Pill>
            <span className="gw-note">Run rationale: {theme.suggestion.rationale}</span>
        </div>
        <button type="button" className="evidence-toggle" onClick={() => setShowEvidence(!showEvidence)}>
            {showEvidence ? 'Hide evidence' : `Evidence · ${theme.citations.length} verbatim quotes`}{review.flagged.length > 0 && ` · ${review.flagged.length} flagged`}
        </button>
        {showEvidence && <div className="evidence">
            {theme.citations.map((c) => <Citation key={c} itemId={c} flagged={review.flagged.includes(c)} onFlag={flagCitation} />)}
        </div>}
        {review.flagged.length > 0 && <Callout title="Misplaced quotes" tone="warning">{review.flagged.length} quote(s) flagged as not supporting this theme. Approving keeps the flags on record; rejecting ends the theme here.</Callout>}
        <div className="theme-actions">
            <Button variant="primary" compact onClick={() => commit('approved', 'approved theme', review.flagged.length > 0 ? `Approved with ${review.flagged.length} misplaced quote(s) flagged` : 'Evidence holds')}>Approve as signal</Button>
            <Button variant="secondary" compact onClick={() => toggle('edit')}>Edit</Button>
            <Button variant="secondary" compact onClick={() => toggle('merge')}>Mark duplicate</Button>
            <Button variant="ghost" compact onClick={() => toggle('reject')}>Reject</Button>
        </div>
        {mode === 'reject' && <div className="theme-panel">
            <TextInput label="Why reject? (required, logged)" value={reason} onChange={setReason} />
            <Button variant="primary" compact onClick={() => reason.trim() && commit('rejected', 'rejected theme', reason.trim())}>Confirm rejection</Button>
        </div>}
        {mode === 'edit' && <div className="theme-panel">
            <TextInput label="Theme title" value={title} onChange={setTitle} />
            <TextInput label="Summary" value={summary} onChange={setSummary} />
            <Button variant="primary" compact onClick={() => commit('approved', 'edited and approved theme', `Edited title/summary before approval`, { title, summary })}>Save and approve</Button>
        </div>}
        {mode === 'merge' && <div className="theme-panel">
            <div className="gw-merge-row">
                {others.map((o) => <Button key={o.id} variant={mergeTarget === o.id ? 'primary' : 'secondary'} compact onClick={() => setMergeTarget(o.id)}>{o.title}</Button>)}
            </div>
            <TextInput label="Why is it a duplicate? (required, logged)" value={reason} onChange={setReason} />
            <Button variant="primary" compact onClick={() => mergeTarget && reason.trim() && commit('rejected', `marked as duplicate of ${mergeTarget}`, reason.trim(), { mergedInto: mergeTarget })}>Confirm duplicate</Button>
        </div>}
    </div>;
}

function RunButton({ pendingThemes }: { pendingThemes: ListedTheme[] }) {
    const { state, mutate, log } = useGW();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<RunError | null>(null);

    const run = async () => {
        setBusy(true);
        setError(null);
        const runId = `R${3 + state.realRuns.length}`;
        try {
            const realRun = await requestRealRun(runId);
            mutate((s) => log({
                kind: 'run',
                target: runId,
                action: `ran real synthesis (${realRun.provider} ${realRun.model})`,
                reason: `${realRun.themes.length} themes entered the queue as unreviewed proposals; validation dropped ${realRun.validation.droppedThemes} theme(s) and ${realRun.validation.droppedCitations} invalid citation(s).`,
            }, { ...s, realRuns: [...s.realRuns, realRun] }));
        } catch (e) {
            setError(e as RunError);
        } finally {
            setBusy(false);
        }
    };

    return <>
        <div className="gw-run-row">
            <Button variant="secondary" compact onClick={run} disabled={busy}>
                {busy ? `Running real synthesis (up to ~1 min)…` : 'Run new synthesis (real AI)'}
            </Button>
            {state.realRuns.length > 0 && <span className="gw-note">{state.realRuns.length} real run(s) on this device: {state.realRuns.map((r) => r.id).join(', ')}</span>}
        </div>
        {error && <Callout title="Real synthesis did not run" tone="warning">{error.message} Nothing was added or changed. Run R1 above stays the simulated reference output (see About).</Callout>}
        {pendingThemes.length === 0 && state.realRuns.length > 0 && null}
    </>;
}

export function Queue() {
    const { state, saved } = useGW();
    const [filter, setFilter] = useState<'pending' | 'reviewed' | 'all'>('pending');
    const allThemes = listAllThemes(state);
    const isPending = (id: string) => (state.reviews[id]?.status ?? 'pending') === 'pending';
    const pendingThemes = allThemes.filter((t) => isPending(t.theme.id));
    const pendingCount = pendingThemes.length;
    const approvedCount = allThemes.filter((t) => state.reviews[t.theme.id]?.status === 'approved').length;
    const rejectedCount = allThemes.filter((t) => state.reviews[t.theme.id]?.status === 'rejected').length;
    const visible = allThemes.filter((t) => filter === 'all' || (filter === 'pending' ? isPending(t.theme.id) : !isPending(t.theme.id)));
    const mergeOptions = pendingThemes.map((t) => t.theme);

    return <>
        <div className="page-head">
            <h1>Review queue</h1>
            <p className="page-sub">Synthesis run R1 (simulated, see About) proposed these themes. Nothing becomes a signal until you approve it. Open the evidence, check each quote, then approve, edit, merge or reject with a reason.</p>
        </div>
        <RunButton pendingThemes={pendingThemes} />
        <div className="queue-toolbar">
            <ChoiceChips value={filter} onChange={(v) => setFilter(v as typeof filter)} options={[
                { value: 'pending', label: `Pending · ${pendingCount}` },
                { value: 'reviewed', label: `Reviewed · ${approvedCount + rejectedCount}` },
                { value: 'all', label: `All · ${allThemes.length}` },
            ]} />
            <span className="queue-stats">{approvedCount} approved · {rejectedCount} rejected · {state.decisions.length} decisions logged</span>
        </div>
        {pendingCount === 0 && filter === 'pending' && <Callout title="Queue clear">All AI themes reviewed. Missed signals can be added from the Evaluation page, or run a real synthesis above.</Callout>}
        {visible.map(({ theme, runLabel }) => <ThemeCard key={theme.id} theme={theme} runLabel={runLabel} mergeOptions={mergeOptions} />)}
        <p className="saved-note">{saved.message}</p>
    </>;
}
