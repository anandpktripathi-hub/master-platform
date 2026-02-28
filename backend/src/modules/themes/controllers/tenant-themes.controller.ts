import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ThemesService } from '../services/themes.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  SelectThemeDto,
  CustomizeThemeDto,
} from '../dto/theme.dto';
@ApiTags('Tenant Themes')
@ApiBearerAuth('bearer')
@Controller('tenant/theme')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('TENANT_OWNER', 'USER')
export class TenantThemesController {
  private readonly logger = new Logger(TenantThemesController.name);

  constructor(private readonly tenantThemesService: ThemesService) {}

  /**
   * Get tenant's current theme with merged CSS variables
   * GET /tenant/theme
   */
  @Get()
  @ApiOperation({ summary: "Get tenant's current theme" })
  @ApiResponse({ status: 200, description: 'Tenant theme returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getTenantTheme(@Req() req: any) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new BadRequestException('Tenant ID is required');
      return await this.tenantThemesService.getTenantTheme(tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getTenantTheme] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get tenant theme');
    }
  }

  /**
   * Get theme as CSS file content
   * GET /tenant/theme/css
   */
  @Get('css')
  @ApiOperation({ summary: 'Get tenant theme as CSS variables content' })
  @ApiResponse({ status: 200, description: 'CSS variables returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getThemeCss(@Req() req: any) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new BadRequestException('Tenant ID is required');
      return await this.tenantThemesService.generateCssVariables(tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getThemeCss] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get theme CSS');
    }
  }

  /**
   * Get theme variables as JSON
   * GET /tenant/theme/variables
   */
  @Get('variables')
  @ApiOperation({ summary: 'Get tenant theme variables as JSON' })
  @ApiResponse({ status: 200, description: 'Theme variables returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getThemeVariables(@Req() req: any) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new BadRequestException('Tenant ID is required');
      return await this.tenantThemesService.getCssVariablesAsJson(tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getThemeVariables] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get theme variables');
    }
  }

  /**
   * Tenant selects a theme
   * POST /tenant/theme/select
   */
  @Post('select')
  @ApiOperation({ summary: 'Select a theme for tenant' })
  @ApiResponse({ status: 201, description: 'Theme selected' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async selectTheme(@Req() req: any, @Body() selectThemeDto: SelectThemeDto) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new BadRequestException('Tenant ID is required');
      return await this.tenantThemesService.selectThemeForTenant(
        tenantId,
        selectThemeDto,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[selectTheme] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to select theme');
    }
  }

  /**
   * Tenant customizes theme CSS variables
   * POST /tenant/theme/customize
   */
  @Post('customize')
  @ApiOperation({ summary: 'Customize theme CSS variables for tenant' })
  @ApiResponse({ status: 201, description: 'Theme customized' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async customizeTheme(
    @Req() req: any,
    @Body() customizeThemeDto: CustomizeThemeDto,
  ) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new BadRequestException('Tenant ID is required');
      return await this.tenantThemesService.customizeThemeForTenant(
        tenantId,
        customizeThemeDto,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[customizeTheme] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to customize theme');
    }
  }
}
