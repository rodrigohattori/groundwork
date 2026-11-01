import React, { useState } from 'react';
import { HashRouter, Routes, Route, NavLink as RRNavLink } from 'react-router-dom';
import './kit.css';

export { Routes, Route };

export function FileRouter({ children }: { children: React.ReactNode }) {
    return <HashRouter>{children}</HashRouter>;
}

export function NavLink({ to, end, children }: { to: string; end?: boolean; children: React.ReactNode }) {
    return <RRNavLink to={to} end={end}>{children}</RRNavLink>;
}

export function FileCard({ children }: { children: React.ReactNode }) {
    return <div className="kit-card">{children}</div>;
}

export function Header({ title, fact, intro }: { title: string; fact?: string; intro?: string }) {
    return <header className="kit-header">
        {fact && <p className="kit-fact">{fact}</p>}
        <h1>{title}</h1>
        {intro && <p className="kit-intro">{intro}</p>}
    </header>;
}

export function Group({ label, heading, children }: { label: string; heading?: boolean; children: React.ReactNode }) {
    return <section className={heading ? 'kit-group is-heading' : 'kit-group'}>
        {heading ? <h2>{label}</h2> : <h3>{label}</h3>}
        {children}
    </section>;
}

export function Callout({ title, tone, children }: { title: string; tone?: 'note' | 'warning' | 'danger'; children: React.ReactNode }) {
    return <aside className={`kit-callout tone-${tone ?? 'note'}`}>
        <strong>{title}</strong>
        <p>{children}</p>
    </aside>;
}

export function NumberedList({ items }: { items: string[] }) {
    return <ol className="gw-list">{items.map((it, i) => <li key={i}>{it}</li>)}</ol>;
}

export function Closing({ children }: { children: React.ReactNode }) {
    return <footer className="kit-closing">{children}</footer>;
}

export function FileButton({ variant, compact, onClick, children }: { variant?: 'primary' | 'secondary' | 'ghost'; compact?: boolean; onClick?: () => void; children: React.ReactNode }) {
    return <button type="button" className={`kit-btn v-${variant ?? 'secondary'}${compact ? ' compact' : ''}`} onClick={onClick}>{children}</button>;
}

export function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return <label className="kit-field"><span>{label}</span>
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>;
}

export function ChoiceRow({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
    return <div className="kit-choice">
        <span className="kit-choice-label">{label}</span>
        <div className="kit-choice-row">
            {options.map((o) => <button key={o.value} type="button" className={o.value === value ? 'kit-chip on' : 'kit-chip'} onClick={() => onChange(o.value)}>{o.label}</button>)}
        </div>
    </div>;
}

export function useLocalState<T>(key: string, initial: T): [T, (v: T) => void, { message: string }] {
    const [value, setValue] = useState<T>(() => {
        try {
            const raw = window.localStorage.getItem(key);
            return raw ? (JSON.parse(raw) as T) : initial;
        } catch {
            return initial;
        }
    });
    const set = (v: T) => {
        setValue(v);
        try { window.localStorage.setItem(key, JSON.stringify(v)); } catch { /* storage full or blocked */ }
    };
    return [value, set, { message: 'Saved on this device (browser local storage).' }];
}
