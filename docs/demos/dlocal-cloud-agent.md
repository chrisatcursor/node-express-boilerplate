# dLocal Cloud Agent Handoff in Demosphere

This document explains how a cloud agent hands completed work back into the Demosphere workflow when working in `ChrisatCursor/node-express-boilerplate`.

## Purpose

Use this runbook to make handoff reproducible for anyone operating the dLocal demo flow, including someone who did not author the original change.

## 1) Inputs to provide the cloud agent

When creating the Linear issue (or equivalent trigger payload), include all of the following:

### Scope

- Exact deliverable (for example: "add docs file", "migrate Batch 3 files to TypeScript", "update import paths for renamed files").
- Exact file paths and allowed edit surface.
- Explicit exclusions (what must not be changed).

### Constraints

- Repository and branch policy:
  - Repo: `ChrisatCursor/node-express-boilerplate`
  - Integration base: `migration/typescript-linear`
  - Working branch pattern: `migration/ts-batch-<N>` (for migration batches)
- Quality gates to run before handoff:
  - `npx tsc --noEmit`
  - `yarn test`
  - `yarn coverage`
  - `yarn lint`
- Coding constraints:
  - No `@ts-ignore`
  - Any `any` must include a `// TODO(ts-migration): reason` comment
  - Exported functions require explicit return types

### Branch naming and commit format

- Branch naming must be deterministic (for batch migrations: `migration/ts-batch-<N>`).
- Commit title format for migration batches:
  - `[migration/ts] Batch <N>: <scope>`
- For non-batch docs/tasks, use a clear descriptive commit subject tied to the issue.

## 2) Where cloud-agent outputs land

In this monorepo/fork layout, outputs are expected in the following locations:

1. **Git branch in this repo**
   - Code/docs changes are committed to the agent's working branch in `ChrisatCursor/node-express-boilerplate`.
2. **Pull request in this fork**
   - PR base should be `migration/typescript-linear`.
   - PR title/body follows migration PR conventions when the task is a TS batch.
3. **Linear issue trail**
   - The triggering Linear issue remains the task anchor.
   - PR link and verification evidence should be easy to map back to the issue ID (for example `DEMO-146`).
4. **Repository paths**
   - Final artifacts must exist at explicit paths in this repo (for this task: `docs/demos/dlocal-cloud-agent.md`).

## 3) Reproducible handoff procedure

Follow this sequence end-to-end:

1. **Start from repo root** (`node-express-boilerplate` checkout).
2. **Confirm remote safety**
   - Run `git remote -v`.
   - Verify `origin` points to `github.com/ChrisatCursor/node-express-boilerplate`.
3. **Check out the integration branch**
   - `git checkout migration/typescript-linear`
   - `git pull origin migration/typescript-linear`
4. **Create task branch**
   - Migration batch: `git checkout -b migration/ts-batch-<N>`
   - Other tasks: use the issue branch policy defined by your orchestrator.
5. **Implement only scoped changes** at the paths declared in the issue.
6. **Run required verification commands**:
   - `npx tsc --noEmit`
   - `yarn test`
   - `yarn coverage`
   - `yarn lint`
7. **Stage, commit, push**
   - `git add <files>`
   - `git commit -m "<descriptive message>"`
   - `git push -u origin <branch>`
8. **Open PR against integration base**
   - Base: `migration/typescript-linear`
   - Repo: `ChrisatCursor/node-express-boilerplate`
9. **Link handoff context**
   - Reference Linear issue ID in PR details and/or commit message.

## 4) How to verify handoff result in this repo

From the repo root, a reviewer can validate handoff quickly:

1. Confirm file exists:
   - `test -f docs/demos/dlocal-cloud-agent.md && echo "present"`
2. Inspect git diff and history:
   - `git log --oneline -n 5`
   - `git show --name-only --stat HEAD`
3. Validate branch and remote:
   - `git branch --show-current`
   - `git remote -v`
4. Re-run quality checks (for code batches):
   - `npx tsc --noEmit`
   - `yarn test`
   - `yarn coverage`
   - `yarn lint`

## Notes for Demosphere operators

- This repo is a forked demo surface; always keep work in `ChrisatCursor/node-express-boilerplate`.
- If Demosphere orchestration changes branch naming conventions, update this file and the trigger templates together to keep handoff reproducible.
