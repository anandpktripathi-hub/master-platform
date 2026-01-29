import { Controller, Get } from '@nestjs/common';

@Controller('orders/stats')
export class OrdersStatsController {
  @Get('dashboard')
  async getDashboardStats() {
    // Placeholder: return dummy stats
    return {
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
    };
  }
}
