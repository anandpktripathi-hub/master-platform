import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Invoice } from '../schemas/invoice.schema';
import { Tenant, TenantDocument } from '../../schemas/tenant.schema';
import { User } from '../../schemas/user.schema';
import { EmailService } from '../../email/email.service';

@Injectable()
export class BillingNotificationService {
  private readonly logger = new Logger(BillingNotificationService.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    @InjectModel(Tenant.name) private readonly tenantModel: Model<TenantDocument>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async notifyInvoiceCreated(invoice: Invoice): Promise<void> {
    await this.sendInvoiceEmail('invoice-created', invoice, 'New invoice issued');
  }

  async notifyInvoicePaid(invoice: Invoice): Promise<void> {
    await this.sendInvoiceEmail('invoice-paid', invoice, 'Payment received');
  }

  async notifyInvoiceFailed(invoice: Invoice): Promise<void> {
    await this.sendInvoiceEmail('invoice-failed', invoice, 'Payment failed');
  }

  private async sendInvoiceEmail(
    templateName: string,
    invoice: Invoice,
    defaultSubject: string,
  ): Promise<void> {
    try {
      const recipient = await this.resolveTenantBillingRecipient(invoice);
      if (!recipient) {
        this.logger.warn(
          `No billing recipient found for tenant ${invoice['tenantId']} – skipping ${templateName} email`,
        );
        return;
      }

      const amountMajor = (invoice.amount || 0) / 100;
      const currency = (invoice.currency || 'USD').toUpperCase();

      const appName =
        this.configService.get<string>('APP_NAME') || 'Master Platform';
      const publicUrl =
        this.configService.get<string>('PUBLIC_APP_URL') ||
        process.env.FRONTEND_URL ||
        'http://localhost:3000';

      const invoiceUrl = `${publicUrl.replace(/\/$/, '')}/app/billing/invoices`; // generic billing URL

      const subject = `${appName}: ${defaultSubject} – ${invoice.invoiceNumber || invoice['_id']}`;

      await this.emailService.sendCustomTemplateEmail(
        recipient.email,
        subject,
        templateName,
        {
          recipientName: recipient.name,
          companyName: recipient.companyName,
          appName,
          invoiceNumber: invoice.invoiceNumber || String(invoice['_id']),
          invoiceAmount: amountMajor.toFixed(2),
          invoiceCurrency: currency,
          invoiceStatus: invoice['status'] || '',
          dueDate: invoice['dueDate']
            ? new Date(invoice['dueDate']).toLocaleDateString()
            : undefined,
          invoiceUrl,
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to send ${templateName} email for invoice ${invoice['_id']}: ${
          (error as Error).message || error
        }`,
      );
    }
  }

  private async resolveTenantBillingRecipient(invoice: Invoice): Promise<
    | {
        email: string;
        name: string;
        companyName: string;
      }
    | null
  > {
    try {
      const tenantIdRaw = invoice['tenantId'];
      if (!tenantIdRaw) {
        return null;
      }

      const tenantId = new Types.ObjectId(String(tenantIdRaw));

      const tenant = await this.tenantModel
        .findById(tenantId)
        .lean<{ name?: string }>();

      const primaryUser = await this.userModel
        .findOne({ tenant: tenantId, role: { $in: ['TENANT_OWNER', 'ADMIN'] } })
        .lean<{ email: string; firstName?: string; lastName?: string }>();

      if (!primaryUser || !primaryUser.email) {
        return null;
      }

      const fullName = [primaryUser.firstName, primaryUser.lastName]
        .filter(Boolean)
        .join(' ');

      return {
        email: primaryUser.email,
        name: fullName || tenant?.name || primaryUser.email,
        companyName: tenant?.name || '',
      };
    } catch (error) {
      this.logger.error(
        `Error resolving billing recipient for invoice ${invoice['_id']}: ${
          (error as Error).message || error
        }`,
      );
      return null;
    }
  }
}
