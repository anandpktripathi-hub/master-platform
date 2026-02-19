import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';

@Injectable()
export class TotpService {
  generateSecret(userId: string) {
    return speakeasy.generateSecret({ name: `SaaSApp (${userId})` });
  }

  getOtpAuthUrl(secret: string, userId: string) {
    return speakeasy.otpauthURL({ secret, label: userId, issuer: 'SaaSApp' });
  }

  verify(token: string, secret: string) {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1,
    });
  }
}
