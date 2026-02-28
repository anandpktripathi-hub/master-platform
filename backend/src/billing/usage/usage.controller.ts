import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { UsageMeterService } from './usage-meter.service';
import { UsageTenantParamDto } from './dto/usage.dto';

@ApiTags('Billing - Usage')
@ApiBearerAuth()
@Controller('billing/usage')
export class UsageController {
  constructor(private readonly usageMeterService: UsageMeterService) {}

  @Get(':tenantId')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiOperation({ summary: 'Get usage metrics for a tenant' })
  @ApiResponse({ status: 200, description: 'Usage metrics returned' })
  @ApiResponse({ status: 400, description: 'Invalid tenant id' })
  async getUsage(@Param() params: UsageTenantParamDto) {
    return this.usageMeterService.getUsage(params.tenantId);
  }
}
