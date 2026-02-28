import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { PosService } from './pos.service';

describe('PosService', () => {
  const createService = async (
    overrides?: Partial<Record<string, unknown>>,
  ) => {
    const stockModel =
      (overrides?.stockModel as Record<string, unknown> | undefined) ??
      ({
        countDocuments: jest.fn(),
        find: jest.fn(),
        findOneAndUpdate: jest.fn(),
        updateOne: jest.fn(),
      } satisfies Record<string, unknown>);

    const movementModel =
      (overrides?.movementModel as Record<string, unknown> | undefined) ??
      ({
        create: jest.fn(),
      } satisfies Record<string, unknown>);

    const orderModel =
      (overrides?.orderModel as Record<string, unknown> | undefined) ??
      ({
        aggregate: jest.fn(),
        countDocuments: jest.fn(),
      } satisfies Record<string, unknown>);

    const productModel =
      (overrides?.productModel as Record<string, unknown> | undefined) ??
      ({
        findById: jest.fn(),
      } satisfies Record<string, unknown>);

    const moduleRef = await Test.createTestingModule({
      providers: [
        PosService,
        { provide: getModelToken('WarehouseStock'), useValue: stockModel },
        { provide: getModelToken('StockMovement'), useValue: movementModel },
        { provide: getModelToken('PosOrder'), useValue: orderModel },
        { provide: getModelToken('Product'), useValue: productModel },
      ],
    }).compile();

    return {
      service: moduleRef.get(PosService),
      mocks: { stockModel, movementModel, orderModel, productModel },
    };
  };

  it('throws BadRequestException for invalid tenantId (getSummary)', async () => {
    const { service } = await createService();

    await expect(service.getSummary('undefined')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('does not reset minStock when omitted (adjustStock)', async () => {
    let capturedUpdate: unknown;

    const findOneAndUpdate = jest
      .fn()
      .mockImplementation((_filter: unknown, update: unknown) => {
        capturedUpdate = update;
        return {
          exec: jest.fn().mockResolvedValue({ _id: 'x', quantity: 10 }),
        };
      });

    const productFindById = jest
      .fn()
      .mockReturnValue({
        lean: () => ({
          exec: jest.fn().mockResolvedValue({ _id: 'p', name: 'P' }),
        }),
      });

    const { service } = await createService({
      stockModel: { findOneAndUpdate, updateOne: jest.fn() },
      movementModel: { create: jest.fn().mockResolvedValue(undefined) },
      productModel: { findById: productFindById },
    });

    await service.adjustStock('507f1f77bcf86cd799439011', {
      productId: '507f1f77bcf86cd799439012',
      quantityDelta: 5,
      type: 'purchase',
    });

    const updateArg = capturedUpdate as Record<
      string,
      unknown
    >;
    expect(updateArg.$inc).toEqual({ quantity: 5 });
    expect(updateArg.$set).toBeUndefined();
  });
});
