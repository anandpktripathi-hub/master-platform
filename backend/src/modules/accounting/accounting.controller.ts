import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  NotFoundException,
  Param,
  Body,
  UseGuards,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AccountingService } from './accounting.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
import {
  ListTransactionsQueryDto,
  RecordTransactionDto,
} from './dto/transaction.dto';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/invoice.dto';
import { CreateBillDto, UpdateBillDto } from './dto/bill.dto';
import { CreateGoalDto, UpdateGoalDto } from './dto/goal.dto';
import { BalanceSheetQueryDto, ProfitAndLossQueryDto } from './dto/reports.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
@ApiTags('Accounting')
@ApiBearerAuth('bearer')
@Controller('accounting')
@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  // Accounts
  @Get('accounts')
  @Roles('tenant_admin')
  listAccounts(@Tenant() tenantId: string) {
    return this.accountingService.listAccounts(tenantId);
  }

  @Post('accounts')
  @Roles('tenant_admin')
  createAccount(@Tenant() tenantId: string, @Body() body: CreateAccountDto) {
    return this.accountingService.createAccount(tenantId, body);
  }

  @Put('accounts/:id')
  @Roles('tenant_admin')
  updateAccount(
    @Tenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: UpdateAccountDto,
  ) {
    return this.accountingService.updateAccount(tenantId, id, body);
  }

  @Delete('accounts/:id')
  @Roles('tenant_admin')
  deleteAccount(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.accountingService.deleteAccount(tenantId, id);
  }

  // Transactions
  @Get('transactions')
  @Roles('tenant_admin')
  listTransactions(
    @Tenant() tenantId: string,
    @Query() query: ListTransactionsQueryDto,
  ) {
    return this.accountingService.listTransactions(tenantId, query.accountId);
  }

  @Post('transactions')
  @Roles('tenant_admin')
  recordTransaction(
    @Tenant() tenantId: string,
    @Body() body: RecordTransactionDto,
  ) {
    return this.accountingService.recordTransaction(tenantId, body);
  }

  // Invoices
  @Get('invoices')
  @Roles('tenant_admin')
  listInvoices(@Tenant() tenantId: string) {
    return this.accountingService.listInvoices(tenantId);
  }

  @Post('invoices')
  @Roles('tenant_admin')
  createInvoice(@Tenant() tenantId: string, @Body() body: CreateInvoiceDto) {
    return this.accountingService.createInvoice(tenantId, body);
  }

  @Put('invoices/:id')
  @Roles('tenant_admin')
  updateInvoice(
    @Tenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: UpdateInvoiceDto,
  ) {
    return this.accountingService.updateInvoice(tenantId, id, body);
  }

  @Delete('invoices/:id')
  @Roles('tenant_admin')
  deleteInvoice(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.accountingService.deleteInvoice(tenantId, id);
  }

  @Get('invoices/:id/pdf')
  @Roles('tenant_admin')
  async downloadInvoicePdf(
    @Tenant() tenantId: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const invoice = await this.accountingService.getInvoiceById(tenantId, id);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Lazy require: keeps build light and avoids TS type dependency.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const PDFDocument = require('pdfkit');

    const safeNumber = String(invoice.number || id).replace(/[^a-zA-Z0-9_-]/g, '_');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="invoice-${safeNumber}.pdf"`,
    );

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(res);

    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown(1.5);

    doc.fontSize(12);
    doc.text(`Invoice Number: ${invoice.number || '—'}`);
    doc.text(`Customer: ${invoice.customerName || '—'}`);
    doc.text(`Status: ${invoice.status || '—'}`);
    doc.text(`Currency: ${invoice.currency || '—'}`);
    doc.text(`Total: ${typeof invoice.totalAmount === 'number' ? invoice.totalAmount : '—'}`);
    doc.text(`Issue Date: ${invoice.issueDate ? new Date(invoice.issueDate).toISOString().slice(0, 10) : '—'}`);
    doc.text(`Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toISOString().slice(0, 10) : '—'}`);
    doc.moveDown(1);

    if (invoice.notes) {
      doc.fontSize(12).text('Notes:', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).text(String(invoice.notes));
    }

    doc.end();
  }

  // Bills
  @Get('bills')
  @Roles('tenant_admin')
  listBills(@Tenant() tenantId: string) {
    return this.accountingService.listBills(tenantId);
  }

  @Post('bills')
  @Roles('tenant_admin')
  createBill(@Tenant() tenantId: string, @Body() body: CreateBillDto) {
    return this.accountingService.createBill(tenantId, body);
  }

  @Put('bills/:id')
  @Roles('tenant_admin')
  updateBill(
    @Tenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: UpdateBillDto,
  ) {
    return this.accountingService.updateBill(tenantId, id, body);
  }

  @Delete('bills/:id')
  @Roles('tenant_admin')
  deleteBill(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.accountingService.deleteBill(tenantId, id);
  }

  // Goals
  @Get('goals')
  @Roles('tenant_admin')
  listGoals(@Tenant() tenantId: string) {
    return this.accountingService.listGoals(tenantId);
  }

  @Post('goals')
  @Roles('tenant_admin')
  createGoal(@Tenant() tenantId: string, @Body() body: CreateGoalDto) {
    return this.accountingService.createGoal(tenantId, body);
  }

  @Put('goals/:id')
  @Roles('tenant_admin')
  updateGoal(
    @Tenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: UpdateGoalDto,
  ) {
    return this.accountingService.updateGoal(tenantId, id, body);
  }

  @Delete('goals/:id')
  @Roles('tenant_admin')
  deleteGoal(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.accountingService.deleteGoal(tenantId, id);
  }

  // Summary KPIs for dashboards
  @Get('summary')
  @Roles('tenant_admin')
  getSummary(@Tenant() tenantId: string) {
    return this.accountingService.getSummary(tenantId);
  }

  // Advanced reports
  @Get('reports/profit-and-loss')
  @Roles('tenant_admin')
  getProfitAndLoss(
    @Tenant() tenantId: string,
    @Query() query?: ProfitAndLossQueryDto,
  ) {
    return this.accountingService.getProfitAndLoss(
      tenantId,
      query?.from,
      query?.to,
    );
  }

  @Get('reports/balance-sheet')
  @Roles('tenant_admin')
  getBalanceSheet(
    @Tenant() tenantId: string,
    @Query() query?: BalanceSheetQueryDto,
  ) {
    return this.accountingService.getBalanceSheet(tenantId, query?.asOf);
  }

  // CSV exports for advanced reports
  @Get('reports/profit-and-loss/export')
  @Roles('tenant_admin')
  async exportProfitAndLoss(
    @Tenant() tenantId: string,
    @Res() res: Response,
    @Query() query?: ProfitAndLossQueryDto,
  ) {
    const report = await this.accountingService.getProfitAndLoss(
      tenantId,
      query?.from,
      query?.to,
    );

    const header = ['Month', 'Income', 'Expense', 'Net'];
    const rows = report.byMonth.map((m) => [
      m.month,
      m.income,
      m.expense,
      m.net,
    ]);

    // Optional totals row for convenience
    rows.push([
      'TOTAL',
      report.totals.income,
      report.totals.expense,
      report.totals.net,
    ]);

    const csvRows = rows.map((row) =>
      row
        .map((value) => {
          const str = String(value ?? '');
          const escaped = str.replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(','),
    );

    const csv = [header.join(','), ...csvRows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="profit-and-loss.csv"',
    );

    return res.send(csv);
  }

  @Get('reports/balance-sheet/export')
  @Roles('tenant_admin')
  async exportBalanceSheet(
    @Tenant() tenantId: string,
    @Res() res: Response,
    @Query() query?: BalanceSheetQueryDto,
  ) {
    const report = await this.accountingService.getBalanceSheet(
      tenantId,
      query?.asOf,
    );

    const header = ['AccountType', 'Balance'];
    const rows = report.byType.map((row) => [row.type, row.balance]);

    // Totals summary rows
    rows.push(['ASSETS_TOTAL', report.totals.assets]);
    rows.push(['LIABILITIES_TOTAL', report.totals.liabilities]);
    rows.push(['EQUITY_TOTAL', report.totals.equity]);

    const csvRows = rows.map((row) =>
      row
        .map((value) => {
          const str = String(value ?? '');
          const escaped = str.replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(','),
    );

    const csv = [header.join(','), ...csvRows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="balance-sheet.csv"',
    );

    return res.send(csv);
  }
}

