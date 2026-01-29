import { Injectable, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Billing,
  BillingDocument,
} from '../../database/schemas/billing.schema';
import { BillingNotificationService } from './billing-notification.service';
import { TenantsService } from '../tenants/tenants.service';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @InjectModel(Billing.name) private billingModel: Model<BillingDocument>,
    private readonly billingNotifications: BillingNotificationService,
    private readonly tenantsService: TenantsService,
  ) {}

  async findAll(tenantId: string): Promise<Billing[]> {
    try {
      this.logger.log(`Fetching all billing records for tenant: ${tenantId}`);
      return await this.billingModel.find({ tenantId }).exec();
    } catch (error) {
      this.logger.error(`Error fetching billing records for tenant ${tenantId}:`, error);
      throw new InternalServerErrorException('Failed to fetch billing records');
    }
  }

  async findOne(id: string): Promise<Billing | null> {
    try {
      this.logger.log(`Fetching billing record with id: ${id}`);
      const billing = await this.billingModel.findById(id).exec();
      if (!billing) {
        this.logger.warn(`Billing record not found: ${id}`);
        throw new NotFoundException(`Billing record with id ${id} not found`);
      }
      return billing;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching billing record ${id}:`, error);
      throw new InternalServerErrorException('Failed to fetch billing record');
    }
  }

  async create(createBillingDto: Billing, tenantId: string): Promise<Billing> {
    try {
      this.logger.log(`Creating billing record for tenant: ${tenantId}`);
      const createdBilling = new this.billingModel({
        ...createBillingDto,
        tenantId,
      });
      const saved = await createdBilling.save();

      // Fire invoice-created notification if email is configured.
      // Note: Billing schema stores amount in major units; convert to cents for consistency.
      await this.billingNotifications
        .sendInvoiceCreatedEmail({
          to: await this.resolveTenantBillingEmail(tenantId),
          tenantId,
          invoiceNumber: saved._id.toString(),
          amount: Math.round(saved.amount * 100),
          currency: saved.currency,
        })
        .catch((err) =>
          this.logger.error('Failed to send billing invoice notification', err as any),
        );

      return saved;
    } catch (error) {
      this.logger.error(`Error creating billing record for tenant ${tenantId}:`, error);
      throw new InternalServerErrorException('Failed to create billing record');
    }
  }

  private async resolveTenantBillingEmail(tenantId: string): Promise<string> {
    try {
      const email = await this.tenantsService.getTenantBillingEmail(tenantId);
      return email || 'billing-notifications@platform.local';
    } catch (error) {
      this.logger.error(
        `Error resolving tenant billing email for tenant ${tenantId}`,
        error as any,
      );
      return 'billing-notifications@platform.local';
    }
  }

  async update(
    id: string,
    updateBillingDto: Billing,
    tenantId: string,
  ): Promise<Billing | null> {
    try {
      this.logger.log(`Updating billing record ${id} for tenant: ${tenantId}`);
      const updated = await this.billingModel
        .findByIdAndUpdate(id, { ...updateBillingDto, tenantId }, { new: true })
        .exec();
      if (!updated) {
        this.logger.warn(`Billing record not found for update: ${id}`);
        throw new NotFoundException(`Billing record with id ${id} not found`);
      }
      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating billing record ${id}:`, error);
      throw new InternalServerErrorException('Failed to update billing record');
    }
  }

  async remove(id: string) {
    try {
      this.logger.log(`Removing billing record: ${id}`);
      const deleted = await this.billingModel.findByIdAndDelete(id).exec();
      if (!deleted) {
        this.logger.warn(`Billing record not found for deletion: ${id}`);
        throw new NotFoundException(`Billing record with id ${id} not found`);
      }
      return deleted;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error removing billing record ${id}:`, error);
      throw new InternalServerErrorException('Failed to remove billing record');
    }
  }
}
