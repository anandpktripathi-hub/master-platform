import {
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  GetSampleStatusResponseDto,
  SeedSampleDataResponseDto,
} from './dto/onboarding-response.dto';
@ApiTags('Onboarding')
@ApiBearerAuth('bearer')
@Controller('onboarding')
@UseGuards(JwtAuthGuard, WorkspaceGuard, RoleGuard)
@Roles('TENANT_ADMIN', 'PLATFORM_SUPER_ADMIN')
export class OnboardingController {
  private readonly logger = new Logger(OnboardingController.name);

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
  @ApiOperation({ summary: 'Seed sample data into the tenant workspace' })
  @ApiResponse({ status: 201, description: 'Seed started/completed', type: SeedSampleDataResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async seedSample(
    @Request() req: RequestWithUser,
    @Tenant() tenantId?: string,
  ): Promise<SeedSampleDataResponseDto> {
    try {
      if (!req.user) {
        throw new BadRequestException('User not authenticated');
      }
      const tenantIdRaw = tenantId ?? req.user.tenantId;
      const userIdRaw =
        req.user.sub ?? req.user.userId ?? req.user.id ?? req.user._id;

      if (!tenantIdRaw) {
        throw new BadRequestException('Tenant ID not found');
      }
      if (!userIdRaw) {
        throw new BadRequestException('User ID not found');
      }

      const userTenantId = req.user.tenantId
        ? String(req.user.tenantId)
        : undefined;
      if (
        userTenantId &&
        String(tenantIdRaw) !== userTenantId &&
        !this.isPlatformSuperAdmin(req.user.role)
      ) {
        throw new ForbiddenException('Cross-tenant access denied');
      }

      return await this.onboardingService.seedSampleData({
        tenantId: String(tenantIdRaw),
        userId: String(userIdRaw),
      });
    } catch (error) {
      const err = error as any;
      this.logger.error(`[seedSample] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Get('sample-status')
  @ApiOperation({ summary: 'Get sample-data seeding status for a tenant' })
  @ApiResponse({ status: 200, description: 'Success', type: GetSampleStatusResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getSampleStatus(
    @Request() req: RequestWithUser,
    @Tenant() tenantId?: string,
  ): Promise<GetSampleStatusResponseDto> {
    try {
      if (!req.user) {
        throw new BadRequestException('User not authenticated');
      }
      const tenantIdRaw = tenantId ?? req.user.tenantId;
      if (!tenantIdRaw) {
        throw new BadRequestException('Tenant ID not found');
      }

      const userTenantId = req.user.tenantId
        ? String(req.user.tenantId)
        : undefined;
      if (
        userTenantId &&
        String(tenantIdRaw) !== userTenantId &&
        !this.isPlatformSuperAdmin(req.user.role)
      ) {
        throw new ForbiddenException('Cross-tenant access denied');
      }

      return await this.onboardingService.getSampleStatus({
        tenantId: String(tenantIdRaw),
      });
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getSampleStatus] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
