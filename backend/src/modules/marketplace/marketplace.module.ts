import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import {
  MarketplacePlugin,
  MarketplacePluginSchema,
} from '../../database/schemas/marketplace-plugin.schema';
import {
  TenantPluginInstall,
  TenantPluginInstallSchema,
} from '../../database/schemas/tenant-plugin-install.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MarketplacePlugin.name, schema: MarketplacePluginSchema },
      { name: TenantPluginInstall.name, schema: TenantPluginInstallSchema },
    ]),
  ],
  controllers: [MarketplaceController],
  providers: [MarketplaceService],
  exports: [MarketplaceService],
})
export class MarketplaceModule {}
