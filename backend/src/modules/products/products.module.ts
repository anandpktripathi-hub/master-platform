import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductsStatsController } from './products.stats.controller';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Product, ProductSchema } from '../../database/schemas/product.schema';
import { DatabaseModule } from '../../tenants/database/database.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    DatabaseModule,
  ],
  controllers: [ProductsController, ProductsStatsController],
  providers: [ProductsService, TenantGuard],
  exports: [ProductsService, TenantGuard],
})
export class ProductsModule {}
