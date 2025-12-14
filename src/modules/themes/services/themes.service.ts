import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Theme } from '../schemas/theme.schema';
import { TenantTheme } from '../schemas/tenant-theme.schema';
import {
  CreateThemeDto,
  UpdateThemeDto,
  SelectThemeDto,
  CustomizeThemeDto,
  ThemeResponseDto,
  TenantThemeResponseDto,
} from '../dto/theme.dto';

@Injectable()
export class ThemesService {
  private readonly logger = new Logger(ThemesService.name);

  constructor(
    @InjectModel(Theme.name) private readonly themeModel: Model<Theme>,
    @InjectModel(TenantTheme.name) private readonly tenantThemeModel: Model<TenantTheme>,
  ) {}

  // ==================== ADMIN THEME MANAGEMENT ====================

  /**
   * Create a new theme (Platform Super Admin only)
   */
  async createTheme(createThemeDto: CreateThemeDto): Promise<ThemeResponseDto> {
    // Check if slug already exists
    const existing = await this.themeModel.findOne({ slug: createThemeDto.slug });
    if (existing) {
      throw new BadRequestException(`Theme with slug '${createThemeDto.slug}' already exists`);
    }

    // If this is marked as default, unset all other defaults
    if (createThemeDto.isDefault) {
      await this.themeModel.updateMany({ isDefault: true }, { isDefault: false });
    }

    const theme = await this.themeModel.create(createThemeDto);
    this.logger.log(`Created new theme: ${theme.name} (${theme.slug})`);

    return this.mapThemeToResponse(theme);
  }

  /**
   * Get all themes (Admin view - includes inactive)
   */
  async getAllThemes(): Promise<ThemeResponseDto[]> {
    const themes = await this.themeModel.find().sort({ createdAt: -1 }).exec();
    return themes.map((theme) => this.mapThemeToResponse(theme));
  }

  /**
   * Get a single theme by ID
   */
  async getThemeById(id: string): Promise<ThemeResponseDto> {
    const theme = await this.themeModel.findById(id).exec();
    if (!theme) {
      throw new NotFoundException(`Theme with ID ${id} not found`);
    }
    return this.mapThemeToResponse(theme);
  }

  /**
   * Update a theme (Platform Super Admin only)
   */
  async updateTheme(id: string, updateThemeDto: UpdateThemeDto): Promise<ThemeResponseDto> {
    const theme = await this.themeModel.findById(id).exec();
    if (!theme) {
      throw new NotFoundException(`Theme with ID ${id} not found`);
    }

    // If this is being set as default, unset all other defaults
    if (updateThemeDto.isDefault) {
      await this.themeModel.updateMany({ _id: { $ne: id }, isDefault: true }, { isDefault: false });
    }

    Object.assign(theme, updateThemeDto);
    await theme.save();

    this.logger.log(`Updated theme: ${theme.name} (${theme.slug})`);
    return this.mapThemeToResponse(theme);
  }

  /**
   * Delete a theme (Platform Super Admin only)
   */
  async deleteTheme(id: string): Promise<void> {
    const theme = await this.themeModel.findById(id).exec();
    if (!theme) {
      throw new NotFoundException(`Theme with ID ${id} not found`);
    }

    // Check if any tenants are using this theme
    const tenantsUsingTheme = await this.tenantThemeModel.countDocuments({ baseThemeId: id });
    if (tenantsUsingTheme > 0) {
      throw new BadRequestException(
        `Cannot delete theme '${theme.name}'. ${tenantsUsingTheme} tenant(s) are currently using it.`,
      );
    }

    await theme.deleteOne();
    this.logger.log(`Deleted theme: ${theme.name} (${theme.slug})`);
  }

  /**
   * Set a theme as default
   */
  async setDefaultTheme(id: string): Promise<ThemeResponseDto> {
    const theme = await this.themeModel.findById(id).exec();
    if (!theme) {
      throw new NotFoundException(`Theme with ID ${id} not found`);
    }

    // Unset all other defaults
    await this.themeModel.updateMany({ _id: { $ne: id }, isDefault: true }, { isDefault: false });

    theme.isDefault = true;
    theme.isActive = true; // Ensure default theme is active
    await theme.save();

    this.logger.log(`Set default theme: ${theme.name} (${theme.slug})`);
    return this.mapThemeToResponse(theme);
  }

  // ==================== TENANT THEME OPERATIONS ====================

  /**
   * Get available themes for tenant selection (only active themes)
   */
  async getAvailableThemes(): Promise<ThemeResponseDto[]> {
    const themes = await this.themeModel.find({ isActive: true }).sort({ isDefault: -1, name: 1 }).exec();
    return themes.map((theme) => this.mapThemeToResponse(theme));
  }

  /**
   * Get tenant's current theme (with customizations applied)
   */
  async getTenantTheme(tenantId: string): Promise<TenantThemeResponseDto> {
    const tenantTheme = await this.tenantThemeModel
      .findOne({ tenantId })
      .populate('baseThemeId')
      .exec();

    if (!tenantTheme) {
      // Return default theme if tenant hasn't selected one yet
      return this.getDefaultTheme();
    }

    const baseTheme = tenantTheme.baseThemeId as any;
    if (!baseTheme) {
      throw new NotFoundException('Base theme not found');
    }

    // Merge base theme with customizations
    return this.mergeTenantTheme(baseTheme, tenantTheme);
  }

  /**
   * Select a theme for tenant (without customizations)
   */
  async selectTheme(tenantId: string, selectThemeDto: SelectThemeDto, userId: string): Promise<TenantThemeResponseDto> {
    // Validate theme exists and is active
    const theme = await this.themeModel.findOne({
      _id: selectThemeDto.baseThemeId,
      isActive: true,
    }).exec();

    if (!theme) {
      throw new NotFoundException('Theme not found or not available');
    }

    // Check if tenant already has a theme selected
    let tenantTheme = await this.tenantThemeModel.findOne({ tenantId }).exec();

    if (tenantTheme) {
      // Update existing selection (clear customizations)
      tenantTheme.baseThemeId = new Types.ObjectId(selectThemeDto.baseThemeId);
      tenantTheme.appliedAt = new Date();
      tenantTheme.lastModifiedBy = new Types.ObjectId(userId);
      
      // Clear all customizations when selecting a new theme
      tenantTheme.customPrimaryColor = undefined;
      tenantTheme.customSecondaryColor = undefined;
      tenantTheme.customBackgroundColor = undefined;
      tenantTheme.customSurfaceColor = undefined;
      tenantTheme.customTextPrimaryColor = undefined;
      tenantTheme.customTextSecondaryColor = undefined;
      tenantTheme.customFontFamily = undefined;
      tenantTheme.customBaseFontSize = undefined;
      tenantTheme.customBaseSpacing = undefined;
      tenantTheme.customBorderRadius = undefined;
      tenantTheme.customMetadata = undefined;

      await tenantTheme.save();
    } else {
      // Create new theme selection
      tenantTheme = await this.tenantThemeModel.create({
        tenantId,
        baseThemeId: selectThemeDto.baseThemeId,
        appliedAt: new Date(),
        lastModifiedBy: userId,
      });
    }

    this.logger.log(`Tenant ${tenantId} selected theme: ${theme.name}`);

    return this.mergeTenantTheme(theme, tenantTheme);
  }

  /**
   * Customize tenant's selected theme
   */
  async customizeTheme(
    tenantId: string,
    customizeThemeDto: CustomizeThemeDto,
    userId: string,
  ): Promise<TenantThemeResponseDto> {
    const tenantTheme = await this.tenantThemeModel
      .findOne({ tenantId })
      .populate('baseThemeId')
      .exec();

    if (!tenantTheme) {
      throw new BadRequestException('Please select a base theme first before customizing');
    }

    // Apply customizations
    Object.assign(tenantTheme, customizeThemeDto);
    tenantTheme.appliedAt = new Date();
    tenantTheme.lastModifiedBy = new Types.ObjectId(userId);
    await tenantTheme.save();

    const baseTheme = tenantTheme.baseThemeId as any;
    this.logger.log(`Tenant ${tenantId} customized theme: ${baseTheme.name}`);

    return this.mergeTenantTheme(baseTheme, tenantTheme);
  }

  /**
   * Reset tenant theme to base (remove customizations)
   */
  async resetTheme(tenantId: string, userId: string): Promise<TenantThemeResponseDto> {
    const tenantTheme = await this.tenantThemeModel
      .findOne({ tenantId })
      .populate('baseThemeId')
      .exec();

    if (!tenantTheme) {
      throw new NotFoundException('Tenant theme not found');
    }

    // Clear all customizations
    tenantTheme.customPrimaryColor = undefined;
    tenantTheme.customSecondaryColor = undefined;
    tenantTheme.customBackgroundColor = undefined;
    tenantTheme.customSurfaceColor = undefined;
    tenantTheme.customTextPrimaryColor = undefined;
    tenantTheme.customTextSecondaryColor = undefined;
    tenantTheme.customFontFamily = undefined;
    tenantTheme.customBaseFontSize = undefined;
    tenantTheme.customBaseSpacing = undefined;
    tenantTheme.customBorderRadius = undefined;
    tenantTheme.customMetadata = undefined;
    tenantTheme.appliedAt = new Date();
    tenantTheme.lastModifiedBy = new Types.ObjectId(userId);

    await tenantTheme.save();

    const baseTheme = tenantTheme.baseThemeId as any;
    this.logger.log(`Tenant ${tenantId} reset theme to base: ${baseTheme.name}`);

    return this.mergeTenantTheme(baseTheme, tenantTheme);
  }

  // ==================== HELPER METHODS ====================

  /**
   * Get the default theme for new tenants
   */
  private async getDefaultTheme(): Promise<TenantThemeResponseDto> {
    const defaultTheme = await this.themeModel.findOne({ isDefault: true, isActive: true }).exec();

    if (!defaultTheme) {
      // Fallback: get any active theme
      const anyTheme = await this.themeModel.findOne({ isActive: true }).exec();
      if (!anyTheme) {
        throw new NotFoundException('No themes available. Please create at least one theme.');
      }
      return this.mapThemeToResponse(anyTheme) as TenantThemeResponseDto;
    }

    return this.mapThemeToResponse(defaultTheme) as TenantThemeResponseDto;
  }

  /**
   * Merge base theme with tenant customizations
   */
  private mergeTenantTheme(baseTheme: any, tenantTheme: TenantTheme): TenantThemeResponseDto {
    const customizations: any = {};

    if (tenantTheme.customPrimaryColor) customizations.customPrimaryColor = tenantTheme.customPrimaryColor;
    if (tenantTheme.customSecondaryColor) customizations.customSecondaryColor = tenantTheme.customSecondaryColor;
    if (tenantTheme.customBackgroundColor) customizations.customBackgroundColor = tenantTheme.customBackgroundColor;
    if (tenantTheme.customSurfaceColor) customizations.customSurfaceColor = tenantTheme.customSurfaceColor;
    if (tenantTheme.customTextPrimaryColor) customizations.customTextPrimaryColor = tenantTheme.customTextPrimaryColor;
    if (tenantTheme.customTextSecondaryColor) customizations.customTextSecondaryColor = tenantTheme.customTextSecondaryColor;
    if (tenantTheme.customFontFamily) customizations.customFontFamily = tenantTheme.customFontFamily;
    if (tenantTheme.customBaseFontSize) customizations.customBaseFontSize = tenantTheme.customBaseFontSize;
    if (tenantTheme.customBaseSpacing) customizations.customBaseSpacing = tenantTheme.customBaseSpacing;
    if (tenantTheme.customBorderRadius) customizations.customBorderRadius = tenantTheme.customBorderRadius;
    if (tenantTheme.customMetadata) customizations.customMetadata = tenantTheme.customMetadata;

    return {
      id: baseTheme._id.toString(),
      name: baseTheme.name,
      description: baseTheme.description,
      slug: baseTheme.slug,
      primaryColor: tenantTheme.customPrimaryColor || baseTheme.primaryColor,
      secondaryColor: tenantTheme.customSecondaryColor || baseTheme.secondaryColor,
      backgroundColor: tenantTheme.customBackgroundColor || baseTheme.backgroundColor,
      surfaceColor: tenantTheme.customSurfaceColor || baseTheme.surfaceColor,
      textPrimaryColor: tenantTheme.customTextPrimaryColor || baseTheme.textPrimaryColor,
      textSecondaryColor: tenantTheme.customTextSecondaryColor || baseTheme.textSecondaryColor,
      fontFamily: tenantTheme.customFontFamily || baseTheme.fontFamily,
      baseFontSize: tenantTheme.customBaseFontSize || baseTheme.baseFontSize,
      baseSpacing: tenantTheme.customBaseSpacing || baseTheme.baseSpacing,
      borderRadius: tenantTheme.customBorderRadius || baseTheme.borderRadius,
      isActive: baseTheme.isActive,
      isDefault: baseTheme.isDefault,
      previewImageUrl: baseTheme.previewImageUrl,
      metadata: { ...baseTheme.metadata, ...tenantTheme.customMetadata },
      createdAt: baseTheme.createdAt,
      updatedAt: baseTheme.updatedAt,
      baseThemeId: baseTheme._id.toString(),
      customizations: Object.keys(customizations).length > 0 ? customizations : undefined,
      appliedAt: tenantTheme.appliedAt,
    };
  }

  /**
   * Map Theme document to response DTO
   */
  private mapThemeToResponse(theme: any): ThemeResponseDto {
    return {
      id: theme._id.toString(),
      name: theme.name,
      description: theme.description,
      slug: theme.slug,
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      backgroundColor: theme.backgroundColor,
      surfaceColor: theme.surfaceColor,
      textPrimaryColor: theme.textPrimaryColor,
      textSecondaryColor: theme.textSecondaryColor,
      fontFamily: theme.fontFamily,
      baseFontSize: theme.baseFontSize,
      baseSpacing: theme.baseSpacing,
      borderRadius: theme.borderRadius,
      isActive: theme.isActive,
      isDefault: theme.isDefault,
      previewImageUrl: theme.previewImageUrl,
      metadata: theme.metadata,
      createdAt: theme.createdAt,
      updatedAt: theme.updatedAt,
    };
  }
}
