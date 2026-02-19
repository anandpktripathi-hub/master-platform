import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SslService } from './ssl.service';
import { SslAutomationService } from './ssl-automation.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { Roles } from '../../decorators/roles.decorator';

@Controller('tenants/ssl')
export class SslController {
  constructor(
    private readonly sslService: SslService,
    private readonly sslAutomation: SslAutomationService,
  ) {}

  @Get(':domain/status')
  async getSslStatus(@Param('domain') domain: string) {
    return this.sslService.getSslStatus(domain);
  }

  /**
   * Manually trigger an ACME issuance sweep.
   *
   * This is primarily for platform operators to run after
   * deploying ACME/certbot or when debugging automation.
   */
  @Get('admin/run-automation')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  async runAutomation() {
    return this.sslAutomation.runIssuanceSweep();
  }

  /**
   * Resync SSL status for ACME-managed domains using the
   * underlying certificate files on disk.
   */
  @Get('admin/resync-statuses')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  async resyncStatuses() {
    return this.sslAutomation.resyncStatuses();
  }
}
