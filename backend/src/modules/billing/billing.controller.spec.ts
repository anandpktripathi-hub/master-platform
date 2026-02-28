import { BadRequestException } from '@nestjs/common';
import { BillingController } from './billing.controller';

describe('BillingController', () => {
  let controller: BillingController;

  const billingService = {
    findAllForAdmin: jest.fn(),
    createForTenant: jest.fn(),
    updateForAdmin: jest.fn(),
    removeForAdmin: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(() => {
    controller = new BillingController(billingService as any);
    jest.clearAllMocks();
  });

  it('findAllForAdmin rejects invalid date filter', () => {
    expect(() =>
      controller.findAllForAdmin({ from: 'not-a-date' } as any),
    ).toThrow(BadRequestException);
    expect(billingService.findAllForAdmin).not.toHaveBeenCalled();
  });

  it('createForAdmin rejects when tenantId is missing', () => {
    expect(() => controller.createForAdmin({ tenantId: ' ' } as any)).toThrow(
      BadRequestException,
    );
    expect(billingService.createForTenant).not.toHaveBeenCalled();
  });

  it('createForAdmin forwards trimmed tenantId to service', () => {
    billingService.createForTenant.mockResolvedValue({ _id: 'b1' });

    const dto = {
      tenantId: ' t1 ',
      amount: 10,
      currency: 'USD',
      status: 'paid',
    };

    controller.createForAdmin(dto as any);

    expect(billingService.createForTenant).toHaveBeenCalledWith(
      {
        amount: 10,
        currency: 'USD',
        status: 'paid',
      },
      't1',
    );
  });
});
