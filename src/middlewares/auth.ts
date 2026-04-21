import passport from 'passport';
import httpStatus from 'http-status';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import ApiError from '../utils/ApiError';
import { roleRights } from '../config/roles';
import type { IUser } from '../models/user.model';

type VerifyResolve = () => void;
type VerifyReject = (reason?: ApiError) => void;

const verifyCallback =
  (req: Request, resolve: VerifyResolve, reject: VerifyReject, requiredRights: string[]) =>
  async (err: Error | null, user: IUser | false | null, info: unknown): Promise<void> => {
    if (err || info || !user) {
      reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
      return;
    }
    req.user = user;

    if (requiredRights.length) {
      const userRights = roleRights.get(user.role as string) as string[];
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
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    })
      .then(() => next())
      .catch((error: Error) => next(error));
  };

export = auth;
