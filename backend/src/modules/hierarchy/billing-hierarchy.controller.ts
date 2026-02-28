import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BillingHierarchyService } from './billing-hierarchy.service';
import { AssignNodeIdsDto, BillingIdParamDto } from './dto/assign-node-ids.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { Roles } from '../../decorators/roles.decorator';
@ApiTags('Billing Hierarchy')
@ApiBearerAuth('bearer')
@Controller('billing-hierarchy')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('PLATFORM_SUPERADMIN')
export class BillingHierarchyController {
  private readonly logger = new Logger(BillingHierarchyController.name);

  constructor(private readonly service: BillingHierarchyService) {}

  @Post(':billingId')
  @ApiOperation({ summary: 'Assign hierarchy nodes to a billing record' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async assignNodes(
    @Param() params: BillingIdParamDto,
    @Body() body: AssignNodeIdsDto,
  ) {
    try {
      return await this.service.assignNodesToBilling(
        params.billingId,
        body.nodeIds,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(`[assignNodes] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Get(':billingId')
  @ApiOperation({ summary: 'Get hierarchy nodes assigned to a billing record' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getNodes(@Param() params: BillingIdParamDto) {
    try {
      return await this.service.getNodesForBilling(params.billingId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getNodes] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Delete(':billingId')
  @ApiOperation({ summary: 'Remove hierarchy node assignment from a billing record' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async removeAssignment(@Param() params: BillingIdParamDto) {
    try {
      await this.service.removeAssignment(params.billingId);
      return { success: true };
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[removeAssignment] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
