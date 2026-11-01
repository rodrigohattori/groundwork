import React from 'react';
import { aiThemes, evaluate, goldThemes } from './data';
import { useGW } from './state';
import { FeedbackCard, Pill } from './components';
import { Button, Callout, Section } from './ui';

export function Evaluation() {
    const ev = evaluate();
    const { state, mutate } = useGW();
    const citedBy = new Map<string, string[]>();
    for (const t of aiThemes) for (const c of t.citations) citedBy.set(c, [...(citedBy.get(c) ?? []), t.id]);

    const addToQueue = (id: string, title: string, items: string[]) => {
        if (state.customThemes.some((t) => t.id === `custom-${id}`)) return;
        mutate((s) => ({
            ...s,
            customThemes: [...s.customThemes, { id: `custom-${id}`, title, summary: `Signal the AI missed: ${items.length} feedback items, none cited by any AI theme.`, citations: items }],
        }));
    };

    return <>
        <div className="page-head">
            <h1>Evaluation: run R1 vs the answer key</h1>
            <p className="page-sub">This demo ships with an answer key (the gold standard) built by hand from the synthetic base. Run R1 is simulated: authored to contain the failure modes a real LLM run shows, not recorded from a measured pipeline execution. The numbers below describe this shipped output against the key — they are not benchmark performance of any model.</p>
            <p className="page-sub">A real local-model experiment (run R2) was also tried against the same base: 4 attempts with small local instruct models, and these 4 attempts, with these models, prompts and resources, did not produce valid structured output. Prompts, raw outputs and parameters: <a href="https://github.com/rodrigohattori/groundwork/tree/main/experiments/r2">experiments/r2</a> in the repository.</p>
        </div>
        <div className="gw-eval-grid">
            <div className="gw-eval-cell"><span className="gw-eval-num">{ev.itemsTotal}</span><span>feedback items</span></div>
            <div className="gw-eval-cell"><span className="gw-eval-num">{ev.themesProposed}</span><span>themes proposed</span></div>
            <div className="gw-eval-cell"><span className="gw-eval-num">{ev.goldCovered} of {ev.goldActionable}</span><span>actionable gold themes found</span></div>
            <div className="gw-eval-cell"><span className="gw-eval-num">{ev.invented.length}</span><span>invented theme</span></div>
            <div className="gw-eval-cell"><span className="gw-eval-num">{ev.duplicatePairs.length}</span><span>duplicated pair</span></div>
            <div className="gw-eval-cell"><span className="gw-eval-num">{ev.misplaced.length} of {ev.citationsTotal}</span><span>misplaced quotes</span></div>
        </div>
        <Callout title="Read the numbers like a PM" tone="note">In this simulated run, the output covers {ev.goldCovered} of {ev.goldActionable} actionable themes, cites {ev.itemsCited} of {ev.itemsTotal} items, and makes three kinds of error: it invents one theme from a single vague quote, splits one real theme into two duplicates, and misplaces {ev.misplaced.length} quote. Its most expensive mistake is what it does not say: the missed signals below.</Callout>
        <Section title="Missed signals (actionable)">
            {ev.missedActionable.map((m) => <div className="theme" key={m.id}>
                <div className="theme-head">
                    <h3>{m.title}</h3>
                    <Pill tone="warn">Missed by AI · {m.items.length} items</Pill>
                </div>
                {m.id === 'g-surgery' && <Callout title="Rare but severe" tone="danger">Only {m.items.length} items, and both allege wrongful denial of surgery coverage. A volume-ranked tool buries exactly this. The reviewer can pull it into the queue by hand.</Callout>}
                {m.items.map((id) => <FeedbackCard key={id} id={id} citedBy={citedBy.get(id) ?? []} />)}
                <div className="theme-actions">
                    <Button variant="primary" compact onClick={() => addToQueue(m.id, m.title, m.items)}>{state.customThemes.some((t) => t.id === `custom-${m.id}`) ? 'In the review queue' : 'Add to review queue'}</Button>
                </div>
            </div>)}
        </Section>
        <Section title="Missed signals (informational)">
            {ev.missedInformational.map((m) => {
                const g = goldThemes.find((x) => x.id === m.id);
                return <div className="theme" key={m.id}>
                    <div className="theme-head"><h3>{m.title}</h3><Pill tone="muted">{m.items.length} items</Pill></div>
                    {g?.note && <p className="gw-note">{g.note}</p>}
                </div>;
            })}
        </Section>
        <Section title="Known flaws left in on purpose">
            <ul className="gw-list">
                <li><strong>t-app-crash</strong> ("App instability on Android") is invented: one quote about a dropped video call inside a telemedicine consult, inflated into a stability theme. Reject it in the queue and the rejection is logged.</li>
                <li><strong>t-pix-delay</strong> and <strong>t-pix-notpaid</strong> are the same underlying issue split in two. Mark one as duplicate of the other.</li>
                <li><strong>FB-051</strong> is cited under the accredited-network theme but is about price expectations. Flag it as a misplaced quote.</li>
            </ul>
        </Section>
    </>;
}
