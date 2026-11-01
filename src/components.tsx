import React from 'react';
import { channelLabel, feedbackById } from './data';

export function Pill({ children, tone }: { children: React.ReactNode; tone?: 'warn' | 'ok' | 'muted' | 'danger' }) {
    const cls = tone === 'warn' ? 'gw-pill is-warn' : tone === 'ok' ? 'gw-pill is-ok' : tone === 'danger' ? 'gw-pill is-danger' : 'gw-pill';
    return <span className={cls}>{children}</span>;
}

export function Citation({ itemId, flagged, onFlag, readOnly }: { itemId: string; flagged: boolean; onFlag?: (id: string) => void; readOnly?: boolean }) {
    const item = feedbackById.get(itemId);
    if (!item) return null;
    return <div className={flagged ? 'gw-citation is-flagged' : 'gw-citation'}>
        <div className="gw-citation-meta">
            <span className="gw-mono">{item.id}</span>
            <span>{channelLabel[item.channel]} · {item.author} · {item.date}</span>
            {!readOnly && onFlag && <button type="button" className="gw-flag" onClick={() => onFlag(itemId)}>
                {flagged ? 'Flagged as misplaced quote' : 'Flag misplaced quote'}
            </button>}
            {readOnly && flagged && <span className="gw-flag ro">Flagged as misplaced quote</span>}
        </div>
        <p className="gw-quote">“{item.text}”</p>
        {item.dupOf && <p className="gw-dup">Duplicate of {item.dupOf} (same author, same issue)</p>}
    </div>;
}

export function FeedbackCard({ id, citedBy }: { id: string; citedBy: string[] }) {
    const item = feedbackById.get(id);
    if (!item) return null;
    return <div className="gw-fb">
        <div className="gw-citation-meta">
            <span className="gw-mono">{item.id}</span>
            <span>{channelLabel[item.channel]} · {item.author} · {item.date}</span>
        </div>
        <p className="gw-fb-text">{item.text}</p>
        <div className="gw-fb-foot">
            {citedBy.length > 0
                ? <Pill tone="muted">Cited by: {citedBy.join(', ')}</Pill>
                : <Pill tone="warn">Not cited by any AI theme</Pill>}
            {item.dupOf && <Pill tone="muted">Duplicate of {item.dupOf}</Pill>}
        </div>
    </div>;
}
