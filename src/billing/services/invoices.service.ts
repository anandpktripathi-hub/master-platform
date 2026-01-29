import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Invoice,
  InvoiceDocument,
  InvoiceStatus,
} from '../schemas/invoice.schema';
import { BillingNotificationService } from './billing-notification.service';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel('Invoice') private invoiceModel: Model<InvoiceDocument>,
    private readonly billingNotificationService: BillingNotificationService,
  ) {}

  async create(
    tenantId: string,
    subscriptionId: string,
    planId: string,
    amount: number,
    description?: string,
  ): Promise<Invoice> {
    // Generate invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.random().toString().substr(2, 9)}`;

    const invoice = new this.invoiceModel({
      tenantId: new Types.ObjectId(tenantId),
      subscriptionId: new Types.ObjectId(subscriptionId),
      planId: new Types.ObjectId(planId),
      invoiceNumber,
      amount,
      currency: 'USD',
      description,
      status: InvoiceStatus.PROCESSING,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Due in 30 days
    });

    const saved = await invoice.save();

    // Fire-and-forget notification; errors are logged inside the service
    this.billingNotificationService
      .notifyInvoiceCreated(saved as unknown as Invoice)
      .catch(() => undefined);

    return saved;
  }

  async createAdminInvoice(params: {
    tenantId: string;
    subscriptionId: string;
    planId: string;
    amount: number;
    currency?: string;
    description?: string;
    dueDate?: string;
    paymentMethod?: string;
    notes?: string;
    lineItems?: Invoice['lineItems'];
    status?: InvoiceStatus;
  }): Promise<Invoice> {
    const {
      tenantId,
      subscriptionId,
      planId,
      amount,
      currency,
      description,
      dueDate,
      paymentMethod,
      notes,
      lineItems,
      status,
    } = params;

    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.random()
      .toString()
      .substr(2, 9)}`;

    const invoice = new this.invoiceModel({
      tenantId: new Types.ObjectId(tenantId),
      subscriptionId: new Types.ObjectId(subscriptionId),
      planId: new Types.ObjectId(planId),
      invoiceNumber,
      amount,
      currency: currency || 'USD',
      description,
      status: status || InvoiceStatus.PENDING,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      paymentMethod,
      notes,
      lineItems,
    });

    const saved = await invoice.save();

    this.billingNotificationService
      .notifyInvoiceCreated(saved as unknown as Invoice)
      .catch(() => undefined);

    return saved;
  }

  async findByTenantId(
    tenantId: string,
    limit = 50,
    page = 1,
  ): Promise<{ data: Invoice[]; total: number }> {
    const skip = (page - 1) * limit;
    const data = await this.invoiceModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await this.invoiceModel.countDocuments({
      tenantId: new Types.ObjectId(tenantId),
    });

    return { data, total };
  }

  async findForAdmin(options: {
    tenantId?: string;
    status?: InvoiceStatus | 'ALL';
    from?: string;
    to?: string;
    paymentMethod?: string;
    limit?: number;
  }): Promise<Invoice[]> {
    const {
      tenantId,
      status,
      from,
      to,
      paymentMethod,
      limit = 500,
    } = options;

    const query: Record<string, any> = {};

    if (tenantId && Types.ObjectId.isValid(tenantId)) {
      query.tenantId = new Types.ObjectId(tenantId);
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    if (from || to) {
      const createdAt: Record<string, Date> = {};
      if (from) {
        const fromDate = new Date(from);
        if (!isNaN(fromDate.getTime())) {
          createdAt.$gte = fromDate;
        }
      }
      if (to) {
        const toDate = new Date(to);
        if (!isNaN(toDate.getTime())) {
          createdAt.$lte = toDate;
        }
      }
      if (Object.keys(createdAt).length > 0) {
        query.createdAt = createdAt;
      }
    }

    const safeLimit = Math.min(Math.max(limit, 1), 1000);

    return this.invoiceModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .lean();
  }

  async findById(invoiceId: string, tenantId: string): Promise<Invoice> {
    const invoice = await this.invoiceModel.findOne({
      _id: invoiceId,
      tenantId: new Types.ObjectId(tenantId),
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async markAsPaid(
    invoiceId: string,
    transactionId?: string,
    paymentMethod?: string,
  ): Promise<Invoice> {
    const invoice = await this.invoiceModel.findById(invoiceId);

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    invoice.status = InvoiceStatus.PAID;
    invoice.paidOn = new Date();
    if (transactionId) invoice.transactionId = transactionId;
    if (paymentMethod) invoice.paymentMethod = paymentMethod;

    const saved = await invoice.save();

    this.billingNotificationService
      .notifyInvoicePaid(saved as unknown as Invoice)
      .catch(() => undefined);

    return saved;
  }

  async markAsFailed(invoiceId: string): Promise<Invoice> {
    const invoice = await this.invoiceModel.findById(invoiceId);

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    invoice.status = InvoiceStatus.FAILED;

    const saved = await invoice.save();

    this.billingNotificationService
      .notifyInvoiceFailed(saved as unknown as Invoice)
      .catch(() => undefined);

    return saved;
  }

  async refund(invoiceId: string, amount: number): Promise<Invoice> {
    const invoice = await this.invoiceModel.findById(invoiceId);

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.PAID) {
      throw new BadRequestException('Only paid invoices can be refunded');
    }

    invoice.status = InvoiceStatus.REFUNDED;
    invoice.refundedAmount = amount;
    invoice.refundedOn = new Date();

    return invoice.save();
  }

  async findByIdForAdmin(invoiceId: string): Promise<Invoice> {
    const invoice = await this.invoiceModel.findById(invoiceId);

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async updateAdminInvoice(
    invoiceId: string,
    updates: import('../dto/update-admin-invoice.dto').UpdateAdminInvoiceDto,
  ): Promise<Invoice> {
    const invoice = await this.invoiceModel.findById(invoiceId);

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (typeof updates.description === 'string') {
      invoice.description = updates.description;
    }

    if (typeof updates.notes === 'string') {
      invoice.notes = updates.notes;
    }

    if (typeof updates.dueDate === 'string') {
      const parsed = new Date(updates.dueDate);
      if (!isNaN(parsed.getTime())) {
        invoice.dueDate = parsed;
      }
    }

    if (Array.isArray(updates.lineItems)) {
      // Accept AdminInvoiceLineItemUpdateDto[] directly
      invoice.lineItems = updates.lineItems as any;
    }

    return invoice.save();
  }

  async findOne(invoiceId: string): Promise<Invoice | null> {
    return this.invoiceModel.findById(invoiceId);
  }
}
