import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { InvoicesService } from '../services/invoices.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { InvoicePdfService } from '../services/invoice-pdf.service';
import type { Response } from 'express';

@ApiTags('Invoices')
@Controller('invoices')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class InvoicesController {
  constructor(
    private invoicesService: InvoicesService,
    private invoicePdfService: InvoicePdfService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get invoices for current tenant' })
  @ApiResponse({ status: 200, description: 'Invoices list returned' })
  async getInvoices(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Request() req: any,
  ) {
    const tenantId = req.user?.tenantId;
    return this.invoicesService.findByTenantId(tenantId, limit, page);
  }

  @Get(':invoiceId')
  @ApiOperation({ summary: 'Get invoice details' })
  @ApiResponse({ status: 200, description: 'Invoice details returned' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async getInvoice(@Param('invoiceId') invoiceId: string, @Request() req: any) {
    const tenantId = req.user?.tenantId;
    return this.invoicesService.findById(invoiceId, tenantId);
  }

  @Get(':invoiceId/pdf')
  @ApiOperation({ summary: 'Download invoice as branded PDF (current tenant)' })
  @ApiResponse({ status: 200, description: 'PDF stream returned' })
  async downloadInvoicePdf(
    @Param('invoiceId') invoiceId: string,
    @Request() req: any,
    @Res() res: Response,
  ) {
    const tenantId = req.user?.tenantId;
    const invoice = await this.invoicesService.findById(invoiceId, tenantId);
    const pdfBuffer = await this.invoicePdfService.generate(invoice as any);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${(invoice as any).invoiceNumber || 'invoice'}.pdf"`,
    );
    res.setHeader('Content-Length', pdfBuffer.length.toString());

    res.end(pdfBuffer);
  }
}
