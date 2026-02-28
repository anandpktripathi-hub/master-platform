import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { SeoController } from './seo.controller';
import { SeoService } from './seo.service';

describe('SeoController', () => {
  let controller: SeoController;

  const seoService = {
    getTenantRobots: jest.fn(),
    getTenantSitemap: jest.fn(),
    getTenantFeed: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SeoController],
      providers: [
        { provide: SeoService, useValue: seoService },
      ],
    }).compile();

    controller = moduleRef.get(SeoController);
    jest.clearAllMocks();
  });

  it('propagates errors from SeoService', async () => {
    seoService.getTenantRobots.mockRejectedValue(new BadRequestException());

    await expect(controller.tenantRobots('')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('delegates robots.txt', async () => {
    seoService.getTenantRobots.mockResolvedValue('robots');

    await expect(controller.tenantRobots('acme')).resolves.toBe('robots');
    expect(seoService.getTenantRobots).toHaveBeenCalledWith('acme');
  });

  it('delegates sitemap.xml', async () => {
    seoService.getTenantSitemap.mockResolvedValue('<xml/>' );

    await expect(controller.tenantSitemap('acme')).resolves.toBe('<xml/>');
    expect(seoService.getTenantSitemap).toHaveBeenCalledWith('acme');
  });

  it('delegates feed.xml', async () => {
    seoService.getTenantFeed.mockResolvedValue('<rss/>' );

    await expect(controller.tenantFeed('acme')).resolves.toBe('<rss/>');
    expect(seoService.getTenantFeed).toHaveBeenCalledWith('acme');
  });
});
