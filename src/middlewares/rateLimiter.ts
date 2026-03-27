// @ts-expect-error express-rate-limit has no bundled typings in this dependency version
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
});

export { authLimiter };
