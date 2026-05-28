import type { RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';

const authLimiter: RequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
});

// eslint-disable-next-line import/prefer-default-export
export { authLimiter };
