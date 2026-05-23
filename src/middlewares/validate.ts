import type { Request, RequestHandler } from 'express';
import Joi from 'joi';
import httpStatus from 'http-status';
import pick = require('../utils/pick');
import ApiError = require('../utils/ApiError');

type RequestValidationKey = 'params' | 'query' | 'body';
type RequestSchema = Partial<Record<RequestValidationKey, Joi.Schema>>;

const validate =
  (schema: RequestSchema): RequestHandler =>
  (req, _res, next): void => {
    const validSchema = pick(schema, ['params', 'query', 'body']);
    const object = pick(req, Object.keys(validSchema) as Array<keyof Request>);
    const { value, error } = Joi.compile(validSchema)
      .prefs({ errors: { label: 'key' }, abortEarly: false })
      .validate(object);

    if (error) {
      const errorMessage = error.details.map((details: Joi.ValidationErrorItem) => details.message).join(', ');
      next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
      return;
    }
    Object.assign(req, value);
    next();
  };

export = validate;
