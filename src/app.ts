import compression from 'compression';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import httpStatus from 'http-status';
import passport from 'passport';
import xss from 'xss-clean';
import config = require('./config/config');
import { jwtStrategy } from './config/passport';
import * as morgan from './config/morgan';
// @ts-expect-error: middleware remains JS until its migration batch is merged
import { authLimiter } from './middlewares/rateLimiter';
// @ts-expect-error: routes remain JS until routes batch merges to this branch
import routes from './routes/v1';
// @ts-expect-error: middleware remains JS until its migration batch is merged
import { errorConverter, errorHandler } from './middlewares/error';
import ApiError = require('./utils/ApiError');

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(xss());
app.use(mongoSanitize());
app.use(compression());
app.use(cors());
app.options('*', cors());
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

app.use('/v1', routes);

app.use((_req: Request, _res: Response, next: NextFunction): void => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

app.use(errorConverter);
app.use(errorHandler);

export = app;
