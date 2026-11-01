# R2: real local-model synthesis experiment

Run R1 shipped with the app is simulated (authored). R2 was a real attempt to produce themes
with small local instruct models, to see what the review queue would be working against.

- Engine: node-llama-cpp (prebuilt npm binary), GGUF Q4_K_M models from bartowski's Hugging Face mirrors
- Models: Qwen2.5-0.5B-Instruct (attempts 1, 2, 4), Qwen2.5-1.5B-Instruct (attempt 3)
- Input: the same 73 synthetic feedback items shipped in the app (embedded in each prompt file)

**Result: these 4 attempts, with these models, prompts and resources, did not produce valid
structured output.** Attempt 1 ignored the JSON-only instruction and wrote markdown prose.
Attempts 2 and 4 echoed the feedback index instead of synthesizing themes. Attempt 3 followed
the array shape loosely but with an invalid schema and did not finish within the time budget.

Each attempt directory file set is complete and unmodified: the exact prompt, the raw model
completion (including failures and truncation), and per-attempt provenance (model file SHA-256,
prompt SHA-256, parameters, timing). No output was hand-repaired.
