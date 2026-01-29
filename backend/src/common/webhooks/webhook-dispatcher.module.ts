import { Module } from '@nestjs/common';
import { WebhookDispatcherService } from './webhook-dispatcher.service';
import { SettingsModule } from '../../modules/settings/settings.module';

@Module({
  imports: [SettingsModule],
  providers: [WebhookDispatcherService],
  exports: [WebhookDispatcherService],
})
export class WebhookDispatcherModule {}
