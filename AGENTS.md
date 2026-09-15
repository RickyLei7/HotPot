# HotPot task lifecycle

- Work in the current Codex task. Do not create, fork, delegate to, or hand work to another Codex task unless the user explicitly asks for a separate or parallel task.
- Do not use recursive subtask workflows in this project. A task created for implementation or review must never create another task.
- If the user explicitly authorizes a temporary child task, keep at most one child active at a time, give it a specific title, and archive it immediately after its result is collected and verified.
- Before finishing any turn that used a temporary child task, confirm that no completed, empty, waiting, or duplicate child tasks remain active.
- Never use generic duplicate titles such as `火锅店系统` for internal work.
- Task cleanup must not modify or delete reservation records, customer data, source changes, commits, or deployment state.
