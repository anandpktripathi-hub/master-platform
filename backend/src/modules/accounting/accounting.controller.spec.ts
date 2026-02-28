import { Test } from '@nestjs/testing';
import { AccountingController } from './accounting.controller';
import { AccountingService } from './accounting.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';

describe('AccountingController', () => {
  let controller: AccountingController;

  const accountingService = {
    listAccounts: jest.fn(),
    createAccount: jest.fn(),
    updateAccount: jest.fn(),
    deleteAccount: jest.fn(),
    listTransactions: jest.fn(),
    recordTransaction: jest.fn(),
    listInvoices: jest.fn(),
    createInvoice: jest.fn(),
    updateInvoice: jest.fn(),
    deleteInvoice: jest.fn(),
    getInvoiceById: jest.fn(),
    listBills: jest.fn(),
    createBill: jest.fn(),
    updateBill: jest.fn(),
    deleteBill: jest.fn(),
    listGoals: jest.fn(),
    createGoal: jest.fn(),
    updateGoal: jest.fn(),
    deleteGoal: jest.fn(),
    getSummary: jest.fn(),
    getProfitAndLoss: jest.fn(),
    getBalanceSheet: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AccountingController],
      providers: [{ provide: AccountingService, useValue: accountingService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(AccountingController);
    jest.clearAllMocks();
  });

  it('listTransactions passes optional accountId filter', async () => {
    const tenantId = '507f1f77bcf86cd799439011';
    const accountId = '507f1f77bcf86cd799439012';
    accountingService.listTransactions.mockResolvedValue([]);

    await controller.listTransactions(tenantId, { accountId });

    expect(accountingService.listTransactions).toHaveBeenCalledWith(
      tenantId,
      accountId,
    );
  });

  it('getProfitAndLoss passes query dates through', async () => {
    const tenantId = '507f1f77bcf86cd799439011';
    accountingService.getProfitAndLoss.mockResolvedValue({});

    await controller.getProfitAndLoss(tenantId, {
      from: '2024-01-01T00:00:00.000Z',
      to: '2024-12-31T00:00:00.000Z',
    });

    expect(accountingService.getProfitAndLoss).toHaveBeenCalledWith(
      tenantId,
      '2024-01-01T00:00:00.000Z',
      '2024-12-31T00:00:00.000Z',
    );
  });
});
