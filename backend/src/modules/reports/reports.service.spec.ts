import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CmsAnalyticsService } from '../../cms/services/cms-analytics.service';

describe('ReportsService', () => {
  const createService = async () => {
    const invoiceModel = {
      aggregate: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
    };

    const posOrderModel = {
      aggregate: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
    };

    const cmsAnalytics = {
      getTenantAnalytics: jest.fn().mockResolvedValue({}),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: getModelToken('Invoice'), useValue: invoiceModel },
        { provide: getModelToken('PosOrder'), useValue: posOrderModel },
        { provide: CmsAnalyticsService, useValue: cmsAnalytics },
      ],
    }).compile();

    return { service: moduleRef.get(ReportsService) };
  };

  it('throws BadRequestException for invalid tenantId (financial)', async () => {
    const { service } = await createService();

    await expect(
      service.getTenantFinancialReport('undefined'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws BadRequestException for invalid tenantId (traffic)', async () => {
    const { service } = await createService();

    await expect(
      service.getTenantTrafficReport('undefined'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
