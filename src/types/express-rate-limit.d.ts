declare module 'express-rate-limit' {
  import { RequestHandler } from 'express';

  interface Options {
    windowMs?: number;
    max?: number;
    skipSuccessfulRequests?: boolean;
    [key: string]: unknown;
  }

  function rateLimit(options?: Options): RequestHandler;

  export = rateLimit;
}
