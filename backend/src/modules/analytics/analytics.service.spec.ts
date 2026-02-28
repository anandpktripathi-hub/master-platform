import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AnalyticsService } from './analytics.service';
import { Tenant } from '../../database/schemas/tenant.schema';
import { User } from '../../database/schemas/user.schema';
import { TenantPackage } from '../../database/schemas/tenant-package.schema';
import { Billing } from '../../database/schemas/billing.schema';
import { Invoice } from '../../database/schemas/invoice.schema';
import { Domain } from '../../database/schemas/domain.schema';
import { CustomDomain } from '../../database/schemas/custom-domain.schema';
import { PosOrder } from '../../database/schemas/pos-order.schema';
import { CmsPageAnalyticsEntity } from '../../cms/entities/cms.entities';
import { PaymentLogService } from '../payments/services/payment-log.service';

function createCountDocumentsModel(defaultValue = 0) {
  return {
    countDocuments: jest.fn(() => ({
      exec: jest.fn().mockResolvedValue(defaultValue),
    })),
  };
}

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    const tenantModel = createCountDocumentsModel(0);
    const userModel = createCountDocumentsModel(0);
    const tenantPackageModel = createCountDocumentsModel(0);
    const billingModel = createCountDocumentsModel(0);

    const invoiceModel = {
      aggregate: jest.fn(() => ({
        exec: jest.fn().mockResolvedValue([]),
      })),
    };

    const domainModel = createCountDocumentsModel(0);
    const customDomainModel = createCountDocumentsModel(0);
    const posOrderModel = createCountDocumentsModel(0);
    const cmsAnalyticsModel = {};

    const paymentLogService = {
      list: jest.fn().mockResolvedValue([]),
      listFailures: jest.fn().mockResolvedValue([]),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: getModelToken(Tenant.name), useValue: tenantModel },
        { provide: getModelToken(User.name), useValue: userModel },
        {
          provide: getModelToken(TenantPackage.name),
          useValue: tenantPackageModel,
        },
        { provide: getModelToken(Billing.name), useValue: billingModel },
        { provide: getModelToken(Invoice.name), useValue: invoiceModel },
        { provide: getModelToken(Domain.name), useValue: domainModel },
        {
          provide: getModelToken(CustomDomain.name),
          useValue: customDomainModel,
        },
        { provide: getModelToken(PosOrder.name), useValue: posOrderModel },
        {
          provide: getModelToken(CmsPageAnalyticsEntity.name),
          useValue: cmsAnalyticsModel,
        },
        { provide: PaymentLogService, useValue: paymentLogService },
      ],
    }).compile();

    service = moduleRef.get(AnalyticsService);

    // Stub expensive aggregations so this stays unit-level and deterministic.
    jest
      .spyOn(service as any, 'buildMonthlyRevenueAgg')
      .mockResolvedValue([]);
    jest
      .spyOn(service as any, 'buildGlobalPosOrdersAgg')
      .mockResolvedValue({
        totalOrders: 0,
        totalSales: 0,
        last30Days: { orders: 0, totalSales: 0 },
        dailySeries: [],
      });
    jest
      .spyOn(service as any, 'buildGlobalPosOrdersLast30DaysSeries')
      .mockResolvedValue([]);
    jest
      .spyOn(service as any, 'buildGlobalVisitorsLast30DaysAgg')
      .mockResolvedValue({ totalViews: 0, totalUniqueVisitors: 0 });
    jest
      .spyOn(service as any, 'buildGlobalVisitorsLast30DaysDailySeries')
      .mockResolvedValue([]);
    jest
      .spyOn(service as any, 'buildGlobalVisitorsTopTenantsLast30Days')
      .mockResolvedValue([]);
  });

  it('returns a sane overview shape with zeros by default', async () => {
    const res = await service.getSaasOverview();

    expect(res.tenants).toEqual({
      total: 0,
      active: 0,
      trialing: 0,
      paying: 0,
    });
    expect(res.users).toEqual({ total: 0, verified: 0 });
    expect(res.billing.totalRevenue).toBe(0);
    expect(res.orders.totalOrders).toBe(0);
    expect(res.orders.dailySeries).toEqual([]);
    expect(res.visitors.dailySeries).toEqual([]);
    expect(res.monthlyRevenue).toEqual([]);
    expect(res.paymentsHealth.recentFailures).toEqual([]);
  });
});
