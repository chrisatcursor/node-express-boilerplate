import { NextFunction, Request, RequestHandler, Response } from 'express';

const catchAsync = <
  P extends Record<string, string> = Record<string, string>,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery extends Record<string, unknown> = Record<string, unknown>
>(
  fn: (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response<ResBody>, next: NextFunction) => Promise<unknown>
): RequestHandler<P, ResBody, ReqBody, ReqQuery> => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error: unknown) => next(error));
  };
};

export default catchAsync;
