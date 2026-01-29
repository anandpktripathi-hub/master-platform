import { Module } from '@nestjs/common';
import { OrdersStatsController } from './orders.stats.controller';

@Module({
  controllers: [OrdersStatsController],
})
export class OrdersModule {}
