import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

export function createRateLimiter(windowMs: number = 60 * 1000, maxRequests: number = 30) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-client';
    const key = `${ip}-${req.baseUrl}${req.path}`;
    const now = Date.now();

    const record = rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
      rateLimitMap.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (record.count >= maxRequests) {
      const waitSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.status(429).json({
        error: `Too many requests. Please wait ${waitSeconds} seconds before submitting again.`,
      });
      return;
    }

    record.count += 1;
    next();
  };
}
