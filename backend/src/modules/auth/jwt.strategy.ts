import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string | null;
  email: string;
  role: 'platform_admin' | 'tenant_admin' | 'staff' | 'customer';
  tenantId?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  validate(payload: JwtPayload) {
    return {
      userId: payload.sub ?? null,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
    };
  }
}
