import rateLimit from 'express-rate-limit';
import type { RequestHandler } from 'express';

const authLimiter: RequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
});

export default authLimiter;
export { authLimiter };
