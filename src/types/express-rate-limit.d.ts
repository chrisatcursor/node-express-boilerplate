declare module 'express-rate-limit' {
  import { RequestHandler } from 'express';

  interface RateLimitOptions {
    windowMs?: number;
    max?: number;
    skipSuccessfulRequests?: boolean;
  }

  function rateLimit(options?: RateLimitOptions): RequestHandler;

  export = rateLimit;
}
