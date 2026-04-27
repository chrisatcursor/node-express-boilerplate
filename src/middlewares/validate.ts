import { NextFunction, Request, RequestHandler, Response } from 'express';
import Joi, { ObjectSchema, Schema, ValidationErrorItem } from 'joi';
import httpStatus from 'http-status';
import pick = require('../utils/pick');
import ApiError = require('../utils/ApiError');

interface ValidationSchema {
  params?: ObjectSchema;
  query?: ObjectSchema;
  body?: ObjectSchema;
}

type RequestSegment = 'params' | 'query' | 'body';

const validate =
  (schema: ValidationSchema): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const validSchema = pick(schema, ['params', 'query', 'body']);
    const object = pick(req, Object.keys(validSchema) as RequestSegment[]);
    const { value, error } = Joi.compile(validSchema as Record<RequestSegment, Schema>)
      .prefs({ errors: { label: 'key' }, abortEarly: false })
      .validate(object);

    if (error) {
      const errorMessage = error.details.map((details: ValidationErrorItem) => details.message).join(', ');
      return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
    }
    Object.assign(req, value);
    return next();
  };

export = validate;
