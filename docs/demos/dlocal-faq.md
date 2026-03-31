# dLocal Customer FAQ (Technical, Demosphere)

This FAQ is for technical buyers evaluating how this demo repository is built and operated. It is intentionally scoped to implementation and operational boundaries, not product marketing.

## 1) How are secrets and environment variables handled?

**Short answer:** runtime config comes from environment variables, and local development uses a non-committed `.env` file.

- The app loads env vars from `.env` via `dotenv` in `src/config/config.js`.
- `.env` files are git-ignored (`.gitignore` includes `.env*`, except `*.example` templates).
- Required variables are validated with Joi at startup in `src/config/config.js`. Missing required variables fail fast.
- Variable names are documented in `.env.example` (for example: `MONGODB_URL`, `JWT_SECRET`, `SMTP_HOST`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `EMAIL_FROM`).

**Security expectation for this demo:**

- Never commit credential values to git, PRs, or docs.
- Share only variable names and setup instructions.
- Inject real secret values through your environment/secret manager (local shell, CI secrets, or cloud-agent settings).

## 2) What runs locally vs in CI vs in cloud agents?

### Local development

- `yarn dev` starts the API with nodemon (`src/index.js`) in development mode.
- The API connects to MongoDB using `MONGODB_URL`.
- `yarn test` runs Jest tests; test mode relies on MongoDB being available.
- In `NODE_ENV=test`, config appends `-test` to the MongoDB database name (from `src/config/config.js`) to isolate test data from non-test data.

### CI (repository-defined behavior)

- This repo currently includes a Travis config (`.travis.yml`) that:
  - starts a MongoDB service,
  - runs `yarn lint`,
  - runs `yarn test`,
  - then runs coverage upload (`yarn coverage:coveralls`).

### Cloud agents (high-level for this demo)

- Cloud agents clone the repo, run commands (install/lint/test/typecheck), and push branch changes back to the fork.
- Agent runtime environment and network egress constraints are platform-configurable.
- If a workflow requires secrets, they should be injected as env vars by the cloud platform; they should not be hardcoded in the repository.

## 3) What are the data/code access boundaries for this demo?

For a buyer-safe demo, use these boundaries:

### Code boundary

- Keep all code changes in the demo fork and feature branches.
- Do not push changes to third-party upstream repositories.
- Avoid unsolicited writes to external systems from automation unless explicitly requested.

### Data boundary

- Use only demo/non-production data in MongoDB.
- Keep test data in isolated test databases (`NODE_ENV=test` path).
- Do not include customer PII or production exports in this repository.

### Secret boundary

- Keep credential material out of source control.
- Reference env var names only in docs.
- Rotate any accidentally exposed credentials immediately.

## 4) Where should dLocal-specific configuration live?

Use env vars and config validation, not literals in source code.

- Add dLocal settings as variable names in `.env.example` (for onboarding clarity).
- Validate them in `src/config/config.js` (fail fast when required config is missing).
- Provide actual values via local environment, CI secret store, or cloud-agent secret injection.

## Assumptions and environment-specific notes

- This FAQ reflects the current repository state (`.env.example`, `.gitignore`, Docker compose files, `src/config/config.js`, `.travis.yml`).
- CI details may differ if your team runs additional pipelines beyond Travis; align command parity (`lint`, `test`, coverage/typecheck) across systems.
- Cloud-agent execution details (network access, secret injection method) are deployment-platform settings rather than hardcoded repository behavior.
