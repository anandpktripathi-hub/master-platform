import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { OrdersStatsService } from './orders-stats.service';

describe('OrdersStatsService', () => {
  let service: OrdersStatsService;

  const makeModel = () => {
    const aggregate = jest.fn();
    return {
      aggregate,
      __getAggregateMock: () => aggregate,
    };
  };

  beforeEach(async () => {
    const posOrderModel = makeModel();
    const domainResellerOrderModel = makeModel();

    posOrderModel.__getAggregateMock().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
    domainResellerOrderModel
      .__getAggregateMock()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

    const moduleRef = await Test.createTestingModule({
      providers: [
        OrdersStatsService,
        { provide: getModelToken('PosOrder'), useValue: posOrderModel },
        { provide: getModelToken('DomainResellerOrder'), useValue: domainResellerOrderModel },
      ],
    }).compile();

    service = moduleRef.get(OrdersStatsService);
  });

  it('throws BadRequest for invalid tenantId', async () => {
    await expect(
      service.getDashboardStats({ tenantId: 'not-an-objectid' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws BadRequest for invalid date range', async () => {
    await expect(
      service.getDashboardStats({
        tenantId: '507f1f77bcf86cd799439011',
        from: 'nope',
        to: '2024-01-01',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('calls aggregate with tenant and createdAt match', async () => {
    const tenantId = '507f1f77bcf86cd799439011';
    const from = '2024-01-01';
    const to = '2024-02-01';

    // We only assert that the first $match stage includes tenant and createdAt bounds.
    // The rest of the pipeline can evolve without breaking this safety contract.
    const moduleRef = await Test.createTestingModule({
      providers: [
        OrdersStatsService,
        {
          provide: getModelToken('PosOrder'),
          useValue: {
            aggregate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
          },
        },
        {
          provide: getModelToken('DomainResellerOrder'),
          useValue: {
            aggregate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
          },
        },
      ],
    }).compile();

    const localService = moduleRef.get(OrdersStatsService);
    const posAgg = moduleRef.get(getModelToken('PosOrder')).aggregate as jest.Mock;
    const domainAgg = moduleRef.get(getModelToken('DomainResellerOrder')).aggregate as jest.Mock;

    await localService.getDashboardStats({ tenantId, from, to });

    const [posPipeline] = posAgg.mock.calls[0];
    const [domainPipeline] = domainAgg.mock.calls[0];

    const posMatch = posPipeline.find((s: any) => s.$match)?.$match;
    const domainMatch = domainPipeline.find((s: any) => s.$match)?.$match;

    expect(posMatch).toBeTruthy();
    expect(domainMatch).toBeTruthy();

    expect(String(posMatch.tenantId)).toContain('507f1f77bcf86cd799439011');
    expect(String(domainMatch.tenantId)).toContain('507f1f77bcf86cd799439011');
    expect(posMatch.createdAt).toBeTruthy();
    expect(domainMatch.createdAt).toBeTruthy();
  });
});
