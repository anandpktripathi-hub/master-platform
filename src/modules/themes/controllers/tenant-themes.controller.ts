import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ThemesService } from '../services/themes.service';
import {
  SelectThemeDto,
  CustomizeThemeDto,
  ThemeResponseDto,
  TenantThemeResponseDto,
} from '../dto/theme.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { Permission } from '../../../common/enums/permission.enum';

/**
 * TenantThemesController
 *
 * Handles theme selection and customization for tenants.
 * Accessible by TENANT_OWNER and users with theme management permissions.
 *
 * Features:
 * - Browse available themes
 * - Get current tenant theme
 * - Select a new theme
 * - Customize selected theme
 * - Reset theme to base (remove customizations)
 */
@ApiTags('Tenant - Themes')
@Controller('tenant/themes')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@ApiBearerAuth()
export class TenantThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Get('available')
  @ApiOperation({ summary: 'Get available themes for selection' })
  @ApiResponse({
    status: 200,
    description: 'Available themes retrieved successfully',
    type: [ThemeResponseDto],
  })
  async getAvailableThemes(): Promise<ThemeResponseDto[]> {
    return this.themesService.getAvailableThemes();
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current tenant theme (with customizations)' })
  @ApiResponse({
    status: 200,
    description: 'Current theme retrieved successfully',
    type: TenantThemeResponseDto,
  })
  async getCurrentTheme(@Req() req: Request): Promise<TenantThemeResponseDto> {
    const tenantId = (req as Request & { user?: { tenantId?: string } }).user
      ?.tenantId;
    if (!tenantId) throw new BadRequestException('Tenant ID is required');
    return this.themesService.getTenantTheme(tenantId);
  }

  @Post('select')
  @Permissions(Permission.MANAGE_TENANT_WEBSITE)
  @ApiOperation({ summary: 'Select a theme for tenant' })
  @ApiResponse({
    status: 200,
    description: 'Theme selected successfully',
    type: TenantThemeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Theme not found or not available' })
  async selectTheme(
    @Req() req: Request,
    @Body() selectThemeDto: SelectThemeDto,
  ): Promise<TenantThemeResponseDto> {
    const tenantId = (
      req as Request & { user?: { tenantId?: string; userId?: string } }
    ).user?.tenantId;
    const userId = (
      req as Request & { user?: { tenantId?: string; userId?: string } }
    ).user?.userId;
    if (!tenantId) throw new BadRequestException('Tenant ID is required');
    if (!userId || typeof userId !== 'string')
      throw new BadRequestException('User ID is required');
    return this.themesService.selectTheme(tenantId, selectThemeDto, userId);
  }

  @Put('customize')
  @Permissions(Permission.MANAGE_TENANT_WEBSITE)
  @ApiOperation({ summary: 'Customize tenant theme' })
  @ApiResponse({
    status: 200,
    description: 'Theme customized successfully',
    type: TenantThemeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Please select a base theme first' })
  async customizeTheme(
    @Req() req: Request,
    @Body() customizeThemeDto: CustomizeThemeDto,
  ): Promise<TenantThemeResponseDto> {
    const tenantId = (
      req as Request & { user?: { tenantId?: string; userId?: string } }
    ).user?.tenantId;
    const userId = (
      req as Request & { user?: { tenantId?: string; userId?: string } }
    ).user?.userId;
    if (!tenantId) throw new BadRequestException('Tenant ID is required');
    if (!userId || typeof userId !== 'string')
      throw new BadRequestException('User ID is required');
    return this.themesService.customizeTheme(
      tenantId,
      customizeThemeDto,
      userId,
    );
  }

  @Post('reset')
  @Permissions(Permission.MANAGE_TENANT_WEBSITE)
  @ApiOperation({ summary: 'Reset theme to base (remove customizations)' })
  @ApiResponse({
    status: 200,
    description: 'Theme reset successfully',
    type: TenantThemeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tenant theme not found' })
  async resetTheme(@Req() req: Request): Promise<TenantThemeResponseDto> {
    const tenantId = (
      req as Request & { user?: { tenantId?: string; userId?: string } }
    ).user?.tenantId;
    const userId = (
      req as Request & { user?: { tenantId?: string; userId?: string } }
    ).user?.userId;
    if (!tenantId || typeof tenantId !== 'string')
      throw new BadRequestException('Tenant ID is required');
    if (!userId || typeof userId !== 'string')
      throw new BadRequestException('User ID is required');
    return this.themesService.resetTheme(tenantId, userId);
  }
}
