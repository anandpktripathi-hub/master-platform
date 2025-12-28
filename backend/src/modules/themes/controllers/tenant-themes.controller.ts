import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Param,
  BadRequestException,
  NotFoundException,
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
  CreateThemeDto,
  UpdateThemeDto,
} from '../dto/theme.dto';

@Controller('tenant/theme')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('TENANT_OWNER', 'USER')
export class TenantThemesController {
  constructor(private readonly tenantThemesService: ThemesService) {}

  /**
   * Get tenant's current theme with merged CSS variables
   * GET /tenant/theme
   */
  @Get()
  async getTenantTheme(@Req() req: any) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new BadRequestException('Tenant ID is required');
    return this.tenantThemesService.getTenantTheme(tenantId);
  }

  /**
   * Get theme as CSS file content
   * GET /tenant/theme/css
   */
  @Get('css')
  async getThemeCss(@Req() req: any) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new BadRequestException('Tenant ID is required');
    return this.tenantThemesService.generateCssVariables(tenantId);
  }

  /**
   * Get theme variables as JSON
   * GET /tenant/theme/variables
   */
  @Get('variables')
  async getThemeVariables(@Req() req: any) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new BadRequestException('Tenant ID is required');
    return this.tenantThemesService.getCssVariablesAsJson(tenantId);
  }

  /**
   * Tenant selects a theme
   * POST /tenant/theme/select
   */
  @Post('select')
  async selectTheme(@Req() req: any, @Body() selectThemeDto: SelectThemeDto) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new BadRequestException('Tenant ID is required');
    return this.tenantThemesService.selectThemeForTenant(
      tenantId,
      selectThemeDto,
    );
  }

  /**
   * Tenant customizes theme CSS variables
   * POST /tenant/theme/customize
   */
  @Post('customize')
  async customizeTheme(
    @Req() req: any,
    @Body() customizeThemeDto: CustomizeThemeDto,
  ) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new BadRequestException('Tenant ID is required');
    return this.tenantThemesService.customizeThemeForTenant(
      tenantId,
      customizeThemeDto,
    );
  }
}
