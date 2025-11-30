import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(email: string, pass: string): Promise<any> {
    // Placeholder validation - replace with real DB lookup
    const user = { email, password: pass, role: 'user', tenantId: 'default', userId: 'default' };
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const subject = user.id ?? user.userId ?? user.sub ?? null;
    const payload = {
      email: user.email,
      sub: subject,
      role: user.role,
      tenantId: user.tenantId,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}