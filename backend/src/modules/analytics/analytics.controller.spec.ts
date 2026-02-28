import { Test } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RoleGuard } from '../../guards/role.guard';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;

  const analyticsService = {
    getSaasOverview: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [{ provide: AnalyticsService, useValue: analyticsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RoleGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(AnalyticsController);
    jest.clearAllMocks();
  });

  it('returns SaaS overview from service', async () => {
    analyticsService.getSaasOverview.mockResolvedValue({ tenants: { total: 1 } });

    const res = await controller.getSaasOverview();

    expect(res).toEqual({ tenants: { total: 1 } });
    expect(analyticsService.getSaasOverview).toHaveBeenCalledTimes(1);
  });
});
