import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SslController } from './ssl.controller';
import { SslService } from './ssl.service';
import {
  CustomDomain,
  CustomDomainSchema,
} from '../../database/schemas/custom-domain.schema';
import { CustomDomainsModule } from '../../modules/custom-domains/custom-domains.module';
import { SslAutomationService } from './ssl-automation.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CustomDomain.name, schema: CustomDomainSchema },
    ]),
    forwardRef(() => CustomDomainsModule),
  ],
  controllers: [SslController],
  providers: [SslService, SslAutomationService],
  exports: [SslService, SslAutomationService],
})
export class SslModule {}
