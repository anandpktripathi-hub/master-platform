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
import { UserHierarchyService } from './user-hierarchy.service';
import { AssignNodeIdsDto, UserIdParamDto } from './dto/assign-node-ids.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { Roles } from '../../decorators/roles.decorator';
@ApiTags('User Hierarchy')
@ApiBearerAuth('bearer')
@Controller('user-hierarchy')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('PLATFORM_SUPERADMIN')
export class UserHierarchyController {
  private readonly logger = new Logger(UserHierarchyController.name);

  constructor(private readonly service: UserHierarchyService) {}

  @Post(':userId')
  @ApiOperation({ summary: 'Assign hierarchy nodes to a user' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async assignNodes(
    @Param() params: UserIdParamDto,
    @Body() body: AssignNodeIdsDto,
  ) {
    try {
      return await this.service.assignNodesToUser(params.userId, body.nodeIds);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[assignNodes] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get hierarchy nodes assigned to a user' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getNodes(@Param() params: UserIdParamDto) {
    try {
      return await this.service.getNodesForUser(params.userId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getNodes] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Remove hierarchy node assignment from a user' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async removeAssignment(@Param() params: UserIdParamDto) {
    try {
      await this.service.removeAssignment(params.userId);
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
