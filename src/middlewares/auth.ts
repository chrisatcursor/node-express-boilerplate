import { NextFunction, Request, RequestHandler, Response } from 'express';
import httpStatus from 'http-status';
import passport from 'passport';
import ApiError from '../utils/ApiError';
import { Right, roleRights } from '../config/roles';
import { IUserDocument } from '../models';

const verifyCallback =
  (req: Request, resolve: () => void, reject: (reason?: unknown) => void, requiredRights: Right[]) =>
  async (err: Error | null, user?: IUserDocument | false, info?: unknown): Promise<void> => {
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
  (...requiredRights: Right[]): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await new Promise<void>((resolve, reject) => {
        passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(
          req,
          res,
          next
        );
      });

      next();
    } catch (error) {
      next(error);
    }
  };

export default auth;
