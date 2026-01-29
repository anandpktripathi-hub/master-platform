import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Invoice, InvoiceSchema } from '../../database/schemas/invoice.schema';
import { PosOrder, PosOrderSchema } from '../../database/schemas/pos-order.schema';
import { CmsModule } from '../../cms/cms.module';

@Module({
  imports: [
    CmsModule,
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },
      { name: PosOrder.name, schema: PosOrderSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
