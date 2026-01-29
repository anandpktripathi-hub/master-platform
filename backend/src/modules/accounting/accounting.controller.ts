import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AccountingService } from './accounting.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { WorkspaceGuard } from '../../guards/workspace.guard';

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
  createAccount(@Tenant() tenantId: string, @Body() body: any) {
    return this.accountingService.createAccount(tenantId, body);
  }

  @Put('accounts/:id')
  @Roles('tenant_admin')
  updateAccount(@Tenant() tenantId: string, @Param('id') id: string, @Body() body: any) {
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
  listTransactions(@Tenant() tenantId: string) {
    return this.accountingService.listTransactions(tenantId);
  }

  @Post('transactions')
  @Roles('tenant_admin')
  recordTransaction(@Tenant() tenantId: string, @Body() body: any) {
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
  createInvoice(@Tenant() tenantId: string, @Body() body: any) {
    return this.accountingService.createInvoice(tenantId, body);
  }

  @Put('invoices/:id')
  @Roles('tenant_admin')
  updateInvoice(@Tenant() tenantId: string, @Param('id') id: string, @Body() body: any) {
    return this.accountingService.updateInvoice(tenantId, id, body);
  }

  @Delete('invoices/:id')
  @Roles('tenant_admin')
  deleteInvoice(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.accountingService.deleteInvoice(tenantId, id);
  }

  // Bills
  @Get('bills')
  @Roles('tenant_admin')
  listBills(@Tenant() tenantId: string) {
    return this.accountingService.listBills(tenantId);
  }

  @Post('bills')
  @Roles('tenant_admin')
  createBill(@Tenant() tenantId: string, @Body() body: any) {
    return this.accountingService.createBill(tenantId, body);
  }

  @Put('bills/:id')
  @Roles('tenant_admin')
  updateBill(@Tenant() tenantId: string, @Param('id') id: string, @Body() body: any) {
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
  createGoal(@Tenant() tenantId: string, @Body() body: any) {
    return this.accountingService.createGoal(tenantId, body);
  }

  @Put('goals/:id')
  @Roles('tenant_admin')
  updateGoal(@Tenant() tenantId: string, @Param('id') id: string, @Body() body: any) {
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
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.accountingService.getProfitAndLoss(tenantId, from, to);
  }

  @Get('reports/balance-sheet')
  @Roles('tenant_admin')
  getBalanceSheet(
    @Tenant() tenantId: string,
    @Query('asOf') asOf?: string,
  ) {
    return this.accountingService.getBalanceSheet(tenantId, asOf);
  }

  // CSV exports for advanced reports
  @Get('reports/profit-and-loss/export')
  @Roles('tenant_admin')
  async exportProfitAndLoss(
    @Tenant() tenantId: string,
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const report = await this.accountingService.getProfitAndLoss(tenantId, from, to);

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
    @Query('asOf') asOf?: string,
  ) {
    const report = await this.accountingService.getBalanceSheet(tenantId, asOf);

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
