// @ts-expect-error -- TODO(ts-migration): express-rate-limit types are unavailable in this branch toolchain
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
});

export default authLimiter;
export { authLimiter };
