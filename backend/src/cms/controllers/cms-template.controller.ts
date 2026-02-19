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
  BadRequestException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CmsTemplateService } from '../services/cms-template.service';
import { CreateTemplateDto } from '../dto/create-template.dto';
import { UpdateTemplateDto } from '../dto/update-template.dto';
import { Tenant } from '../../decorators/tenant.decorator';

@ApiTags('CMS - Templates')
@Controller('cms/templates')
export class CmsTemplateController {
  constructor(private readonly templateService: CmsTemplateService) {}

  @Post()
  async createTemplate(
    @Req() req: any,
    @Tenant() tenantId: string,
    @Body() dto: CreateTemplateDto,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant context missing');
    return this.templateService.createTemplate(
      tenantId,
      req.user?.id || 'system',
      dto,
    );
  }

  @Get()
  async getTemplates(
    @Tenant() tenantId: string,
    @Query() query: any,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant context missing');
    return this.templateService.getTemplates(tenantId, query);
  }

  @Get('popular')
  async getPopular(@Tenant() tenantId: string, @Query('limit') limit?: number) {
    if (!tenantId) throw new BadRequestException('Tenant context missing');
    return this.templateService.getPopularTemplates(tenantId, limit);
  }

  @Get('category/:category')
  async getByCategory(
    @Tenant() tenantId: string,
    @Param('category') category: string,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant context missing');
    return this.templateService.getTemplatesByCategory(tenantId, category);
  }

  @Get(':id')
  async getTemplate(@Tenant() tenantId: string, @Param('id') id: string) {
    if (!tenantId) throw new BadRequestException('Tenant context missing');
    return this.templateService.getTemplateById(tenantId, id);
  }

  @Patch(':id')
  async updateTemplate(
    @Tenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant context missing');
    return this.templateService.updateTemplate(tenantId, id, dto);
  }

  @Delete(':id')
  async deleteTemplate(@Tenant() tenantId: string, @Param('id') id: string) {
    if (!tenantId) throw new BadRequestException('Tenant context missing');
    return this.templateService.deleteTemplate(tenantId, id);
  }

  @Post(':id/use')
  async useTemplate(
    @Req() req: any,
    @Tenant() tenantId: string,
    @Param('id') id: string,
    @Body('pageName') pageName: string,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant context missing');
    return this.templateService.useTemplate(
      tenantId,
      req.user?.id || 'system',
      id,
      pageName,
    );
  }
}
