import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

describe('ProductsController', () => {
  let controller: ProductsController;
  const tenantId = '507f1f77bcf86cd799439012';

  const productsServiceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: productsServiceMock }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(TenantGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(ProductsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('throws BadRequestException for invalid page', async () => {
    expect(() =>
      controller.findAll(tenantId, { page: 0 as any, limit: 10 as any }),
    ).toThrow(
      BadRequestException,
    );
    expect(productsServiceMock.findAll).not.toHaveBeenCalled();
  });

  it('throws BadRequestException for invalid limit', async () => {
    expect(() =>
      controller.findAll(tenantId, { page: 1 as any, limit: 1000 as any }),
    ).toThrow(
      BadRequestException,
    );
    expect(productsServiceMock.findAll).not.toHaveBeenCalled();
  });

  it('delegates findAll with numeric pagination', async () => {
    productsServiceMock.findAll.mockResolvedValue({ data: [], total: 0 });

    await controller.findAll(tenantId, { page: 2 as any, limit: 25 as any });

    expect(productsServiceMock.findAll).toHaveBeenCalledWith(tenantId, 2, 25);
  });

  it('delegates findOne', async () => {
    productsServiceMock.findOne.mockResolvedValue({ id: 'p1' });

    const res = await controller.findOne(tenantId, '507f1f77bcf86cd799439011');

    expect(productsServiceMock.findOne).toHaveBeenCalledWith(
      tenantId,
      '507f1f77bcf86cd799439011',
    );
    expect(res).toEqual({ id: 'p1' });
  });
});
