import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  const tenantId = '507f1f77bcf86cd799439012';

  const createService = async () => {
    const query = {
      populate: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    };

    const productModel = {
      find: jest.fn().mockReturnValue(query),
      countDocuments: jest.fn().mockResolvedValue(0),
      findOne: jest.fn().mockReturnValue(query),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getModelToken('Product'), useValue: productModel },
      ],
    }).compile();

    return {
      service: moduleRef.get(ProductsService),
      mocks: { productModel, query },
    };
  };

  it('throws BadRequestException for invalid productId', async () => {
    const { service } = await createService();

    await expect(service.findOne(tenantId, 'not-an-objectid')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('normalizes pagination for NaN values', async () => {
    const { service, mocks } = await createService();

    await service.findAll(tenantId, Number.NaN, Number.NaN);

    expect(mocks.query.skip).toHaveBeenCalledWith(0);
    expect(mocks.query.limit).toHaveBeenCalledWith(10);
  });
});
