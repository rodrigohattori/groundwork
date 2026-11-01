import React, { useState } from 'react';
import { aiThemes, type AITheme } from './data';
import { useGW } from './state';
import { Citation, Pill } from './components';
import { Button, TextInput, Callout, ChoiceChips } from './ui';

function ThemeCard({ theme, provenance }: { theme: AITheme; provenance: 'ai' | 'human' }) {
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

    const others = aiThemes.filter((t) => t.id !== theme.id && reviewFor(t.id).status === 'pending');
    const toggle = (m: 'reject' | 'edit' | 'merge') => setMode(mode === m ? 'none' : m);

    return <div className="theme">
        <div className="theme-head">
            <h3>{review.title ?? theme.title}</h3>
            <Pill tone={provenance === 'ai' ? 'muted' : 'ok'}>{provenance === 'ai' ? 'Simulated run R1' : 'Added by reviewer'}</Pill>
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

export function Queue() {
    const { state, saved, reviewFor } = useGW();
    const [filter, setFilter] = useState<'pending' | 'reviewed' | 'all'>('pending');
    const allThemes: { theme: AITheme; provenance: 'ai' | 'human' }[] = [
        ...aiThemes.map((t) => ({ theme: t, provenance: 'ai' as const })),
        ...state.customThemes.map((t) => ({
            theme: { ...t, goldMatch: null, suggestion: { impact: 'medium', effort: 'medium', rationale: 'Added by the reviewer from uncited feedback; no AI suggestion.' } },
            provenance: 'human' as const,
        })),
    ];
    const isPending = (id: string) => (state.reviews[id]?.status ?? 'pending') === 'pending';
    const pendingCount = allThemes.filter((t) => isPending(t.theme.id)).length;
    const approvedCount = allThemes.filter((t) => state.reviews[t.theme.id]?.status === 'approved').length;
    const rejectedCount = allThemes.filter((t) => state.reviews[t.theme.id]?.status === 'rejected').length;
    const visible = allThemes.filter((t) => filter === 'all' || (filter === 'pending' ? isPending(t.theme.id) : !isPending(t.theme.id)));

    return <>
        <div className="page-head">
            <h1>Review queue</h1>
            <p className="page-sub">Synthesis run R1 (simulated — see About) proposed these themes. Nothing becomes a signal until you approve it. Open the evidence, check each quote, then approve, edit, merge or reject with a reason.</p>
        </div>
        <div className="queue-toolbar">
            <ChoiceChips value={filter} onChange={(v) => setFilter(v as typeof filter)} options={[
                { value: 'pending', label: `Pending · ${pendingCount}` },
                { value: 'reviewed', label: `Reviewed · ${approvedCount + rejectedCount}` },
                { value: 'all', label: `All · ${allThemes.length}` },
            ]} />
            <span className="queue-stats">{approvedCount} approved · {rejectedCount} rejected · {state.decisions.length} decisions logged</span>
        </div>
        {pendingCount === 0 && filter === 'pending' && <Callout title="Queue clear">All AI themes reviewed. Missed signals can be added from the Evaluation page.</Callout>}
        {visible.map(({ theme, provenance }) => <ThemeCard key={theme.id} theme={theme} provenance={provenance} />)}
        <p className="saved-note">{saved.message}</p>
    </>;
}
