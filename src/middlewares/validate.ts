import { NextFunction, Request, RequestHandler, Response } from 'express';
import Joi from 'joi';
import httpStatus from 'http-status';
import pick = require('../utils/pick');
import ApiError = require('../utils/ApiError');

type RequestValidationKey = 'params' | 'query' | 'body';
type RequestValidationSchema = Partial<Record<RequestValidationKey, Joi.Schema>>;

const validationKeys: RequestValidationKey[] = ['params', 'query', 'body'];

const validate =
  (schema: RequestValidationSchema): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const validSchema = pick(schema, validationKeys);
    const object = pick(req, Object.keys(validSchema) as RequestValidationKey[]);
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
