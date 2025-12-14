import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ThemesService } from '../services/themes.service';
import {
  SelectThemeDto,
  CustomizeThemeDto,
  TenantThemeResponseDto,
  ThemeResponseDto,
} from '../dto/theme.dto';

@Controller('tenant/theme')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('TENANT_OWNER', 'USER')
export class TenantThemesController {
  constructor(private readonly themesService: ThemesService) {}

  /**
   * Get all available themes for selection
   * GET /tenant/theme/available
   */
  @Get('available')
  async getAvailableThemes(): Promise<ThemeResponseDto[]> {
    return this.themesService.getAllThemes(false); // Only active themes
  }

  /**
   * Get tenant's current theme with merged CSS variables
   * GET /tenant/theme
   */
  @Get()
  async getTenantTheme(
    @Request() req: { user: { tenantId: string } },
  ): Promise<TenantThemeResponseDto> {
    return this.themesService.getTenantTheme(req.user.tenantId);
  }

  /**
   * Get theme as CSS file content
   * GET /tenant/theme/css
   */
  @Get('css')
  async getThemeCss(
    @Request() req: { user: { tenantId: string } },
  ): Promise<{ css: string }> {
    const css = await this.themesService.generateCssVariables(
      req.user.tenantId,
    );
    return { css };
  }

  /**
   * Get theme variables as JSON
   * GET /tenant/theme/variables
   */
  @Get('variables')
  async getThemeVariables(
    @Request() req: { user: { tenantId: string } },
  ): Promise<Record<string, string>> {
    return this.themesService.getCssVariablesAsJson(req.user.tenantId);
  }

  /**
   * Tenant selects a theme
   * POST /tenant/theme/select
   */
  @Post('select')
  @HttpCode(HttpStatus.OK)
  async selectTheme(
    @Request() req: { user: { tenantId: string } },
    @Body() selectThemeDto: SelectThemeDto,
  ): Promise<TenantThemeResponseDto> {
    return this.themesService.selectThemeForTenant(
      req.user.tenantId,
      selectThemeDto,
    );
  }

  /**
   * Tenant customizes theme CSS variables
   * POST /tenant/theme/customize
   */
  @Post('customize')
  @HttpCode(HttpStatus.OK)
  async customizeTheme(
    @Request() req: { user: { tenantId: string } },
    @Body() customizeThemeDto: CustomizeThemeDto,
  ): Promise<TenantThemeResponseDto> {
    return this.themesService.customizeThemeForTenant(
      req.user.tenantId,
      customizeThemeDto,
    );
  }
}
