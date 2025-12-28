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

@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel('Invoice') private invoiceModel: Model<InvoiceDocument>,
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

    return invoice.save();
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

    return invoice.save();
  }

  async markAsFailed(invoiceId: string): Promise<Invoice> {
    const invoice = await this.invoiceModel.findById(invoiceId);

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    invoice.status = InvoiceStatus.FAILED;
    return invoice.save();
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
}
