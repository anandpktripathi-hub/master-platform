import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ThemesService } from '../services/themes.service';
import { CreateThemeDto, UpdateThemeDto, ThemeResponseDto } from '../dto/theme.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { Permission } from '../../../common/enums/permission.enum';

/**
 * AdminThemesController
 * 
 * Handles theme management for Platform Super Admins.
 * Only PLATFORM_SUPER_ADMIN users can access these endpoints.
 * 
 * Features:
 * - Create new themes
 * - List all themes (including inactive)
 * - Update existing themes
 * - Delete themes (if not in use)
 * - Set default theme
 */
@ApiTags('Admin - Themes')
@Controller('admin/themes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AdminThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Post()
  @Permissions(Permission.MANAGE_PLATFORM_THEMES)
  @ApiOperation({ summary: 'Create a new theme (Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Theme created successfully', type: ThemeResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input or slug already exists' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires PLATFORM_SUPER_ADMIN role' })
  async createTheme(@Body() createThemeDto: CreateThemeDto): Promise<ThemeResponseDto> {
    return this.themesService.createTheme(createThemeDto);
  }

  @Get()
  @Permissions(Permission.MANAGE_PLATFORM_THEMES)
  @ApiOperation({ summary: 'Get all themes (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Themes retrieved successfully', type: [ThemeResponseDto] })
  async getAllThemes(): Promise<ThemeResponseDto[]> {
    return this.themesService.getAllThemes();
  }

  @Get(':id')
  @Permissions(Permission.MANAGE_PLATFORM_THEMES)
  @ApiOperation({ summary: 'Get theme by ID (Super Admin only)' })
  @ApiParam({ name: 'id', description: 'Theme ID' })
  @ApiResponse({ status: 200, description: 'Theme retrieved successfully', type: ThemeResponseDto })
  @ApiResponse({ status: 404, description: 'Theme not found' })
  async getThemeById(@Param('id') id: string): Promise<ThemeResponseDto> {
    return this.themesService.getThemeById(id);
  }

  @Put(':id')
  @Permissions(Permission.MANAGE_PLATFORM_THEMES)
  @ApiOperation({ summary: 'Update a theme (Super Admin only)' })
  @ApiParam({ name: 'id', description: 'Theme ID' })
  @ApiResponse({ status: 200, description: 'Theme updated successfully', type: ThemeResponseDto })
  @ApiResponse({ status: 404, description: 'Theme not found' })
  async updateTheme(
    @Param('id') id: string,
    @Body() updateThemeDto: UpdateThemeDto,
  ): Promise<ThemeResponseDto> {
    return this.themesService.updateTheme(id, updateThemeDto);
  }

  @Delete(':id')
  @Permissions(Permission.MANAGE_PLATFORM_THEMES)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a theme (Super Admin only)' })
  @ApiParam({ name: 'id', description: 'Theme ID' })
  @ApiResponse({ status: 204, description: 'Theme deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete theme in use by tenants' })
  @ApiResponse({ status: 404, description: 'Theme not found' })
  async deleteTheme(@Param('id') id: string): Promise<void> {
    return this.themesService.deleteTheme(id);
  }

  @Post(':id/set-default')
  @Permissions(Permission.MANAGE_PLATFORM_THEMES)
  @ApiOperation({ summary: 'Set theme as default for new tenants (Super Admin only)' })
  @ApiParam({ name: 'id', description: 'Theme ID' })
  @ApiResponse({ status: 200, description: 'Default theme set successfully', type: ThemeResponseDto })
  @ApiResponse({ status: 404, description: 'Theme not found' })
  async setDefaultTheme(@Param('id') id: string): Promise<ThemeResponseDto> {
    return this.themesService.setDefaultTheme(id);
  }
}
