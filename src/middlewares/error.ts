import mongoose from 'mongoose';
import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';
import config = require('../config/config');
import logger = require('../config/logger');
import ApiError = require('../utils/ApiError');

type MaybeApiError = Error & {
  statusCode?: number;
  isOperational?: boolean;
};

const errorConverter = (err: MaybeApiError, _req: Request, _res: Response, next: NextFunction): void => {
  let error: ApiError | MaybeApiError = err;
  if (!(error instanceof ApiError)) {
    const hasStatusCode = typeof (error as { statusCode?: number }).statusCode === 'number';
    let statusCode: number;
    if (hasStatusCode) {
      statusCode = (error as { statusCode: number }).statusCode;
    } else if (error instanceof mongoose.Error) {
      statusCode = httpStatus.BAD_REQUEST;
    } else {
      statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    }

    const statusText = httpStatus[statusCode as keyof typeof httpStatus];
    const message: string = error.message || String(statusText);
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (err: ApiError, _req: Request, res: Response, _next: NextFunction): void => {
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
