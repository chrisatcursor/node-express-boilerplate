import { NextFunction, Request, RequestHandler, Response } from 'express';
import httpStatus from 'http-status';
import passport from 'passport';
import { roleRights } from '../config/roles';
import type { IUser } from '../models/user.model';
import ApiError = require('../utils/ApiError');

const verifyCallback =
  (req: Request, resolve: () => void, reject: (err: ApiError) => void, requiredRights: string[]) =>
  async (err: Error | null, user: IUser | false, info: unknown): Promise<void> => {
    if (err || info || !user) {
      reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
      return;
    }
    req.user = user;

    if (requiredRights.length) {
      const userRights = roleRights.get(user.role) as string[];
      const hasRequiredRights = requiredRights.every((requiredRight: string) => userRights.includes(requiredRight));
      if (!hasRequiredRights && req.params.userId !== user.id) {
        reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
        return;
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
