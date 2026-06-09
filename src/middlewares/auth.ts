import { NextFunction, Request, RequestHandler, Response } from 'express';
import passport from 'passport';
import httpStatus from 'http-status';
import ApiError = require('../utils/ApiError');
import { roleRights } from '../config/roles';
import type { IUser } from '../models/user.model';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends IUser {}
  }
}

const verifyCallback =
  (req: Request, resolve: () => void, reject: (err: ApiError) => void, requiredRights: string[]) =>
  async (err: Error | null, user: IUser | false): Promise<void> => {
    if (err || !user) {
      return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }
    req.user = user;

    if (requiredRights.length) {
      const userRights = roleRights.get(user.role) as string[];
      const hasRequiredRights = requiredRights.every((requiredRight: string) => userRights.includes(requiredRight));
      if (!hasRequiredRights && req.params.userId !== user.id) {
        return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
      }
    }

    resolve();
  };

const auth =
  (...requiredRights: string[]): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    })
      .then(() => next())
      .catch((err: Error) => next(err));
  };

export = auth;
