# Groundwork

Groundwork turns raw customer feedback into product decisions a PM can defend. AI proposes themes; every theme only exists with verbatim quotes behind it, and nothing becomes a signal until a person approves it.

This is a portfolio demo. It runs on a synthetic base of 73 feedback items about MAG +Cuidado, a real Brazilian insurance product (public product facts checked against the public page; every review is invented). It is not affiliated with or endorsed by MAG Seguros and uses no real customer data.

**Live demo:** https://groundwork-demo-pied.vercel.app

## What's inside

- **Review queue (the core).** Ten proposed themes from synthesis run R1. Open the evidence, check each quote, then approve, edit, merge or reject — every decision needs a reason and lands in the log.
- **Feedback base.** All 73 synthetic items, searchable and filterable by channel; every citation in the queue resolves back here.
- **Priorities.** Suggested impact/effort ordering with written rationale — a suggestion, never an auto-decision.
- **Decision log.** Every call and its reason, exportable as JSON. State persists locally (localStorage).
- **Evaluation.** R1 measured against a versioned gold answer key, including the errors: R1 invents one theme, duplicates another, misplaces a quote, and misses three real signals — one rare but severe.

## Honesty notes

- Run R1 is **simulated**: authored to contain realistic failure modes so the review workflow has something real to catch. It is labeled as simulated in the UI wherever it appears.
- `experiments/r2/` documents a real experiment: 4 attempts to run theme synthesis with small local instruct models (Qwen2.5 0.5B/1.5B GGUF via node-llama-cpp). These 4 attempts, with these models, prompts and resources, did not produce valid structured output. Raw completions and per-attempt parameters are included unmodified.

## Run it

```bash
npm install
npm run build
npm run serve   # http://localhost:8904
```

End-to-end interaction tests (headless Chrome via puppeteer-core, system Chrome required):

```bash
npm run serve &
npm test        # 21 checks: queue actions, evidence, filters, persistence, mobile viewport
```

## Stack

React 19 + TypeScript, react-router (hash routing), esbuild. No backend, no accounts, no tracking; review state lives in localStorage.
