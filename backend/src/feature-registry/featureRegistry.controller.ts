import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  HttpException,
  InternalServerErrorException,
  Logger,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FeatureRegistryService } from './featureRegistry.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { Roles } from '../decorators/roles.decorator';
import {
  FeatureNodeDto,
  FeatureRegistryCreateQueryDto,
  FeatureRegistryIdParamDto,
  FeatureRegistryIdRoleParamDto,
  FeatureRegistryIdTenantParamDto,
  UpdateFeatureNodeDto,
} from './dto/feature-registry.dto';
@ApiTags('FeatureRegistry')
@ApiBearerAuth('bearer')
@Controller('features')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('PLATFORM_SUPERADMIN')
export class FeatureRegistryController {
  private readonly logger = new Logger(FeatureRegistryController.name);

  constructor(
    private readonly featureRegistryService: FeatureRegistryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get the full feature registry tree' })
  @ApiResponse({ status: 200, description: 'Feature registry returned' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAll() {
    try {
      return await this.featureRegistryService.getAll();
    } catch (error) {
      this.logger.error(
        '[getAll] Failed to fetch feature registry',
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a feature node by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Feature node returned' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getById(@Param() params: FeatureRegistryIdParamDto) {
    try {
      return await this.featureRegistryService.findById(params.id);
    } catch (error) {
      this.logger.error(
        `[getById] Failed to fetch node (id=${params?.id})`,
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new feature node' })
  @ApiResponse({ status: 200, description: 'Feature registry updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(
    @Body() node: FeatureNodeDto,
    @Query() query: FeatureRegistryCreateQueryDto,
  ) {
    try {
      return await this.featureRegistryService.create(node as any, query.parentId);
    } catch (error) {
      this.logger.error(
        `[create] Failed to create node (parentId=${query?.parentId ?? 'root'})`,
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Patch(':id/assign-role/:role')
  @ApiOperation({ summary: 'Assign a role to a feature node' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'role', type: String })
  @ApiResponse({ status: 200, description: 'Feature node updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async assignRole(@Param() params: FeatureRegistryIdRoleParamDto) {
    try {
      return await this.featureRegistryService.assignRole(params.id, params.role);
    } catch (error) {
      this.logger.error(
        `[assignRole] Failed to assign role (id=${params?.id}, role=${params?.role})`,
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Patch(':id/unassign-role/:role')
  @ApiOperation({ summary: 'Unassign a role from a feature node' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'role', type: String })
  @ApiResponse({ status: 200, description: 'Feature node updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async unassignRole(@Param() params: FeatureRegistryIdRoleParamDto) {
    try {
      return await this.featureRegistryService.unassignRole(params.id, params.role);
    } catch (error) {
      this.logger.error(
        `[unassignRole] Failed to unassign role (id=${params?.id}, role=${params?.role})`,
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Patch(':id/assign-tenant/:tenant')
  @ApiOperation({ summary: 'Assign a tenant to a feature node' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'tenant', type: String })
  @ApiResponse({ status: 200, description: 'Feature node updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async assignTenant(@Param() params: FeatureRegistryIdTenantParamDto) {
    try {
      return await this.featureRegistryService.assignTenant(
        params.id,
        params.tenant,
      );
    } catch (error) {
      this.logger.error(
        `[assignTenant] Failed to assign tenant (id=${params?.id}, tenant=${params?.tenant})`,
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Patch(':id/unassign-tenant/:tenant')
  @ApiOperation({ summary: 'Unassign a tenant from a feature node' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'tenant', type: String })
  @ApiResponse({ status: 200, description: 'Feature node updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async unassignTenant(@Param() params: FeatureRegistryIdTenantParamDto) {
    try {
      return await this.featureRegistryService.unassignTenant(
        params.id,
        params.tenant,
      );
    } catch (error) {
      this.logger.error(
        `[unassignTenant] Failed to unassign tenant (id=${params?.id}, tenant=${params?.tenant})`,
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a feature node' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Feature node updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async update(
    @Param() params: FeatureRegistryIdParamDto,
    @Body() node: UpdateFeatureNodeDto,
  ) {
    try {
      return await this.featureRegistryService.update(params.id, node as any);
    } catch (error) {
      this.logger.error(
        `[update] Failed to update node (id=${params?.id})`,
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a feature node' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Deleted (true/false)' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async delete(@Param() params: FeatureRegistryIdParamDto) {
    try {
      return await this.featureRegistryService.delete(params.id);
    } catch (error) {
      this.logger.error(
        `[delete] Failed to delete node (id=${params?.id})`,
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle enabled status for a feature node' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Feature node toggled' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async toggle(@Param() params: FeatureRegistryIdParamDto) {
    try {
      return await this.featureRegistryService.toggle(params.id);
    } catch (error) {
      this.logger.error(
        `[toggle] Failed to toggle node (id=${params?.id})`,
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
