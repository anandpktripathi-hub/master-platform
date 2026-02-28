import {
  BadRequestException,
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  HttpException,
  InternalServerErrorException,
  Logger,
  ForbiddenException,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { DomainService } from './domain.service';
import { VerifyDomainDto } from './dto/verify-domain.dto';
import { MapDomainDto } from './dto/map-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';
import { TenantIdParamDto } from './dto/tenant-id-param.dto';
@ApiTags('Domain')
@ApiBearerAuth('bearer')
@Controller('tenants/domain')
@UseGuards(JwtAuthGuard, TenantGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class DomainController {
  private readonly logger = new Logger(DomainController.name);

  constructor(private readonly domainService: DomainService) {}

  private isPlatformSuperAdmin(rawRole?: string): boolean {
    if (!rawRole) return false;
    const role = rawRole.trim();
    return (
      role === 'PLATFORM_SUPER_ADMIN' ||
      role === 'PLATFORM_SUPERADMIN' ||
      role === 'platform_admin' ||
      role === 'PLATFORM_ADMIN_LEGACY'
    );
  }

  private toHttpException(err: any): HttpException {
    if (err instanceof HttpException) return err;
    if (err && typeof err === 'object' && err.status && err.message) {
      return new HttpException(String(err.message), Number(err.status));
    }
    return new InternalServerErrorException('An unexpected error occurred');
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify DNS configuration for a domain' })
  @ApiResponse({ status: 201, description: 'Verified' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async verifyDomain(
    @Body() verifyDomainDto: VerifyDomainDto,
    @Req() req: RequestWithUser,
  ) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        throw new BadRequestException('Tenant ID not found in auth context');
      }
      return await this.domainService.verifyDomain(
        verifyDomainDto,
        tenantId,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[verifyDomain] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw this.toHttpException(err);
    }
  }

  @Post('map')
  @ApiOperation({ summary: 'Map a custom domain to the tenant' })
  @ApiResponse({ status: 201, description: 'Mapped' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async mapDomain(
    @Body() mapDomainDto: MapDomainDto,
    @Req() req: RequestWithUser,
  ) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        throw new BadRequestException('Tenant ID not found in auth context');
      }
      return await this.domainService.mapDomain(
        mapDomainDto,
        tenantId,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(`[mapDomain] ${err?.message ?? String(err)}`, err?.stack);
      throw this.toHttpException(err);
    }
  }

  @Post('update')
  @ApiOperation({ summary: 'Update a mapped domain configuration' })
  @ApiResponse({ status: 201, description: 'Updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateDomain(
    @Body() updateDomainDto: UpdateDomainDto,
    @Req() req: RequestWithUser,
  ) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        throw new BadRequestException('Tenant ID not found in auth context');
      }
      return await this.domainService.updateDomain(
        updateDomainDto,
        tenantId,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateDomain] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw this.toHttpException(err);
    }
  }

  @Get(':tenantId/domains')
  @ApiOperation({ summary: 'Get domains mapped to a tenant' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getDomains(
    @Param() params: TenantIdParamDto,
    @Req() req: RequestWithUser,
  ) {
    try {
      const requestedTenantId = String(params.tenantId);

      const userTenantId = req.user?.tenantId ? String(req.user.tenantId) : undefined;
      if (
        userTenantId &&
        requestedTenantId !== userTenantId &&
        !this.isPlatformSuperAdmin(req.user?.role)
      ) {
        throw new ForbiddenException('Cross-tenant access denied');
      }

      return await this.domainService.getDomains(requestedTenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getDomains] ${err?.message ?? String(err)}`, err?.stack);
      throw this.toHttpException(err);
    }
  }
}
