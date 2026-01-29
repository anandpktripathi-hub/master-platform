import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Account, AccountDocument } from '../../database/schemas/account.schema';
import { Transaction, TransactionDocument } from '../../database/schemas/transaction.schema';
import { Invoice, InvoiceDocument } from '../../database/schemas/invoice.schema';
import { Bill, BillDocument } from '../../database/schemas/bill.schema';
import { Goal, GoalDocument } from '../../database/schemas/goal.schema';

@Injectable()
export class AccountingService {
  constructor(
    @InjectModel(Account.name) private readonly accountModel: Model<AccountDocument>,
    @InjectModel(Transaction.name) private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(Invoice.name) private readonly invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Bill.name) private readonly billModel: Model<BillDocument>,
    @InjectModel(Goal.name) private readonly goalModel: Model<GoalDocument>,
  ) {}

  // Accounts
  async listAccounts(tenantId: string): Promise<Account[]> {
    return this.accountModel.find({ tenantId: new Types.ObjectId(tenantId) }).lean().exec();
  }

  async createAccount(tenantId: string, payload: Partial<Account>): Promise<Account> {
    const doc = new this.accountModel({ ...payload, tenantId: new Types.ObjectId(tenantId) });
    return doc.save();
  }

  async updateAccount(tenantId: string, id: string, payload: Partial<Account>): Promise<Account | null> {
    return this.accountModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), tenantId: new Types.ObjectId(tenantId) },
        { $set: payload },
        { new: true },
      )
      .exec();
  }

  async deleteAccount(tenantId: string, id: string): Promise<void> {
    await this.accountModel
      .findOneAndDelete({ _id: new Types.ObjectId(id), tenantId: new Types.ObjectId(tenantId) })
      .exec();
  }

  // Transactions
  async listTransactions(tenantId: string, accountId?: string): Promise<Transaction[]> {
    const filter: Record<string, unknown> = { tenantId: new Types.ObjectId(tenantId) };
    if (accountId) {
      filter.accountId = new Types.ObjectId(accountId);
    }
    return this.transactionModel.find(filter).sort({ date: -1 }).lean().exec();
  }

  async recordTransaction(tenantId: string, payload: Partial<Transaction>): Promise<Transaction> {
    const doc = new this.transactionModel({
      ...payload,
      tenantId: new Types.ObjectId(tenantId),
      date: payload.date ? payload.date : new Date(),
    });
    return doc.save();
  }

  // Invoices
  async listInvoices(tenantId: string): Promise<Invoice[]> {
    return this.invoiceModel.find({ tenantId: new Types.ObjectId(tenantId) }).sort({ issueDate: -1 }).lean().exec();
  }

  async createInvoice(tenantId: string, payload: Partial<Invoice>): Promise<Invoice> {
    const doc = new this.invoiceModel({
      ...payload,
      tenantId: new Types.ObjectId(tenantId),
    });
    return doc.save();
  }

  async updateInvoice(tenantId: string, id: string, payload: Partial<Invoice>): Promise<Invoice | null> {
    return this.invoiceModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), tenantId: new Types.ObjectId(tenantId) },
        { $set: payload },
        { new: true },
      )
      .exec();
  }

  async deleteInvoice(tenantId: string, id: string): Promise<void> {
    await this.invoiceModel
      .findOneAndDelete({ _id: new Types.ObjectId(id), tenantId: new Types.ObjectId(tenantId) })
      .exec();
  }

  // Bills
  async listBills(tenantId: string): Promise<Bill[]> {
    return this.billModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .sort({ issueDate: -1 })
      .lean()
      .exec();
  }

  async createBill(tenantId: string, payload: Partial<Bill>): Promise<Bill> {
    const doc = new this.billModel({
      ...payload,
      tenantId: new Types.ObjectId(tenantId),
    });
    return doc.save();
  }

  async updateBill(tenantId: string, id: string, payload: Partial<Bill>): Promise<Bill | null> {
    return this.billModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), tenantId: new Types.ObjectId(tenantId) },
        { $set: payload },
        { new: true },
      )
      .exec();
  }

  async deleteBill(tenantId: string, id: string): Promise<void> {
    await this.billModel
      .findOneAndDelete({ _id: new Types.ObjectId(id), tenantId: new Types.ObjectId(tenantId) })
      .exec();
  }

  // Goals
  async listGoals(tenantId: string): Promise<Goal[]> {
    return this.goalModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async createGoal(tenantId: string, payload: Partial<Goal>): Promise<Goal> {
    const doc = new this.goalModel({
      ...payload,
      tenantId: new Types.ObjectId(tenantId),
    });
    return doc.save();
  }

  async updateGoal(tenantId: string, id: string, payload: Partial<Goal>): Promise<Goal | null> {
    return this.goalModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), tenantId: new Types.ObjectId(tenantId) },
        { $set: payload },
        { new: true },
      )
      .exec();
  }

  async deleteGoal(tenantId: string, id: string): Promise<void> {
    await this.goalModel
      .findOneAndDelete({ _id: new Types.ObjectId(id), tenantId: new Types.ObjectId(tenantId) })
      .exec();
  }

  // Simple KPI summary for dashboards, including last 30 days cashflow
  async getSummary(tenantId: string): Promise<{
    income: number;
    expense: number;
    outstandingInvoices: number;
    last30Days: { income: number; expense: number; net: number };
    last6Months: { month: string; income: number; expense: number; net: number }[];
  }> {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      incomeAgg,
      expenseAgg,
      outstandingCount,
      income30Agg,
      expense30Agg,
      cashflowAgg,
    ] = await Promise.all([
      this.transactionModel
        .aggregate([
          { $match: { tenantId: tenantObjectId, type: 'credit' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ])
        .exec(),
      this.transactionModel
        .aggregate([
          { $match: { tenantId: tenantObjectId, type: 'debit' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ])
        .exec(),
      this.invoiceModel
        .countDocuments({
          tenantId: tenantObjectId,
          status: { $in: ['sent', 'overdue'] },
        })
        .exec(),
      this.transactionModel
        .aggregate([
          {
            $match: {
              tenantId: tenantObjectId,
              type: 'credit',
              date: { $gte: thirtyDaysAgo },
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ])
        .exec(),
      this.transactionModel
        .aggregate([
          {
            $match: {
              tenantId: tenantObjectId,
              type: 'debit',
              date: { $gte: thirtyDaysAgo },
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ])
        .exec(),
      this.transactionModel
        .aggregate([
          {
            $match: {
              tenantId: tenantObjectId,
              date: { $gte: sixMonthsAgo },
            },
          },
          {
            $group: {
              _id: {
                year: { $year: '$date' },
                month: { $month: '$date' },
                type: '$type',
              },
              total: { $sum: '$amount' },
            },
          },
        ])
        .exec(),
    ]);

    const income = incomeAgg[0]?.total || 0;
    const expense = expenseAgg[0]?.total || 0;
    const income30 = income30Agg[0]?.total || 0;
    const expense30 = expense30Agg[0]?.total || 0;

    // Build last 6 months cashflow series (per month income/expense/net)
    const monthlyMap = new Map<string, { income: number; expense: number }>();

    for (const row of cashflowAgg) {
      const year: number = row._id.year;
      const monthNum: number = row._id.month;
      const type: string = row._id.type;
      const key = `${year}-${String(monthNum).padStart(2, '0')}`;

      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, { income: 0, expense: 0 });
      }

      const entry = monthlyMap.get(key)!;
      if (type === 'credit') {
        entry.income += row.total || 0;
      } else if (type === 'debit') {
        entry.expense += row.total || 0;
      }
    }

    const last6Months: { month: string; income: number; expense: number; net: number }[] = [];

    // Generate series for the last 6 calendar months including current month
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthNum = d.getMonth() + 1;
      const key = `${year}-${String(monthNum).padStart(2, '0')}`;
      const entry = monthlyMap.get(key) || { income: 0, expense: 0 };

      last6Months.push({
        month: key,
        income: entry.income,
        expense: entry.expense,
        net: entry.income - entry.expense,
      });
    }

    return {
      income,
      expense,
      outstandingInvoices: outstandingCount,
      last30Days: {
        income: income30,
        expense: expense30,
        net: income30 - expense30,
      },
      last6Months,
    };
  }

  // Advanced reports: Profit & Loss (P&L) over a period, default last 12 months
  async getProfitAndLoss(tenantId: string, from?: string, to?: string): Promise<{
    period: { from: Date; to: Date };
    totals: { income: number; expense: number; net: number };
    byMonth: { month: string; income: number; expense: number; net: number }[];
  }> {
    const tenantObjectId = new Types.ObjectId(tenantId);

    const now = new Date();
    const toDate = to ? new Date(to) : now;
    const fromDate = from
      ? new Date(from)
      : new Date(toDate.getFullYear(), toDate.getMonth() - 11, 1);

    const agg = await this.transactionModel
      .aggregate([
        {
          $match: {
            tenantId: tenantObjectId,
            date: { $gte: fromDate, $lte: toDate },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
              type: '$type',
            },
            total: { $sum: '$amount' },
          },
        },
      ])
      .exec();

    const monthlyMap = new Map<string, { income: number; expense: number }>();

    for (const row of agg) {
      const year: number = row._id.year;
      const monthNum: number = row._id.month;
      const type: string = row._id.type;
      const key = `${year}-${String(monthNum).padStart(2, '0')}`;

      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, { income: 0, expense: 0 });
      }

      const entry = monthlyMap.get(key)!;
      if (type === 'credit') {
        entry.income += row.total || 0;
      } else if (type === 'debit') {
        entry.expense += row.total || 0;
      }
    }

    const byMonth: { month: string; income: number; expense: number; net: number }[] = [];

    // Generate series month by month between fromDate and toDate (inclusive)
    const cursor = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
    const end = new Date(toDate.getFullYear(), toDate.getMonth(), 1);

    while (cursor <= end) {
      const year = cursor.getFullYear();
      const monthNum = cursor.getMonth() + 1;
      const key = `${year}-${String(monthNum).padStart(2, '0')}`;
      const entry = monthlyMap.get(key) || { income: 0, expense: 0 };

      byMonth.push({
        month: key,
        income: entry.income,
        expense: entry.expense,
        net: entry.income - entry.expense,
      });

      cursor.setMonth(cursor.getMonth() + 1);
    }

    const totals = byMonth.reduce(
      (acc, m) => {
        acc.income += m.income;
        acc.expense += m.expense;
        return acc;
      },
      { income: 0, expense: 0 },
    );

    return {
      period: { from: fromDate, to: toDate },
      totals: {
        income: totals.income,
        expense: totals.expense,
        net: totals.income - totals.expense,
      },
      byMonth,
    };
  }

  // Advanced reports: simple balance sheet-style snapshot as of a date
  async getBalanceSheet(tenantId: string, asOf?: string): Promise<{
    asOf: Date;
    byType: { type: string; balance: number }[];
    totals: { assets: number; liabilities: number; equity: number };
  }> {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const asOfDate = asOf ? new Date(asOf) : new Date();

    const agg = await this.transactionModel
      .aggregate([
        {
          $match: {
            tenantId: tenantObjectId,
            date: { $lte: asOfDate },
          },
        },
        {
          $lookup: {
            from: 'accounts',
            localField: 'accountId',
            foreignField: '_id',
            as: 'account',
          },
        },
        { $unwind: '$account' },
        {
          $group: {
            _id: { accountType: '$account.type', txType: '$type' },
            total: { $sum: '$amount' },
          },
        },
      ])
      .exec();

    const typeMap = new Map<
      string,
      { debit: number; credit: number }
    >();

    for (const row of agg) {
      const accountType: string = row._id.accountType;
      const txType: string = row._id.txType;
      if (!typeMap.has(accountType)) {
        typeMap.set(accountType, { debit: 0, credit: 0 });
      }
      const entry = typeMap.get(accountType)!;
      if (txType === 'debit') {
        entry.debit += row.total || 0;
      } else if (txType === 'credit') {
        entry.credit += row.total || 0;
      }
    }

    const byType: { type: string; balance: number }[] = [];
    let assets = 0;
    let liabilities = 0;
    let equity = 0;

    for (const [accountType, { debit, credit }] of typeMap.entries()) {
      // Simplified accounting logic: debit-normal vs credit-normal accounts
      let balance = 0;
      if (accountType === 'asset' || accountType === 'expense') {
        balance = debit - credit;
      } else {
        balance = credit - debit;
      }

      byType.push({ type: accountType, balance });

      if (accountType === 'asset') assets += balance;
      if (accountType === 'liability') liabilities += balance;
      if (accountType === 'equity') equity += balance;
    }

    return {
      asOf: asOfDate,
      byType,
      totals: { assets, liabilities, equity },
    };
  }
}
