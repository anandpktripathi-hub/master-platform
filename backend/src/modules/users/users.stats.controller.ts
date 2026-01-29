import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users/stats')
export class UsersStatsController {
  constructor(private readonly usersService: UsersService) {}

  @Get('dashboard')
  async getDashboardStats() {
    // All users
    const total = await this.usersService.countAll();
    // Customers
    const customers = await this.usersService.countByRole('CUSTOMER_LEGACY');
    // Team members
    const teamMembers = await this.usersService.countByRole('STAFF_LEGACY');
    // Platform admins
    const platformAdmins = await this.usersService.countByRole('PLATFORM_SUPER_ADMIN');
    return {
      totalUsers: total,
      customers,
      teamMembers,
      platformAdmins,
    };
  }
}
