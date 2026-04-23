const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for resend verification endpoint
 * Limits to 5 requests per 15 minutes per IP
 */
const resendVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 requests per window
  message: {
    status: 'error',
    statusCode: 429,
    type: 'RateLimitError',
    message: 'Too many verification requests. Please try again in 15 minutes.',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for non-production environments (optional)
    return false;
  },
});

module.exports = {
  resendVerificationLimiter,
};
