import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CrmService } from './crm.service';
import { CrmController } from './crm.controller';
import {
  CrmContact,
  CrmContactSchema,
} from '../../database/schemas/crm-contact.schema';
import {
  CrmCompany,
  CrmCompanySchema,
} from '../../database/schemas/crm-company.schema';
import { CrmDeal, CrmDealSchema } from '../../database/schemas/crm-deal.schema';
import { CrmTask, CrmTaskSchema } from '../../database/schemas/crm-task.schema';
import { User, UserSchema } from '../../database/schemas/user.schema';
import { Tenant, TenantSchema } from '../../database/schemas/tenant.schema';
import { SettingsModule } from '../settings/settings.module';
import { CrmNotificationService } from './crm-notification.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { CalendarModule } from '../../common/calendar/calendar.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CrmContact.name, schema: CrmContactSchema },
      { name: CrmCompany.name, schema: CrmCompanySchema },
      { name: CrmDeal.name, schema: CrmDealSchema },
      { name: CrmTask.name, schema: CrmTaskSchema },
      { name: User.name, schema: UserSchema },
      { name: Tenant.name, schema: TenantSchema },
    ]),
    SettingsModule,
    NotificationsModule,
    CalendarModule,
  ],
  providers: [CrmService, CrmNotificationService],
  controllers: [CrmController],
  exports: [CrmService],
})
export class CrmModule {}
