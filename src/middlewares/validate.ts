import { NextFunction, Request, RequestHandler, Response } from 'express';
import httpStatus from 'http-status';
import Joi from 'joi';
import ApiError from '../utils/ApiError';

type RequestProperty = 'params' | 'query' | 'body';
type ValidationSchema = Partial<Record<RequestProperty, Joi.ObjectSchema>>;
type ValidationInput = Partial<Record<RequestProperty, unknown>>;

const requestProperties: RequestProperty[] = ['params', 'query', 'body'];

const validate =
  (schema: ValidationSchema): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction) => {
    const validSchema = requestProperties.reduce<ValidationSchema>((accumulator, property) => {
      if (schema[property]) {
        accumulator[property] = schema[property];
      }

      return accumulator;
    }, {});

    const object = requestProperties.reduce<ValidationInput>((accumulator, property) => {
      if (validSchema[property]) {
        accumulator[property] = req[property];
      }

      return accumulator;
    }, {});

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

export default validate;
