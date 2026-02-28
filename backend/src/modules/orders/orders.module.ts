import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersStatsController } from './orders.stats.controller';
import { OrdersStatsService } from './services/orders-stats.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './services/orders.service';
import { WorkspaceSharedModule } from '../../workspaces/workspace-shared.module';
import {
  PosOrder,
  PosOrderSchema,
} from '../../database/schemas/pos-order.schema';
import {
  DomainResellerOrder,
  DomainResellerOrderSchema,
} from '../../database/schemas/domain-reseller-order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PosOrder.name, schema: PosOrderSchema },
      { name: DomainResellerOrder.name, schema: DomainResellerOrderSchema },
    ]),
    WorkspaceSharedModule,
  ],
  controllers: [OrdersStatsController, OrdersController],
  providers: [OrdersStatsService, OrdersService],
})
export class OrdersModule {}
