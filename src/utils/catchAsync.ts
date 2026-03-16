import { NextFunction, Request, Response } from 'express';
import { ParamsDictionary, RequestHandler } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

const catchAsync = <
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = ParsedQs,
>(
  fn: (
    req: Request<P, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction
  ) => Promise<unknown>
): RequestHandler<P, ResBody, ReqBody, ReqQuery> => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error: unknown) => next(error));
  };
};

export default catchAsync;
