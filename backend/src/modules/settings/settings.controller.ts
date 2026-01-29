import { Body, Controller, Get, Put, Post, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { Roles } from '../../decorators/roles.decorator';
import {
  BasicSettingsDto,
  UpdateBasicSettingsDto,
} from './dto/basic-settings.dto';
import {
  ApplicationSettingsDto,
  UpdateApplicationSettingsDto,
} from './dto/application-settings.dto';
import {
  SystemSettingsDto,
  UpdateSystemSettingsDto,
} from './dto/system-settings.dto';
import { SendTestEmailDto } from './dto/send-test-email.dto';

// UI DTOs
import {
  UiTogglesSettingsDto,
  UpdateUiTogglesSettingsDto,
} from './dto/ui-toggles-settings.dto';
import {
  BrandingSettingsDto,
  UpdateBrandingSettingsDto,
} from './dto/branding-settings.dto';
import {
  PagesSettingsDto,
  UpdatePagesSettingsDto,
} from './dto/pages-settings.dto';
import {
  CurrencySettingsDto,
  UpdateCurrencySettingsDto,
} from './dto/currency-settings.dto';
import { SeoSettingsDto, UpdateSeoSettingsDto } from './dto/seo-settings.dto';
import {
  EmailSettingsDto,
  UpdateEmailSettingsDto,
} from './dto/email-settings.dto';
import {
  PaymentSettingsDto,
  UpdatePaymentSettingsDto,
} from './dto/payment-settings.dto';
import {
  IntegrationSettingsDto,
  UpdateIntegrationSettingsDto,
} from './dto/integration-settings.dto';
import {
  TrackerSettingsDto,
  UpdateTrackerSettingsDto,
} from './dto/tracker-settings.dto';
import {
  NotificationSettingsDto,
  UpdateNotificationSettingsDto,
} from './dto/notification-settings.dto';
import {
  ZoomSettingsDto,
  UpdateZoomSettingsDto,
} from './dto/zoom-settings.dto';
import {
  CalendarSettingsDto,
  UpdateCalendarSettingsDto,
} from './dto/calendar-settings.dto';
import {
  WebhookSettingsDto,
  UpdateWebhookSettingsDto,
} from './dto/webhook-settings.dto';
import {
  IpRestrictionSettingsDto,
  UpdateIpRestrictionSettingsDto,
} from './dto/ip-restriction-settings.dto';
import {
  ReferralSettingsDto,
  UpdateReferralSettingsDto,
} from './dto/referral-settings.dto';
import {
  ReportsSettingsDto,
  UpdateReportsSettingsDto,
} from './dto/reports-settings.dto';
import {
  UiColorsLightSettingsDto,
  UpdateUiColorsLightSettingsDto,
} from './dto/ui-colors-light-settings.dto';
import {
  UiColorsDarkSettingsDto,
  UpdateUiColorsDarkSettingsDto,
} from './dto/ui-colors-dark-settings.dto';
import {
  UiColorsCategoriesSettingsDto,
  UpdateUiColorsCategoriesSettingsDto,
} from './dto/ui-colors-categories-settings.dto';
import {
  UiTypographySettingsDto,
  UpdateUiTypographySettingsDto,
} from './dto/ui-typography-settings.dto';

// UI mappers
import {
  entriesToUiTogglesDto,
  uiTogglesDtoToEntries,
  entriesToUiColorsLightDto,
  uiColorsLightDtoToEntries,
  entriesToUiColorsDarkDto,
  uiColorsDarkDtoToEntries,
  entriesToUiColorsCategoriesDto,
  uiColorsCategoriesDtoToEntries,
  entriesToUiTypographyDto,
  uiTypographyDtoToEntries,
} from './mappers/ui-settings-mappers';
import {
  basicDtoToEntries,
  entriesToBasicDto,
} from './mappers/basic-settings-mappers';
import {
  applicationDtoToEntries,
  entriesToApplicationDto,
} from './mappers/application-settings-mappers';
import {
  entriesToSystemDto,
  systemDtoToEntries,
} from './mappers/system-settings-mappers';
import {
  brandingDtoToEntries,
  entriesToBrandingDto,
} from './mappers/branding-settings-mappers';
import {
  entriesToPagesDto,
  pagesDtoToEntries,
} from './mappers/pages-settings-mappers';
import {
  currencyDtoToEntries,
  entriesToCurrencyDto,
} from './mappers/currency-settings-mappers';
import {
  entriesToSeoDto,
  seoDtoToEntries,
} from './mappers/seo-settings-mappers';
import {
  emailDtoToEntries,
  entriesToEmailDto,
} from './mappers/email-settings-mappers';
import {
  entriesToReferralDto,
  referralDtoToEntries,
} from './mappers/referral-settings-mappers';
import {
  entriesToReportsDto,
  reportsDtoToEntries,
} from './mappers/reports-settings-mappers';
import {
  entriesToPaymentDto,
  paymentDtoToEntries,
} from './mappers/payment-settings-mappers';
import {
  entriesToIntegrationDto,
  integrationDtoToEntries,
} from './mappers/integration-settings-mappers';
import {
  entriesToTrackerDto,
  trackerDtoToEntries,
} from './mappers/tracker-settings-mappers';
import {
  entriesToNotificationDto,
  notificationDtoToEntries,
} from './mappers/notification-settings-mappers';
import {
  entriesToZoomDto,
  zoomDtoToEntries,
} from './mappers/zoom-settings-mappers';
import {
  calendarDtoToEntries,
  entriesToCalendarDto,
} from './mappers/calendar-settings-mappers';
import {
  entriesToWebhookDto,
  webhookDtoToEntries,
} from './mappers/webhook-settings-mappers';
import {
  entriesToIpRestrictionDto,
  ipRestrictionDtoToEntries,
} from './mappers/ip-restriction-settings-mappers';

@Controller()
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly emailService: EmailService,
  ) {}

  // Basic
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Get('admin/settings/basic/typed')
  async getBasic(): Promise<BasicSettingsDto> {
    const res = await this.settingsService.getGroupAdmin('basic');
    return entriesToBasicDto(res.items);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Put('admin/settings/basic/typed')
  async updateBasic(
    @Body() dto: UpdateBasicSettingsDto,
  ): Promise<BasicSettingsDto> {
    const entries = basicDtoToEntries(dto);
    const res = await this.settingsService.upsertGroup('basic', entries);
    return entriesToBasicDto(res.items);
  }

  // Application
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Get('admin/settings/application/typed')
  async getApplication(): Promise<ApplicationSettingsDto> {
    const res = await this.settingsService.getGroupAdmin('application');
    return entriesToApplicationDto(res.items);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Put('admin/settings/application/typed')
  async updateApplication(
    @Body() dto: UpdateApplicationSettingsDto,
  ): Promise<ApplicationSettingsDto> {
    const entries = applicationDtoToEntries(dto);
    const res = await this.settingsService.upsertGroup('application', entries);
    return entriesToApplicationDto(res.items);
  }

  // System
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Get('admin/settings/system/typed')
  async getSystem(): Promise<SystemSettingsDto> {
    const res = await this.settingsService.getGroupAdmin('system');
    return entriesToSystemDto(res.items);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Put('admin/settings/system/typed')
  async updateSystem(
    @Body() dto: UpdateSystemSettingsDto,
  ): Promise<SystemSettingsDto> {
    const entries = systemDtoToEntries(dto);
    const res = await this.settingsService.upsertGroup('system', entries);
    return entriesToSystemDto(res.items);
  }

  // UI: Toggles
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Get('admin/settings/ui/toggles/typed')
  async getUiToggles(): Promise<UiTogglesSettingsDto> {
    const res = await this.settingsService.getGroupAdmin('ui');
    return entriesToUiTogglesDto(res.items);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Put('admin/settings/ui/toggles/typed')
  async updateUiToggles(
    @Body() dto: UpdateUiTogglesSettingsDto,
  ): Promise<UiTogglesSettingsDto> {
    const entries = uiTogglesDtoToEntries(dto);
    const res = await this.settingsService.upsertGroup('ui', entries);
    return entriesToUiTogglesDto(res.items);
  }

  // UI: Colors Light
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Get('admin/settings/ui/colors/light/typed')
  async getUiColorsLight(): Promise<UiColorsLightSettingsDto> {
    const res = await this.settingsService.getGroupAdmin('ui');
    return entriesToUiColorsLightDto(res.items);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Put('admin/settings/ui/colors/light/typed')
  async updateUiColorsLight(
    @Body() dto: UpdateUiColorsLightSettingsDto,
  ): Promise<UiColorsLightSettingsDto> {
    const entries = uiColorsLightDtoToEntries(dto);
    const res = await this.settingsService.upsertGroup('ui', entries);
    return entriesToUiColorsLightDto(res.items);
  }

  // UI: Colors Dark
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Get('admin/settings/ui/colors/dark/typed')
  async getUiColorsDark(): Promise<UiColorsDarkSettingsDto> {
    const res = await this.settingsService.getGroupAdmin('ui');
    return entriesToUiColorsDarkDto(res.items);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Put('admin/settings/ui/colors/dark/typed')
  async updateUiColorsDark(
    @Body() dto: UpdateUiColorsDarkSettingsDto,
  ): Promise<UiColorsDarkSettingsDto> {
    const entries = uiColorsDarkDtoToEntries(dto);
    const res = await this.settingsService.upsertGroup('ui', entries);
    return entriesToUiColorsDarkDto(res.items);
  }

  // UI: Colors Categories
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Get('admin/settings/ui/colors/categories/typed')
  async getUiColorsCategories(): Promise<UiColorsCategoriesSettingsDto> {
    const res = await this.settingsService.getGroupAdmin('ui');
    return entriesToUiColorsCategoriesDto(res.items);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Put('admin/settings/ui/colors/categories/typed')
  async updateUiColorsCategories(
    @Body() dto: UpdateUiColorsCategoriesSettingsDto,
  ): Promise<UiColorsCategoriesSettingsDto> {
    const entries = uiColorsCategoriesDtoToEntries(dto);
    const res = await this.settingsService.upsertGroup('ui', entries);
    return entriesToUiColorsCategoriesDto(res.items);
  }

  // UI: Typography
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Get('admin/settings/ui/typography/typed')
  async getUiTypography(): Promise<UiTypographySettingsDto> {
    const res = await this.settingsService.getGroupAdmin('ui');
    return entriesToUiTypographyDto(res.items);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Put('admin/settings/ui/typography/typed')
  async updateUiTypography(
    @Body() dto: UpdateUiTypographySettingsDto,
  ): Promise<UiTypographySettingsDto> {
    const entries = uiTypographyDtoToEntries(dto);
    const res = await this.settingsService.upsertGroup('ui', entries);
    return entriesToUiTypographyDto(res.items);
  }

  // Branding
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Get('admin/settings/branding/typed')
  async getBranding(): Promise<BrandingSettingsDto> {
    const res = await this.settingsService.getGroupAdmin('branding');
    return entriesToBrandingDto(res.items);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Put('admin/settings/branding/typed')
  async updateBranding(
    @Body() dto: UpdateBrandingSettingsDto,
  ): Promise<BrandingSettingsDto> {
    const entries = brandingDtoToEntries(dto);
    const res = await this.settingsService.upsertGroup('branding', entries);
    return entriesToBrandingDto(res.items);
  }

  // Pages
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Get('admin/settings/pages/typed')
  async getPages(): Promise<PagesSettingsDto> {
    const res = await this.settingsService.getGroupAdmin('pages');
    return entriesToPagesDto(res.items);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Put('admin/settings/pages/typed')
  async updatePages(
    @Body() dto: UpdatePagesSettingsDto,
  ): Promise<PagesSettingsDto> {
    const entries = pagesDtoToEntries(dto);
    const res = await this.settingsService.upsertGroup('pages', entries);
    return entriesToPagesDto(res.items);
  }

  // Currency
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Get('admin/settings/currency/typed')
  async getCurrency(): Promise<CurrencySettingsDto> {
    const res = await this.settingsService.getGroupAdmin('currency');
    return entriesToCurrencyDto(res.items);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Put('admin/settings/currency/typed')
  async updateCurrency(
    @Body() dto: UpdateCurrencySettingsDto,
  ): Promise<CurrencySettingsDto> {
    const entries = currencyDtoToEntries(dto);
    const res = await this.settingsService.upsertGroup('currency', entries);
    return entriesToCurrencyDto(res.items);
  }

  // SEO
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Get('admin/settings/seo/typed')
  async getSeo(): Promise<SeoSettingsDto> {
    const res = await this.settingsService.getGroupAdmin('seo');
    return entriesToSeoDto(res.items);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Put('admin/settings/seo/typed')
  async updateSeo(@Body() dto: UpdateSeoSettingsDto): Promise<SeoSettingsDto> {
    const entries = seoDtoToEntries(dto);
    const res = await this.settingsService.upsertGroup('seo', entries);
    return entriesToSeoDto(res.items);
  }

  // Email/SMTP
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Get('admin/settings/email/typed')
  async getEmail(): Promise<EmailSettingsDto> {
    const res = await this.settingsService.getGroupAdmin('email');
    return entriesToEmailDto(res.items);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Put('admin/settings/email/typed')
  async updateEmail(
    @Body() dto: UpdateEmailSettingsDto,
  ): Promise<EmailSettingsDto> {
    const entries = emailDtoToEntries(dto);
    const res = await this.settingsService.upsertGroup('email', entries);
    return entriesToEmailDto(res.items);
  }

  // Email: Send Test
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Post('admin/settings/email/test')
  async sendTestEmail(
    @Body() dto: SendTestEmailDto,
  ): Promise<{ success: boolean; message: string }> {
    await this.emailService.sendTestEmail(dto.testRecipient);
    return {
      success: true,
      message: `Test email sent to ${dto.testRecipient}`,
    };
  }

  // Referral
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Get('admin/settings/referral/typed')
  async getReferral(): Promise<ReferralSettingsDto> {
    const res = await this.settingsService.getGroupAdmin('referral');
    return entriesToReferralDto(res.items);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Put('admin/settings/referral/typed')
  async updateReferral(
    @Body() dto: UpdateReferralSettingsDto,
  ): Promise<ReferralSettingsDto> {
    const entries = referralDtoToEntries(dto);
    const res = await this.settingsService.upsertGroup('referral', entries);
    return entriesToReferralDto(res.items);
  }

  // Reports
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Get('admin/settings/reports/typed')
  async getReports(): Promise<ReportsSettingsDto> {
    const res = await this.settingsService.getGroupAdmin('reports');
    return entriesToReportsDto(res.items);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Put('admin/settings/reports/typed')
  async updateReports(
    @Body() dto: UpdateReportsSettingsDto,
  ): Promise<ReportsSettingsDto> {
    const entries = reportsDtoToEntries(dto);
    const res = await this.settingsService.upsertGroup('reports', entries);
    return entriesToReportsDto(res.items);
  }

  // Public (read-only) Reports settings for authenticated tenants
  @UseGuards(JwtAuthGuard)
  @Get('settings/reports')
  async getReportsPublic(): Promise<ReportsSettingsDto> {
    const res = await this.settingsService.getGroupAdmin('reports');
    return entriesToReportsDto(res.items);
  }

  // Payment Settings
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN')
  @Get('admin/settings/payment/typed')
  async getPayment(): Promise<PaymentSettingsDto> {
    const res = await this.settingsService.getGroupAdmin('payment');
    return entriesToPaymentDto(res.items);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN')
  @Put('admin/settings/payment/typed')
  async updatePayment(
    @Body() dto: UpdatePaymentSettingsDto,
  ): Promise<PaymentSettingsDto> {
    const entries = paymentDtoToEntries(dto);
    const res = await this.settingsService.upsertGroup('payment', entries);
    return entriesToPaymentDto(res.items);
  }

  // Integration Settings (Slack, Telegram, Twilio)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN')
  @Get('admin/settings/integrations/typed')
  async getIntegrations(): Promise<IntegrationSettingsDto> {
    const res = await this.settingsService.getGroupAdmin('integrations');
    return entriesToIntegrationDto(res.items);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN')
  @Put('admin/settings/integrations/typed')
  async updateIntegrations(
    @Body() dto: UpdateIntegrationSettingsDto,
  ): Promise<IntegrationSettingsDto> {
    const entries = integrationDtoToEntries(dto);
    const res = await this.settingsService.upsertGroup('integrations', entries);
    return entriesToIntegrationDto(res.items);
  }

  // Time Tracker Settings
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN')
  @Get('admin/settings/tracker/typed')
  async getTracker(): Promise<TrackerSettingsDto> {
    const res = await this.settingsService.getGroupAdmin('tracker');
    return entriesToTrackerDto(res.items);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN')
  @Put('admin/settings/tracker/typed')
  async updateTracker(
    @Body() dto: UpdateTrackerSettingsDto,
  ): Promise<TrackerSettingsDto> {
    const entries = trackerDtoToEntries(dto);
    const res = await this.settingsService.upsertGroup('tracker', entries);
    return entriesToTrackerDto(res.items);
  }

  // Notification Settings
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN')
  @Get('admin/settings/notifications/typed')
  async getNotifications(): Promise<NotificationSettingsDto> {
    const res = await this.settingsService.getGroupAdmin('notifications');
    return entriesToNotificationDto(res.items);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN')
  @Put('admin/settings/notifications/typed')
  async updateNotifications(
    @Body() dto: UpdateNotificationSettingsDto,
  ): Promise<NotificationSettingsDto> {
    const entries = notificationDtoToEntries(dto);
    const res = await this.settingsService.upsertGroup('notifications', entries);
    return entriesToNotificationDto(res.items);
  }

  // Zoom Settings
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN')
  @Get('admin/settings/zoom/typed')
  async getZoom(): Promise<ZoomSettingsDto> {
    const res = await this.settingsService.getGroupAdmin('zoom');
    return entriesToZoomDto(res.items);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN')
  @Put('admin/settings/zoom/typed')
  async updateZoom(
    @Body() dto: UpdateZoomSettingsDto,
  ): Promise<ZoomSettingsDto> {
    const entries = zoomDtoToEntries(dto);
    const res = await this.settingsService.upsertGroup('zoom', entries);
    return entriesToZoomDto(res.items);
  }

  // Calendar Settings (Google Calendar)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN')
  @Get('admin/settings/calendar/typed')
  async getCalendar(): Promise<CalendarSettingsDto> {
    const res = await this.settingsService.getGroupAdmin('calendar');
    return entriesToCalendarDto(res.items);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN')
  @Put('admin/settings/calendar/typed')
  async updateCalendar(
    @Body() dto: UpdateCalendarSettingsDto,
  ): Promise<CalendarSettingsDto> {
    const entries = calendarDtoToEntries(dto);
    const res = await this.settingsService.upsertGroup('calendar', entries);
    return entriesToCalendarDto(res.items);
  }

  // Webhook Settings
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN')
  @Get('admin/settings/webhooks/typed')
  async getWebhooks(): Promise<WebhookSettingsDto> {
    const res = await this.settingsService.getGroupAdmin('webhooks');
    return entriesToWebhookDto(res.items);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN')
  @Put('admin/settings/webhooks/typed')
  async updateWebhooks(
    @Body() dto: UpdateWebhookSettingsDto,
  ): Promise<WebhookSettingsDto> {
    const entries = webhookDtoToEntries(dto);
    const res = await this.settingsService.upsertGroup('webhooks', entries);
    return entriesToWebhookDto(res.items);
  }

  // IP Restriction Settings
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN')
  @Get('admin/settings/ip-restriction/typed')
  async getIpRestriction(): Promise<IpRestrictionSettingsDto> {
    const res = await this.settingsService.getGroupAdmin('ip-restriction');
    return entriesToIpRestrictionDto(res.items);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN')
  @Put('admin/settings/ip-restriction/typed')
  async updateIpRestriction(
    @Body() dto: UpdateIpRestrictionSettingsDto,
  ): Promise<IpRestrictionSettingsDto> {
    const entries = ipRestrictionDtoToEntries(dto);
    const res = await this.settingsService.upsertGroup('ip-restriction', entries);
    return entriesToIpRestrictionDto(res.items);
  }
}
