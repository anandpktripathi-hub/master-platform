import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SettingsService } from '../modules/settings/settings.service';
import { entriesToIpRestrictionDto } from '../modules/settings/mappers/ip-restriction-settings-mappers';
import { IpRestrictionSettingsDto } from '../modules/settings/dto/ip-restriction-settings.dto';

interface IpRestrictionCache {
  settings: IpRestrictionSettingsDto;
  expiresAt: number;
}

/**
 * IP Restriction Middleware
 *
 * Enforces platform-wide IP allow-listing based on the
 * "IP Restriction" settings group managed by Super Admin.
 *
 * - If feature is disabled, all requests are allowed.
 * - If enabled and allowedIps is empty, all requests are allowed
 *   (fail-open to avoid accidental lock-out).
 * - Localhost addresses are always allowed.
 * - Supports exact IPs and simple prefix patterns with '*', e.g. "192.168.0.*".
 */
@Injectable()
export class IpRestrictionMiddleware implements NestMiddleware {
  private cache?: IpRestrictionCache;
  private readonly cacheTtlMs = 30_000; // 30 seconds

  constructor(private readonly settingsService: SettingsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await this.getSettings();

      if (!settings.enabled) {
        return next();
      }

      const clientIp = this.extractClientIp(req);

      if (this.isIpAllowed(clientIp, settings.allowedIps)) {
        return next();
      }

      return res.status(403).json({
        statusCode: 403,
        message: 'Access denied from this IP address',
      });
    } catch (err) {
      // Fail-open on settings lookup errors to avoid total outage.
      // eslint-disable-next-line no-console
      console.error('[IpRestrictionMiddleware] Error while enforcing IP restriction:', err);
      return next();
    }
  }

  private async getSettings(): Promise<IpRestrictionSettingsDto> {
    const now = Date.now();
    if (this.cache && this.cache.expiresAt > now) {
      return this.cache.settings;
    }

    const res = await this.settingsService.getGroupAdmin('ip-restriction');
    const dto = entriesToIpRestrictionDto(res.items);

    this.cache = {
      settings: dto,
      expiresAt: now + this.cacheTtlMs,
    };

    return dto;
  }

  private extractClientIp(req: Request): string {
    const xff = (req.headers['x-forwarded-for'] as string) || '';
    const firstForwarded = xff.split(',')[0].trim();
    const rawIp = firstForwarded || req.ip || req.socket.remoteAddress || '';
    // Normalize IPv4-mapped IPv6 addresses like ::ffff:127.0.0.1
    return rawIp.replace('::ffff:', '');
  }

  private isIpAllowed(ip: string, allowedIps: string[]): boolean {
    if (!ip) {
      return false;
    }

    // Always allow localhost to prevent lock-out in development / CI
    if (ip === '127.0.0.1' || ip === '::1') {
      return true;
    }

    // If no allow-list is defined, fail-open (feature effectively disabled)
    if (!allowedIps || allowedIps.length === 0) {
      return true;
    }

    return allowedIps.some((pattern) => {
      if (!pattern) return false;
      if (pattern === '*') return true;

      // Simple prefix wildcard support, e.g. "192.168.1.*"
      if (pattern.endsWith('*')) {
        const prefix = pattern.slice(0, -1);
        return ip.startsWith(prefix);
      }

      return ip === pattern;
    });
  }
}
