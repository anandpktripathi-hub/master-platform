import {
  Controller,
  Get,
  Post,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CmsSeoAuditService } from '../services/cms-seo-audit.service';
import { Tenant } from '../../decorators/tenant.decorator';

@ApiTags('CMS - SEO Audit')
@Controller('cms/seo-audit')
export class CmsSeoAuditController {
  constructor(private readonly seoAuditService: CmsSeoAuditService) {}

  @Post(':pageId/run')
  async runAudit(@Tenant() tenantId: string, @Param('pageId') pageId: string) {
    if (!tenantId) throw new BadRequestException('Tenant context missing');
    return this.seoAuditService.runAudit(tenantId, pageId);
  }

  @Get(':pageId')
  async getAudit(@Tenant() tenantId: string, @Param('pageId') pageId: string) {
    if (!tenantId) throw new BadRequestException('Tenant context missing');
    return this.seoAuditService.getAudit(tenantId, pageId);
  }

  @Get(':pageId/recommendations')
  async getRecommendations(
    @Tenant() tenantId: string,
    @Param('pageId') pageId: string,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant context missing');
    return this.seoAuditService.getRecommendations(tenantId, pageId);
  }
}
