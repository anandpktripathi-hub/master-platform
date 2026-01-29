console.log('TEST LOG: file loaded (backend/src/modules/auth/auth.controller.ts)');
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
import { LoginDto } from './dto/login.dto';
import logger from '../../config/logger.config';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Simple login: expects { email, password }
  @Post('login')
  @HttpCode(200)
  @UseGuards(RateLimitGuard)
  async login(@Body() body: LoginDto) {
    console.log('GUARANTEED LOG: login() method in AuthController was called. Body:', body);
    logger.info('here');
    logger.info('[LOGIN CONTROLLER] Received login request body', { body });
    const { email, password } = body;
    logger.info(`[LOGIN ATTEMPT] Email: ${email}`);
    return await this.authService.login(body);
  }

  // Optional stub for register to avoid TS error (can customize later)
  @Post('register')
  register(
    @Body()
    body: {
      id?: string;
      _id?: unknown;
      userId?: string;
      email: string;
      role: string;
      tenantId?: string;
    },
  ) {
    // For now just return a token for the created user payload
    return this.authService.login(body);
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
  async sendVerificationEmail(@Body() body: { email: string }) {
    return this.authService.sendVerificationEmail(body.email);
  }

  /**
   * Verify email with token
   */
  @Post('verify-email')
  @HttpCode(200)
  @UseGuards(RateLimitGuard)
  async verifyEmail(@Body() body: { token: string }) {
    return this.authService.verifyEmail(body.token);
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
  async requestPasswordReset(@Body() body: { email: string }) {
    return this.authService.requestPasswordReset(body.email);
  }

  /**
   * Reset password with token
   */
  @Post('reset-password')
  @HttpCode(200)
  @UseGuards(RateLimitGuard)
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.authService.resetPassword(body.token, body.newPassword);
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
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
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
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
  }
}
