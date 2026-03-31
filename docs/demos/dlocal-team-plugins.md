# dLocal Demo: Team Plugins Onboarding + Committed Config

## Goal

Make the "team plugins" portion of the dLocal demo reproducible from this repository so a second machine can follow the same path and reach the same state.

This repo demonstrates team plugins through committed Cursor workspace assets in `.cursor/`:

- `rules/` for guardrails and policy
- `skills/` for reusable implementation playbooks
- `agents/` for specialized execution roles
- `commands/` for team-shared workflows (added for this demo)

## What is committed for this demo

The workflow shown in the demo is fully represented in version control:

1. Team guardrail rule:
   - `.cursor/rules/no-javascript.mdc`
2. Team migration skill:
   - `.cursor/skills/typescript-migration/SKILL.md`
   - `.cursor/skills/typescript-migration/patterns.md`
3. Team agent specs:
   - `.cursor/agents/migrate.md`
   - `.cursor/agents/verify.md`
   - `.cursor/agents/modernize.md`
   - `.cursor/agents/test-audit.md`
4. Team shared command:
   - `.cursor/commands/ts-migration-verify.md`

## One workflow to demo every time

Use this exact flow in demos:

1. **Implement** migration work with the `migrate` agent pattern.
2. **Verify** quality gates with the shared `ts-migration-verify` command.
3. **Report** pass/fail against the recorded baseline (tests/coverage/lint/typecheck).

This keeps the demo deterministic and directly tied to committed files.

## Onboarding steps (new machine)

### 1) Clone and install

```bash
git clone https://github.com/ChrisatCursor/node-express-boilerplate.git
cd node-express-boilerplate
yarn install
```

### 2) Create local env file (no secrets in git)

```bash
cp .env.example .env
```

Do not commit `.env`. Use placeholders and secure secret storage for real values.

Required local setting for tests:

```bash
MONGODB_URL=mongodb://127.0.0.1:27017/node-boilerplate
```

### 3) Confirm committed team plugin assets exist

```bash
test -f .cursor/rules/no-javascript.mdc
test -f .cursor/skills/typescript-migration/SKILL.md
test -f .cursor/agents/migrate.md
test -f .cursor/commands/ts-migration-verify.md
```

### 4) Run the shared workflow command

Use the committed command definition:

- `.cursor/commands/ts-migration-verify.md`

It executes the same baseline verification used in the migration workflow:

- `npx tsc --noEmit`
- `yarn test`
- `yarn coverage`
- `yarn lint`

### 5) Expected demo-ready state

You should reach the same baseline reported by the migration skill:

- TypeScript compile: pass (`npx tsc --noEmit`)
- Tests: 113 passing
- Coverage: 100% statements/branches/functions/lines
- Lint: no new errors (historical note: pre-existing prettier issues were tracked during early batches)

## Secrets and secure storage

- Never commit credentials or tokens to this repo.
- Keep local values in `.env` only.
- Use your team's secure secret manager for real secrets (for example: 1Password, AWS Secrets Manager, or Vault).
- In docs/screenshots, use placeholder values such as:
  - `JWT_SECRET=__SET_IN_SECRET_MANAGER__`
  - `SMTP_PASSWORD=__SET_IN_SECRET_MANAGER__`

## Troubleshooting

- **MongoDB not running**: start MongoDB locally before running tests.
- **Coverage mismatch**: re-run `yarn coverage` after a clean install.
- **Lint mismatch**: run `yarn lint` and compare output with branch baseline.

