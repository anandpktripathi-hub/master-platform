import { Module } from '@nestjs/common';
import { TenantsModule } from '../tenants/tenants.module';
import { DomainsModule } from '../domains/domains.module';
import { CmsModule } from '../../cms/cms.module';
import { SeoController } from './seo.controller';
import { SeoService } from './seo.service';

@Module({
  imports: [TenantsModule, DomainsModule, CmsModule],
  controllers: [SeoController],
  providers: [SeoService],
})
export class SeoModule {}
