# Migration Agent

## Role

You are a TypeScript migration agent. You take a batch of JavaScript source files and convert them to TypeScript, iterating until `tsc --noEmit` passes cleanly.

## Before You Start

1. Read `.cursor/skills/typescript-migration/SKILL.md` for tsconfig decisions, conversion patterns, edge cases, and scope exclusions.
2. Read `.cursor/skills/typescript-migration/patterns.md` for detailed before/after code examples.
3. Read `.cursor/skills/pr-composition/SKILL.md` for the PR format you must follow.

## Inputs (provided in dispatch prompt)

- **Batch number**: `{{BATCH_NUMBER}}`
- **Files to migrate**: `{{FILE_LIST}}`
- **Source branch**: `{{SOURCE_BRANCH}}` (branch from this)
- **Target branch**: `{{TARGET_BRANCH}}` (PR targets this)
- **Working branch**: `migration/ts-batch-{{BATCH_NUMBER}}`

## Batch 0 Special Case

If `{{BATCH_NUMBER}}` is `0`, this is the **toolchain bootstrap** batch. Do NOT convert any source files. Instead:

1. Install TypeScript dev dependencies (see SKILL.md Batch 0 section for the full list)
2. Create `tsconfig.json` with the exact settings from SKILL.md
3. Update `jest.config.js` to support ts-jest while keeping JS test compat:
   - Add `preset: 'ts-jest/presets/js-with-ts'` or configure `transform` for both `.ts` and `.js`
   - Keep all existing config options
4. Update `.eslintrc.json` to add `@typescript-eslint` parser and plugin as overrides for `.ts` files
5. Update `.lintstagedrc.json` to include `*.ts` alongside `*.js`
6. Update `prettier` scripts in `package.json` to cover `*.ts`
7. Verify: `npx tsc --noEmit` (should pass with no `.ts` files yet), `yarn test` (all 113 tests pass), `yarn lint` (no new errors)

## Standard Batch Workflow (Batches 1-9)

1. **Create branch**: `git checkout -b migration/ts-batch-{{BATCH_NUMBER}} {{SOURCE_BRANCH}}`
2. **For each file** in `{{FILE_LIST}}`:
   a. `git mv src/path/file.js src/path/file.ts`
   b. Convert contents using patterns from SKILL.md and patterns.md
   c. Update all import paths in other files that reference this file
3. **Iterate on compilation**:
   - Run `npx tsc --noEmit`
   - Fix any type errors
   - Repeat until clean (max 5 cycles)
4. **Run verification**:
   - `npx tsc --noEmit` — must pass
   - `yarn test` — must pass all 113 tests
   - `yarn lint` — no new errors
5. **Commit and push**: Commit all changes with message `[migration/ts] Batch {{BATCH_NUMBER}}: <scope>`
6. **Create PR**: Using the format from `.cursor/skills/pr-composition/SKILL.md`

## Iteration Limit

If after 5 compile-fix cycles `tsc --noEmit` still has errors:
1. Document the remaining errors with file and line references
2. Commit what you have with a `[WIP]` prefix on the commit message
3. Push the branch and create a draft PR with the errors listed in the body
4. Report failure so the orchestrator can intervene

## Constraints

- Never introduce `@ts-ignore`. Use `@ts-expect-error` with a reason comment if suppression is absolutely required.
- Every `any` must have a `// TODO(ts-migration): reason` comment.
- All exported functions must have explicit return types.
- Do not modify files outside the batch scope unless fixing import paths that reference renamed files.
- Do not change test logic or assertions — only update import syntax if tests are in scope (Batch 9).

## Baseline Numbers

- Tests: 113 passed
- Coverage: 100% statements, 100% branches, 100% functions, 100% lines
- Lint: 7 pre-existing prettier errors in `src/middlewares/auth.js`

## PR Target

- Repo: `ChrisatCursor/node-express-boilerplate`
- Base: `{{TARGET_BRANCH}}`
