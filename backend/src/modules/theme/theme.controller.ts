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
} from '@nestjs/common';
import { ThemeService } from './theme.service';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CreateThemeDto, UpdateThemeDto } from './dto/theme.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
@ApiTags('Theme')
@ApiBearerAuth('bearer')
@Controller('themes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  @Get()
  findAll(@Tenant() tenantId: string) {
    if (!tenantId) throw new BadRequestException('tenantId is required');
    return this.themeService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Tenant() tenantId: string) {
    if (!tenantId) throw new BadRequestException('tenantId is required');
    return this.themeService.findOne(id, tenantId);
  }

  @Post()
  @Roles('admin')
  create(@Body() createThemeDto: CreateThemeDto, @Tenant() tenantId: string) {
    if (!tenantId) throw new BadRequestException('tenantId is required');
    return this.themeService.create(createThemeDto, tenantId);
  }

  @Put(':id')
  @Roles('admin')
  update(
    @Param('id') id: string,
    @Body() updateThemeDto: UpdateThemeDto,
    @Tenant() tenantId: string,
  ) {
    if (!tenantId) throw new BadRequestException('tenantId is required');
    return this.themeService.update(id, updateThemeDto, tenantId);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string, @Tenant() tenantId: string) {
    if (!tenantId) throw new BadRequestException('tenantId is required');
    return this.themeService.remove(id, tenantId);
  }
}

