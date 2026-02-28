import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SeoService } from './seo.service';
import { TenantsService } from '../tenants/tenants.service';
import { DomainService } from '../domains/services/domain.service';
import { CmsPageService } from '../../cms/services/cms-page.service';

describe('SeoService', () => {
  let service: SeoService;

  const tenantsService = {
    getPublicBusinessBySlug: jest.fn(),
  };

  const domainService = {
    getPrimaryDomain: jest.fn(),
  };

  const cmsPageService = {
    getPublicPagesForSitemap: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SeoService,
        { provide: TenantsService, useValue: tenantsService },
        { provide: DomainService, useValue: domainService },
        { provide: CmsPageService, useValue: cmsPageService },
      ],
    }).compile();

    service = moduleRef.get(SeoService);
    jest.clearAllMocks();
  });

  it('rejects empty slug', async () => {
    await expect(service.getTenantRobots('')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('returns NotFound when tenant missing', async () => {
    tenantsService.getPublicBusinessBySlug.mockResolvedValue(null);

    await expect(service.getTenantSitemap('acme')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('generates feed xml', async () => {
    tenantsService.getPublicBusinessBySlug.mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      slug: 'acme',
    });
    domainService.getPrimaryDomain.mockResolvedValue(null);
    cmsPageService.getPublicPagesForSitemap.mockResolvedValue([
      {
        slug: 'news',
        title: 'News',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      },
    ]);

    const rss = await service.getTenantFeed('acme');
    expect(rss).toContain('<rss');
    expect(rss).toContain('<item>');
    expect(rss).toContain('News');
  });
});
