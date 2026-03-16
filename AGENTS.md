# AGENTS.md

## Cursor Cloud specific instructions

This is a Node.js Express REST API boilerplate with MongoDB. See `README.md` for full command reference (`yarn dev`, `yarn test`, `yarn lint`, etc.).

### Services

| Service | How to start | Notes |
|---------|-------------|-------|
| MongoDB | `mongod --fork --logpath /tmp/mongod.log --dbpath /data/db` | Must be running before the app or tests. Default URL: `mongodb://127.0.0.1:27017/node-boilerplate` |
| Express API | `yarn dev` | Runs on port 3000 with nodemon hot-reload. Swagger docs at `http://localhost:3000/v1/docs` |

### Key caveats

- **MongoDB required**: The app validates `MONGODB_URL` at startup via Joi and will crash without a running MongoDB instance.
- **`.env` file**: Copy `.env.example` to `.env` before first run. The file is gitignored.
- **Pre-existing lint errors**: `src/middlewares/auth.js` has Prettier formatting issues that exist in the upstream repo. `yarn lint` exits non-zero due to these.
- **Tests connect to MongoDB**: All Jest integration tests need a live MongoDB. Tests auto-append `-test` to the database name.
- **SMTP is optional**: Email features (password reset, email verification) require SMTP config but the app starts fine without it.
- **Node.js version**: The project requires `>=12.0.0`. Mongoose 5.x may emit deprecation warnings on Node 22+ but works correctly.
