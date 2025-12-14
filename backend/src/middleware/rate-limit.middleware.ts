import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

/**
 * Rate Limiting Middleware
 *
 * Implements simple in-memory rate limiting per IP address.
 * Limits: 100 requests per 15 minutes per IP.
 *
 * For production, consider using Redis-based rate limiting.
 */
@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private store: RateLimitStore = {};
  private readonly maxRequests = 100;
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes

  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    // Initialize or get existing rate limit data
    if (!this.store[ip] || now > this.store[ip].resetTime) {
      this.store[ip] = {
        count: 0,
        resetTime: now + this.windowMs,
      };
    }

    // Increment request count
    this.store[ip].count++;

    // Set rate limit headers
    const remaining = Math.max(0, this.maxRequests - this.store[ip].count);
    res.setHeader('X-RateLimit-Limit', this.maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader(
      'X-RateLimit-Reset',
      new Date(this.store[ip].resetTime).toISOString(),
    );

    // Check if rate limit exceeded
    if (this.store[ip].count > this.maxRequests) {
      const retryAfter = Math.ceil((this.store[ip].resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());
      return res.status(429).json({
        statusCode: 429,
        message: 'Too many requests, please try again later.',
        retryAfter,
      });
    }

    // Clean up old entries every 1000 requests
    if (Object.keys(this.store).length > 1000) {
      this.cleanupStore(now);
    }

    next();
  }

  private cleanupStore(now: number) {
    for (const key in this.store) {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    }
  }
}
