import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { HierarchyService } from './hierarchy.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { Roles } from '../../decorators/roles.decorator';
import {
  CreateHierarchyNodeDto,
  GetHierarchyTreeQueryDto,
  HierarchyNodeIdParamDto,
  UpdateHierarchyNodeDto,
} from './dto/hierarchy.dto';
@ApiTags('Hierarchy')
@ApiBearerAuth('bearer')
@Controller('hierarchy')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('PLATFORM_SUPERADMIN')
export class HierarchyController {
  private readonly logger = new Logger(HierarchyController.name);

  constructor(private readonly hierarchyService: HierarchyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a hierarchy node' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async create(@Body() data: CreateHierarchyNodeDto) {
    try {
      return await this.hierarchyService.createNode(data);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[create] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a hierarchy node by id' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getNode(@Param() params: HierarchyNodeIdParamDto) {
    try {
      return await this.hierarchyService.getNodeById(params.id);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getNode] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'Get children of a hierarchy node' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getChildren(@Param() params: HierarchyNodeIdParamDto) {
    try {
      return await this.hierarchyService.getChildren(params.id);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getChildren] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a hierarchy node' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async update(
    @Param() params: HierarchyNodeIdParamDto,
    @Body() data: UpdateHierarchyNodeDto,
  ) {
    try {
      return await this.hierarchyService.updateNode(params.id, data);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[update] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a hierarchy node' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async delete(@Param() params: HierarchyNodeIdParamDto) {
    try {
      await this.hierarchyService.deleteNode(params.id);
      return { success: true };
    } catch (error) {
      const err = error as any;
      this.logger.error(`[delete] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get hierarchy tree' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getTree(@Query() query: GetHierarchyTreeQueryDto) {
    try {
      return await this.hierarchyService.getTree(query.rootType);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getTree] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
