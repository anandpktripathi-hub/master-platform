import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
@ApiTags('Rbac')
@ApiBearerAuth('bearer')
@Controller('rbac')
@UseGuards(JwtAuthGuard)
export class RbacController {
  constructor(private rbacService: RbacService) {}

  /**
   * Check if a role has permission for a specific field/action/module
   * POST /api/v1/rbac/check-field-permission
   * Body: { roleId, module, action, field }
   * Returns: { allowed: boolean }
   */
  @Post('check-field-permission')
  async checkFieldPermission(
    @Body() body: CheckFieldPermissionDto,
    @CurrentTenant() tenantId: string,
  ) {
    const role = await this.rbacService.getRoleById(tenantId, body.roleId);
    const allowed = RbacService.hasPermissionForField(
      role.permissions,
      body.module,
      body.action,
      body.field,
    );
    return { allowed };
  }

  // ============= PERMISSION ENDPOINTS =============

  @Get('permissions')
  async getAllPermissions() {
    return this.rbacService.getAllPermissions();
  }

  @Get('permissions/module/:module')
  async getPermissionsByModule(@Param('module') module: string) {
    return this.rbacService.getPermissionsByModule(module);
  }

  @Post('permissions')
  async createPermission(@Body() dto: CreatePermissionDto) {
    return this.rbacService.createPermission(dto);
  }

  // ============= ROLE ENDPOINTS =============

  @Post('roles')
  async createRole(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateRoleDto,
  ) {
    return this.rbacService.createRole(tenantId, dto);
  }

  @Get('roles')
  async getRoles(@CurrentTenant() tenantId: string) {
    return this.rbacService.getRolesByTenant(tenantId);
  }

  @Get('roles/:roleId')
  async getRole(
    @CurrentTenant() tenantId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.rbacService.getRoleById(tenantId, roleId);
  }

  @Put('roles/:roleId')
  async updateRole(
    @CurrentTenant() tenantId: string,
    @Param('roleId') roleId: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.rbacService.updateRole(tenantId, roleId, dto);
  }

  @Delete('roles/:roleId')
  @HttpCode(204)
  async deleteRole(
    @CurrentTenant() tenantId: string,
    @Param('roleId') roleId: string,
  ) {
    await this.rbacService.deleteRole(tenantId, roleId);
  }

  // ============= USER TENANT ENDPOINTS =============

  @Post('users')
  async createTenantUser(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateUserDto,
  ) {
    return this.rbacService.createTenantUser(tenantId, dto);
  }

  @Get('users')
  async getTenantUsers(
    @CurrentTenant() tenantId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.rbacService.getTenantUsers(tenantId, page, limit);
  }

  @Put('users/:userTenantId')
  async updateTenantUser(
    @CurrentTenant() tenantId: string,
    @Param('userTenantId') userTenantId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.rbacService.updateTenantUser(tenantId, userTenantId, dto);
  }

  @Delete('users/:userTenantId')
  @HttpCode(204)
  async deleteTenantUser(
    @CurrentTenant() tenantId: string,
    @Param('userTenantId') userTenantId: string,
  ) {
    await this.rbacService.deleteTenantUser(tenantId, userTenantId);
  }

  @Post('users/:userTenantId/reset-password')
  async resetPassword(
    @CurrentTenant() tenantId: string,
    @Param('userTenantId') userTenantId: string,
    @Body() dto: ResetPasswordDto,
  ) {
    await this.rbacService.resetUserPassword(tenantId, userTenantId, dto);
  }

  @Post('users/:userTenantId/toggle-login')
  async toggleLogin(
    @CurrentTenant() tenantId: string,
    @Param('userTenantId') userTenantId: string,
    @Body() body: ToggleLoginDto,
  ) {
    return this.rbacService.toggleUserLogin(
      tenantId,
      userTenantId,
      body.enable,
    );
  }
}
