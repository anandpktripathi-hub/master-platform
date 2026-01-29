import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeveloperPortalController } from './developer-portal.controller';
import { DeveloperPortalService } from './developer-portal.service';
import {
  DeveloperApiKey,
  DeveloperApiKeySchema,
} from '../../database/schemas/developer-api-key.schema';
import {
  WebhookDeliveryLog,
  WebhookDeliveryLogSchema,
} from '../../database/schemas/webhook-delivery-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeveloperApiKey.name, schema: DeveloperApiKeySchema },
      { name: WebhookDeliveryLog.name, schema: WebhookDeliveryLogSchema },
    ]),
  ],
  controllers: [DeveloperPortalController],
  providers: [DeveloperPortalService],
  exports: [DeveloperPortalService],
})
export class DeveloperPortalModule {}
