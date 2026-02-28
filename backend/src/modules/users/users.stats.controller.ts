import {
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../decorators/roles.decorator';
import { RolesGuard } from '../../guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class UsersStatsDashboardQueryDto {}
@ApiTags('Users Stats')
@ApiBearerAuth('bearer')
@Controller('users/stats')
export class UsersStatsController {
  private readonly logger = new Logger(UsersStatsController.name);

  constructor(private readonly usersService: UsersService) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_admin')
  @ApiOperation({ summary: 'Get user dashboard stats (platform admin only)' })
  @ApiResponse({ status: 200, description: 'Stats returned' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getDashboardStats(@Query() query: UsersStatsDashboardQueryDto) {
    try {
      void query;
      // All users
      const total = await this.usersService.countAll();
      // Customers
      const customers = await this.usersService.countByRole('CUSTOMER_LEGACY');
      // Team members
      const teamMembers = await this.usersService.countByRole('STAFF_LEGACY');
      // Platform admins
      const platformAdmins = await this.usersService.countByRole(
        'PLATFORM_SUPER_ADMIN',
      );
      return {
        totalUsers: total,
        customers,
        teamMembers,
        platformAdmins,
      };
    } catch (error) {
      this.logger.error(
        '[getDashboardStats] Failed to compute user dashboard stats',
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
