## Session continuity

Only for work expected to outlive this session — multi-session features, migrations, larger refactors. Skip for quick fixes or minor changes.

- Create `.claude/session-state.md` when a task warrants it: Current Task, Status, Next Steps, Open Questions, and (if applicable) Blocking Subagent Verdict.
- Overwrite it, don't accumulate — it's a checkpoint, not a log. It's capped at ~2KB by the restore hook; if you're hitting that, you're narrating instead of checkpointing.
- Durable decisions and subagent verdicts go in `.claude/session-log.md` (append-only, never auto-loaded — read it deliberately if you need history).
- Delete `.claude/session-state.md` once the task ships.
