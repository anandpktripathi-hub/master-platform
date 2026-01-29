import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CmsTemplateService } from '../services/cms-template.service';
import { CreateTemplateDto } from '../dto/create-template.dto';
import { UpdateTemplateDto } from '../dto/update-template.dto';

@ApiTags('CMS - Templates')
@Controller('api/cms/templates')
export class CmsTemplateController {
  constructor(private readonly templateService: CmsTemplateService) {}

  @Post()
  async createTemplate(@Req() req: any, @Body() dto: CreateTemplateDto) {
    const tenantId = req.headers['x-tenant-id'] || 'demo-tenant';
    return this.templateService.createTemplate(
      tenantId,
      req.user?.id || 'system',
      dto,
    );
  }

  @Get()
  async getTemplates(@Req() req: any, @Query() query: any) {
    const tenantId = req.headers['x-tenant-id'] || 'demo-tenant';
    return this.templateService.getTemplates(tenantId, query);
  }

  @Get('popular')
  async getPopular(@Req() req: any, @Query('limit') limit?: number) {
    const tenantId = req.headers['x-tenant-id'] || 'demo-tenant';
    return this.templateService.getPopularTemplates(tenantId, limit);
  }

  @Get('category/:category')
  async getByCategory(@Req() req: any, @Param('category') category: string) {
    const tenantId = req.headers['x-tenant-id'] || 'demo-tenant';
    return this.templateService.getTemplatesByCategory(tenantId, category);
  }

  @Get(':id')
  async getTemplate(@Req() req: any, @Param('id') id: string) {
    const tenantId = req.headers['x-tenant-id'] || 'demo-tenant';
    return this.templateService.getTemplateById(tenantId, id);
  }

  @Patch(':id')
  async updateTemplate(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
  ) {
    const tenantId = req.headers['x-tenant-id'] || 'demo-tenant';
    return this.templateService.updateTemplate(tenantId, id, dto);
  }

  @Delete(':id')
  async deleteTemplate(@Req() req: any, @Param('id') id: string) {
    const tenantId = req.headers['x-tenant-id'] || 'demo-tenant';
    return this.templateService.deleteTemplate(tenantId, id);
  }

  @Post(':id/use')
  async useTemplate(
    @Req() req: any,
    @Param('id') id: string,
    @Body('pageName') pageName: string,
  ) {
    const tenantId = req.headers['x-tenant-id'] || 'demo-tenant';
    return this.templateService.useTemplate(
      tenantId,
      req.user?.id || 'system',
      id,
      pageName,
    );
  }
}
