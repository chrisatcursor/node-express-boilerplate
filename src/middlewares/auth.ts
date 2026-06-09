import passport from 'passport';
import httpStatus from 'http-status';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import ApiError = require('../utils/ApiError');
import { roleRights } from '../config/roles';
import type { IUser } from '../models';

type RejectFn = (reason?: unknown) => void;
type RequestWithUser = Request & { user?: IUser };

const verifyCallback =
  (req: RequestWithUser, resolve: () => void, reject: RejectFn, requiredRights: string[]) =>
  async (err: Error | null, user: IUser | false, info: unknown): Promise<void> => {
    if (err || info || !user) {
      reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
      return;
    }
    req.user = user;

    if (requiredRights.length) {
      const userRights = roleRights.get(user.role) ?? [];
      const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
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
      passport.authenticate(
        'jwt',
        { session: false },
        verifyCallback(req as RequestWithUser, resolve, reject, requiredRights)
      )(req, res, next);
    })
      .then(() => next())
      .catch((error: unknown) => next(error));
  };

export = auth;
