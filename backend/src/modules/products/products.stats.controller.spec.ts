import { Test, TestingModule } from '@nestjs/testing';
import { ProductsStatsController } from './products.stats.controller';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

describe('ProductsStatsController', () => {
  let controller: ProductsStatsController;
  const tenantId = '507f1f77bcf86cd799439012';

  const productsServiceMock = {
    countAll: jest.fn(),
    countActive: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ProductsStatsController],
      providers: [{ provide: ProductsService, useValue: productsServiceMock }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(TenantGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(ProductsStatsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns total + active counts', async () => {
    productsServiceMock.countAll.mockResolvedValue(12);
    productsServiceMock.countActive.mockResolvedValue(7);

    const res = await controller.getDashboardStats(tenantId);

    expect(res).toEqual({ totalProducts: 12, activeProducts: 7 });
  });
});
