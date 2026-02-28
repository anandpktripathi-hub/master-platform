import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AccountingService } from './accounting.service';
import { Account } from '../../database/schemas/account.schema';
import { Transaction } from '../../database/schemas/transaction.schema';
import { Invoice } from '../../database/schemas/invoice.schema';
import { Bill } from '../../database/schemas/bill.schema';
import { Goal } from '../../database/schemas/goal.schema';

describe('AccountingService', () => {
  async function createService() {
    const accountModel = { find: jest.fn() };
    const transactionModel = { find: jest.fn(), aggregate: jest.fn() };
    const invoiceModel = { find: jest.fn() };
    const billModel = { find: jest.fn() };
    const goalModel = { find: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AccountingService,
        { provide: getModelToken(Account.name), useValue: accountModel },
        { provide: getModelToken(Transaction.name), useValue: transactionModel },
        { provide: getModelToken(Invoice.name), useValue: invoiceModel },
        { provide: getModelToken(Bill.name), useValue: billModel },
        { provide: getModelToken(Goal.name), useValue: goalModel },
      ],
    }).compile();

    return {
      service: moduleRef.get(AccountingService),
      accountModel,
      transactionModel,
    };
  }

  it('rejects invalid tenantId early', async () => {
    const { service, accountModel } = await createService();

    await expect(service.listAccounts('not-an-objectid')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(accountModel.find).not.toHaveBeenCalled();
  });

  it('rejects invalid accountId filter in listTransactions', async () => {
    const { service, transactionModel } = await createService();
    const tenantId = '507f1f77bcf86cd799439011';

    await expect(
      service.listTransactions(tenantId, 'bad-account-id'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(transactionModel.find).not.toHaveBeenCalled();
  });

  it('rejects invalid date strings in profit and loss report', async () => {
    const { service, transactionModel } = await createService();
    const tenantId = '507f1f77bcf86cd799439011';

    await expect(service.getProfitAndLoss(tenantId, 'nope', undefined)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(transactionModel.aggregate).not.toHaveBeenCalled();
  });
});
