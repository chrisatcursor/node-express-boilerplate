// @ts-expect-error -- TODO(ts-migration): express-rate-limit has no type declarations in this dependency set
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
});

export { authLimiter };
