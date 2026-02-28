import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  Logger,
  Param,
  Query,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RbacService } from './rbac.service';
import {
  CreatePermissionDto,
  CreateRoleDto,
  UpdateRoleDto,
  CreateUserDto,
  UpdateUserDto,
  ResetPasswordDto,
  CheckFieldPermissionDto,
  ToggleLoginDto,
} from './dto/rbac.dto';
import { CurrentTenant } from '../../decorators/tenant.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  RbacModuleParamDto,
  RoleIdParamDto,
  UserTenantIdParamDto,
} from './dto/rbac-params.dto';
import { RbacUsersQueryDto } from './dto/rbac-users-query.dto';
@ApiTags('Rbac')
@ApiBearerAuth('bearer')
@Controller('rbac')
@UseGuards(JwtAuthGuard)
export class RbacController {
  private readonly logger = new Logger(RbacController.name);

  constructor(private rbacService: RbacService) {}

  /**
   * Check if a role has permission for a specific field/action/module
   * POST /api/v1/rbac/check-field-permission
   * Body: { roleId, module, action, field }
   * Returns: { allowed: boolean }
   */
  @Post('check-field-permission')
  @ApiOperation({ summary: 'Check whether role has field permission' })
  @ApiResponse({ status: 200, description: 'Check result returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async checkFieldPermission(
    @Body() body: CheckFieldPermissionDto,
    @CurrentTenant() tenantId: string,
  ) {
    try {
      if (!tenantId) {
        throw new BadRequestException('Tenant ID not found');
      }
      const role = await this.rbacService.getRoleById(tenantId, body.roleId);
      const allowed = RbacService.hasPermissionForField(
        role.permissions,
        body.module,
        body.action,
        body.field,
      );
      return { allowed };
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[checkFieldPermission] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to check field permission',
          );
    }
  }

  // ============= PERMISSION ENDPOINTS =============

  @Get('permissions')
  @ApiOperation({ summary: 'List all permissions' })
  @ApiResponse({ status: 200, description: 'Permissions returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getAllPermissions() {
    try {
      return await this.rbacService.getAllPermissions();
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getAllPermissions] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list permissions');
    }
  }

  @Get('permissions/module/:module')
  @ApiOperation({ summary: 'List permissions by module' })
  @ApiResponse({ status: 200, description: 'Permissions returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getPermissionsByModule(@Param() params: RbacModuleParamDto) {
    try {
      return await this.rbacService.getPermissionsByModule(params.module);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getPermissionsByModule] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to list permissions by module',
          );
    }
  }

  @Post('permissions')
  @ApiOperation({ summary: 'Create permission' })
  @ApiResponse({ status: 201, description: 'Permission created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createPermission(@Body() dto: CreatePermissionDto) {
    try {
      return await this.rbacService.createPermission(dto);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[createPermission] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create permission');
    }
  }

  // ============= ROLE ENDPOINTS =============

  @Post('roles')
  @ApiOperation({ summary: 'Create role (tenant)' })
  @ApiResponse({ status: 201, description: 'Role created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createRole(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateRoleDto,
  ) {
    try {
      if (!tenantId) {
        throw new BadRequestException('Tenant ID not found');
      }
      return await this.rbacService.createRole(tenantId, dto);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[createRole] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create role');
    }
  }

  @Get('roles')
  @ApiOperation({ summary: 'List roles (tenant)' })
  @ApiResponse({ status: 200, description: 'Roles returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getRoles(@CurrentTenant() tenantId: string) {
    try {
      if (!tenantId) {
        throw new BadRequestException('Tenant ID not found');
      }
      return await this.rbacService.getRolesByTenant(tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getRoles] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list roles');
    }
  }

  @Get('roles/:roleId')
  @ApiOperation({ summary: 'Get role by id (tenant)' })
  @ApiResponse({ status: 200, description: 'Role returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getRole(
    @CurrentTenant() tenantId: string,
    @Param() params: RoleIdParamDto,
  ) {
    try {
      if (!tenantId) {
        throw new BadRequestException('Tenant ID not found');
      }
      return await this.rbacService.getRoleById(tenantId, params.roleId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getRole] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get role');
    }
  }

  @Put('roles/:roleId')
  @ApiOperation({ summary: 'Update role (tenant)' })
  @ApiResponse({ status: 200, description: 'Role updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateRole(
    @CurrentTenant() tenantId: string,
    @Param() params: RoleIdParamDto,
    @Body() dto: UpdateRoleDto,
  ) {
    try {
      if (!tenantId) {
        throw new BadRequestException('Tenant ID not found');
      }
      return await this.rbacService.updateRole(tenantId, params.roleId, dto);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[updateRole] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update role');
    }
  }

  @Delete('roles/:roleId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete role (tenant)' })
  @ApiResponse({ status: 204, description: 'Role deleted' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteRole(
    @CurrentTenant() tenantId: string,
    @Param() params: RoleIdParamDto,
  ) {
    try {
      if (!tenantId) {
        throw new BadRequestException('Tenant ID not found');
      }
      await this.rbacService.deleteRole(tenantId, params.roleId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[deleteRole] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to delete role');
    }
  }

  // ============= USER TENANT ENDPOINTS =============

  @Post('users')
  @ApiOperation({ summary: 'Create tenant user' })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createTenantUser(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateUserDto,
  ) {
    try {
      if (!tenantId) {
        throw new BadRequestException('Tenant ID not found');
      }
      return await this.rbacService.createTenantUser(tenantId, dto);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[createTenantUser] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create user');
    }
  }

  @Get('users')
  @ApiOperation({ summary: 'List tenant users' })
  @ApiResponse({ status: 200, description: 'Users returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getTenantUsers(
    @CurrentTenant() tenantId: string,
    @Query() query: RbacUsersQueryDto,
  ) {
    try {
      if (!tenantId) {
        throw new BadRequestException('Tenant ID not found');
      }
      return await this.rbacService.getTenantUsers(
        tenantId,
        query.page ?? 1,
        query.limit ?? 10,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getTenantUsers] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list users');
    }
  }

  @Put('users/:userTenantId')
  @ApiOperation({ summary: 'Update tenant user' })
  @ApiResponse({ status: 200, description: 'User updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateTenantUser(
    @CurrentTenant() tenantId: string,
    @Param() params: UserTenantIdParamDto,
    @Body() dto: UpdateUserDto,
  ) {
    try {
      if (!tenantId) {
        throw new BadRequestException('Tenant ID not found');
      }
      return await this.rbacService.updateTenantUser(
        tenantId,
        params.userTenantId,
        dto,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateTenantUser] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update user');
    }
  }

  @Delete('users/:userTenantId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete tenant user' })
  @ApiResponse({ status: 204, description: 'User deleted' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteTenantUser(
    @CurrentTenant() tenantId: string,
    @Param() params: UserTenantIdParamDto,
  ) {
    try {
      if (!tenantId) {
        throw new BadRequestException('Tenant ID not found');
      }
      await this.rbacService.deleteTenantUser(tenantId, params.userTenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[deleteTenantUser] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to delete user');
    }
  }

  @Post('users/:userTenantId/reset-password')
  @ApiOperation({ summary: 'Reset tenant user password' })
  @ApiResponse({ status: 200, description: 'Password reset' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async resetPassword(
    @CurrentTenant() tenantId: string,
    @Param() params: UserTenantIdParamDto,
    @Body() dto: ResetPasswordDto,
  ) {
    try {
      if (!tenantId) {
        throw new BadRequestException('Tenant ID not found');
      }
      await this.rbacService.resetUserPassword(
        tenantId,
        params.userTenantId,
        dto,
      );
      return { success: true };
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[resetPassword] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to reset password');
    }
  }

  @Post('users/:userTenantId/toggle-login')
  @ApiOperation({ summary: 'Enable/disable tenant user login' })
  @ApiResponse({ status: 200, description: 'Login toggled' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async toggleLogin(
    @CurrentTenant() tenantId: string,
    @Param() params: UserTenantIdParamDto,
    @Body() body: ToggleLoginDto,
  ) {
    try {
      if (!tenantId) {
        throw new BadRequestException('Tenant ID not found');
      }
      return await this.rbacService.toggleUserLogin(
        tenantId,
        params.userTenantId,
        body.enable,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(`[toggleLogin] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to toggle login');
    }
  }
}
