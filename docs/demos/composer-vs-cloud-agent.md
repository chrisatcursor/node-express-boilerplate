# Composer vs Cloud Agent (Demosphere buyer view)

This is a practical guide for when to use **local Composer (Composer 2)** versus **cloud agents** while working in this repo.

## Quick decision guide

| If your task looks like this... | Use | Why |
|---|---|---|
| You are editing multiple related files and want to approve each change in a tight loop | **Local Composer (Composer 2)** | Fast back-and-forth, instant context from your open files, and you stay in direct control of every edit |
| You can delegate a chunk of work and check back later | **Cloud agent** | Runs asynchronously, can execute commands/tests, and handles end-to-end batches without blocking your local flow |
| You need parallel attempts (for example: compare 2 implementation options) | **Cloud agent(s)** | Run multiple isolated branches/tasks in parallel, then choose the best result |
| You need a human-guided product/code decision with quick micro-iterations | **Local Composer (Composer 2)** | Best for interactive "think + edit + verify" loops |

## Latency, parallelism, and responsibility split (plain language)

- **Latency**  
  - **Composer 2 (local):** Lowest interaction latency for live collaboration while you are actively coding.  
  - **Cloud agent:** Higher per-interaction latency, but good for "fire-and-return" tasks.

- **Parallelism**  
  - **Composer 2 (local):** Typically one focused thread at a time with you in the loop.  
  - **Cloud agent:** Better for parallel delegation across independent tasks or branches.

- **Responsibility split**  
  - **Composer 2 (local):** You are the driver; Composer is your copilot for changes you want to review immediately.  
  - **Cloud agent:** You hand off a scoped objective; the agent executes autonomously (edits, verification, commit/push) and reports back.

## Concrete examples in this codebase

### Example A: choose Composer 2 (local)

You want to tighten auth behavior and immediately inspect each edit across related files:

- `src/controllers/auth.controller.js`
- `src/services/auth.service.js`
- `src/routes/v1/auth.route.js`
- `tests/integration/auth.test.js`

Why local Composer is better here: this is a tight multi-file loop where you likely want to quickly tweak code, run one test, and adjust again while reviewing each diff in real time.

### Example B: choose cloud agent

You want a delegated documentation/package task with clear acceptance criteria, then review the final PR output:

- Create `docs/demos/composer-vs-cloud-agent.md`
- Reference real repo areas (`src/`, `tests/`, `docs/`)
- Commit and push on the assigned branch

Why cloud agent is better here: the task is self-contained, asynchronous, and does not require constant interactive steering.

## Where team plugins fit

Team plugins are useful in both modes:

- In **Composer 2**, they enrich your live local workflow (quick lookups while coding).
- In **cloud agents**, they provide the same organizational context during delegated execution.

For the dLocal demo positioning, the simplest framing is:
- **Composer 2** = best for interactive local implementation loops.
- **Cloud agents** = best for delegated, async, parallelizable execution.
- **Team plugins** = shared context layer that improves both.
