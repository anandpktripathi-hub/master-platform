import {
  Controller,
  Post,
  Body,
  Req,
  BadRequestException,
  HttpCode,
  Get,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { TenantRegisterDto } from './dto/tenant-register.dto';
import {
  LoginDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
  SendVerificationEmailDto,
  SimpleRegisterDto,
  VerifyEmailDto,
} from './dto/auth.dto';
import logger from '../../config/logger.config';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Auth')
@Controller('auth')
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('logout')
  @HttpCode(200)
  async logout() {
    // Stateless JWT logout: client clears tokens. Placeholder for refresh-token revocation.
    return { success: true };
  }

  // Simple login: expects { email, password }
  @Post('login')
  @HttpCode(200)
  @UseGuards(RateLimitGuard)
  async login(@Body() body: LoginDto) {
    logger.info('here');
    logger.info('[LOGIN CONTROLLER] Received login request body', { body });
    const { email, password } = body;
    logger.info(`[LOGIN ATTEMPT] Email: ${email}`);
    return await this.authService.login(body);
  }

  // Optional stub for register to avoid TS error (can customize later)
  @Post('register')
  async register(@Body() dto: SimpleRegisterDto) {
    return this.authService.registerSimple(dto);
  }

  /**
   * Phase 2: Public endpoint for 4-step tenant self-registration
   * POST /api/auth/tenant-register
   */
  @Post('tenant-register')
  @UseGuards(RateLimitGuard)
  async tenantRegister(@Body() dto: TenantRegisterDto) {
    return this.authService.registerTenant(dto);
  }

  /**
   * Send or resend email verification link
   */
  @Post('send-verification-email')
  @HttpCode(200)
  @UseGuards(RateLimitGuard)
  async sendVerificationEmail(@Body() dto: SendVerificationEmailDto) {
    return this.authService.sendVerificationEmail(dto.email);
  }

  /**
   * Verify email with token
   */
  @Post('verify-email')
  @HttpCode(200)
  @UseGuards(RateLimitGuard)
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  /**
   * Verify email with token via GET (for email links)
   */
  @Get('verify-email')
  async verifyEmailGet(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }
    return this.authService.verifyEmail(token);
  }

  /**
   * Request password reset
   */
  @Post('request-password-reset')
  @HttpCode(200)
  @UseGuards(RateLimitGuard)
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  /**
   * Reset password with token
   */
  @Post('reset-password')
  @HttpCode(200)
  @UseGuards(RateLimitGuard)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  /**
   * Google OAuth login - initiates OAuth flow
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    // Guard redirects to Google
  }

  /**
   * Google OAuth callback - handles redirect from Google
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any, @Res() res: Response) {
    // req.user contains the OAuth profile from GoogleStrategy
    const token = await this.authService.handleOAuthLogin(req.user);
    // Redirect to frontend with token
    res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?token=${token}`,
    );
  }

  /**
   * GitHub OAuth login - initiates OAuth flow
   */
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubLogin() {
    // Guard redirects to GitHub
  }

  /**
   * GitHub OAuth callback - handles redirect from GitHub
   */
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req: any, @Res() res: Response) {
    // req.user contains the OAuth profile from GithubStrategy
    const token = await this.authService.handleOAuthLogin(req.user);
    // Redirect to frontend with token
    res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?token=${token}`,
    );
  }
}
