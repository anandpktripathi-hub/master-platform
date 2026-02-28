import {
  Body,
  Controller,
  Get,
  Put,
  Post,
  UseGuards,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  entriesToIpRestrictionDto,
  ipRestrictionDtoToEntries,
} from './mappers/ip-restriction-settings-mappers';
@ApiTags('Settings')
@ApiBearerAuth('bearer')
@Controller()
export class SettingsController {
  private readonly logger = new Logger(SettingsController.name);

  constructor(
    private readonly settingsService: SettingsService,
    private readonly emailService: EmailService,
  ) {}

  // Basic
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Get('admin/settings/basic/typed')
  @ApiOperation({ summary: 'Get basic settings (typed)' })
  @ApiResponse({ status: 200, description: 'Basic settings returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getBasic(): Promise<BasicSettingsDto> {
    try {
      const res = await this.settingsService.getGroupAdmin('basic');
      return entriesToBasicDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getBasic] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get basic settings');
    }
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Put('admin/settings/basic/typed')
  @ApiOperation({ summary: 'Update basic settings (typed)' })
  @ApiResponse({ status: 200, description: 'Basic settings updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateBasic(
    @Body() dto: UpdateBasicSettingsDto,
  ): Promise<BasicSettingsDto> {
    try {
      const entries = basicDtoToEntries(dto);
      const res = await this.settingsService.upsertGroup('basic', entries);
      return entriesToBasicDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateBasic] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update basic settings');
    }
  }

  // Application
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Get('admin/settings/application/typed')
  @ApiOperation({ summary: 'Get application settings (typed)' })
  @ApiResponse({ status: 200, description: 'Application settings returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getApplication(): Promise<ApplicationSettingsDto> {
    try {
      const res = await this.settingsService.getGroupAdmin('application');
      return entriesToApplicationDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getApplication] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to get application settings',
          );
    }
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Put('admin/settings/application/typed')
  @ApiOperation({ summary: 'Update application settings (typed)' })
  @ApiResponse({ status: 200, description: 'Application settings updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateApplication(
    @Body() dto: UpdateApplicationSettingsDto,
  ): Promise<ApplicationSettingsDto> {
    try {
      const entries = applicationDtoToEntries(dto);
      const res = await this.settingsService.upsertGroup(
        'application',
        entries,
      );
      return entriesToApplicationDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateApplication] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to update application settings',
          );
    }
  }

  // System
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Get('admin/settings/system/typed')
  @ApiOperation({ summary: 'Get system settings (typed)' })
  @ApiResponse({ status: 200, description: 'System settings returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getSystem(): Promise<SystemSettingsDto> {
    try {
      const res = await this.settingsService.getGroupAdmin('system');
      return entriesToSystemDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getSystem] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get system settings');
    }
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Put('admin/settings/system/typed')
  @ApiOperation({ summary: 'Update system settings (typed)' })
  @ApiResponse({ status: 200, description: 'System settings updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateSystem(
    @Body() dto: UpdateSystemSettingsDto,
  ): Promise<SystemSettingsDto> {
    try {
      const entries = systemDtoToEntries(dto);
      const res = await this.settingsService.upsertGroup('system', entries);
      return entriesToSystemDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateSystem] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update system settings');
    }
  }

  // UI: Toggles
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Get('admin/settings/ui/toggles/typed')
  @ApiOperation({ summary: 'Get UI toggles settings (typed)' })
  @ApiResponse({ status: 200, description: 'UI toggles settings returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getUiToggles(): Promise<UiTogglesSettingsDto> {
    try {
      const res = await this.settingsService.getGroupAdmin('ui');
      return entriesToUiTogglesDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getUiToggles] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get UI toggles settings');
    }
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Put('admin/settings/ui/toggles/typed')
  @ApiOperation({ summary: 'Update UI toggles settings (typed)' })
  @ApiResponse({ status: 200, description: 'UI toggles settings updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateUiToggles(
    @Body() dto: UpdateUiTogglesSettingsDto,
  ): Promise<UiTogglesSettingsDto> {
    try {
      const entries = uiTogglesDtoToEntries(dto);
      const res = await this.settingsService.upsertGroup('ui', entries);
      return entriesToUiTogglesDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateUiToggles] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to update UI toggles settings',
          );
    }
  }

  // UI: Colors Light
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Get('admin/settings/ui/colors/light/typed')
  @ApiOperation({ summary: 'Get UI colors (light) settings (typed)' })
  @ApiResponse({ status: 200, description: 'UI light colors settings returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getUiColorsLight(): Promise<UiColorsLightSettingsDto> {
    try {
      const res = await this.settingsService.getGroupAdmin('ui');
      return entriesToUiColorsLightDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getUiColorsLight] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to get UI light colors settings',
          );
    }
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Put('admin/settings/ui/colors/light/typed')
  @ApiOperation({ summary: 'Update UI colors (light) settings (typed)' })
  @ApiResponse({ status: 200, description: 'UI light colors settings updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateUiColorsLight(
    @Body() dto: UpdateUiColorsLightSettingsDto,
  ): Promise<UiColorsLightSettingsDto> {
    try {
      const entries = uiColorsLightDtoToEntries(dto);
      const res = await this.settingsService.upsertGroup('ui', entries);
      return entriesToUiColorsLightDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateUiColorsLight] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to update UI light colors settings',
          );
    }
  }

  // UI: Colors Dark
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Get('admin/settings/ui/colors/dark/typed')
  @ApiOperation({ summary: 'Get UI colors (dark) settings (typed)' })
  @ApiResponse({ status: 200, description: 'UI dark colors settings returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getUiColorsDark(): Promise<UiColorsDarkSettingsDto> {
    try {
      const res = await this.settingsService.getGroupAdmin('ui');
      return entriesToUiColorsDarkDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getUiColorsDark] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to get UI dark colors settings',
          );
    }
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Put('admin/settings/ui/colors/dark/typed')
  @ApiOperation({ summary: 'Update UI colors (dark) settings (typed)' })
  @ApiResponse({ status: 200, description: 'UI dark colors settings updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateUiColorsDark(
    @Body() dto: UpdateUiColorsDarkSettingsDto,
  ): Promise<UiColorsDarkSettingsDto> {
    try {
      const entries = uiColorsDarkDtoToEntries(dto);
      const res = await this.settingsService.upsertGroup('ui', entries);
      return entriesToUiColorsDarkDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateUiColorsDark] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to update UI dark colors settings',
          );
    }
  }

  // UI: Colors Categories
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Get('admin/settings/ui/colors/categories/typed')
  @ApiOperation({ summary: 'Get UI color categories settings (typed)' })
  @ApiResponse({ status: 200, description: 'UI color categories settings returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getUiColorsCategories(): Promise<UiColorsCategoriesSettingsDto> {
    try {
      const res = await this.settingsService.getGroupAdmin('ui');
      return entriesToUiColorsCategoriesDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getUiColorsCategories] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to get UI color categories settings',
          );
    }
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Put('admin/settings/ui/colors/categories/typed')
  @ApiOperation({ summary: 'Update UI color categories settings (typed)' })
  @ApiResponse({ status: 200, description: 'UI color categories settings updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateUiColorsCategories(
    @Body() dto: UpdateUiColorsCategoriesSettingsDto,
  ): Promise<UiColorsCategoriesSettingsDto> {
    try {
      const entries = uiColorsCategoriesDtoToEntries(dto);
      const res = await this.settingsService.upsertGroup('ui', entries);
      return entriesToUiColorsCategoriesDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateUiColorsCategories] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to update UI color categories settings',
          );
    }
  }

  // UI: Typography
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Get('admin/settings/ui/typography/typed')
  @ApiOperation({ summary: 'Get UI typography settings (typed)' })
  @ApiResponse({ status: 200, description: 'UI typography settings returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getUiTypography(): Promise<UiTypographySettingsDto> {
    try {
      const res = await this.settingsService.getGroupAdmin('ui');
      return entriesToUiTypographyDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getUiTypography] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to get UI typography settings',
          );
    }
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Put('admin/settings/ui/typography/typed')
  @ApiOperation({ summary: 'Update UI typography settings (typed)' })
  @ApiResponse({ status: 200, description: 'UI typography settings updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateUiTypography(
    @Body() dto: UpdateUiTypographySettingsDto,
  ): Promise<UiTypographySettingsDto> {
    try {
      const entries = uiTypographyDtoToEntries(dto);
      const res = await this.settingsService.upsertGroup('ui', entries);
      return entriesToUiTypographyDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateUiTypography] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to update UI typography settings',
          );
    }
  }

  // Branding
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Get('admin/settings/branding/typed')
  @ApiOperation({ summary: 'Get branding settings (typed)' })
  @ApiResponse({ status: 200, description: 'Branding settings returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getBranding(): Promise<BrandingSettingsDto> {
    try {
      const res = await this.settingsService.getGroupAdmin('branding');
      return entriesToBrandingDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getBranding] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get branding settings');
    }
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Put('admin/settings/branding/typed')
  @ApiOperation({ summary: 'Update branding settings (typed)' })
  @ApiResponse({ status: 200, description: 'Branding settings updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateBranding(
    @Body() dto: UpdateBrandingSettingsDto,
  ): Promise<BrandingSettingsDto> {
    try {
      const entries = brandingDtoToEntries(dto);
      const res = await this.settingsService.upsertGroup('branding', entries);
      return entriesToBrandingDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateBranding] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to update branding settings',
          );
    }
  }

  // Pages
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Get('admin/settings/pages/typed')
  @ApiOperation({ summary: 'Get pages settings (typed)' })
  @ApiResponse({ status: 200, description: 'Pages settings returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getPages(): Promise<PagesSettingsDto> {
    try {
      const res = await this.settingsService.getGroupAdmin('pages');
      return entriesToPagesDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getPages] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get pages settings');
    }
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Put('admin/settings/pages/typed')
  @ApiOperation({ summary: 'Update pages settings (typed)' })
  @ApiResponse({ status: 200, description: 'Pages settings updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updatePages(
    @Body() dto: UpdatePagesSettingsDto,
  ): Promise<PagesSettingsDto> {
    try {
      const entries = pagesDtoToEntries(dto);
      const res = await this.settingsService.upsertGroup('pages', entries);
      return entriesToPagesDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updatePages] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update pages settings');
    }
  }

  // Currency
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Get('admin/settings/currency/typed')
  @ApiOperation({ summary: 'Get currency settings (typed)' })
  @ApiResponse({ status: 200, description: 'Currency settings returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getCurrency(): Promise<CurrencySettingsDto> {
    try {
      const res = await this.settingsService.getGroupAdmin('currency');
      return entriesToCurrencyDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getCurrency] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get currency settings');
    }
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Put('admin/settings/currency/typed')
  @ApiOperation({ summary: 'Update currency settings (typed)' })
  @ApiResponse({ status: 200, description: 'Currency settings updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateCurrency(
    @Body() dto: UpdateCurrencySettingsDto,
  ): Promise<CurrencySettingsDto> {
    try {
      const entries = currencyDtoToEntries(dto);
      const res = await this.settingsService.upsertGroup('currency', entries);
      return entriesToCurrencyDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateCurrency] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to update currency settings',
          );
    }
  }

  // SEO
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Get('admin/settings/seo/typed')
  @ApiOperation({ summary: 'Get SEO settings (typed)' })
  @ApiResponse({ status: 200, description: 'SEO settings returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getSeo(): Promise<SeoSettingsDto> {
    try {
      const res = await this.settingsService.getGroupAdmin('seo');
      return entriesToSeoDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getSeo] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get SEO settings');
    }
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Put('admin/settings/seo/typed')
  @ApiOperation({ summary: 'Update SEO settings (typed)' })
  @ApiResponse({ status: 200, description: 'SEO settings updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateSeo(@Body() dto: UpdateSeoSettingsDto): Promise<SeoSettingsDto> {
    try {
      const entries = seoDtoToEntries(dto);
      const res = await this.settingsService.upsertGroup('seo', entries);
      return entriesToSeoDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateSeo] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update SEO settings');
    }
  }

  // Email/SMTP
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Get('admin/settings/email/typed')
  @ApiOperation({ summary: 'Get email/SMTP settings (typed)' })
  @ApiResponse({ status: 200, description: 'Email/SMTP settings returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getEmail(): Promise<EmailSettingsDto> {
    try {
      const res = await this.settingsService.getGroupAdmin('email');
      return entriesToEmailDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getEmail] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get email settings');
    }
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Put('admin/settings/email/typed')
  @ApiOperation({ summary: 'Update email/SMTP settings (typed)' })
  @ApiResponse({ status: 200, description: 'Email/SMTP settings updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateEmail(
    @Body() dto: UpdateEmailSettingsDto,
  ): Promise<EmailSettingsDto> {
    try {
      const entries = emailDtoToEntries(dto);
      const res = await this.settingsService.upsertGroup('email', entries);
      return entriesToEmailDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateEmail] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update email settings');
    }
  }

  // Email: Send Test
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Post('admin/settings/email/test')
  @ApiOperation({ summary: 'Send test email' })
  @ApiResponse({ status: 200, description: 'Test email sent' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async sendTestEmail(
    @Body() dto: SendTestEmailDto,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.emailService.sendTestEmail(dto.testRecipient);
      return {
        success: true,
        message: `Test email sent to ${dto.testRecipient}`,
      };
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[sendTestEmail] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to send test email');
    }
  }

  // Referral
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Get('admin/settings/referral/typed')
  @ApiOperation({ summary: 'Get referral settings (typed)' })
  @ApiResponse({ status: 200, description: 'Referral settings returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getReferral(): Promise<ReferralSettingsDto> {
    try {
      const res = await this.settingsService.getGroupAdmin('referral');
      return entriesToReferralDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getReferral] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get referral settings');
    }
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Put('admin/settings/referral/typed')
  @ApiOperation({ summary: 'Update referral settings (typed)' })
  @ApiResponse({ status: 200, description: 'Referral settings updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateReferral(
    @Body() dto: UpdateReferralSettingsDto,
  ): Promise<ReferralSettingsDto> {
    try {
      const entries = referralDtoToEntries(dto);
      const res = await this.settingsService.upsertGroup('referral', entries);
      return entriesToReferralDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateReferral] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to update referral settings',
          );
    }
  }

  // Reports
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Get('admin/settings/reports/typed')
  @ApiOperation({ summary: 'Get reports settings (typed)' })
  @ApiResponse({ status: 200, description: 'Reports settings returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getReports(): Promise<ReportsSettingsDto> {
    try {
      const res = await this.settingsService.getGroupAdmin('reports');
      return entriesToReportsDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getReports] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get reports settings');
    }
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @Put('admin/settings/reports/typed')
  @ApiOperation({ summary: 'Update reports settings (typed)' })
  @ApiResponse({ status: 200, description: 'Reports settings updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateReports(
    @Body() dto: UpdateReportsSettingsDto,
  ): Promise<ReportsSettingsDto> {
    try {
      const entries = reportsDtoToEntries(dto);
      const res = await this.settingsService.upsertGroup('reports', entries);
      return entriesToReportsDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateReports] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to update reports settings',
          );
    }
  }

  // Public (read-only) Reports settings for authenticated tenants
  @UseGuards(JwtAuthGuard)
  @Get('settings/reports')
  @ApiOperation({ summary: 'Get reports settings (read-only, tenant authenticated)' })
  @ApiResponse({ status: 200, description: 'Reports settings returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getReportsPublic(): Promise<ReportsSettingsDto> {
    try {
      const res = await this.settingsService.getGroupAdmin('reports');
      return entriesToReportsDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getReportsPublic] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to get reports settings',
          );
    }
  }

  // Payment Settings
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN')
  @Get('admin/settings/payment/typed')
  @ApiOperation({ summary: 'Get payment settings (typed)' })
  @ApiResponse({ status: 200, description: 'Payment settings returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getPayment(): Promise<PaymentSettingsDto> {
    try {
      const res = await this.settingsService.getGroupAdmin('payment');
      return entriesToPaymentDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getPayment] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get payment settings');
    }
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN')
  @Put('admin/settings/payment/typed')
  @ApiOperation({ summary: 'Update payment settings (typed)' })
  @ApiResponse({ status: 200, description: 'Payment settings updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updatePayment(
    @Body() dto: UpdatePaymentSettingsDto,
  ): Promise<PaymentSettingsDto> {
    try {
      const entries = paymentDtoToEntries(dto);
      const res = await this.settingsService.upsertGroup('payment', entries);
      return entriesToPaymentDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updatePayment] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update payment settings');
    }
  }

  // Integration Settings (Slack, Telegram, Twilio)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN')
  @Get('admin/settings/integrations/typed')
  @ApiOperation({ summary: 'Get integration settings (typed)' })
  @ApiResponse({ status: 200, description: 'Integration settings returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getIntegrations(): Promise<IntegrationSettingsDto> {
    try {
      const res = await this.settingsService.getGroupAdmin('integrations');
      return entriesToIntegrationDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getIntegrations] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to get integration settings',
          );
    }
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN')
  @Put('admin/settings/integrations/typed')
  @ApiOperation({ summary: 'Update integration settings (typed)' })
  @ApiResponse({ status: 200, description: 'Integration settings updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateIntegrations(
    @Body() dto: UpdateIntegrationSettingsDto,
  ): Promise<IntegrationSettingsDto> {
    try {
      const entries = integrationDtoToEntries(dto);
      const res = await this.settingsService.upsertGroup(
        'integrations',
        entries,
      );
      return entriesToIntegrationDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateIntegrations] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to update integration settings',
          );
    }
  }

  // Time Tracker Settings
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN')
  @Get('admin/settings/tracker/typed')
  @ApiOperation({ summary: 'Get time tracker settings (typed)' })
  @ApiResponse({ status: 200, description: 'Tracker settings returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getTracker(): Promise<TrackerSettingsDto> {
    try {
      const res = await this.settingsService.getGroupAdmin('tracker');
      return entriesToTrackerDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getTracker] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get tracker settings');
    }
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN')
  @Put('admin/settings/tracker/typed')
  @ApiOperation({ summary: 'Update time tracker settings (typed)' })
  @ApiResponse({ status: 200, description: 'Tracker settings updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateTracker(
    @Body() dto: UpdateTrackerSettingsDto,
  ): Promise<TrackerSettingsDto> {
    try {
      const entries = trackerDtoToEntries(dto);
      const res = await this.settingsService.upsertGroup('tracker', entries);
      return entriesToTrackerDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateTracker] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update tracker settings');
    }
  }

  // Notification Settings
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN')
  @Get('admin/settings/notifications/typed')
  @ApiOperation({ summary: 'Get notification settings (typed)' })
  @ApiResponse({ status: 200, description: 'Notification settings returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getNotifications(): Promise<NotificationSettingsDto> {
    try {
      const res = await this.settingsService.getGroupAdmin('notifications');
      return entriesToNotificationDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getNotifications] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to get notification settings',
          );
    }
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN')
  @Put('admin/settings/notifications/typed')
  @ApiOperation({ summary: 'Update notification settings (typed)' })
  @ApiResponse({ status: 200, description: 'Notification settings updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateNotifications(
    @Body() dto: UpdateNotificationSettingsDto,
  ): Promise<NotificationSettingsDto> {
    try {
      const entries = notificationDtoToEntries(dto);
      const res = await this.settingsService.upsertGroup(
        'notifications',
        entries,
      );
      return entriesToNotificationDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateNotifications] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to update notification settings',
          );
    }
  }

  // Zoom Settings
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN')
  @Get('admin/settings/zoom/typed')
  @ApiOperation({ summary: 'Get Zoom settings (typed)' })
  @ApiResponse({ status: 200, description: 'Zoom settings returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getZoom(): Promise<ZoomSettingsDto> {
    try {
      const res = await this.settingsService.getGroupAdmin('zoom');
      return entriesToZoomDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getZoom] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get Zoom settings');
    }
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN')
  @Put('admin/settings/zoom/typed')
  @ApiOperation({ summary: 'Update Zoom settings (typed)' })
  @ApiResponse({ status: 200, description: 'Zoom settings updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateZoom(
    @Body() dto: UpdateZoomSettingsDto,
  ): Promise<ZoomSettingsDto> {
    try {
      const entries = zoomDtoToEntries(dto);
      const res = await this.settingsService.upsertGroup('zoom', entries);
      return entriesToZoomDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateZoom] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update Zoom settings');
    }
  }

  // Calendar Settings (Google Calendar)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN')
  @Get('admin/settings/calendar/typed')
  @ApiOperation({ summary: 'Get calendar settings (typed)' })
  @ApiResponse({ status: 200, description: 'Calendar settings returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getCalendar(): Promise<CalendarSettingsDto> {
    try {
      const res = await this.settingsService.getGroupAdmin('calendar');
      return entriesToCalendarDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getCalendar] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get calendar settings');
    }
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN')
  @Put('admin/settings/calendar/typed')
  @ApiOperation({ summary: 'Update calendar settings (typed)' })
  @ApiResponse({ status: 200, description: 'Calendar settings updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateCalendar(
    @Body() dto: UpdateCalendarSettingsDto,
  ): Promise<CalendarSettingsDto> {
    try {
      const entries = calendarDtoToEntries(dto);
      const res = await this.settingsService.upsertGroup('calendar', entries);
      return entriesToCalendarDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateCalendar] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to update calendar settings',
          );
    }
  }

  // Webhook Settings
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN')
  @Get('admin/settings/webhooks/typed')
  @ApiOperation({ summary: 'Get webhook settings (typed)' })
  @ApiResponse({ status: 200, description: 'Webhook settings returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getWebhooks(): Promise<WebhookSettingsDto> {
    try {
      const res = await this.settingsService.getGroupAdmin('webhooks');
      return entriesToWebhookDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getWebhooks] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get webhook settings');
    }
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN')
  @Put('admin/settings/webhooks/typed')
  @ApiOperation({ summary: 'Update webhook settings (typed)' })
  @ApiResponse({ status: 200, description: 'Webhook settings updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateWebhooks(
    @Body() dto: UpdateWebhookSettingsDto,
  ): Promise<WebhookSettingsDto> {
    try {
      const entries = webhookDtoToEntries(dto);
      const res = await this.settingsService.upsertGroup('webhooks', entries);
      return entriesToWebhookDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateWebhooks] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to update webhook settings',
          );
    }
  }

  // IP Restriction Settings
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN')
  @Get('admin/settings/ip-restriction/typed')
  @ApiOperation({ summary: 'Get IP restriction settings (typed)' })
  @ApiResponse({ status: 200, description: 'IP restriction settings returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getIpRestriction(): Promise<IpRestrictionSettingsDto> {
    try {
      const res = await this.settingsService.getGroupAdmin('ip-restriction');
      return entriesToIpRestrictionDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getIpRestriction] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to get IP restriction settings',
          );
    }
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPER_ADMIN')
  @Put('admin/settings/ip-restriction/typed')
  @ApiOperation({ summary: 'Update IP restriction settings (typed)' })
  @ApiResponse({ status: 200, description: 'IP restriction settings updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateIpRestriction(
    @Body() dto: UpdateIpRestrictionSettingsDto,
  ): Promise<IpRestrictionSettingsDto> {
    try {
      const entries = ipRestrictionDtoToEntries(dto);
      const res = await this.settingsService.upsertGroup(
        'ip-restriction',
        entries,
      );
      return entriesToIpRestrictionDto(res.items);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateIpRestriction] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException(
            'Failed to update IP restriction settings',
          );
    }
  }
}
