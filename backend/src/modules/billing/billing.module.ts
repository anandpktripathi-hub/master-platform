import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Billing, BillingSchema } from '../../database/schemas/billing.schema';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { RolesGuard } from '../../guards/roles.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Billing.name, schema: BillingSchema }]),
  ],
  controllers: [BillingController],
  providers: [
    BillingService,
    RolesGuard,
    // Decorator factories (Roles, Tenant) should not be providers
  ],
})
export class BillingModule {}
