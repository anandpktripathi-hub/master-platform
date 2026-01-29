import { Controller, Get, Post, Param, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CmsSeoAuditService } from '../services/cms-seo-audit.service';

@ApiTags('CMS - SEO Audit')
@Controller('api/cms/seo-audit')
export class CmsSeoAuditController {
  constructor(private readonly seoAuditService: CmsSeoAuditService) {}

  @Post(':pageId/run')
  async runAudit(@Req() req: any, @Param('pageId') pageId: string) {
    const tenantId = req.headers['x-tenant-id'] || 'demo-tenant';
    return this.seoAuditService.runAudit(tenantId, pageId);
  }

  @Get(':pageId')
  async getAudit(@Req() req: any, @Param('pageId') pageId: string) {
    const tenantId = req.headers['x-tenant-id'] || 'demo-tenant';
    return this.seoAuditService.getAudit(tenantId, pageId);
  }

  @Get(':pageId/recommendations')
  async getRecommendations(@Req() req: any, @Param('pageId') pageId: string) {
    const tenantId = req.headers['x-tenant-id'] || 'demo-tenant';
    return this.seoAuditService.getRecommendations(tenantId, pageId);
  }
}
