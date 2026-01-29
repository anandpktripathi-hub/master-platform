import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { SettingsModule } from '../../modules/settings/settings.module';

@Module({
  imports: [SettingsModule],
  providers: [CalendarService],
  exports: [CalendarService],
})
export class CalendarModule {}
