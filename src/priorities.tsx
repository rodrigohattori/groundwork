import React, { useState } from 'react';
import { useGW, listAllThemes } from './state';
import { Pill } from './components';
import { Button, TextInput, Callout } from './ui';

export function Priorities() {
    const { state, mutate, reviewFor, log } = useGW();
    const [reasons, setReasons] = useState<Record<string, string>>({});
    const approved = listAllThemes(state)
        .map((t) => ({ ...t.theme, provenance: t.runLabel }))
        .filter((t) => reviewFor(t.id).status === 'approved');

    const decided = new Set(state.decisions.filter((d) => d.kind === 'priority').map((d) => d.target));
    const decide = (id: string, action: string) => {
        const reason = (reasons[id] ?? '').trim();
        if (!reason) return;
        mutate((s) => log({ kind: 'priority', target: id, action, reason }, s));
    };

    return <>
        <div className="page-head">
            <h1>Priorities</h1>
            <p className="page-sub">Approved signals land here with the run's impact and effort suggestion and its written rationale. The suggestion is advice, not a decision: the PM commits, defers or discards, and every call is logged with its reason.</p>
        </div>
        {approved.length === 0 && <Callout title="Nothing to prioritize yet">Approve themes in the review queue first.</Callout>}
        {approved.map((t) => <div className="theme" key={t.id}>
            <div className="theme-head">
                <h3>{reviewFor(t.id).title ?? t.title}</h3>
                <Pill tone="muted">{t.provenance}</Pill>
            </div>
            <div className="gw-suggestion">
                <Pill tone="muted">Suggested impact: {t.suggestion.impact}</Pill>
                <Pill tone="muted">Suggested effort: {t.suggestion.effort}</Pill>
                <Pill tone="muted">{t.citations.length} pieces of evidence</Pill>
            </div>
            <p className="gw-note">Run rationale: {t.suggestion.rationale}</p>
            {decided.has(t.id)
                ? <p className="gw-note">Decision logged: {state.decisions.filter((d) => d.kind === 'priority' && d.target === t.id).map((d) => `${d.action} — ${d.reason}`).join(' · ')}</p>
                : <>
                    <TextInput label="Reason for the call (required, logged)" value={reasons[t.id] ?? ''} onChange={(v) => setReasons({ ...reasons, [t.id]: v })} />
                    <div className="theme-actions">
                        <Button variant="primary" compact onClick={() => decide(t.id, 'committed to next cycle')}>Commit to next cycle</Button>
                        <Button variant="secondary" compact onClick={() => decide(t.id, 'deferred')}>Defer</Button>
                        <Button variant="ghost" compact onClick={() => decide(t.id, 'discarded')}>Discard</Button>
                    </div>
                </>}
        </div>)}
    </>;
}
