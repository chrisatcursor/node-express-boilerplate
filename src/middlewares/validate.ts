import { NextFunction, Request, RequestHandler, Response } from 'express';
import httpStatus from 'http-status';
import Joi from 'joi';
import ApiError = require('../utils/ApiError');
import pick = require('../utils/pick');

type RequestSegment = 'params' | 'query' | 'body';
type ValidationSchema = Partial<Record<RequestSegment, Joi.Schema>>;

const requestSegments: RequestSegment[] = ['params', 'query', 'body'];

const validate =
  (schema: ValidationSchema): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const validSchema = pick(schema, requestSegments);
    const object = pick(req, Object.keys(validSchema) as RequestSegment[]);
    const { value, error } = Joi.compile(validSchema)
      .prefs({ errors: { label: 'key' }, abortEarly: false })
      .validate(object);

    if (error) {
      const errorMessage = error.details.map((details: Joi.ValidationErrorItem) => details.message).join(', ');
      return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
    }
    Object.assign(req, value);
    return next();
  };

export = validate;
