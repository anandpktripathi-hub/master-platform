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
import { RoleHierarchyService } from './role-hierarchy.service';
import { AssignNodeIdsDto, RoleNameParamDto } from './dto/assign-node-ids.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { Roles } from '../../decorators/roles.decorator';
@ApiTags('Role Hierarchy')
@ApiBearerAuth('bearer')
@Controller('role-hierarchy')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('PLATFORM_SUPERADMIN')
export class RoleHierarchyController {
  private readonly logger = new Logger(RoleHierarchyController.name);

  constructor(private readonly service: RoleHierarchyService) {}

  @Post(':roleName')
  @ApiOperation({ summary: 'Assign hierarchy nodes to a role' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async assignNodes(
    @Param() params: RoleNameParamDto,
    @Body() body: AssignNodeIdsDto,
  ) {
    try {
      return await this.service.assignNodesToRole(params.roleName, body.nodeIds);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[assignNodes] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Get(':roleName')
  @ApiOperation({ summary: 'Get hierarchy nodes assigned to a role' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getNodes(@Param() params: RoleNameParamDto) {
    try {
      return await this.service.getNodesForRole(params.roleName);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getNodes] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Delete(':roleName')
  @ApiOperation({ summary: 'Remove hierarchy node assignment from a role' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async removeAssignment(@Param() params: RoleNameParamDto) {
    try {
      await this.service.removeAssignment(params.roleName);
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
