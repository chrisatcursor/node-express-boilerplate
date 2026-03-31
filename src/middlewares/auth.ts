import passport from 'passport';
import httpStatus from 'http-status';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import ApiError from '../utils/ApiError';
import { roleRights } from '../config/roles';
import type { IUser } from '../models/user.model';

declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser;
  }
}

type VerifyResolve = () => void;
type VerifyReject = (reason?: ApiError) => void;

const verifyCallback =
  (req: Request, resolve: VerifyResolve, reject: VerifyReject, requiredRights: string[]) =>
  async (err: Error | null, user: IUser | false, info: unknown): Promise<void> => {
    if (err || info || !user) {
      return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }

    req.user = user;

    if (requiredRights.length) {
      const userRights = roleRights.get(user.role) as string[];
      const hasRequiredRights = requiredRights.every((requiredRight: string): boolean => userRights.includes(requiredRight));
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
      .catch((authError: unknown) => next(authError));
  };

export = auth;
