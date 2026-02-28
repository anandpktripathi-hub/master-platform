import {
  BadRequestException,
  Controller,
  HttpCode,
  Post,
  Body,
  UseGuards,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
  HttpException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDto, RefreshTokenResponseDto } from './dto/auth.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
@ApiTags('Refresh')
@Controller('auth')
@Public()
export class RefreshController {
  private readonly logger = new Logger(RefreshController.name);

  constructor(
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Exchange refresh token for new access token' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiResponse({ status: 200, type: RefreshTokenResponseDto })
  async refresh(@Body() dto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    try {
      const { refreshToken } = dto;
      if (!refreshToken) {
        throw new BadRequestException('No refresh token provided');
      }

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
    } catch (error) {
      this.logger.error('refresh failed', error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to refresh token');
    }
  }
}
