declare module 'bcryptjs' {
  export function compare(data: string, encrypted: string): Promise<boolean>;
  export function hash(data: string, saltOrRounds: string | number): Promise<string>;
}

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
