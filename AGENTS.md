# AGENTS.md

## Cursor Cloud specific instructions

### Services

This is a Node.js/Express REST API with MongoDB. Two services are needed:

| Service | Required | How to start |
|---------|----------|-------------|
| MongoDB | Yes | `sudo mongod --dbpath /data/db --fork --logpath /var/log/mongod.log` |
| Express API (dev) | Yes | `yarn dev` (runs on port 3000 with nodemon hot-reload) |
| SMTP server | No | Only needed for password-reset / email-verification flows |

### Running commands

- **Dev server:** `yarn dev` (port 3000, auto-reloads via nodemon)
- **Lint:** `yarn lint` (ESLint + Prettier). Note: `src/middlewares/auth.js` has pre-existing formatting issues.
- **Tests:** `yarn test` (Jest, runs against a separate `node-boilerplate-test` MongoDB database automatically)
- **API docs:** Visit `http://localhost:3000/v1/docs` when the dev server is running

### Gotchas

- MongoDB must be running before `yarn dev` or `yarn test`. The app calls `mongoose.connect()` on boot and will hang/crash without it.
- Tests use an in-memory MongoDB connection to a `-test` suffixed database (e.g., `node-boilerplate-test`), so they won't interfere with dev data.
- The `.env` file is required. Copy from `.env.example` if missing: `cp .env.example .env`.
- The project uses Yarn (lockfile: `yarn.lock`). Do not use npm.
- Husky git hooks are installed via `yarn install` (`prepare` script). The pre-commit hook runs `lint-staged`.
