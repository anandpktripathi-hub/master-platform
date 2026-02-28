import {
  BadRequestException,
  Controller,
  HttpCode,
  Post,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDto } from './dto/auth.dto';
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Refresh')
@Controller('auth')
@Public()
export class RefreshController {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body() dto: RefreshTokenDto) {
    const { refreshToken } = dto;
    if (!refreshToken) throw new BadRequestException('No refresh token provided');
    try {
      const payload = this.jwtService.verify(refreshToken, {
        ignoreExpiration: false,
      });
      const subject = payload.sub ?? payload.id;
      if (!subject) throw new UnauthorizedException('Invalid refresh token');
      // Optionally check if token is blacklisted, etc.
      // Issue new access token
      const newAccessToken = this.jwtService.sign({
        sub: subject,
        email: payload.email,
        role: payload.role,
        tenantId: payload.tenantId,
      });
      return { accessToken: newAccessToken };
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
