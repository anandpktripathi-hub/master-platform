import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { TenantsService } from '../tenants/tenants.service';
import { DomainService } from '../domains/services/domain.service';
import { CmsPageService } from '../../cms/services/cms-page.service';

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

type PublicTenantForSeo = {
  _id: Types.ObjectId | string;
  slug: string;
};

@Injectable()
export class SeoService {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly domainService: DomainService,
    private readonly cmsPageService: CmsPageService,
  ) {}

  private async resolveTenantBase(slug: string): Promise<{
    tenantId: string;
    slug: string;
    baseUrl: string;
  }> {
    if (typeof slug !== 'string' || slug.trim().length === 0) {
      throw new BadRequestException('Invalid slug');
    }

    const tenant = (await this.tenantsService.getPublicBusinessBySlug(
      slug,
    )) as PublicTenantForSeo;

    if (!tenant?._id || !tenant.slug) {
      throw new NotFoundException('Tenant not found');
    }

    const tenantId = String(tenant._id);

    if (!Types.ObjectId.isValid(tenantId)) {
      throw new NotFoundException('Tenant not found');
    }

    const primaryDomain = await this.domainService.getPrimaryDomain(tenantId);
    const platformDomain = process.env.PLATFORM_DOMAIN || 'localhost';

    let baseUrl: string;
    if (primaryDomain) {
      if (primaryDomain.type === 'subdomain') {
        baseUrl = `https://${primaryDomain.value}.${platformDomain}`;
      } else {
        baseUrl = `https://${platformDomain}/${primaryDomain.value}`;
      }
    } else {
      baseUrl = `https://${platformDomain}/b/${tenant.slug}`;
    }

    return { tenantId, slug: tenant.slug, baseUrl };
  }

  async getTenantRobots(slug: string): Promise<string> {
    const { baseUrl } = await this.resolveTenantBase(slug);

    const lines: string[] = [];
    lines.push('User-agent: *');
    lines.push('Allow: /');
    lines.push('Disallow: /app');
    lines.push('Disallow: /api');
    lines.push('');
    lines.push(`# Tenant sitemap`);
    lines.push(`Sitemap: ${baseUrl}/sitemap.xml`);

    return lines.join('\n');
  }

  async getTenantSitemap(slug: string): Promise<string> {
    const {
      tenantId,
      slug: effectiveSlug,
      baseUrl,
    } = await this.resolveTenantBase(slug);

    const pages = await this.cmsPageService.getPublicPagesForSitemap(tenantId);

    const urls: string[] = [];

    urls.push(
      `<url><loc>${xmlEscape(
        baseUrl,
      )}</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
    );

    // Directory profile URL on the main platform host (if not already the base)
    const platformDomain = process.env.PLATFORM_DOMAIN || 'localhost';
    const directoryUrl = `https://${platformDomain}/b/${effectiveSlug}`;
    if (directoryUrl !== baseUrl) {
      urls.push(
        `<url><loc>${xmlEscape(
          directoryUrl,
        )}</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>`,
      );
    }

    for (const page of pages) {
      const loc = `${baseUrl}/${page.slug}`;
      const lastModDate: Date | undefined =
        (page.updatedAt as Date) || (page.createdAt as Date);
      const lastMod = lastModDate ? lastModDate.toISOString() : undefined;
      const lastModTag = lastMod
        ? `<lastmod>${xmlEscape(lastMod)}</lastmod>`
        : '';

      urls.push(
        `<url><loc>${xmlEscape(
          loc,
        )}</loc>${lastModTag}<changefreq>weekly</changefreq><priority>0.7</priority></url>`,
      );
    }

    return (
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      urls.join('') +
      `</urlset>`
    );
  }

  async getTenantFeed(slug: string): Promise<string> {
    const {
      tenantId,
      slug: effectiveSlug,
      baseUrl,
    } = await this.resolveTenantBase(slug);
    const platformDomain = process.env.PLATFORM_DOMAIN || 'localhost';
    const pages = await this.cmsPageService.getPublicPagesForSitemap(tenantId);

    const channelTitle = `Updates for ${effectiveSlug}`;
    const channelLink = baseUrl;
    const channelDescription = `Latest pages and content for ${effectiveSlug} on ${platformDomain}`;

    const items: string[] = [];

    for (const page of pages.slice(0, 50)) {
      const loc = `${baseUrl}/${page.slug}`;
      const pubDate: Date | undefined =
        (page.updatedAt as Date) || (page.createdAt as Date);
      const pubDateStr = pubDate
        ? pubDate.toUTCString()
        : new Date().toUTCString();

      const pageWithTitle = page as { title?: string; slug: string };
      const title: string = pageWithTitle.title || pageWithTitle.slug;

      items.push(
        `<item>` +
          `<title>${xmlEscape(title)}</title>` +
          `<link>${xmlEscape(loc)}</link>` +
          `<guid>${xmlEscape(loc)}</guid>` +
          `<pubDate>${xmlEscape(pubDateStr)}</pubDate>` +
          `</item>`,
      );
    }

    return (
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<rss version="2.0">` +
      `<channel>` +
      `<title>${xmlEscape(channelTitle)}</title>` +
      `<link>${xmlEscape(channelLink)}</link>` +
      `<description>${xmlEscape(channelDescription)}</description>` +
      items.join('') +
      `</channel>` +
      `</rss>`
    );
  }
}
