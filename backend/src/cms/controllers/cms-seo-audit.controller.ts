import {
  Controller,
  Get,
  Post,
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  Logger,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CmsSeoAuditService } from '../services/cms-seo-audit.service';
import { Tenant } from '../../decorators/tenant.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CmsSeoAuditPageIdParamDto } from '../dto/cms-seo-audit.dto';

@ApiTags('CMS - SEO Audit')
@ApiBearerAuth('bearer')
@Controller('cms/seo-audit')
export class CmsSeoAuditController {
  private readonly logger = new Logger(CmsSeoAuditController.name);

  constructor(private readonly seoAuditService: CmsSeoAuditService) {}

  @Post(':pageId/run')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Run an SEO audit for a CMS page' })
  @ApiParam({ name: 'pageId', type: String })
  @ApiResponse({ status: 200, description: 'Audit started / executed' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async runAudit(
    @Tenant() tenantId: string,
    @Param() params: CmsSeoAuditPageIdParamDto,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant context missing');
      return await this.seoAuditService.runAudit(tenantId, params.pageId);
    } catch (error) {
      this.logger.error(
        `[runAudit] Failed to run SEO audit (tenantId=${tenantId}, pageId=${params?.pageId})`,
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Get(':pageId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the latest SEO audit for a CMS page' })
  @ApiParam({ name: 'pageId', type: String })
  @ApiResponse({ status: 200, description: 'Audit returned' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAudit(
    @Tenant() tenantId: string,
    @Param() params: CmsSeoAuditPageIdParamDto,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant context missing');
      return await this.seoAuditService.getAudit(tenantId, params.pageId);
    } catch (error) {
      this.logger.error(
        `[getAudit] Failed to get SEO audit (tenantId=${tenantId}, pageId=${params?.pageId})`,
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Get(':pageId/recommendations')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get SEO recommendations for a CMS page' })
  @ApiParam({ name: 'pageId', type: String })
  @ApiResponse({ status: 200, description: 'Recommendations returned' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getRecommendations(
    @Tenant() tenantId: string,
    @Param() params: CmsSeoAuditPageIdParamDto,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant context missing');
      return await this.seoAuditService.getRecommendations(
        tenantId,
        params.pageId,
      );
    } catch (error) {
      this.logger.error(
        `[getRecommendations] Failed to get recommendations (tenantId=${tenantId}, pageId=${params?.pageId})`,
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
