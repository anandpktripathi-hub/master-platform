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

  // Default: 5 attempts per 60 seconds per IP+route
  private readonly config: RateLimitConfig = {
    windowMs: 60_000,
    max: 5,
  };

  canActivate(context: ExecutionContext): boolean {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();

    const ip = (req.ip || req.socket.remoteAddress || 'unknown').toString();
    const routeKey = `${req.method}:${req.baseUrl || ''}${req.path || ''}`;
    const key = `${ip}|${routeKey}`;

    const now = Date.now();
    const entry = this.hits.get(key);

    if (!entry || entry.expiresAt <= now) {
      this.hits.set(key, { count: 1, expiresAt: now + this.config.windowMs });
      return true;
    }

    if (entry.count >= this.config.max) {
      throw new TooManyRequestsException(
        'Too many requests. Please try again later.',
      );
    }

    entry.count += 1;
    this.hits.set(key, entry);
    return true;
  }
}
