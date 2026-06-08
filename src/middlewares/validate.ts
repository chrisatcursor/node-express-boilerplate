import { RequestHandler } from 'express';
import Joi from 'joi';
import httpStatus from 'http-status';
import pick = require('../utils/pick');
import ApiError = require('../utils/ApiError');

type RequestValidationKey = 'params' | 'query' | 'body';

type ValidationSchema = Partial<Record<RequestValidationKey, Joi.Schema>>;

const requestValidationKeys: RequestValidationKey[] = ['params', 'query', 'body'];

const validate =
  (schema: ValidationSchema): RequestHandler =>
  (req, _res, next): void => {
    const validSchema = pick(schema, requestValidationKeys);
    const object = pick(req, Object.keys(validSchema) as RequestValidationKey[]);
    const { value, error } = Joi.compile(validSchema)
      .prefs({ errors: { label: 'key' }, abortEarly: false })
      .validate(object);

    if (error) {
      const errorMessage = error.details.map((details) => details.message).join(', ');
      return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
    }
    Object.assign(req, value);
    return next();
  };

export = validate;
