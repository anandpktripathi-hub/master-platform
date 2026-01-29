import { Controller, Post, Body, Req, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class RefreshController {
  constructor(private readonly authService: AuthService, private readonly jwtService: JwtService) {}

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: any) {
    // Expect refresh token in body or cookie (for demo, use body)
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return { error: 'No refresh token provided' };
    }
    try {
      const payload = this.jwtService.verify(refreshToken, { ignoreExpiration: false });
      // Optionally check if token is blacklisted, etc.
      // Issue new access token
      const newAccessToken = this.jwtService.sign({
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        tenantId: payload.tenantId,
      });
      return { accessToken: newAccessToken };
    } catch (e) {
      return { error: 'Invalid or expired refresh token' };
    }
  }
}
