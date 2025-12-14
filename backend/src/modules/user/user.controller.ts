import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../../database/schemas/user.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';

// OLD, tenant-scoped user controller.
// Used by tenant_admin to manage staff inside THEIR tenant only.
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Tenant Admin: list users in own tenant
  @Roles('tenant_admin')
  @Get()
  findAll(@Tenant() tenantId: string) {
    return this.userService.findAll(tenantId);
  }

  // Tenant Admin: get single user in own tenant
  @Roles('tenant_admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  // Tenant Admin: create staff in own tenant
  @Roles('tenant_admin')
  @Post()
  create(@Body() createUserDto: User, @Tenant() tenantId: string) {
    return this.userService.create(createUserDto, tenantId);
  }

  // Tenant Admin: update staff in own tenant
  @Roles('tenant_admin')
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: User,
    @Tenant() tenantId: string,
  ) {
    return this.userService.update(id, updateUserDto, tenantId);
  }

  // Tenant Admin: delete staff in own tenant
  @Roles('tenant_admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
