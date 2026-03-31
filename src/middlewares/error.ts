import mongoose from 'mongoose';
import httpStatus from 'http-status';
import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import config = require('../config/config');
import logger = require('../config/logger');
import ApiError = require('../utils/ApiError');

type ErrorWithStatus = Error & { statusCode?: number; isOperational?: boolean };

const errorConverter = (err: unknown, _req: Request, _res: Response, next: NextFunction): void => {
  let error: ErrorWithStatus | ApiError;

  if (err instanceof Error) {
    error = err as ErrorWithStatus;
  } else {
    error = new Error() as ErrorWithStatus;
  }
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || (httpStatus[statusCode] as string);
    error = new ApiError(statusCode, message, false, error.stack);
  }
  next(error);
};

const errorHandler: ErrorRequestHandler = (err: ApiError, _req: Request, res: Response): void => {
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
