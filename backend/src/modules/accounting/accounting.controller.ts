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
  HttpException,
  InternalServerErrorException,
  Logger,
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
import { AccountingIdParamDto } from './dto/accounting-id-param.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
@ApiTags('Accounting')
@ApiBearerAuth('bearer')
@Controller('accounting')
@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
export class AccountingController {
  private readonly logger = new Logger(AccountingController.name);

  constructor(private readonly accountingService: AccountingService) {}

  // Accounts
  @Get('accounts')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'List accounts' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listAccounts(@Tenant() tenantId: string) {
    try {
      return await this.accountingService.listAccounts(tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[listAccounts] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list accounts');
    }
  }

  @Post('accounts')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Create account' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createAccount(
    @Tenant() tenantId: string,
    @Body() body: CreateAccountDto,
  ) {
    try {
      return await this.accountingService.createAccount(tenantId, body);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[createAccount] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create account');
    }
  }

  @Put('accounts/:id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Update account' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateAccount(
    @Tenant() tenantId: string,
    @Param() params: AccountingIdParamDto,
    @Body() body: UpdateAccountDto,
  ) {
    try {
      return await this.accountingService.updateAccount(
        tenantId,
        params.id,
        body,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateAccount] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update account');
    }
  }

  @Delete('accounts/:id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Delete account' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteAccount(@Tenant() tenantId: string, @Param() params: AccountingIdParamDto) {
    try {
      return await this.accountingService.deleteAccount(tenantId, params.id);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[deleteAccount] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to delete account');
    }
  }

  // Transactions
  @Get('transactions')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'List transactions' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listTransactions(
    @Tenant() tenantId: string,
    @Query() query: ListTransactionsQueryDto,
  ) {
    try {
      return await this.accountingService.listTransactions(
        tenantId,
        query.accountId,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[listTransactions] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list transactions');
    }
  }

  @Post('transactions')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Record transaction' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async recordTransaction(
    @Tenant() tenantId: string,
    @Body() body: RecordTransactionDto,
  ) {
    try {
      return await this.accountingService.recordTransaction(tenantId, body);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[recordTransaction] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to record transaction');
    }
  }

  // Invoices
  @Get('invoices')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'List invoices' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listInvoices(@Tenant() tenantId: string) {
    try {
      return await this.accountingService.listInvoices(tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[listInvoices] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list invoices');
    }
  }

  @Post('invoices')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Create invoice' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createInvoice(@Tenant() tenantId: string, @Body() body: CreateInvoiceDto) {
    try {
      return await this.accountingService.createInvoice(tenantId, body);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[createInvoice] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create invoice');
    }
  }

  @Put('invoices/:id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Update invoice' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateInvoice(
    @Tenant() tenantId: string,
    @Param() params: AccountingIdParamDto,
    @Body() body: UpdateInvoiceDto,
  ) {
    try {
      return await this.accountingService.updateInvoice(
        tenantId,
        params.id,
        body,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateInvoice] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update invoice');
    }
  }

  @Delete('invoices/:id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Delete invoice' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteInvoice(@Tenant() tenantId: string, @Param() params: AccountingIdParamDto) {
    try {
      return await this.accountingService.deleteInvoice(tenantId, params.id);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[deleteInvoice] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to delete invoice');
    }
  }

  @Get('invoices/:id/pdf')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Download invoice PDF' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async downloadInvoicePdf(
    @Tenant() tenantId: string,
    @Param() params: AccountingIdParamDto,
    @Res() res: Response,
  ) {
    try {
      const id = params.id;
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
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[downloadInvoicePdf] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to download invoice pdf');
    }
  }

  // Bills
  @Get('bills')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'List bills' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listBills(@Tenant() tenantId: string) {
    try {
      return await this.accountingService.listBills(tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[listBills] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list bills');
    }
  }

  @Post('bills')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Create bill' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createBill(@Tenant() tenantId: string, @Body() body: CreateBillDto) {
    try {
      return await this.accountingService.createBill(tenantId, body);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[createBill] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create bill');
    }
  }

  @Put('bills/:id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Update bill' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateBill(
    @Tenant() tenantId: string,
    @Param() params: AccountingIdParamDto,
    @Body() body: UpdateBillDto,
  ) {
    try {
      return await this.accountingService.updateBill(tenantId, params.id, body);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[updateBill] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update bill');
    }
  }

  @Delete('bills/:id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Delete bill' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteBill(@Tenant() tenantId: string, @Param() params: AccountingIdParamDto) {
    try {
      return await this.accountingService.deleteBill(tenantId, params.id);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[deleteBill] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to delete bill');
    }
  }

  // Goals
  @Get('goals')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'List goals' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listGoals(@Tenant() tenantId: string) {
    try {
      return await this.accountingService.listGoals(tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[listGoals] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list goals');
    }
  }

  @Post('goals')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Create goal' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createGoal(@Tenant() tenantId: string, @Body() body: CreateGoalDto) {
    try {
      return await this.accountingService.createGoal(tenantId, body);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[createGoal] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create goal');
    }
  }

  @Put('goals/:id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Update goal' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateGoal(
    @Tenant() tenantId: string,
    @Param() params: AccountingIdParamDto,
    @Body() body: UpdateGoalDto,
  ) {
    try {
      return await this.accountingService.updateGoal(tenantId, params.id, body);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[updateGoal] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update goal');
    }
  }

  @Delete('goals/:id')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Delete goal' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteGoal(@Tenant() tenantId: string, @Param() params: AccountingIdParamDto) {
    try {
      return await this.accountingService.deleteGoal(tenantId, params.id);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[deleteGoal] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to delete goal');
    }
  }

  // Summary KPIs for dashboards
  @Get('summary')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Get accounting summary' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getSummary(@Tenant() tenantId: string) {
    try {
      return await this.accountingService.getSummary(tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getSummary] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get summary');
    }
  }

  // Advanced reports
  @Get('reports/profit-and-loss')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Get profit and loss report' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getProfitAndLoss(
    @Tenant() tenantId: string,
    @Query() query?: ProfitAndLossQueryDto,
  ) {
    try {
      return await this.accountingService.getProfitAndLoss(
        tenantId,
        query?.from,
        query?.to,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getProfitAndLoss] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get profit and loss report');
    }
  }

  @Get('reports/balance-sheet')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Get balance sheet report' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getBalanceSheet(
    @Tenant() tenantId: string,
    @Query() query?: BalanceSheetQueryDto,
  ) {
    try {
      return await this.accountingService.getBalanceSheet(tenantId, query?.asOf);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getBalanceSheet] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get balance sheet report');
    }
  }

  // CSV exports for advanced reports
  @Get('reports/profit-and-loss/export')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Export profit and loss report (CSV)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async exportProfitAndLoss(
    @Tenant() tenantId: string,
    @Res() res: Response,
    @Query() query?: ProfitAndLossQueryDto,
  ) {
    try {
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
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[exportProfitAndLoss] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to export profit and loss report');
    }
  }

  @Get('reports/balance-sheet/export')
  @Roles('tenant_admin')
  @ApiOperation({ summary: 'Export balance sheet report (CSV)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async exportBalanceSheet(
    @Tenant() tenantId: string,
    @Res() res: Response,
    @Query() query?: BalanceSheetQueryDto,
  ) {
    try {
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
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[exportBalanceSheet] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to export balance sheet report');
    }
  }
}

