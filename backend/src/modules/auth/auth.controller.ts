import {
  Controller,
  Post,
  Body,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { TenantRegisterDto } from './dto/tenant-register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Simple login: expects { email, password }
  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    return this.authService.login({ email, password });
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
  async tenantRegister(@Body() dto: TenantRegisterDto) {
    return this.authService.registerTenant(dto);
  }
}
