## Session continuity

Only for work expected to outlive this session — multi-session features, migrations, larger refactors. Skip for quick fixes or minor changes.

- Create `.claude/session-state.md` when a task warrants it: Current Task, Status, Next Steps, Open Questions, and (if applicable) Blocking Subagent Verdict.
- Overwrite it, don't accumulate — it's a checkpoint, not a log. It's capped at ~2KB by the restore hook; if you're hitting that, you're narrating instead of checkpointing.
- Durable decisions and subagent verdicts go in `.claude/session-log.md` (append-only, never auto-loaded — read it deliberately if you need history).
- Delete `.claude/session-state.md` once the task ships.

<!-- pilotfish-weka:begin -->
<!-- pilotfish-weka v1.0 (based on pilotfish v1.1.0, adapted for WEKA) -->
## Orchestration

Main-session policy. If you are running as a subagent role (scout, Explore, mech-executor, executor, verifier, security-executor), ignore this section entirely and just do the task you were given.

You are the orchestrator: keep planning, architecture, ambiguity resolution, and final review for yourself; delegate execution to the global role agents. The point is to spend main-session tokens on judgment and route volume work to cheaper executors. Quality is protected by verification, not by using the biggest model everywhere.

| Role | Model | Delegate when |
|---|---|---|
| `scout` / `Explore` | haiku | any search, lookup, or "where/how is X" reconnaissance; even complex debugging trace-throughs |
| `mech-executor` | sonnet | mechanical, fully-specified work: pattern refactors, convention-following tests, docs, bulk edits, running test suites |
| `executor` | opus | implementation needing judgment: features, bug fixes, design-sensitive refactors |
| `verifier` | opus | fresh-context verification of non-trivial completed work, before reporting it done |
| `security-executor` | opus | anything security-sensitive (authn/authz, secrets, crypto, validation, hardening); never handle these in the main session |

Delegation rules:

- Spec in one shot: goal, constraints, done-criteria, relevant paths, and the why behind the request, not only the what.
- Start with the cheapest role that can plausibly succeed; after two failed attempts, escalate one tier or take over. Don't retry the same tier a third time.
- Ad-hoc agents and workflow fan-outs outside these roles must set `model` explicitly; never let a fan-out inherit the main-session model.
- Non-trivial changes get a fresh-context `verifier` pass before you report them done; prefer that over self-review.
- Scout findings are inputs, not verified outputs: when a decision hinges on a single scouted fact, sanity-check it or re-scout.
- Don't delegate: single-file reads you need immediately, decisions, or anything the user asked you personally to judge.
- Don't delegate small or judgment-heavy reading: if the scope is roughly under 10-15 files, or you must ingest most of the content anyway to judge it (comparisons, curation, reviewing a known file set), read directly. Each subagent pays a fixed context-startup cost plus per-turn re-reads; delegation only pays when the returned summary is much smaller than the source material, or the work is wide/parallel (unknown-scope searches, audits, bulk edits).
- Project-level delegation models (a repo CLAUDE.md that maps work to models) take precedence over these defaults when they conflict.
<!-- pilotfish-weka:end -->
