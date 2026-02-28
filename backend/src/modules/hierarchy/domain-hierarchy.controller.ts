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
import { DomainHierarchyService } from './domain-hierarchy.service';
import { AssignNodeIdsDto, DomainIdParamDto } from './dto/assign-node-ids.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { Roles } from '../../decorators/roles.decorator';
@ApiTags('Domain Hierarchy')
@ApiBearerAuth('bearer')
@Controller('domain-hierarchy')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('PLATFORM_SUPERADMIN')
export class DomainHierarchyController {
  private readonly logger = new Logger(DomainHierarchyController.name);

  constructor(private readonly service: DomainHierarchyService) {}

  @Post(':domainId')
  @ApiOperation({ summary: 'Assign hierarchy nodes to a domain' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async assignNodes(
    @Param() params: DomainIdParamDto,
    @Body() body: AssignNodeIdsDto,
  ) {
    try {
      return await this.service.assignNodesToDomain(
        params.domainId,
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

  @Get(':domainId')
  @ApiOperation({ summary: 'Get hierarchy nodes assigned to a domain' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getNodes(@Param() params: DomainIdParamDto) {
    try {
      return await this.service.getNodesForDomain(params.domainId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getNodes] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Delete(':domainId')
  @ApiOperation({ summary: 'Remove hierarchy node assignment from a domain' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async removeAssignment(@Param() params: DomainIdParamDto) {
    try {
      await this.service.removeAssignment(params.domainId);
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
