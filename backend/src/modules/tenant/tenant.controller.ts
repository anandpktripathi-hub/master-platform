import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { Tenant } from '../../decorators/tenant.decorator';
import { TenantService } from './tenant.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentTenantResponseDto } from './dto/tenant-response.dto';
@ApiTags('Tenant')
@ApiBearerAuth('bearer')
@Controller('tenant')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class TenantController {
  private readonly logger = new Logger(TenantController.name);

  constructor(private readonly tenantService: TenantService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current tenant context' })
  @ApiResponse({ status: 200, description: 'Success', type: CurrentTenantResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async current(
    @Tenant() tenantId: string | undefined,
  ): Promise<CurrentTenantResponseDto> {
    try {
      if (!tenantId) {
        throw new BadRequestException('Tenant ID not found');
      }

      const tenant = await this.tenantService.getCurrentTenant(String(tenantId));
      if (!tenant) {
        throw new BadRequestException('Tenant not found');
      }

      return { tenant };
    } catch (error) {
      const err = error as any;
      this.logger.error(`[current] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
