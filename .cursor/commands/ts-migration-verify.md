---
description: Run shared TypeScript migration verification workflow
---

# TS Migration Verify

Run the project verification gates used by the migration workflow, in order:

1. `npx tsc --noEmit`
2. `yarn test`
3. `yarn coverage`
4. `yarn lint`

Then summarize results against the baseline:

- Tests: 113 passed
- Coverage: 100% statements, branches, functions, lines
- Lint: no new errors

If any command fails:

- Report the failing command
- Include file/line errors where available
- Stop and mark verification as failed
