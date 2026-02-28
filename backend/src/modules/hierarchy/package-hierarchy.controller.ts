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
import { PackageHierarchyService } from './package-hierarchy.service';
import { AssignNodeIdsDto, PackageIdParamDto } from './dto/assign-node-ids.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { Roles } from '../../decorators/roles.decorator';
@ApiTags('Package Hierarchy')
@ApiBearerAuth('bearer')
@Controller('package-hierarchy')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('PLATFORM_SUPERADMIN')
export class PackageHierarchyController {
  private readonly logger = new Logger(PackageHierarchyController.name);

  constructor(private readonly service: PackageHierarchyService) {}

  @Post(':packageId')
  @ApiOperation({ summary: 'Assign hierarchy nodes to a package' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async assignNodes(
    @Param() params: PackageIdParamDto,
    @Body() body: AssignNodeIdsDto,
  ) {
    try {
      return await this.service.assignNodesToPackage(
        params.packageId,
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

  @Get(':packageId')
  @ApiOperation({ summary: 'Get hierarchy nodes assigned to a package' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getNodes(@Param() params: PackageIdParamDto) {
    try {
      return await this.service.getNodesForPackage(params.packageId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getNodes] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Delete(':packageId')
  @ApiOperation({ summary: 'Remove hierarchy node assignment from a package' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async removeAssignment(@Param() params: PackageIdParamDto) {
    try {
      await this.service.removeAssignment(params.packageId);
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
