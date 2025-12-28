import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../../database/schemas/user.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('all')
  @Roles('platform_admin')
  findAllPlatform() {
    return this.userService.findAllPlatform();
  }

  @Get()
  @Roles('tenant_admin', 'staff')
  findAllTenant(@Tenant() tenantId: string) {
    return this.userService.findAll(tenantId);
  }

  @Get(':id')
  @Roles('tenant_admin', 'staff')
  findOne(@Param('id') id: string, @Tenant() tenantId: string) {
    return this.userService.findOne(id, tenantId);
  }

  @Get('me')
  getMe(@Req() req: { user?: { userId?: string } }) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User ID not found');
    }
    return this.userService.findMe(userId);
  }

  @Post()
  @Roles('tenant_admin')
  create(@Body() createUserDto: User, @Tenant() tenantId: string) {
    return this.userService.create(createUserDto, tenantId);
  }

  @Put(':id')
  @Roles('tenant_admin')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: User,
    @Tenant() tenantId: string,
  ) {
    return this.userService.update(id, updateUserDto, tenantId);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  remove(@Param('id') id: string, @Tenant() tenantId: string) {
    return this.userService.remove(id, tenantId);
  }
}
