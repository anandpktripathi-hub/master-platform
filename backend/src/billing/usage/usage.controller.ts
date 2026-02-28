import {
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { UsageMeterService } from './usage-meter.service';
import { UsageTenantParamDto } from './dto/usage.dto';

@ApiTags('Billing - Usage')
@ApiBearerAuth()
@Controller('billing/usage')
export class UsageController {
  private readonly logger = new Logger(UsageController.name);

  constructor(private readonly usageMeterService: UsageMeterService) {}

  @Get(':tenantId')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiOperation({ summary: 'Get usage metrics for a tenant' })
  @ApiResponse({ status: 200, description: 'Usage metrics returned' })
  @ApiResponse({ status: 400, description: 'Invalid tenant id' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getUsage(@Param() params: UsageTenantParamDto) {
    try {
      return await this.usageMeterService.getUsage(params.tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getUsage] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get usage');
    }
  }
}
