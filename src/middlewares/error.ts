import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import config from '../config/config';
import logger from '../config/logger';
import ApiError from '../utils/ApiError';

type ErrorWithStatusCode = Error & { statusCode?: number };

const errorConverter: ErrorRequestHandler = (err, _req, _res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const typedError = error as ErrorWithStatusCode;
    const statusCode =
      typedError.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
    const message = typedError.message || String(httpStatus[statusCode]);
    error = new ApiError(statusCode, message, false, typedError.stack);
  }

  next(error);
};

const errorHandler: ErrorRequestHandler = (err, _req: Request, res: Response, _next: NextFunction) => {
  let { statusCode, message } = err as ApiError;

  if (config.env === 'production' && !(err as ApiError).isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = String(httpStatus[httpStatus.INTERNAL_SERVER_ERROR]);
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
