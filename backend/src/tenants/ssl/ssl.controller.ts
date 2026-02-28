import {
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SslService } from './ssl.service';
import { SslAutomationService } from './ssl-automation.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { Roles } from '../../decorators/roles.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SslDomainParamDto } from './dto/ssl.dto';
@ApiTags('Ssl')
@ApiBearerAuth('bearer')
@Controller('tenants/ssl')
export class SslController {
  private readonly logger = new Logger(SslController.name);

  constructor(
    private readonly sslService: SslService,
    private readonly sslAutomation: SslAutomationService,
  ) {}

  @Get(':domain/status')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(
    'tenant_admin',
    'admin',
    'owner',
    'platform_admin',
    'PLATFORM_SUPER_ADMIN',
    'PLATFORM_SUPERADMIN',
  )
  @ApiOperation({ summary: 'Get SSL status for a domain' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getSslStatus(@Param() params: SslDomainParamDto) {
    try {
      return this.sslService.getSslStatus(params.domain);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getSslStatus] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
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
  @ApiOperation({ summary: 'Run SSL automation issuance sweep (platform)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async runAutomation() {
    try {
      return await this.sslAutomation.runIssuanceSweep();
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[runAutomation] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  /**
   * Resync SSL status for ACME-managed domains using the
   * underlying certificate files on disk.
   */
  @Get('admin/resync-statuses')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'Resync SSL statuses from disk (platform)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async resyncStatuses() {
    try {
      return await this.sslAutomation.resyncStatuses();
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[resyncStatuses] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
