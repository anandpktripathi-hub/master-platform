import {
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserIdParamDto } from './dto/user-id-param.dto';
@ApiTags('User')
@ApiBearerAuth('bearer')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Get('all')
  @Roles('platform_admin')
  @ApiOperation({ summary: 'List all platform users (platform)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  findAllPlatform() {
    try {
      return this.userService.findAllPlatform();
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[findAllPlatform] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Get()
  @Roles('tenant_admin', 'staff')
  @ApiOperation({ summary: 'List users for current tenant' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  findAllTenant(@Tenant() tenantId: string) {
    try {
      return this.userService.findAll(tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[findAllTenant] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  getMe(@Req() req: RequestWithUser) {
    try {
      const userId =
        req.user?.userId ??
        req.user?.sub ??
        req.user?.id ??
        (req.user?._id ? String(req.user._id) : undefined);
      if (!userId) {
        throw new BadRequestException('User ID not found');
      }
      return this.userService.findMe(String(userId));
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getMe] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Get(':id')
  @Roles('tenant_admin', 'staff')
  @ApiOperation({ summary: 'Get a tenant user by id' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  findOne(@Param() params: UserIdParamDto, @Tenant() tenantId: string) {
    try {
      return this.userService.findOne(params.id, tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[findOne] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Post()
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Create a tenant user' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  create(@Body() createUserDto: CreateUserDto, @Tenant() tenantId: string) {
    try {
      return this.userService.create(createUserDto as any, tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[create] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Put(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Update a tenant user' })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  update(
    @Param() params: UserIdParamDto,
    @Body() updateUserDto: UpdateUserDto,
    @Tenant() tenantId: string,
  ) {
    try {
      return this.userService.update(params.id, updateUserDto as any, tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[update] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Remove a tenant user' })
  @ApiResponse({ status: 200, description: 'Removed' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  remove(@Param() params: UserIdParamDto, @Tenant() tenantId: string) {
    try {
      return this.userService.remove(params.id, tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[remove] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
