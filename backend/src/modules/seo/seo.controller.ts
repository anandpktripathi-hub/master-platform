import {
  Controller,
  Get,
  Header,
  Param,
} from '@nestjs/common';
import { SeoService } from './seo.service';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Seo')
@Controller('seo')
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('tenants/:slug/robots.txt')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  async tenantRobots(@Param('slug') slug: string): Promise<string> {
    return this.seoService.getTenantRobots(slug);
  }

  @Get('tenants/:slug/sitemap.xml')
  @Header('Content-Type', 'application/xml; charset=utf-8')
  async tenantSitemap(@Param('slug') slug: string): Promise<string> {
    return this.seoService.getTenantSitemap(slug);
  }

  @Get('tenants/:slug/feed.xml')
  @Header('Content-Type', 'application/xml; charset=utf-8')
  async tenantFeed(@Param('slug') slug: string): Promise<string> {
    return this.seoService.getTenantFeed(slug);
  }
}
