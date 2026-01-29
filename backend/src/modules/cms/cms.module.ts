import { Module } from '@nestjs/common';
import { CmsMenuController } from './cms.menu.controller';

@Module({
  controllers: [CmsMenuController],
})
export class CmsModule {}
