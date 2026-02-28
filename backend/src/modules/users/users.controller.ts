import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../decorators/roles.decorator';
import { RolesGuard } from '../../guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { objectIdToString } from '../../utils/objectIdToString';
import { BulkCreateUserDto, CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { Public } from '../../common/decorators/public.decorator';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';
import { UserIdParamDto } from './dto/user-id-param.dto';
import { UsersPaginationQueryDto } from './dto/users-pagination-query.dto';

@ApiTags('Users')
@ApiBearerAuth('bearer')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  // PLATFORM ADMIN ONLY – global user creation
  @Roles('platform_admin')
  @Post()
  @ApiOperation({ summary: 'Create a user (platform)' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async create(@Body() body: CreateUserDto) {
    try {
      return await this.usersService.create(body);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[create] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  // PLATFORM ADMIN ONLY – bulk creation
  @Roles('platform_admin')
  @Post('bulk')
  @ApiOperation({ summary: 'Bulk create users (platform)' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async bulkCreate(@Body() body: BulkCreateUserDto) {
    try {
      return await this.usersService.bulkCreate(body.users);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[bulkCreate] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  // PUBLIC (no auth) – legacy public listing
  @Get('public')
  @ApiOperation({ summary: 'Get all users (public legacy endpoint)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Public()
  async findAllPublic() {
    try {
      return await this.usersService.findAll(1, 1000);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[findAllPublic] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  // ANY AUTHED USER – current logged-in user (used by frontend AuthContext)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current logged-in user' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getMe(@Req() req: RequestWithUser) {
    try {
      let userId = req.user?.userId || req.user?.sub || req.user?.id;
      if (!userId && req.user?._id) {
        userId = objectIdToString(req.user._id as any);
      }
      if (!userId) {
        throw new BadRequestException('User ID not found in request');
      }
      return await this.usersService.findOne(String(userId));
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getMe] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  // PLATFORM ADMIN ONLY – paginated list of all users
  @Roles('platform_admin')
  @Get()
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findAll(@Query() query: UsersPaginationQueryDto) {
    try {
      const page = query.page ?? 1;
      const limit = query.limit ?? 10;
      return await this.usersService.findAll(page, limit);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[findAll] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  // PLATFORM ADMIN ONLY – get user by ID
  @Roles('platform_admin')
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findOne(@Param() params: UserIdParamDto) {
    try {
      return await this.usersService.findOne(params.id);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[findOne] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  // PLATFORM ADMIN ONLY – update user by ID
  @Roles('platform_admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async update(
    @Param() params: UserIdParamDto,
    @Body() updateDto: UpdateUserDto,
  ) {
    try {
      return await this.usersService.update(params.id, updateDto);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[update] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  // PLATFORM ADMIN ONLY – delete user by ID
  @Roles('platform_admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({ status: 200, description: 'Deleted' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async remove(@Param() params: UserIdParamDto) {
    try {
      return await this.usersService.remove(params.id);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[remove] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
