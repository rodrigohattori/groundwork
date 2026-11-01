import React, { useState } from 'react';
import { useGW } from './state';
import { Button, Callout } from './ui';

export function Decisions() {
    const { state } = useGW();
    const [showExport, setShowExport] = useState(false);
    const sorted = [...state.decisions].sort((a, b) => b.ts.localeCompare(a.ts));
    return <>
        <div className="page-head">
            <h1>Decision log</h1>
            <p className="page-sub">Every approval, rejection, merge, flagged quote and priority call, with its reason. Over time this becomes product memory: why things got in, and why things stayed out.</p>
        </div>
        {sorted.length === 0 && <Callout title="No decisions yet">Review themes in the queue and the log starts filling.</Callout>}
        {sorted.length > 0 && <div className="theme-actions">
            <Button variant="secondary" compact onClick={() => setShowExport(!showExport)}>{showExport ? 'Hide export' : 'Export as JSON'}</Button>
        </div>}
        {showExport && <pre className="gw-export">{JSON.stringify(state.decisions, null, 2)}</pre>}
        {sorted.map((d, i) => <div className="decision" key={i}>
            <div className="gw-citation-meta">
                <span className="gw-mono">{d.target}</span>
                <span>{new Date(d.ts).toLocaleString('pt-BR')}</span>
                <span className="gw-kind">{d.kind}</span>
            </div>
            <p className="gw-fb-text"><strong>{d.action}.</strong> {d.reason}</p>
        </div>)}
    </>;
}
