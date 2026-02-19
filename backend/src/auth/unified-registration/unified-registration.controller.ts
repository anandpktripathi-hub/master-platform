import { Controller, Post, Body } from '@nestjs/common';
import { UnifiedRegistrationService } from './unified-registration.service';

@Controller('auth/unified-register')
export class UnifiedRegistrationController {
  constructor(
    private readonly unifiedRegistrationService: UnifiedRegistrationService,
  ) {}

  @Post()
  async register(
    @Body()
    dto: {
      email: string;
      password: string;
      tenantIds: string[];
      roles: string[];
    },
  ) {
    // Register user with same email in multiple tenants/roles
    return this.unifiedRegistrationService.register(dto);
  }
}
