import { BadRequestException, Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { Tenant } from '../../decorators/tenant.decorator';
import { TenantService } from './tenant.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
@ApiTags('Tenant')
@ApiBearerAuth('bearer')
@Controller('tenant')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get('current')
  async current(@Tenant() tenantId: string | undefined) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found');
    }

    const tenant = await this.tenantService.getCurrentTenant(String(tenantId));
    if (!tenant) {
      throw new BadRequestException('Tenant not found');
    }

    return { tenant };
  }
}
