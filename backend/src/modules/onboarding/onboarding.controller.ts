import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { RoleGuard } from '../../guards/role.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { OnboardingService } from './onboarding.service';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
@ApiTags('Onboarding')
@ApiBearerAuth('bearer')
@Controller('onboarding')
@UseGuards(JwtAuthGuard, WorkspaceGuard, RoleGuard)
@Roles('TENANT_ADMIN', 'PLATFORM_SUPER_ADMIN')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

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

  @Post('seed-sample')
  async seedSample(@Request() req: RequestWithUser, @Tenant() tenantId?: string) {
    if (!req.user) {
      throw new BadRequestException('User not authenticated');
    }
    const tenantIdRaw = tenantId ?? req.user.tenantId;
    const userIdRaw = req.user.sub ?? req.user.userId ?? req.user.id ?? req.user._id;

    if (!tenantIdRaw) {
      throw new BadRequestException('Tenant ID not found');
    }
    if (!userIdRaw) {
      throw new BadRequestException('User ID not found');
    }

    const userTenantId = req.user.tenantId ? String(req.user.tenantId) : undefined;
    if (
      userTenantId &&
      String(tenantIdRaw) !== userTenantId &&
      !this.isPlatformSuperAdmin(req.user.role)
    ) {
      throw new ForbiddenException('Cross-tenant access denied');
    }

    return this.onboardingService.seedSampleData({
      tenantId: String(tenantIdRaw),
      userId: String(userIdRaw),
    });
  }

  @Get('sample-status')
  async getSampleStatus(
    @Request() req: RequestWithUser,
    @Tenant() tenantId?: string,
  ) {
    if (!req.user) {
      throw new BadRequestException('User not authenticated');
    }
    const tenantIdRaw = tenantId ?? req.user.tenantId;
    if (!tenantIdRaw) {
      throw new BadRequestException('Tenant ID not found');
    }

    const userTenantId = req.user.tenantId ? String(req.user.tenantId) : undefined;
    if (
      userTenantId &&
      String(tenantIdRaw) !== userTenantId &&
      !this.isPlatformSuperAdmin(req.user.role)
    ) {
      throw new ForbiddenException('Cross-tenant access denied');
    }

    return this.onboardingService.getSampleStatus({ tenantId: String(tenantIdRaw) });
  }
}
