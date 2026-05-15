import { Request, Response, NextFunction, RequestHandler } from 'express';
import httpStatus from 'http-status';
import Joi from 'joi';
import pick = require('../utils/pick');
import ApiError = require('../utils/ApiError');

interface ValidationSchema {
  params?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  body?: Joi.ObjectSchema;
}

const requestValidationKeys: Array<keyof ValidationSchema> = ['params', 'query', 'body'];

const validate =
  (schema: ValidationSchema): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const validSchema = pick(schema, requestValidationKeys);
    const object = pick(req, Object.keys(validSchema) as Array<keyof Request>);
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
