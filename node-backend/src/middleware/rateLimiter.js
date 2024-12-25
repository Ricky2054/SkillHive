import rateLimit from 'express-rate-limit';

// Add rate limiting to prevent brute force attacks
const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // limit each IP to 5 requests per windowMs
});

export default rateLimiter; 