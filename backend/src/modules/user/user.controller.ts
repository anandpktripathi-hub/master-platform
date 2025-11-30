import { Controller, Get, Post, Body, Put, Delete, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../../database/schemas/user.schema';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';

@Controller('users')
@UseGuards(RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(@Tenant() tenantId: string) {
    return this.userService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  @Roles('admin')
  create(@Body() createUserDto: User, @Tenant() tenantId: string) {
    return this.userService.create(createUserDto, tenantId);
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateUserDto: User, @Tenant() tenantId: string) {
    return this.userService.update(id, updateUserDto, tenantId);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
