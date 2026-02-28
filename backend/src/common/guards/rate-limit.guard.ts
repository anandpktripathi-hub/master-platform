import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

class TooManyRequestsException extends HttpException {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message, HttpStatus.TOO_MANY_REQUESTS);
  }
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly hits = new Map<
    string,
    { count: number; expiresAt: number }
  >();

  private pruneCounter = 0;

  // Default: 5 attempts per 60 seconds per IP+route
  private readonly config: RateLimitConfig = {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
    max: Number(process.env.RATE_LIMIT_MAX || 5),
  };

  canActivate(context: ExecutionContext): boolean {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<{ setHeader: (name: string, value: any) => any }>();

    const ip = (req.ip || req.socket.remoteAddress || 'unknown').toString();
    const routeKey = `${req.method}:${req.baseUrl || ''}${req.path || ''}`;
    const key = `${ip}|${routeKey}`;

    const now = Date.now();

    // Basic cleanup to avoid unbounded memory growth.
    this.pruneCounter += 1;
    if (this.pruneCounter % 200 === 0 || this.hits.size > 10_000) {
      for (const [k, v] of this.hits.entries()) {
        if (v.expiresAt <= now) this.hits.delete(k);
      }
    }

    const entry = this.hits.get(key);

    if (!entry || entry.expiresAt <= now) {
      const expiresAt = now + this.config.windowMs;
      this.hits.set(key, { count: 1, expiresAt });

      res?.setHeader?.('X-RateLimit-Limit', String(this.config.max));
      res?.setHeader?.('X-RateLimit-Remaining', String(this.config.max - 1));
      res?.setHeader?.('X-RateLimit-Reset', String(Math.ceil(expiresAt / 1000)));
      return true;
    }

    if (entry.count >= this.config.max) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((entry.expiresAt - now) / 1000),
      );
      res?.setHeader?.('Retry-After', String(retryAfterSeconds));
      res?.setHeader?.('X-RateLimit-Limit', String(this.config.max));
      res?.setHeader?.('X-RateLimit-Remaining', '0');
      res?.setHeader?.(
        'X-RateLimit-Reset',
        String(Math.ceil(entry.expiresAt / 1000)),
      );
      throw new TooManyRequestsException(
        'Too many requests. Please try again later.',
      );
    }

    entry.count += 1;
    this.hits.set(key, entry);

    res?.setHeader?.('X-RateLimit-Limit', String(this.config.max));
    res?.setHeader?.(
      'X-RateLimit-Remaining',
      String(Math.max(0, this.config.max - entry.count)),
    );
    res?.setHeader?.('X-RateLimit-Reset', String(Math.ceil(entry.expiresAt / 1000)));
    return true;
  }
}
