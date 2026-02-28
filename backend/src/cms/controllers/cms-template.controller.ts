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
  HttpException,
  InternalServerErrorException,
  Logger,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CmsTemplateService } from '../services/cms-template.service';
import { CreateTemplateDto } from '../dto/create-template.dto';
import { UpdateTemplateDto } from '../dto/update-template.dto';
import { Tenant } from '../../decorators/tenant.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Roles } from '../../decorators/roles.decorator';
import {
  CmsTemplateCategoryParamDto,
  CmsTemplateIdParamDto,
  CmsTemplatesPopularQueryDto,
  CmsTemplatesQueryDto,
  CmsTemplateUseBodyDto,
} from '../dto/cms-template.dto';

@ApiTags('CMS - Templates')
@ApiBearerAuth('bearer')
@Controller('cms/templates')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Roles('admin')
export class CmsTemplateController {
  private readonly logger = new Logger(CmsTemplateController.name);

  constructor(private readonly templateService: CmsTemplateService) {}

  @Post()
  @ApiOperation({ summary: 'Create a CMS page template' })
  @ApiBody({ type: CreateTemplateDto })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createTemplate(
    @Req() req: any,
    @Tenant() tenantId: string,
    @Body() dto: CreateTemplateDto,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant context missing');
      return await this.templateService.createTemplate(
        tenantId,
        req.user?.id || 'system',
        dto,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[createTemplate] Failed (tenantId=${tenantId}) ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Get()
  @ApiOperation({ summary: 'List CMS page templates' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getTemplates(@Tenant() tenantId: string, @Query() query: CmsTemplatesQueryDto) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant context missing');
      return await this.templateService.getTemplates(tenantId, query);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getTemplates] Failed (tenantId=${tenantId}) ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular CMS page templates' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getPopular(
    @Tenant() tenantId: string,
    @Query() query: CmsTemplatesPopularQueryDto,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant context missing');
      return await this.templateService.getPopularTemplates(tenantId, query.limit);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getPopular] Failed (tenantId=${tenantId}) ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get CMS page templates by category' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getByCategory(
    @Tenant() tenantId: string,
    @Param() params: CmsTemplateCategoryParamDto,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant context missing');
      return await this.templateService.getTemplatesByCategory(
        tenantId,
        params.category,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getByCategory] Failed (tenantId=${tenantId}, category=${params?.category}) ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a CMS page template by id' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getTemplate(@Tenant() tenantId: string, @Param() params: CmsTemplateIdParamDto) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant context missing');
      return await this.templateService.getTemplateById(tenantId, params.id);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getTemplate] Failed (tenantId=${tenantId}, id=${params?.id}) ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a CMS page template' })
  @ApiBody({ type: UpdateTemplateDto })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateTemplate(
    @Tenant() tenantId: string,
    @Param() params: CmsTemplateIdParamDto,
    @Body() dto: UpdateTemplateDto,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant context missing');
      return await this.templateService.updateTemplate(tenantId, params.id, dto);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateTemplate] Failed (tenantId=${tenantId}, id=${params?.id}) ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a CMS page template' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteTemplate(@Tenant() tenantId: string, @Param() params: CmsTemplateIdParamDto) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant context missing');
      return await this.templateService.deleteTemplate(tenantId, params.id);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[deleteTemplate] Failed (tenantId=${tenantId}, id=${params?.id}) ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Post(':id/use')
  @ApiOperation({ summary: 'Use a template to create a page' })
  @ApiBody({ type: CmsTemplateUseBodyDto })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async useTemplate(
    @Req() req: any,
    @Tenant() tenantId: string,
    @Param() params: CmsTemplateIdParamDto,
    @Body() body: CmsTemplateUseBodyDto,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant context missing');
      return await this.templateService.useTemplate(
        tenantId,
        req.user?.id || 'system',
        params.id,
        body.pageName,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[useTemplate] Failed (tenantId=${tenantId}, id=${params?.id}) ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
