import { Module } from '@nestjs/common';
import { TenantsModule } from '../tenants/tenants.module';
import { DomainsModule } from '../domains/domains.module';
import { CmsModule } from '../../cms/cms.module';
import { SeoController } from './seo.controller';

@Module({
  imports: [TenantsModule, DomainsModule, CmsModule],
  controllers: [SeoController],
})
export class SeoModule {}
