import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  validate(payload: {
    sub?: string;
    userId?: string;
    email: string;
    role: string;
    tenantId?: string;
  }) {
    return {
      userId: payload.sub ?? payload.userId,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
    };
  }
}
