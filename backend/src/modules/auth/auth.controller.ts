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
  HttpException,
  InternalServerErrorException,
  Logger,
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
  VerifyEmailQueryDto,
} from './dto/auth.dto';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
@ApiTags('Auth')
@Controller('auth')
@Public()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout (stateless JWT)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async logout() {
    try {
      return await this.authService.logout();
    } catch (error) {
      const err = error as any;
      this.logger.error(`[logout] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  // Simple login: expects { email, password }
  @Post('login')
  @HttpCode(200)
  @UseGuards(RateLimitGuard)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 429, description: 'Too Many Requests' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async login(@Body() body: LoginDto) {
    try {
      const { email } = body;
      this.logger.log(`[login] Login attempt: ${email}`);
      return await this.authService.login(body);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[login] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  // Optional stub for register to avoid TS error (can customize later)
  @Post('register')
  @ApiOperation({ summary: 'Register a user (simple)' })
  @ApiBody({ type: SimpleRegisterDto })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Conflict' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async register(@Body() dto: SimpleRegisterDto) {
    try {
      return await this.authService.registerSimple(dto);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[register] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * Phase 2: Public endpoint for 4-step tenant self-registration
   * POST /api/auth/tenant-register
   */
  @Post('tenant-register')
  @UseGuards(RateLimitGuard)
  @ApiOperation({ summary: 'Tenant self-registration (4-step flow)' })
  @ApiBody({ type: TenantRegisterDto })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Conflict' })
  @ApiResponse({ status: 429, description: 'Too Many Requests' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async tenantRegister(@Body() dto: TenantRegisterDto) {
    try {
      return await this.authService.registerTenant(dto);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[tenantRegister] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * Send or resend email verification link
   */
  @Post('send-verification-email')
  @HttpCode(200)
  @UseGuards(RateLimitGuard)
  @ApiOperation({ summary: 'Send or resend email verification link' })
  @ApiBody({ type: SendVerificationEmailDto })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 429, description: 'Too Many Requests' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async sendVerificationEmail(@Body() dto: SendVerificationEmailDto) {
    try {
      return await this.authService.sendVerificationEmail(dto.email);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[sendVerificationEmail] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * Verify email with token
   */
  @Post('verify-email')
  @HttpCode(200)
  @UseGuards(RateLimitGuard)
  @ApiOperation({ summary: 'Verify email with token (POST)' })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 429, description: 'Too Many Requests' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    try {
      return await this.authService.verifyEmail(dto.token);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[verifyEmail] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * Verify email with token via GET (for email links)
   */
  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email with token (GET)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async verifyEmailGet(@Query() query: VerifyEmailQueryDto) {
    try {
      if (!query?.token) {
        throw new BadRequestException('Token is required');
      }
      return await this.authService.verifyEmail(query.token);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[verifyEmailGet] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * Request password reset
   */
  @Post('request-password-reset')
  @HttpCode(200)
  @UseGuards(RateLimitGuard)
  @ApiOperation({ summary: 'Request a password reset email' })
  @ApiBody({ type: RequestPasswordResetDto })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 429, description: 'Too Many Requests' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    try {
      return await this.authService.requestPasswordReset(dto.email);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[requestPasswordReset] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * Reset password with token
   */
  @Post('reset-password')
  @HttpCode(200)
  @UseGuards(RateLimitGuard)
  @ApiOperation({ summary: 'Reset password using a reset token' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 429, description: 'Too Many Requests' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    try {
      return await this.authService.resetPassword(dto.token, dto.newPassword);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[resetPassword] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * Google OAuth login - initiates OAuth flow
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth login (initiates redirect)' })
  @ApiResponse({ status: 302, description: 'Redirect to Google OAuth' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async googleLogin(): Promise<void> {
    try {
      await this.authService.trackOAuthStart('google');
      return;
    } catch (error) {
      const err = error as any;
      this.logger.error(`[googleLogin] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * Google OAuth callback - handles redirect from Google
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback (redirects to frontend with token)' })
  @ApiResponse({ status: 302, description: 'Redirect to frontend with token' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async googleCallback(@Req() req: any, @Res() res: Response) {
    try {
      const token = await this.authService.handleOAuthLogin(req.user);
      res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?token=${token}`,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[googleCallback] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * GitHub OAuth login - initiates OAuth flow
   */
  @Get('github')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'GitHub OAuth login (initiates redirect)' })
  @ApiResponse({ status: 302, description: 'Redirect to GitHub OAuth' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async githubLogin(): Promise<void> {
    try {
      await this.authService.trackOAuthStart('github');
      return;
    } catch (error) {
      const err = error as any;
      this.logger.error(`[githubLogin] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * GitHub OAuth callback - handles redirect from GitHub
   */
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'GitHub OAuth callback (redirects to frontend with token)' })
  @ApiResponse({ status: 302, description: 'Redirect to frontend with token' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async githubCallback(@Req() req: any, @Res() res: Response) {
    try {
      const token = await this.authService.handleOAuthLogin(req.user);
      res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?token=${token}`,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[githubCallback] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
