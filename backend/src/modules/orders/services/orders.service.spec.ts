import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  const makeFindModel = (rows: any[] = []) => {
    const exec = jest.fn().mockResolvedValue(rows);
    const chain = {
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec,
    };

    return {
      find: jest.fn().mockReturnValue(chain),
      findOne: jest.fn().mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(null) }) }),
      __chain: chain,
    };
  };

  it('throws for invalid tenantId', async () => {
    const posModel = makeFindModel();
    const domainModel = makeFindModel();

    const moduleRef = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getModelToken('PosOrder'), useValue: posModel },
        { provide: getModelToken('DomainResellerOrder'), useValue: domainModel },
      ],
    }).compile();

    const service = moduleRef.get(OrdersService);

    await expect(service.listOrders({ tenantId: 'nope' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('clamps limit and queries both sources', async () => {
    const posModel = makeFindModel([{ _id: 'p1', createdAt: new Date('2024-01-02'), totalAmount: 10 }]);
    const domainModel = makeFindModel([{ _id: 'd1', createdAt: new Date('2024-01-03'), domain: 'a.com', provider: 'stub' }]);

    const moduleRef = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getModelToken('PosOrder'), useValue: posModel },
        { provide: getModelToken('DomainResellerOrder'), useValue: domainModel },
      ],
    }).compile();

    const service = moduleRef.get(OrdersService);

    const results = await service.listOrders({
      tenantId: '507f1f77bcf86cd799439011',
      limit: 9999,
    });

    expect(posModel.find).toHaveBeenCalledTimes(1);
    expect(domainModel.find).toHaveBeenCalledTimes(1);

    // both chains should have limit(200)
    expect(posModel.__chain.limit).toHaveBeenCalledWith(200);
    expect(domainModel.__chain.limit).toHaveBeenCalledWith(200);

    expect(results[0].source).toBe('domain');
  });

  it('throws for invalid date range', async () => {
    const posModel = makeFindModel();
    const domainModel = makeFindModel();

    const moduleRef = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getModelToken('PosOrder'), useValue: posModel },
        { provide: getModelToken('DomainResellerOrder'), useValue: domainModel },
      ],
    }).compile();

    const service = moduleRef.get(OrdersService);

    await expect(
      service.listOrders({
        tenantId: '507f1f77bcf86cd799439011',
        from: '2024-02-01',
        to: '2024-01-01',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('getPosOrderById throws NotFound when missing', async () => {
    const posModel = makeFindModel();
    const domainModel = makeFindModel();
    posModel.findOne = jest.fn().mockReturnValue({ lean: () => ({ exec: jest.fn().mockResolvedValue(null) }) });

    const moduleRef = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getModelToken('PosOrder'), useValue: posModel },
        { provide: getModelToken('DomainResellerOrder'), useValue: domainModel },
      ],
    }).compile();

    const service = moduleRef.get(OrdersService);

    await expect(
      service.getPosOrderById('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439099'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
