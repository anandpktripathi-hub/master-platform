import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  UseGuards,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  HttpException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { CreateTenantUserDto, UpdateTenantUserDto } from './dto/user.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserIdParamDto } from '../users/dto/user-id-param.dto';

// OLD, tenant-scoped user controller.
// Used by tenant_admin to manage staff inside THEIR tenant only.
@ApiTags('User')
@ApiBearerAuth('bearer')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  // Tenant Admin: list users in own tenant
  @Roles('tenant_admin')
  @Get()
  @ApiOperation({ summary: 'List users in current tenant (tenant admin)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findAll(@Tenant() tenantId: string) {
    try {
      if (!tenantId) throw new BadRequestException('tenantId is required');
      return await this.userService.findAll(tenantId);
    } catch (error) {
      this.logger.error('findAll failed', error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to list tenant users');
    }
  }

  // Tenant Admin: get single user in own tenant
  @Roles('tenant_admin')
  @Get(':id')
  @ApiOperation({ summary: 'Get a user in current tenant (tenant admin)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findOne(@Param() params: UserIdParamDto, @Tenant() tenantId: string) {
    try {
      if (!tenantId) throw new BadRequestException('tenantId is required');
      return await this.userService.findOne(params.id, tenantId);
    } catch (error) {
      this.logger.error('findOne failed', error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch tenant user');
    }
  }

  // Tenant Admin: create staff in own tenant
  @Roles('tenant_admin')
  @Post()
  @ApiOperation({ summary: 'Create a user in current tenant (tenant admin)' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async create(
    @Body() createUserDto: CreateTenantUserDto,
    @Tenant() tenantId: string,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('tenantId is required');
      return await this.userService.create(createUserDto, tenantId);
    } catch (error) {
      this.logger.error('create failed', error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to create tenant user');
    }
  }

  // Tenant Admin: update staff in own tenant
  @Roles('tenant_admin')
  @Put(':id')
  @ApiOperation({ summary: 'Update a user in current tenant (tenant admin)' })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async update(
    @Param() params: UserIdParamDto,
    @Body() updateUserDto: UpdateTenantUserDto,
    @Tenant() tenantId: string,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('tenantId is required');
      return await this.userService.update(params.id, updateUserDto, tenantId);
    } catch (error) {
      this.logger.error('update failed', error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to update tenant user');
    }
  }

  // Tenant Admin: delete staff in own tenant
  @Roles('tenant_admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user in current tenant (tenant admin)' })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async remove(@Param() params: UserIdParamDto, @Tenant() tenantId: string) {
    try {
      if (!tenantId) throw new BadRequestException('tenantId is required');
      return await this.userService.remove(params.id, tenantId);
    } catch (error) {
      this.logger.error('remove failed', error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to delete tenant user');
    }
  }
}

