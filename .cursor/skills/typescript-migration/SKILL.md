# TypeScript Migration Skill

## Purpose

Convert the `node-express-boilerplate` codebase from CommonJS JavaScript to strict TypeScript while maintaining 100% test pass rate and coverage parity.

## Baseline Acceptance Criteria

Every batch must maintain or exceed these numbers recorded from `main`:

| Metric | Value |
|--------|-------|
| Test count | 113 tests |
| Test suites | 7 passed |
| Coverage — Statements | 100% |
| Coverage — Branches | 100% |
| Coverage — Functions | 100% |
| Coverage — Lines | 100% |
| Lint | 7 pre-existing prettier errors in `src/middlewares/auth.js` (will be fixed during Batch 4) |

## tsconfig.json Decisions

These settings are non-negotiable — applied in Batch 0:

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "module": "commonjs",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "target": "ES2018",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "forceConsistentCasingInFileNames": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**Critical**: Do NOT set `"type": "module"` in `package.json`. `ts-jest` transpiles ES module imports to `require()` at runtime via `module: "commonjs"`. This is the correct interop path for this codebase.

## Batch 0 — TS Toolchain Bootstrap

Batch 0 installs tooling only. No source files are renamed or converted.

1. Install dev dependencies:
   - `typescript`
   - `ts-jest`
   - `@types/node`, `@types/express`, `@types/passport`, `@types/passport-jwt`, `@types/bcryptjs`, `@types/compression`, `@types/cors`, `@types/morgan`, `@types/swagger-jsdoc`, `@types/swagger-ui-express`, `@types/validator`, `@types/jsonwebtoken`, `@types/nodemailer`, `@types/supertest`, `@types/jest`
   - `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`
2. Create `tsconfig.json` (settings above)
3. Update `jest.config.js` to use `ts-jest` preset while keeping JS test compat
4. Update `.eslintrc.json` to add `@typescript-eslint` parser and plugin with overrides for `.ts` files
5. Update `.lintstagedrc.json` to include `*.ts` alongside `*.js`
6. Update `prettier` scripts in `package.json` to cover `*.ts` files

## Migration Patterns

See `patterns.md` in this directory for detailed before/after code examples.

Summary of patterns to apply:

| Pattern | JS Idiom | TS Replacement |
|---------|----------|----------------|
| Imports | `const x = require('x')` | `import x from 'x'` |
| Named imports | `const { a, b } = require('x')` | `import { a, b } from 'x'` |
| Default export | `module.exports = x` | `export default x` |
| Named exports | `module.exports = { a, b }` | `export { a, b }` or `export const a = ...` |
| Mongoose models | Plain schema + `mongoose.model()` | `IUser` interface extending `Document`, typed schema |
| Mongoose plugins | Untyped plugin function | Generic plugin with schema type parameter |
| Passport `req.user` | Implicit dynamic attachment | Express `Request` declaration merging |
| Express handlers | `(req, res, next)` | `(req: Request, res: Response, next: NextFunction)` |
| Joi validation | Object literal schemas | Typed validation objects |
| Error class | JS class extending Error | TS class with typed constructor params |
| Jest mocks | `jest.fn()` | `jest.Mock` / `jest.mocked()` |

## Edge Cases

- **`.lean()` return types**: Mongoose `.lean()` returns a plain object, not a `Document`. Use `LeanDocument<IUser>` or the lean generic.
- **`httpStatus` as const**: The `http-status` package exports numeric constants. Import with `import httpStatus from 'http-status'` — `esModuleInterop` handles the default export.
- **Dynamic property access**: `user.role`, `roleRights.get(user.role)` — ensure `role` is typed as the union of valid roles, not `string`.
- **Joi inference**: Joi schemas don't natively produce TS types. Type the validated output explicitly rather than trying to infer from Joi.
- **Barrel index re-exports**: Convert `module.exports = { User, Token }` to `export { User } from './user.model'` etc. Prefer named re-exports over default.
- **`catchAsync` wrapper**: Must be typed as a generic that preserves the handler signature. Return type is `RequestHandler`.
- **`pick` utility**: Should be typed with `keyof` constraint: `<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>`.
- **Mongoose `Schema.statics` and `Schema.methods`**: Use interface merging with `Model<IUser, {}, IUserMethods>` and a separate `IUserModel` interface for statics.

## Verification Checklist

After every batch, run these checks (the `verify` agent automates this):

1. `npx tsc --noEmit` — must pass with zero errors
2. `yarn test` — must pass all 113 tests
3. `yarn coverage` — must maintain 100% on all metrics
4. `yarn lint` — no new errors (7 pre-existing prettier errors acceptable until Batch 4)
5. No unjustified `any` — every `any` must have a `// TODO(ts-migration): reason` comment
6. All exported functions have explicit return types
7. No `@ts-ignore` — use `@ts-expect-error` with explanation if suppression is absolutely required

## Scope Exclusions

- `bin/createNodejsApp.js` — excluded from migration entirely
- Root config files (`jest.config.js`, `.eslintrc.json`, `ecosystem.config.json`) — updated for TS support but not renamed
- `src/docs/components.yml` — YAML file, left as-is
- `src/docs/swaggerDef.js` — migrated in Batch 8 (app entry batch)

## File Renaming Convention

When converting a file:
1. `git mv src/path/file.js src/path/file.ts`
2. Update all import paths that reference it (drop `.js` extension if present — TS resolves extensionless)
3. Convert contents per the patterns in `patterns.md`
4. Run `tsc --noEmit` to verify the file and its dependents compile
