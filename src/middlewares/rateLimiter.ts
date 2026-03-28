// @ts-expect-error express-rate-limit v5 has no bundled type declarations in this stack
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
});

// eslint-disable-next-line import/prefer-default-export
export { authLimiter };
