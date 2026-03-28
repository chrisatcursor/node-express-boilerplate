import mongoose from 'mongoose';
import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';
import config from '../config/config';
import logger from '../config/logger';
import ApiError from '../utils/ApiError';

type ErrorWithStatusCode = Error & {
  statusCode?: number;
};

const errorConverter = (err: ErrorWithStatusCode | ApiError, _req: Request, _res: Response, next: NextFunction): void => {
  let error: ErrorWithStatusCode | ApiError = err;
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || (httpStatus[statusCode] as string);
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

const errorHandler = (err: ApiError, _req: Request, res: Response, next: NextFunction): void => {
  // This parameter is required so Express recognizes this as error middleware.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _expressErrorMiddlewareNext = next;
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
