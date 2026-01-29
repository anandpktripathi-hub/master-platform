import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserNotification,
  UserNotificationSchema,
} from '../../database/schemas/user-notification.schema';
import {
  PushSubscription,
  PushSubscriptionSchema,
} from '../../database/schemas/push-subscription.schema';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { IntegrationsModule } from '../../common/integrations/integrations.module';
import { PushSubscriptionsService } from './push-subscriptions.service';
import { PushSubscriptionsController } from './push-subscriptions.controller';

@Module({
  imports: [
    IntegrationsModule,
    MongooseModule.forFeature([
      { name: UserNotification.name, schema: UserNotificationSchema },
      { name: PushSubscription.name, schema: PushSubscriptionSchema },
    ]),
  ],
  providers: [NotificationsService, PushSubscriptionsService],
  controllers: [NotificationsController, PushSubscriptionsController],
  exports: [NotificationsService, PushSubscriptionsService],
})
export class NotificationsModule {}
