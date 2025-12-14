import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, BulkCreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // PLATFORM ADMIN ONLY – global user creation
  @Roles('platform_admin')
  @Post()
  async create(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  // PLATFORM ADMIN ONLY – bulk creation
  @Roles('platform_admin')
  @Post('bulk')
  async bulkCreate(@Body() body: BulkCreateUserDto) {
    return this.usersService.bulkCreate(body.users);
  }

  // PUBLIC (no auth) – legacy public listing
  @Get('public')
  @ApiOperation({ summary: 'Get all users public, no auth' })
  async findAllPublic() {
    return this.usersService.findAll(1, 1000);
  }

  // ANY AUTHED USER – current logged-in user (used by frontend AuthContext)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current logged-in user' })
  async getMe(@Req() req: { user?: { userId?: string } }) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.usersService.findOne(userId);
  }

  // PLATFORM ADMIN ONLY – paginated list of all users
  @Roles('platform_admin')
  @Get()
  @ApiOperation({ summary: 'Get all users with pagination' })
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.usersService.findAll(Number(page), Number(limit));
  }

  // PLATFORM ADMIN ONLY – get user by ID
  @Roles('platform_admin')
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // PLATFORM ADMIN ONLY – update user by ID
  @Roles('platform_admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: Record<string, unknown>,
  ) {
    return this.usersService.update(id, updateDto);
  }

  // PLATFORM ADMIN ONLY – delete user by ID
  @Roles('platform_admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID' })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
