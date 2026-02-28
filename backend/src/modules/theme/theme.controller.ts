import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  UseGuards,
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ThemeService } from './theme.service';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CreateThemeDto, UpdateThemeDto } from './dto/theme.dto';
import { ThemeIdParamDto } from './dto/theme-id-param.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
@ApiTags('Theme')
@ApiBearerAuth('bearer')
@Controller('themes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ThemeController {
  private readonly logger = new Logger(ThemeController.name);

  constructor(private readonly themeService: ThemeService) {}

  @Get()
  @ApiOperation({ summary: 'List themes for tenant' })
  @ApiResponse({ status: 200, description: 'Themes returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findAll(@Tenant() tenantId: string) {
    try {
      if (!tenantId) throw new BadRequestException('tenantId is required');
      return await this.themeService.findAll(tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[findAll] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list themes');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a theme by id' })
  @ApiResponse({ status: 200, description: 'Theme returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findOne(@Param() params: ThemeIdParamDto, @Tenant() tenantId: string) {
    try {
      if (!tenantId) throw new BadRequestException('tenantId is required');
      return await this.themeService.findOne(params.id, tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[findOne] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get theme');
    }
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a theme (admin)' })
  @ApiResponse({ status: 201, description: 'Theme created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async create(
    @Body() createThemeDto: CreateThemeDto,
    @Tenant() tenantId: string,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('tenantId is required');
      return await this.themeService.create(createThemeDto, tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[create] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create theme');
    }
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update a theme (admin)' })
  @ApiResponse({ status: 200, description: 'Theme updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async update(
    @Param() params: ThemeIdParamDto,
    @Body() updateThemeDto: UpdateThemeDto,
    @Tenant() tenantId: string,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('tenantId is required');
      return await this.themeService.update(params.id, updateThemeDto, tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[update] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update theme');
    }
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a theme (admin)' })
  @ApiResponse({ status: 200, description: 'Theme deleted' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async remove(@Param() params: ThemeIdParamDto, @Tenant() tenantId: string) {
    try {
      if (!tenantId) throw new BadRequestException('tenantId is required');
      return await this.themeService.remove(params.id, tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[remove] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to delete theme');
    }
  }
}

