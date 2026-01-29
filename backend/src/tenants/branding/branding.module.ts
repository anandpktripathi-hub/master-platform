import { Module } from '@nestjs/common';
// Removed TypeOrmModule import
import { BrandingService } from './branding.service';
import { BrandingController } from './branding.controller';
import { StorageModule } from '../../common/storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [BrandingController],
  providers: [BrandingService],
  exports: [BrandingService],
})
export class BrandingModule {}
