import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Dashboard, DashboardSchema } from '../../database/schemas/dashboard.schema';
import { User, UserSchema } from '../../database/schemas/user.schema';
import { PosOrder, PosOrderSchema } from '../../database/schemas/pos-order.schema';
import { UserNotification, UserNotificationSchema } from '../../database/schemas/user-notification.schema';
import { DatabaseModule } from '../database/database.module';
import { CmsModule } from '../../cms/cms.module';
import { FeatureRegistryModule } from '../../feature-registry/featureRegistry.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Dashboard.name, schema: DashboardSchema },
      { name: User.name, schema: UserSchema },
      { name: PosOrder.name, schema: PosOrderSchema },
      { name: UserNotification.name, schema: UserNotificationSchema },
    ]),
    DatabaseModule,
    CmsModule,
    FeatureRegistryModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
