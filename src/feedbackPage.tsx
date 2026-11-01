import React, { useState } from 'react';
import { aiThemes, channelLabel, feedback, type Channel } from './data';
import { useGW } from './state';
import { FeedbackCard } from './components';
import { TextInput, ChoiceChips } from './ui';

export function FeedbackBase() {
    const { state } = useGW();
    const [q, setQ] = useState('');
    const [channel, setChannel] = useState('all');
    const [uncitedOnly, setUncitedOnly] = useState('no');

    const citedBy = new Map<string, string[]>();
    for (const t of aiThemes) for (const c of t.citations) citedBy.set(c, [...(citedBy.get(c) ?? []), t.id]);
    for (const t of state.customThemes) for (const c of t.citations) citedBy.set(c, [...(citedBy.get(c) ?? []), t.id]);

    const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const items = feedback.filter((f) => {
        if (channel !== 'all' && f.channel !== (channel as Channel)) return false;
        if (uncitedOnly === 'yes' && (citedBy.get(f.id) ?? []).length > 0) return false;
        if (q.trim() && !norm(f.text + ' ' + f.author + ' ' + f.id).includes(norm(q))) return false;
        return true;
    });

    return <>
        <div className="page-head">
            <h1>Feedback base</h1>
            <p className="page-sub">{feedback.length} synthetic items across five channels, in the customers' own Portuguese. This is the raw evidence every conclusion must point back to.</p>
        </div>
        <div className="filters-bar">
            <TextInput label="Search text, author or id" value={q} onChange={setQ} />
            <ChoiceChips label="Channel" value={channel} onChange={setChannel} options={[{ value: 'all', label: 'All' }, ...Object.entries(channelLabel).map(([value, label]) => ({ value, label }))]} />
            <ChoiceChips label="Citation" value={uncitedOnly} onChange={setUncitedOnly} options={[{ value: 'no', label: 'All items' }, { value: 'yes', label: 'Not cited by any theme' }]} />
        </div>
        <p className="gw-note">{items.length} of {feedback.length} items shown.</p>
        {items.map((f) => <FeedbackCard key={f.id} id={f.id} citedBy={citedBy.get(f.id) ?? []} />)}
    </>;
}
