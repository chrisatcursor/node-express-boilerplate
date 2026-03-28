import Joi, { ObjectSchema } from 'joi';
import httpStatus from 'http-status';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import pick from '../utils/pick';
import ApiError from '../utils/ApiError';

interface ValidationSchema {
  params?: ObjectSchema;
  query?: ObjectSchema;
  body?: ObjectSchema;
}

const validate =
  (schema: ValidationSchema): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const validSchema = pick(schema, ['params', 'query', 'body']);
    const object = pick(req, Object.keys(validSchema) as Array<'params' | 'query' | 'body'>);
    const { value, error } = Joi.compile(validSchema)
      .prefs({ errors: { label: 'key' }, abortEarly: false })
      .validate(object);

    if (error) {
      const errorMessage = error.details.map((details) => details.message).join(', ');
      next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
      return;
    }
    Object.assign(req, value);
    next();
  };

export = validate;
