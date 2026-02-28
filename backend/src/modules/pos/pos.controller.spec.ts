import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PosController } from './pos.controller';
import { PosService } from './pos.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { AdjustStockDto, CreatePosOrderDto } from './dto/pos.dto';

describe('PosController', () => {
  let controller: PosController;

  const posService = {
    getSummary: jest.fn().mockResolvedValue({}),
    listStock: jest.fn().mockResolvedValue([]),
    adjustStock: jest.fn().mockResolvedValue({ ok: true }),
    listOrders: jest.fn().mockResolvedValue([]),
    createOrder: jest.fn().mockResolvedValue({ _id: 'o1' }),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PosController],
      providers: [{ provide: PosService, useValue: posService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(PosController);
    jest.clearAllMocks();
  });

  it('rejects when tenantId missing', () => {
    expect(() => controller.getSummary('')).toThrow(BadRequestException);
    expect(() => controller.listStock('')).toThrow(BadRequestException);
    expect(() =>
      controller.adjustStock(
        '',
        Object.assign(new AdjustStockDto(), {
          productId: '507f1f77bcf86cd799439011',
          quantityDelta: 1,
          type: 'adjustment' as const,
        }),
      ),
    ).toThrow(BadRequestException);
  });

  it('listOrders defaults limit to 50', async () => {
    await controller.listOrders('t1', undefined);
    expect(posService.listOrders).toHaveBeenCalledWith('t1', 50);
  });

  it('listOrders rejects invalid limit', () => {
    expect(() => controller.listOrders('t1', '0')).toThrow(BadRequestException);
    expect(() => controller.listOrders('t1', '201')).toThrow(
      BadRequestException,
    );
    expect(() => controller.listOrders('t1', '1.5')).toThrow(
      BadRequestException,
    );
    expect(() => controller.listOrders('t1', 'abc')).toThrow(
      BadRequestException,
    );
  });

  it('createOrder forwards tenantId and dto', async () => {
    const dto = Object.assign(new CreatePosOrderDto(), {
      items: [
        {
          productId: '507f1f77bcf86cd799439011',
          quantity: 1,
        },
      ],
      paymentMethod: 'cash',
    });

    await controller.createOrder('t1', dto);

    expect(posService.createOrder).toHaveBeenCalledWith('t1', dto);
  });
});
