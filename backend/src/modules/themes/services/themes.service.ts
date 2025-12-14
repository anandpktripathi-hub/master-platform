import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Theme, ThemeDocument } from '../schemas/theme.schema';
import {
  TenantTheme,
  TenantThemeDocument,
} from '../schemas/tenant-theme.schema';
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
  constructor(
    @InjectModel(Theme.name) private themeModel: Model<ThemeDocument>,
    @InjectModel(TenantTheme.name)
    private tenantThemeModel: Model<TenantThemeDocument>,
  ) {}

  /**
   * Create a new theme (Super Admin only)
   */
  async createTheme(createThemeDto: CreateThemeDto): Promise<ThemeResponseDto> {
    // Check if theme with same key already exists
    const existingTheme = await this.themeModel.findOne({
      key: createThemeDto.key.toLowerCase(),
    });

    if (existingTheme) {
      throw new BadRequestException(
        `Theme with key "${createThemeDto.key}" already exists`,
      );
    }

    // Create new theme
    const theme = new this.themeModel({
      ...createThemeDto,
      key: createThemeDto.key.toLowerCase(),
      status: createThemeDto.status || 'ACTIVE',
    });

    const savedTheme = await theme.save();
    return this.mapThemeToDto(savedTheme);
  }

  /**
   * Get all themes (Super Admin)
   */
  async getAllThemes(includeInactive = false): Promise<ThemeResponseDto[]> {
    const filter: { status?: string } = {};
    if (!includeInactive) {
      filter.status = 'ACTIVE';
    }

    const themes = await this.themeModel.find(filter).sort({ createdAt: -1 });
    return themes.map((theme) => this.mapThemeToDto(theme));
  }

  /**
   * Get theme by ID
   */
  async getThemeById(themeId: string): Promise<ThemeResponseDto> {
    if (!Types.ObjectId.isValid(themeId)) {
      throw new BadRequestException('Invalid theme ID');
    }

    const theme = await this.themeModel.findById(themeId);

    if (!theme) {
      throw new NotFoundException(`Theme with ID "${themeId}" not found`);
    }

    return this.mapThemeToDto(theme);
  }

  /**
   * Update theme (Super Admin)
   */
  async updateTheme(
    themeId: string,
    updateThemeDto: UpdateThemeDto,
  ): Promise<ThemeResponseDto> {
    if (!Types.ObjectId.isValid(themeId)) {
      throw new BadRequestException('Invalid theme ID');
    }

    // Check if new key is unique (if key is being updated)
    if (updateThemeDto.key) {
      const existingTheme = await this.themeModel.findOne({
        key: updateThemeDto.key.toLowerCase(),
        _id: { $ne: themeId },
      });

      if (existingTheme) {
        throw new BadRequestException(
          `Theme with key "${updateThemeDto.key}" already exists`,
        );
      }
    }

    const updateData = {
      ...updateThemeDto,
      ...(updateThemeDto.key && { key: updateThemeDto.key.toLowerCase() }),
      updatedAt: new Date(),
    };

    const updatedTheme = await this.themeModel.findByIdAndUpdate(
      themeId,
      updateData,
      {
        new: true,
      },
    );

    if (!updatedTheme) {
      throw new NotFoundException(`Theme with ID "${themeId}" not found`);
    }

    return this.mapThemeToDto(updatedTheme);
  }

  /**
   * Activate a theme
   */
  async activateTheme(themeId: string): Promise<ThemeResponseDto> {
    return this.updateTheme(themeId, { status: 'ACTIVE' });
  }

  /**
   * Deactivate a theme
   */
  async deactivateTheme(themeId: string): Promise<ThemeResponseDto> {
    return this.updateTheme(themeId, { status: 'INACTIVE' });
  }

  /**
   * Delete a theme (Super Admin)
   */
  async deleteTheme(themeId: string): Promise<void> {
    if (!Types.ObjectId.isValid(themeId)) {
      throw new BadRequestException('Invalid theme ID');
    }

    // Check if any tenant is using this theme
    const tenantThemeCount = await this.tenantThemeModel.countDocuments({
      themeId: new Types.ObjectId(themeId),
    });

    if (tenantThemeCount > 0) {
      throw new BadRequestException(
        `Cannot delete theme. It is being used by ${tenantThemeCount} tenant(s).`,
      );
    }

    const result = await this.themeModel.findByIdAndDelete(themeId);

    if (!result) {
      throw new NotFoundException(`Theme with ID "${themeId}" not found`);
    }
  }

  /**
   * Tenant selects a theme
   */
  async selectThemeForTenant(
    tenantId: string,
    selectThemeDto: SelectThemeDto,
  ): Promise<TenantThemeResponseDto> {
    if (!Types.ObjectId.isValid(selectThemeDto.themeId)) {
      throw new BadRequestException('Invalid theme ID');
    }

    // Verify theme exists and is active
    const theme = await this.themeModel.findById(selectThemeDto.themeId);

    if (!theme) {
      throw new NotFoundException(
        `Theme with ID "${selectThemeDto.themeId}" not found`,
      );
    }

    if (theme.status !== 'ACTIVE') {
      throw new BadRequestException('Can only select active themes');
    }

    // Find or create tenant theme
    let tenantTheme = await this.tenantThemeModel.findOne({
      tenantId: new Types.ObjectId(tenantId),
    });

    if (!tenantTheme) {
      tenantTheme = new this.tenantThemeModel({
        tenantId: new Types.ObjectId(tenantId),
        themeId: new Types.ObjectId(selectThemeDto.themeId),
        customCssVariables: {},
      });
    } else {
      tenantTheme.themeId = new Types.ObjectId(selectThemeDto.themeId);
      tenantTheme.updatedAt = new Date();
    }

    const savedTenantTheme = await tenantTheme.save();
    return this.mapTenantThemeToDto(savedTenantTheme, theme);
  }

  /**
   * Tenant customizes theme by overriding CSS variables
   */
  async customizeThemeForTenant(
    tenantId: string,
    customizeThemeDto: CustomizeThemeDto,
  ): Promise<TenantThemeResponseDto> {
    const tenantTheme = await this.tenantThemeModel.findOne({
      tenantId: new Types.ObjectId(tenantId),
    });

    if (!tenantTheme) {
      throw new NotFoundException('Tenant has not selected a theme yet');
    }

    // Update custom CSS variables
    tenantTheme.customCssVariables = customizeThemeDto.customCssVariables;
    tenantTheme.updatedAt = new Date();

    const savedTenantTheme = await tenantTheme.save();

    // Fetch the associated theme
    const theme = await this.themeModel.findById(tenantTheme.themeId);

    return this.mapTenantThemeToDto(savedTenantTheme, theme);
  }

  /**
   * Get tenant's current theme with merged CSS variables
   */
  async getTenantTheme(tenantId: string): Promise<TenantThemeResponseDto> {
    const tenantTheme = await this.tenantThemeModel.findOne({
      tenantId: new Types.ObjectId(tenantId),
    });

    if (!tenantTheme) {
      // Return default theme if tenant hasn't selected one
      const defaultTheme = await this.themeModel.findOne({ status: 'ACTIVE' });

      if (!defaultTheme) {
        throw new NotFoundException('No default theme available');
      }

      return this.mapTenantThemeToDto(
        {
          _id: null,
          tenantId: new Types.ObjectId(tenantId),
          themeId: defaultTheme._id,
          customCssVariables: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as TenantThemeDocument,
        defaultTheme,
      );
    }

    const theme = await this.themeModel.findById(tenantTheme.themeId);

    if (!theme) {
      throw new NotFoundException('Associated theme not found');
    }

    return this.mapTenantThemeToDto(tenantTheme, theme);
  }

  /**
   * Helper: Merge system CSS variables with tenant overrides
   */
  private mergeCssVariables(
    systemVariables: Record<string, string>,
    customVariables: Record<string, string>,
  ): Record<string, string> {
    // Tenant overrides take priority
    return {
      ...systemVariables,
      ...customVariables,
    };
  }

  /**
   * Helper: Map Theme document to DTO
   */
  private mapThemeToDto(theme: ThemeDocument): ThemeResponseDto {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const themeIdStr = theme._id.toString();
    return {
      _id: themeIdStr,
      name: theme.name,
      key: theme.key,
      previewImage: theme.previewImage,
      cssVariables: theme.cssVariables || {},
      status: theme.status,
      createdAt: theme.createdAt,
      updatedAt: theme.updatedAt,
    };
  }

  /**
   * Helper: Map TenantTheme document to DTO with merged CSS variables
   */
  private mapTenantThemeToDto(
    tenantTheme: TenantThemeDocument,
    theme: ThemeDocument,
  ): TenantThemeResponseDto {
    const mergedCssVariables = this.mergeCssVariables(
      theme.cssVariables || {},
      tenantTheme.customCssVariables || {},
    );

    const tenantThemeIdStr = tenantTheme._id
      ? // eslint-disable-next-line @typescript-eslint/no-base-to-string
        tenantTheme._id.toString()
      : null;

    const tenantIdStr = tenantTheme.tenantId.toString();

    const themeIdStr = tenantTheme.themeId.toString();
    return {
      _id: tenantThemeIdStr,
      tenantId: tenantIdStr,
      themeId: themeIdStr,
      theme: this.mapThemeToDto(theme),
      customCssVariables: tenantTheme.customCssVariables || {},
      mergedCssVariables,
      createdAt: tenantTheme.createdAt,
      updatedAt: tenantTheme.updatedAt,
    };
  }

  /**
   * Generate CSS file content from theme variables
   */
  async generateCssVariables(tenantId: string): Promise<string> {
    const tenantTheme = await this.getTenantTheme(tenantId);

    // Generate CSS custom properties
    const cssLines = Object.entries(tenantTheme.mergedCssVariables).map(
      ([key, value]) => `  --${key}: ${value};`,
    );

    return `:root {\n${cssLines.join('\n')}\n}`;
  }

  /**
   * Get CSS as JSON (for frontend parsing)
   */
  async getCssVariablesAsJson(
    tenantId: string,
  ): Promise<Record<string, string>> {
    const tenantTheme = await this.getTenantTheme(tenantId);
    return tenantTheme.mergedCssVariables;
  }
}
