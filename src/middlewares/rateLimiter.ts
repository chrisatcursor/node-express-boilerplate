// @ts-expect-error: express-rate-limit v5 ships without declarations in this dependency set
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
});

export default authLimiter;
export { authLimiter };
