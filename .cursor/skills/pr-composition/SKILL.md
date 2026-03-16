# PR Composition Skill

## Purpose

Standardize pull request format for the JS-to-TypeScript migration. Every migration PR must follow this template to ensure consistency and reviewability.

## Title Format

```
[migration/ts] Batch N: <scope description>
```

Examples:
- `[migration/ts] Batch 0: TS toolchain bootstrap`
- `[migration/ts] Batch 1: config and utils`
- `[migration/ts] Batch 2: Mongoose models`
- `[migration/ts] Batch 9: test suite migration`

## Body Template

```markdown
## Summary

<1-3 sentences describing what this batch converts and any notable decisions.>

## Files Changed

| File | Action | Notes |
|------|--------|-------|
| `src/path/file.js` → `src/path/file.ts` | Converted | <brief note if any> |
| ... | ... | ... |

## Type Complexity Notes

<List any non-trivial typing decisions made in this batch:>
- <e.g., "Used declaration merging for `req.user` typing">
- <e.g., "Created `IUser` interface extending `Document` for Mongoose model">
- <e.g., "Used `as const` assertion for token types enum">

## Modernization Notes

<Any idiomatic TS improvements applied beyond the mechanical conversion:>
- <e.g., "Replaced verbose type annotations with inference where safe">
- <e.g., "Used `Pick<T, K>` for partial update types">

## Test Results

- **Tests**: X passed, Y total (baseline: 113)
- **Coverage**: Stmts X% | Branch X% | Funcs X% | Lines X% (baseline: all 100%)
- **tsc --noEmit**: ✅ Pass
- **Lint**: ✅ Clean / ⚠️ N pre-existing errors

## Human Review Items

<Flag anything that needs human attention:>
- [ ] <e.g., "Verify `any` usage in paginate plugin is acceptable">
- [ ] <e.g., "Confirm Express declaration merging doesn't conflict with other middleware">
```

## Constraints

- **Atomicity**: Each PR covers exactly one batch. Do not combine batches.
- **Base branch**: `migration/typescript-linear`
- **Repo target**: Always use `--repo ChrisatCursor/node-express-boilerplate` (per upstream protection rule)
- **Branch naming**: `migration/ts-batch-N` (e.g., `migration/ts-batch-0`)
- **No draft PRs**: All migration PRs are opened as ready for review
- **Labels**: Apply the batch label (`batch-N`) and classification label to the PR if supported

## PR Creation Command

```bash
gh pr create \
  --repo ChrisatCursor/node-express-boilerplate \
  --base migration/typescript-linear \
  --title "[migration/ts] Batch N: <scope>" \
  --body "$(cat <<'EOF'
<body from template above>
EOF
)"
```
