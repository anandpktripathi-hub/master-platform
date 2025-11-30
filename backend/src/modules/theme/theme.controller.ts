import { Controller, Get, Post, Body, Put, Delete, Param, UseGuards } from '@nestjs/common';
import { ThemeService } from './theme.service';
import { Theme } from '../../database/schemas/theme.schema';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';

@Controller('themes')
@UseGuards(RolesGuard)
export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  @Get()
  findAll(@Tenant() tenantId: string) {
    return this.themeService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.themeService.findOne(id);
  }

  @Post()
  @Roles('admin')
  create(@Body() createThemeDto: Theme, @Tenant() tenantId: string) {
    return this.themeService.create(createThemeDto, tenantId);
  }

  @Put(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateThemeDto: Theme, @Tenant() tenantId: string) {
    return this.themeService.update(id, updateThemeDto, tenantId);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.themeService.remove(id);
  }
}
















