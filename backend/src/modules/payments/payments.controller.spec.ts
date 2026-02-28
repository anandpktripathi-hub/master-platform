import { BadRequestException } from '@nestjs/common';
import { PaymentsController } from './payments.controller';

describe('PaymentsController', () => {
  let controller: PaymentsController;

  const paymentLogService = {
    list: jest.fn().mockResolvedValue({ items: [] }),
    record: jest.fn().mockResolvedValue(undefined),
  };

  const paymentGatewayService = {
    capturePaypalOrder: jest.fn().mockResolvedValue({ ok: true }),
  };

  const packageService = {
    getPackage: jest.fn(),
    assignPackageToTenant: jest.fn(),
  };

  beforeEach(() => {
    controller = new PaymentsController(
      paymentLogService as any,
      paymentGatewayService as any,
      packageService as any,
    );
    jest.clearAllMocks();
  });

  it('getPaymentLogs rejects invalid date filter', () => {
    expect(() => controller.getPaymentLogs({ from: 'bad-date' } as any)).toThrow(
      BadRequestException,
    );
    expect(paymentLogService.list).not.toHaveBeenCalled();
  });

  it('capturePaypalOrder forwards orderId', async () => {
    await controller.capturePaypalOrder({ orderId: 'o1' } as any);
    expect(paymentGatewayService.capturePaypalOrder).toHaveBeenCalledWith('o1');
  });
});
