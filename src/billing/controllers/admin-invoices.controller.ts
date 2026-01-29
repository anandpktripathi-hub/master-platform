import { Body, Controller, Get, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InvoicesService } from '../services/invoices.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Role } from '../../common/enums/role.enum';
import { Permission } from '../../common/enums/permission.enum';
import { InvoiceStatus } from '../schemas/invoice.schema';
import { CreateAdminInvoiceDto } from '../dto/create-admin-invoice.dto';
import { UpdateAdminInvoiceDto } from '../dto/update-admin-invoice.dto';
import { InvoicePdfService } from '../services/invoice-pdf.service';
import type { Response } from 'express';

@ApiTags('Admin Invoices')
@Controller('admin/invoices')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.PLATFORM_SUPER_ADMIN)
@Permissions(Permission.MANAGE_PLATFORM_BILLING)
@ApiBearerAuth()
export class AdminInvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly invoicePdfService: InvoicePdfService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List invoices across all tenants for reconciliation' })
  @ApiResponse({ status: 200, description: 'Invoices list returned successfully' })
  async getAdminInvoices(
    @Query('tenantId') tenantId?: string,
    @Query('status') status?: InvoiceStatus | 'ALL',
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('paymentMethod') paymentMethod?: string,
    @Query('limit') limit?: number,
  ) {
    return this.invoicesService.findForAdmin({
      tenantId,
      status,
      from,
      to,
      paymentMethod,
      limit,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a manual invoice for a tenant/subscription' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  @ApiBody({ type: CreateAdminInvoiceDto })
  async createAdminInvoice(@Body() dto: CreateAdminInvoiceDto) {
    return this.invoicesService.createAdminInvoice(dto);
  }

  @Patch(':invoiceId')
  @ApiOperation({ summary: 'Update an existing invoice (notes, due date, line items)' })
  @ApiResponse({ status: 200, description: 'Invoice updated successfully' })
  async updateAdminInvoice(
    @Param('invoiceId') invoiceId: string,
    @Body() dto: UpdateAdminInvoiceDto,
  ) {
    return this.invoicesService.updateAdminInvoice(invoiceId, dto);
  }

  @Get(':invoiceId/pdf')
  @ApiOperation({ summary: 'Download any invoice as branded PDF (admin)' })
  @ApiResponse({ status: 200, description: 'PDF stream returned' })
  async downloadAdminInvoicePdf(
    @Param('invoiceId') invoiceId: string,
    @Res() res: Response,
  ) {
    const invoice = await this.invoicesService.findByIdForAdmin(invoiceId);
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
