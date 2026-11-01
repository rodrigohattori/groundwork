# Live synthesis (R3+): setup and operations runbook

How to activate real synthesis runs on the Vercel deployment. Until these
steps are done, the "Run new synthesis (real AI)" button in the queue explains
that the endpoint is not configured and changes nothing.

## Cost and data-use model (decided by the owner, recorded here)

- Provider: Google Gemini API, model `gemini-3.8-flash` (ID verified on the
  official model catalog 2026-11-01).
- Free tier: no billing account is ever linked to the API project. Without
  billing, Google cannot charge for this API; abuse of the public endpoint can
  only exhaust the free quota, never spend money.
- Tradeoff accepted by the owner: on the free tier, Google may use prompts and
  responses to improve its products (the paid tier does not). This is
  acceptable here only because the feedback base is 100% synthetic. A real
  customer dataset would require a provider/tier with a no-training guarantee.

## Setup checklist

1. AI Studio (aistudio.google.com) with the owner's Google account:
   - Create a NEW, separate project for Groundwork. Do not reuse a project
     that has, or ever had, billing linked.
   - Verify the backing Google Cloud project shows no billing account
     (console.cloud.google.com > Billing) before creating any key.
   - Create the API key. Restrict it to the Gemini API if the console offers
     restriction options.
   - Note the project's free-tier rate limits shown in AI Studio (RPM/RPD) and
     record them here when set up.
2. Vercel project `groundwork-demo` > Settings > Environment Variables
   (Production):
   - `AI_PROVIDER` = `gemini`
   - `GEMINI_API_KEY` = the key from step 1
   - optional: `AI_MODEL_GEMINI` (defaults to `gemini-3.8-flash`)
3. Redeploy. Then run one real synthesis from the queue and confirm:
   - themes enter the queue labeled "Real run R3 - gemini-3.8-flash";
   - the run appears in the Decision log with validation counts;
   - the Evaluation page shows R3 against the answer key.

## Endpoint protection (already in code)

- No user text accepted: a run always covers the fixed synthetic dataset, and
  the gold answer key is never sent to the model.
- Output-token cap (8192) and 55s timeout on the provider call.
- Schema validation before anything enters the queue: themes without valid
  citations are dropped, unknown feedback ids are dropped, malformed or
  truncated output aborts the run (HTTP 502) and adds nothing.
- Rate limits: 10 runs/hour per IP and 30 runs/day per warm instance
  (best-effort; serverless instances do not share memory). The provider-side
  free-tier quota is the final backstop. Worst case from abuse is quota
  exhaustion (runs fail until quota resets), never spend.

## Lockdown procedure

If the endpoint is abused or quota keeps exhausting:

1. Immediate: set `RUN_TOKEN` in Vercel env vars and redeploy (or just trigger
   an env-var redeploy). The endpoint then answers 401 to everyone without the
   token. The UI does not send a token, so public runs stop; the owner runs
   synthesis by calling the endpoint with header `x-gw-run-token`.
2. Stronger: delete the API key in AI Studio (endpoint then answers 501) or
   remove the env vars.
3. Never rotate to a billing-linked project as a fix for quota exhaustion;
   quota exhaustion is the intended failure mode.

## If a paid provider is ever chosen instead

Prepaid credits with auto-reload disabled reduce exposure but are not
presented as a hard cap here: billing cutoff timing/overshoot was not
verified. That verification is required before relying on it.
