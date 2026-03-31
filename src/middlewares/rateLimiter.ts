import rateLimit from 'express-rate-limit';
import { RequestHandler } from 'express';

const authLimiter: RequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
});

export { authLimiter };
