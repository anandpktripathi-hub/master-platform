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
  CreateThemeDto,
  UpdateThemeDto,
  ThemeResponseDto,
} from '../dto/theme.dto';
import { ThemeIdParamDto } from '../dto/theme-id-param.dto';
@ApiTags('Admin Themes')
@ApiBearerAuth('bearer')
@Controller('admin/themes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminThemesController {
  private readonly logger = new Logger(AdminThemesController.name);

  constructor(private readonly themesService: ThemesService) {}

  /**
   * Create a new theme
   * POST /admin/themes
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new theme (admin)' })
  @ApiResponse({ status: 201, description: 'Theme created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createTheme(
    @Body() createThemeDto: CreateThemeDto,
  ): Promise<ThemeResponseDto> {
    try {
      return await this.themesService.createTheme(createThemeDto);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[createTheme] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create theme');
    }
  }

  /**
   * Get all themes
   * GET /admin/themes
   */
  @Get()
  @ApiOperation({ summary: 'Get all themes (admin)' })
  @ApiResponse({ status: 200, description: 'Themes returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getAllThemes(): Promise<ThemeResponseDto[]> {
    try {
      return await this.themesService.getAllThemes(true); // Include inactive themes for admin
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getAllThemes] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list themes');
    }
  }

  /**
   * Get theme by ID
   * GET /admin/themes/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a theme by id (admin)' })
  @ApiResponse({ status: 200, description: 'Theme returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getTheme(@Param() params: ThemeIdParamDto): Promise<ThemeResponseDto> {
    try {
      return await this.themesService.getThemeById(params.id);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getTheme] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get theme');
    }
  }

  /**
   * Update theme
   * PATCH /admin/themes/:id
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update a theme (admin)' })
  @ApiResponse({ status: 200, description: 'Theme updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateTheme(
    @Param() params: ThemeIdParamDto,
    @Body() updateThemeDto: UpdateThemeDto,
  ): Promise<ThemeResponseDto> {
    try {
      return await this.themesService.updateTheme(params.id, updateThemeDto);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateTheme] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update theme');
    }
  }

  /**
   * Activate theme
   * PATCH /admin/themes/:id/activate
   */
  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate a theme (admin)' })
  @ApiResponse({ status: 200, description: 'Theme activated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async activateTheme(@Param() params: ThemeIdParamDto): Promise<ThemeResponseDto> {
    try {
      return await this.themesService.activateTheme(params.id);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[activateTheme] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to activate theme');
    }
  }

  /**
   * Deactivate theme
   * PATCH /admin/themes/:id/deactivate
   */
  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate a theme (admin)' })
  @ApiResponse({ status: 200, description: 'Theme deactivated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deactivateTheme(
    @Param() params: ThemeIdParamDto,
  ): Promise<ThemeResponseDto> {
    try {
      return await this.themesService.deactivateTheme(params.id);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[deactivateTheme] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to deactivate theme');
    }
  }

  /**
   * Delete theme
   * DELETE /admin/themes/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a theme (admin)' })
  @ApiResponse({ status: 204, description: 'Theme deleted' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteTheme(@Param() params: ThemeIdParamDto): Promise<void> {
    try {
      await this.themesService.deleteTheme(params.id);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[deleteTheme] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to delete theme');
    }
  }
}
