import React from 'react';
import { NavLink, Route, Routes } from './kit';
import './style.css';
import { Queue } from './queue';
import { FeedbackBase } from './feedbackPage';
import { Priorities } from './priorities';
import { Decisions } from './decisions';
import { Evaluation } from './evaluation';
import { useGW } from './state';
import { aiThemes } from './data';
import { Callout, Section } from './ui';

function About() {
    return <>
        <div className="page-head">
            <h1>About Groundwork</h1>
            <p className="page-sub">Why this demo exists, how it is built, and what it deliberately does not do.</p>
        </div>
        <Section title="What this is">
            <p className="body-text">Groundwork turns raw customer feedback into product decisions a PM can defend. The AI proposes themes; every theme only exists with verbatim quotes behind it, and nothing becomes a signal until a person approves it. This demo runs on a synthetic base of 73 feedback items about MAG +Cuidado, a real Brazilian insurance product, so the hard cases are realistic.</p>
            <ol className="gw-list">
                <li>Feedback base: tickets, reviews, WhatsApp messages, social comments and call notes — all invented for this demo.</li>
                <li>Synthesis with proof: run R1 groups feedback into themes. No quote, no theme. In this demo R1 is a simulated run, authored to contain realistic failure modes — not a benchmark of any model.</li>
                <li>Human review: the queue is the core of the product. Approve, edit, merge or reject — with a logged reason.</li>
                <li>Suggested prioritization: impact and effort with written rationale. The PM decides.</li>
                <li>Decision log: every call and its reason, exportable as JSON.</li>
            </ol>
            <Callout title="Synthetic data, real product facts" tone="warning">All feedback is invented. Product facts (plans, prices, coverages, waiting periods) were checked against the public page magmaiscuidado.com.br on 2026-11-01. This is a portfolio demo: not affiliated with, or endorsed by, MAG Seguros, and it uses no real customer data.</Callout>
        </Section>
        <Section title="The honest part">
            <p className="body-text">Run R1 is deliberately imperfect: it invents one theme, duplicates another, misplaces a quote, and misses three real signals — one of them rare but severe. The Evaluation page measures this output against a hand-built answer key. Finding and fixing those errors is the product working, not the demo failing.</p>
        </Section>
        <Section title="Why Groundwork exists">
            <p className="body-text">AI tools that summarize feedback make two trust-killing mistakes: they invent themes with no evidence, and they hide where each conclusion came from. Groundwork's answer is structural: evidence before synthesis, human review as the core mechanic, auditable prioritization, and a decision log that becomes product memory.</p>
        </Section>
        <Section title="Architecture">
            <ol className="gw-list">
                <li>Static web app (React + TypeScript). No backend: the demo is review-workflow-first.</li>
                <li>Synthesis runs offline behind a provider interface, treating all AI output as untrusted input. The shipped run R1 is simulated — authored to contain realistic failure modes, not a recorded model execution. Swapping in a live LLM is a provider change, not a redesign.</li>
                <li>All AI output is treated as untrusted input: themes, citations and priority suggestions are proposals until a person acts on them.</li>
                <li>Review state and the decision log persist on this device only (local storage). Export the log as JSON from the Decisions page.</li>
                <li>The gold standard is versioned with the data, so every synthesis run can be measured the same way.</li>
            </ol>
        </Section>
        <Section title="Design decisions I would defend in an interview">
            <ol className="gw-list">
                <li>No theme without verbatim quotes. Weak evidence is flagged, never hidden.</li>
                <li>Rejecting the AI is a first-class action with a required reason, not a footer disclaimer.</li>
                <li>Rare-but-severe signals get surfaced even when volume ranking would bury them.</li>
                <li>The evaluation page measures each run against a versioned answer key and shows the errors, including the embarrassing kind.</li>
                <li>Synthetic data only: the demo proves judgment without touching any company’s customer data.</li>
            </ol>
        </Section>
        <Section title="Limits, on purpose">
            <p className="body-text">No live LLM calls, no accounts, no server, no integrations. Those are next steps, in order: a live synthesis provider behind the existing interface, server-side persistence with auth, then feedback-source connectors.</p>
            <p className="body-text">Source: <a href="https://github.com/rodrigohattori/groundwork">github.com/rodrigohattori/groundwork</a>.</p>
        </Section>
        <Section title="R2: a real, failed model experiment">
            <p className="body-text">R1 is simulated by design. R2 asked a real question: what would a small local model actually produce from this same 73-item base? Four attempts were run with small local instruct models (Qwen2.5 0.5B and 1.5B, GGUF, via node-llama-cpp): a plain JSON-only prompt, a stricter JSON-forcing prompt, the larger model, and a few-shot format example.</p>
            <p className="body-text">These 4 attempts, with these models, prompts and resources, did not produce valid structured output: markdown prose instead of JSON, the feedback index echoed back instead of synthesized themes, an invalid schema, and a truncated run. The exact prompts, the raw model outputs (unmodified, including the failures) and the per-attempt parameters are published in <a href="https://github.com/rodrigohattori/groundwork/tree/main/experiments/r2">experiments/r2</a> in the repository. A live provider behind the existing interface remains the path to a real run.</p>
        </Section>
    </>;
}

export function App() {
    const { state } = useGW();
    const pending = aiThemes.filter((t) => (state.reviews[t.id]?.status ?? 'pending') === 'pending').length
        + state.customThemes.filter((t) => (state.reviews[t.id]?.status ?? 'pending') === 'pending').length;
    return <div className="app">
        <aside className="app-side">
            <div className="app-brand"><span className="app-mark">G</span><span>Groundwork</span></div>
            <nav className="app-nav" aria-label="Product areas">
                <NavLink to="/" end>Review queue{pending > 0 && <span className="app-badge">{pending}</span>}</NavLink>
                <NavLink to="/feedback">Feedback base</NavLink>
                <NavLink to="/priorities">Priorities</NavLink>
                <NavLink to="/decisions">Decision log</NavLink>
                <NavLink to="/evaluation">Evaluation</NavLink>
                <NavLink to="/about">About</NavLink>
            </nav>
            <p className="app-sidefoot">Portfolio demo · synthetic feedback only · not affiliated with MAG Seguros · product facts checked on magmaiscuidado.com.br, 2026-11-01</p>
        </aside>
        <main className="app-main">
            <Routes>
                <Route path="/" element={<Queue />} />
                <Route path="/queue" element={<Queue />} />
                <Route path="/feedback" element={<FeedbackBase />} />
                <Route path="/priorities" element={<Priorities />} />
                <Route path="/decisions" element={<Decisions />} />
                <Route path="/evaluation" element={<Evaluation />} />
                <Route path="/about" element={<About />} />
            </Routes>
        </main>
    </div>;
}
