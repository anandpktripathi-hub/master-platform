import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ThemesService } from '../services/themes.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CreateThemeDto,
  UpdateThemeDto,
  ThemeResponseDto,
} from '../dto/theme.dto';
@ApiTags('Admin Themes')
@ApiBearerAuth('bearer')
@Controller('admin/themes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminThemesController {
  constructor(private readonly themesService: ThemesService) {}

  /**
   * Create a new theme
   * POST /admin/themes
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTheme(
    @Body() createThemeDto: CreateThemeDto,
  ): Promise<ThemeResponseDto> {
    return this.themesService.createTheme(createThemeDto);
  }

  /**
   * Get all themes
   * GET /admin/themes
   */
  @Get()
  async getAllThemes(): Promise<ThemeResponseDto[]> {
    return this.themesService.getAllThemes(true); // Include inactive themes for admin
  }

  /**
   * Get theme by ID
   * GET /admin/themes/:id
   */
  @Get(':id')
  async getTheme(@Param('id') themeId: string): Promise<ThemeResponseDto> {
    return this.themesService.getThemeById(themeId);
  }

  /**
   * Update theme
   * PATCH /admin/themes/:id
   */
  @Patch(':id')
  async updateTheme(
    @Param('id') themeId: string,
    @Body() updateThemeDto: UpdateThemeDto,
  ): Promise<ThemeResponseDto> {
    return this.themesService.updateTheme(themeId, updateThemeDto);
  }

  /**
   * Activate theme
   * PATCH /admin/themes/:id/activate
   */
  @Patch(':id/activate')
  async activateTheme(@Param('id') themeId: string): Promise<ThemeResponseDto> {
    return this.themesService.activateTheme(themeId);
  }

  /**
   * Deactivate theme
   * PATCH /admin/themes/:id/deactivate
   */
  @Patch(':id/deactivate')
  async deactivateTheme(
    @Param('id') themeId: string,
  ): Promise<ThemeResponseDto> {
    return this.themesService.deactivateTheme(themeId);
  }

  /**
   * Delete theme
   * DELETE /admin/themes/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTheme(@Param('id') themeId: string): Promise<void> {
    return this.themesService.deleteTheme(themeId);
  }
}
