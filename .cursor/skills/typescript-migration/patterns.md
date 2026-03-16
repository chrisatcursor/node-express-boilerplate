# TypeScript Migration Patterns

Detailed before/after code examples for each migration pattern in this codebase.

---

## 1. Imports and Exports

### Default require → default import

```javascript
// BEFORE
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
```

```typescript
// AFTER
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
```

### Destructured require → named import

```javascript
// BEFORE
const { User } = require('../models');
const { authService, userService, tokenService, emailService } = require('../services');
```

```typescript
// AFTER
import { User } from '../models';
import { authService, userService, tokenService, emailService } from '../services';
```

### module.exports default → export default

```javascript
// BEFORE
const User = mongoose.model('User', userSchema);
module.exports = User;
```

```typescript
// AFTER
const User = mongoose.model<IUser, IUserModel>('User', userSchema);
export default User;
```

### module.exports object → named exports

```javascript
// BEFORE
module.exports = {
  createUser,
  queryUsers,
  getUserById,
};
```

```typescript
// AFTER
export { createUser, queryUsers, getUserById };
```

### Barrel index re-exports

```javascript
// BEFORE (src/models/index.js)
module.exports.Token = require('./token.model');
module.exports.User = require('./user.model');
```

```typescript
// AFTER (src/models/index.ts)
export { default as Token } from './token.model';
export { default as User } from './user.model';
```

---

## 2. Mongoose Models

### User model with Document interface

```typescript
// AFTER (src/models/user.model.ts)
import mongoose, { Document, Model, Schema } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import { toJSON, paginate } from './plugins';
import { roles } from '../config/roles';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  isPasswordMatch(password: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUser> {
  isEmailTaken(email: string, excludeUserId?: mongoose.Types.ObjectId): Promise<boolean>;
  paginate(filter: Record<string, unknown>, options: Record<string, unknown>): Promise<QueryResult>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value: string) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true,
    },
    role: { type: String, enum: roles, default: 'user' },
    isEmailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.plugin(toJSON);
userSchema.plugin(paginate);

userSchema.statics.isEmailTaken = async function (
  email: string,
  excludeUserId?: mongoose.Types.ObjectId
): Promise<boolean> {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

userSchema.methods.isPasswordMatch = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

const User = mongoose.model<IUser, IUserModel>('User', userSchema);
export default User;
```

### Token model

```typescript
// AFTER (src/models/token.model.ts)
import mongoose, { Document, Model, Schema } from 'mongoose';
import { toJSON } from './plugins';
import { tokenTypes } from '../config/tokens';

export interface IToken extends Document {
  token: string;
  user: mongoose.Types.ObjectId;
  type: string;
  expires: Date;
  blacklisted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const tokenSchema = new Schema<IToken>(
  {
    token: { type: String, required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: [tokenTypes.REFRESH, tokenTypes.RESET_PASSWORD, tokenTypes.VERIFY_EMAIL], required: true },
    expires: { type: Date, required: true },
    blacklisted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

tokenSchema.plugin(toJSON);

const Token = mongoose.model<IToken>('Token', tokenSchema);
export default Token;
```

---

## 3. Mongoose Plugins

### Paginate plugin with generics

```typescript
// AFTER (src/models/plugins/paginate.plugin.ts)
import { Schema, Document, Model } from 'mongoose';

export interface QueryResult {
  results: Document[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

interface PaginateOptions {
  sortBy?: string;
  populate?: string;
  limit?: number | string;
  page?: number | string;
}

const paginate = <T extends Document>(schema: Schema<T>): void => {
  schema.statics.paginate = async function (
    this: Model<T>,
    filter: Record<string, unknown>,
    options: PaginateOptions
  ): Promise<QueryResult> {
    let sort = '';
    if (options.sortBy) {
      const sortingCriteria: string[] = [];
      options.sortBy.split(',').forEach((sortOption: string) => {
        const [key, order] = sortOption.split(':');
        sortingCriteria.push((order === 'desc' ? '-' : '') + key);
      });
      sort = sortingCriteria.join(' ');
    } else {
      sort = 'createdAt';
    }

    const limit = options.limit && parseInt(String(options.limit), 10) > 0
      ? parseInt(String(options.limit), 10)
      : 10;
    const page = options.page && parseInt(String(options.page), 10) > 0
      ? parseInt(String(options.page), 10)
      : 1;
    const skip = (page - 1) * limit;

    const countPromise = this.countDocuments(filter).exec();
    let docsPromise = this.find(filter).sort(sort).skip(skip).limit(limit);

    if (options.populate) {
      options.populate.split(',').forEach((populateOption: string) => {
        docsPromise = docsPromise.populate(
          populateOption
            .split('.')
            .reverse()
            .reduce((a: unknown, b: string) => ({ path: b, populate: a }))
        );
      });
    }

    const docsExec = docsPromise.exec();

    return Promise.all([countPromise, docsExec]).then((values) => {
      const [totalResults, results] = values;
      const totalPages = Math.ceil(totalResults / limit);
      return { results, page, limit, totalPages, totalResults };
    });
  };
};

export default paginate;
```

### toJSON plugin

```typescript
// AFTER (src/models/plugins/toJSON.plugin.ts)
import { Schema, Document } from 'mongoose';

interface ToJSONOptions {
  private?: boolean;
}

const deleteAtPath = (obj: Record<string, unknown>, path: string[], index: number): void => {
  if (index === path.length - 1) {
    delete obj[path[index]];
    return;
  }
  const next = obj[path[index]];
  if (next && typeof next === 'object') {
    deleteAtPath(next as Record<string, unknown>, path, index + 1);
  }
};

const toJSON = <T extends Document>(schema: Schema<T>): void => {
  const toJSONOriginal = schema.get('toJSON') as Record<string, unknown> | undefined;
  schema.set('toJSON', {
    ...toJSONOriginal,
    transform(_doc: Document, ret: Record<string, unknown>) {
      // Remove paths marked private
      Object.keys((schema as unknown as { paths: Record<string, { options?: ToJSONOptions }> }).paths).forEach((path) => {
        const pathConfig = (schema as unknown as { paths: Record<string, { options?: ToJSONOptions }> }).paths[path];
        if (pathConfig.options && pathConfig.options.private) {
          deleteAtPath(ret, path.split('.'), 0);
        }
      });

      ret.id = ret._id?.toString();
      delete ret._id;
      delete ret.__v;
      delete ret.createdAt;
      delete ret.updatedAt;

      if (toJSONOriginal && typeof toJSONOriginal.transform === 'function') {
        toJSONOriginal.transform(_doc, ret);
      }
    },
  });
};

export default toJSON;
```

---

## 4. Express Middleware

### Auth middleware with declaration merging

```typescript
// AFTER (src/middlewares/auth.ts)
import passport from 'passport';
import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';
import { roleRights } from '../config/roles';
import { IUser } from '../models/user.model';

// Declaration merging for req.user
declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

const verifyCallback =
  (req: Request, resolve: () => void, reject: (err: ApiError) => void, requiredRights: string[]) =>
  async (err: Error | null, user: IUser | false, info: unknown): Promise<void> => {
    if (err || info || !user) {
      return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }
    req.user = user;

    if (requiredRights.length) {
      const userRights = roleRights.get(user.role);
      const hasRequiredRights = requiredRights.every((requiredRight: string) => userRights?.includes(requiredRight));
      if (!hasRequiredRights && req.params.userId !== user.id) {
        return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
      }
    }

    resolve();
  };

const auth =
  (...requiredRights: string[]) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(
        req,
        res,
        next
      );
    })
      .then(() => next())
      .catch((err: Error) => next(err));
  };

export default auth;
```

### Error handler middleware

```typescript
// AFTER (src/middlewares/error.ts)
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';
import config from '../config/config';
import logger from '../config/logger';
import ApiError from '../utils/ApiError';

const errorConverter = (err: Error | ApiError, _req: Request, _res: Response, next: NextFunction): void => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode =
      (error as { statusCode?: number }).statusCode || error instanceof mongoose.Error
        ? httpStatus.BAD_REQUEST
        : httpStatus.INTERNAL_SERVER_ERROR;
    const message: string = error.message || (httpStatus[statusCode] as string);
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

const errorHandler = (err: ApiError, _req: Request, res: Response, _next: NextFunction): void => {
  let { statusCode, message } = err;
  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR] as string;
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(config.env === 'development' && { stack: err.stack }),
  };

  if (config.env === 'development') {
    logger.error(err);
  }

  res.status(statusCode).send(response);
};

export { errorConverter, errorHandler };
```

---

## 5. Utility Classes and Functions

### ApiError class

```typescript
// AFTER (src/utils/ApiError.ts)
class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
```

### catchAsync wrapper

```typescript
// AFTER (src/utils/catchAsync.ts)
import { Request, Response, NextFunction, RequestHandler } from 'express';

const catchAsync =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch((err: Error) => next(err));
  };

export default catchAsync;
```

### pick utility

```typescript
// AFTER (src/utils/pick.ts)
const pick = <T extends object, K extends keyof T>(object: T, keys: K[]): Pick<T, K> => {
  return keys.reduce((obj, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      obj[key] = object[key];
    }
    return obj;
  }, {} as Pick<T, K>);
};

export default pick;
```

---

## 6. Controllers

### Controller pattern (auth example)

```typescript
// AFTER (src/controllers/auth.controller.ts)
import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import { authService, userService, tokenService, emailService } from '../services';

const register = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

// ... remaining handlers follow the same pattern
```

---

## 7. Services

### Service pattern (user example)

```typescript
// AFTER (src/services/user.service.ts)
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import { User } from '../models';
import ApiError from '../utils/ApiError';
import { IUser } from '../models/user.model';

const createUser = async (userBody: Partial<IUser>): Promise<IUser> => {
  if (await User.isEmailTaken(userBody.email!)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

const queryUsers = async (
  filter: Record<string, unknown>,
  options: Record<string, unknown>
): Promise<{ results: IUser[]; page: number; limit: number; totalPages: number; totalResults: number }> => {
  const users = await User.paginate(filter, options);
  return users;
};

const getUserById = async (id: string | mongoose.Types.ObjectId): Promise<IUser | null> => {
  return User.findById(id);
};

// ... remaining service functions follow the same pattern
```

---

## 8. Validation Schemas

```typescript
// AFTER (src/validations/auth.validation.ts)
import Joi from 'joi';
import { password } from './custom.validation';

const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
  }),
};

// Validation objects keep the same shape — Joi schemas are already well-typed
// via @types/joi. No additional type annotations needed on the schema objects.
```

---

## 9. Config Files

### Config with typed export

```typescript
// AFTER (src/config/config.ts)
import dotenv from 'dotenv';
import path from 'path';
import Joi from 'joi';

dotenv.config({ path: path.join(__dirname, '../../.env') });

// ... Joi validation stays the same ...

export interface Config {
  env: string;
  port: number;
  mongoose: {
    url: string;
    options: Record<string, boolean>;
  };
  jwt: {
    secret: string;
    accessExpirationMinutes: number;
    refreshExpirationDays: number;
    resetPasswordExpirationMinutes: number;
    verifyEmailExpirationMinutes: number;
  };
  email: {
    smtp: {
      host: string;
      port: number;
      auth: { user: string; pass: string };
    };
    from: string;
  };
}

const config: Config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  // ... same structure ...
};

export default config;
```

---

## 10. Jest Test Patterns

### Import changes in test files

```javascript
// BEFORE
const { User } = require('../../src/models');
const app = require('../../src/app');
```

```typescript
// AFTER
import { User } from '../../src/models';
import app from '../../src/app';
```

### Mock typing

```javascript
// BEFORE
jest.mock('../../src/services/email.service');
```

```typescript
// AFTER
jest.mock('../../src/services/email.service');
const emailService = jest.mocked(await import('../../src/services/email.service'));
```

### Supertest typing

```typescript
import request from 'supertest';
import app from '../../src/app';

// request(app) continues to work — supertest accepts Express apps
```
