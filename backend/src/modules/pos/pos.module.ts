import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WarehouseStock, WarehouseStockSchema } from '../../database/schemas/warehouse-stock.schema';
import { StockMovement, StockMovementSchema } from '../../database/schemas/stock-movement.schema';
import { PosOrder, PosOrderSchema } from '../../database/schemas/pos-order.schema';
import { Product, ProductSchema } from '../../database/schemas/product.schema';
import { PosController } from './pos.controller';
import { PosService } from './pos.service';
import { RolesGuard } from '../../guards/roles.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WarehouseStock.name, schema: WarehouseStockSchema },
      { name: StockMovement.name, schema: StockMovementSchema },
      { name: PosOrder.name, schema: PosOrderSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [PosController],
  providers: [PosService, RolesGuard],
})
export class PosModule {}
