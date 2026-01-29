import { Module } from '@nestjs/common';
import { SlackIntegrationService } from './slack-integration.service';
import { TelegramIntegrationService } from './telegram-integration.service';
import { TwilioIntegrationService } from './twilio-integration.service';
import { SettingsModule } from '../../modules/settings/settings.module';

@Module({
  imports: [SettingsModule],
  providers: [
    SlackIntegrationService,
    TelegramIntegrationService,
    TwilioIntegrationService,
  ],
  exports: [
    SlackIntegrationService,
    TelegramIntegrationService,
    TwilioIntegrationService,
  ],
})
export class IntegrationsModule {}
