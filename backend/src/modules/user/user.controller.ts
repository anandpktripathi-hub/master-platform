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
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { CreateTenantUserDto, UpdateTenantUserDto } from './dto/user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

// OLD, tenant-scoped user controller.
// Used by tenant_admin to manage staff inside THEIR tenant only.
@ApiTags('User')
@ApiBearerAuth('bearer')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Tenant Admin: list users in own tenant
  @Roles('tenant_admin')
  @Get()
  findAll(@Tenant() tenantId: string) {
    if (!tenantId) throw new BadRequestException('tenantId is required');
    return this.userService.findAll(tenantId);
  }

  // Tenant Admin: get single user in own tenant
  @Roles('tenant_admin')
  @Get(':id')
  findOne(@Param('id') id: string, @Tenant() tenantId: string) {
    if (!tenantId) throw new BadRequestException('tenantId is required');
    return this.userService.findOne(id, tenantId);
  }

  // Tenant Admin: create staff in own tenant
  @Roles('tenant_admin')
  @Post()
  create(@Body() createUserDto: CreateTenantUserDto, @Tenant() tenantId: string) {
    if (!tenantId) throw new BadRequestException('tenantId is required');
    return this.userService.create(createUserDto, tenantId);
  }

  // Tenant Admin: update staff in own tenant
  @Roles('tenant_admin')
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateTenantUserDto,
    @Tenant() tenantId: string,
  ) {
    if (!tenantId) throw new BadRequestException('tenantId is required');
    return this.userService.update(id, updateUserDto, tenantId);
  }

  // Tenant Admin: delete staff in own tenant
  @Roles('tenant_admin')
  @Delete(':id')
  remove(@Param('id') id: string, @Tenant() tenantId: string) {
    if (!tenantId) throw new BadRequestException('tenantId is required');
    return this.userService.remove(id, tenantId);
  }
}

