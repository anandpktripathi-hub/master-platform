import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { CrmContact, CrmContactSchema } from '../../database/schemas/crm-contact.schema';
import { CrmCompany, CrmCompanySchema } from '../../database/schemas/crm-company.schema';
import { CrmDeal, CrmDealSchema } from '../../database/schemas/crm-deal.schema';
import { CrmTask, CrmTaskSchema } from '../../database/schemas/crm-task.schema';
import { UserPost, UserPostSchema } from '../../database/schemas/user-post.schema';
import { Ticket, TicketSchema } from '../../database/schemas/ticket.schema';
import { Tenant, TenantSchema } from '../../database/schemas/tenant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CrmContact.name, schema: CrmContactSchema },
      { name: CrmCompany.name, schema: CrmCompanySchema },
      { name: CrmDeal.name, schema: CrmDealSchema },
      { name: CrmTask.name, schema: CrmTaskSchema },
      { name: UserPost.name, schema: UserPostSchema },
      { name: Ticket.name, schema: TicketSchema },
      { name: Tenant.name, schema: TenantSchema },
    ]),
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService],
})
export class OnboardingModule {}
