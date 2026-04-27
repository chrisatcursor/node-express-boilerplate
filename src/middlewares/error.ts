import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import config = require('../config/config');
import logger = require('../config/logger');
import ApiError = require('../utils/ApiError');

interface ErrorWithStatus extends Error {
  statusCode?: number;
}

const httpStatusMessages = httpStatus as unknown as Record<number, string>;

const getStatusMessage = (statusCode: number): string => httpStatusMessages[statusCode] || String(statusCode);

const errorConverter = (err: ErrorWithStatus, _req: Request, _res: Response, next: NextFunction): void => {
  let error: ErrorWithStatus | ApiError = err;
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || getStatusMessage(statusCode);
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

const errorHandler: ErrorRequestHandler = (err: ApiError, _req: Request, res: Response, _next: NextFunction): void => {
  let { statusCode, message } = err;
  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = getStatusMessage(httpStatus.INTERNAL_SERVER_ERROR);
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
