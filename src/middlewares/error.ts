import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import config = require('../config/config');
import logger = require('../config/logger');
import ApiError = require('../utils/ApiError');

interface ErrorLike {
  statusCode?: number;
  message?: string;
  stack?: string;
}

const getErrorLike = (err: unknown): ErrorLike => Object(err) as ErrorLike;

const errorConverter = (err: unknown, _req: Request, _res: Response, next: NextFunction): void => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const errorLike = getErrorLike(error);
    const statusCode =
      errorLike.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
    const message = errorLike.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, errorLike.stack || '');
  }
  next(error);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (err: ApiError, _req: Request, res: Response, _next?: NextFunction): void => {
  let { statusCode, message } = err;
  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
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
