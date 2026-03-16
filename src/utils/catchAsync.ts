import { NextFunction, Request, RequestHandler, Response } from 'express';

const catchAsync = <P = Record<string, string>, ResBody = unknown, ReqBody = unknown, ReqQuery = Request['query']>(
  fn: (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response<ResBody>, next: NextFunction) => Promise<unknown>
): RequestHandler<P, ResBody, ReqBody, ReqQuery> => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error: unknown) => next(error));
  };
};

export default catchAsync;
