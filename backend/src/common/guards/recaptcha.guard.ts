import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface RecaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

@Injectable()
export class RecaptchaGuard implements CanActivate {
  private readonly logger = new Logger(RecaptchaGuard.name);
  private readonly secretKey: string;
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.secretKey = this.configService.get<string>('RECAPTCHA_SECRET_KEY', '');
    this.enabled =
      this.configService.get<string>('RECAPTCHA_ENABLED', 'false') === 'true';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.enabled) {
      this.logger.debug('reCAPTCHA verification disabled');
      return true;
    }

    if (!this.secretKey) {
      this.logger.warn(
        'reCAPTCHA secret key not configured, skipping verification',
      );
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const recaptchaToken =
      request.body?.recaptchaToken ||
      request.headers['x-recaptcha-token'] ||
      request.query?.recaptchaToken;

    if (!recaptchaToken) {
      throw new UnauthorizedException('reCAPTCHA token is required');
    }

    try {
      const response = await axios.post<RecaptchaResponse>(
        'https://www.google.com/recaptcha/api/siteverify',
        null,
        {
          params: {
            secret: this.secretKey,
            response: recaptchaToken,
          },
        },
      );

      if (!response.data.success) {
        this.logger.warn(
          `reCAPTCHA verification failed: ${response.data['error-codes']?.join(', ')}`,
        );
        throw new UnauthorizedException('reCAPTCHA verification failed');
      }

      this.logger.debug('reCAPTCHA verification successful');
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      this.logger.error(`reCAPTCHA verification error: ${message}`, stack);
      throw new UnauthorizedException('Failed to verify reCAPTCHA');
    }
  }
}
