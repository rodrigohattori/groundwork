import React from 'react';

export function Button({ variant = 'secondary', compact, onClick, disabled, children }: {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; compact?: boolean; onClick?: () => void; disabled?: boolean; children: React.ReactNode;
}) {
    return <button type="button" disabled={disabled} className={`btn v-${variant}${compact ? ' compact' : ''}`} onClick={onClick}>{children}</button>;
}

export function TextInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
    return <label className="field"><span>{label}</span>
        <input type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>;
}

export function ChoiceChips({ label, value, onChange, options }: {
    label?: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
    return <div className="chips-wrap">
        {label && <span className="chips-label">{label}</span>}
        <div className="chips">{options.map((o) => (
            <button key={o.value} type="button" className={o.value === value ? 'chip on' : 'chip'} onClick={() => onChange(o.value)}>{o.label}</button>
        ))}</div>
    </div>;
}

export function Callout({ title, tone = 'note', children }: { title: string; tone?: 'note' | 'warning' | 'danger'; children: React.ReactNode }) {
    return <aside className={`callout tone-${tone}`}><strong>{title}</strong><p>{children}</p></aside>;
}

export function Section({ title, children, tight }: { title?: string; children: React.ReactNode; tight?: boolean }) {
    return <section className={tight ? 'section tight' : 'section'}>{title && <h2 className="section-title">{title}</h2>}{children}</section>;
}
