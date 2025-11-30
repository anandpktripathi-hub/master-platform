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

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @Post('bulk')
  async bulkCreate(@Body() body: BulkCreateUserDto) {
    return this.usersService.bulkCreate(body.users);
  }

  @Get('public')
  @ApiOperation({ summary: 'Get all users (public, no auth)' })
  async findAllPublic() {
    return this.usersService.findAll(1, 1000);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current logged-in user' })
  async getMe(@Req() req: any) {
    const userId = req.user?.userId;
    return this.usersService.findOne(userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination' })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.usersService.findAll(Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  async update(@Param('id') id: string, @Body() updateDto: any) {
    return this.usersService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID' })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
