declare module 'express-rate-limit' {
  import type { RequestHandler } from 'express';

  interface Options {
    windowMs?: number;
    max?: number;
    skipSuccessfulRequests?: boolean;
  }

  function rateLimit(options?: Options): RequestHandler;

  export = rateLimit;
}
