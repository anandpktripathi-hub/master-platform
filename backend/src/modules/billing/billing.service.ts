import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Billing,
  BillingDocument,
} from '../../database/schemas/billing.schema';

@Injectable()
export class BillingService {
  constructor(
    @InjectModel(Billing.name) private billingModel: Model<BillingDocument>,
  ) {}

  async findAll(tenantId: string): Promise<Billing[]> {
    return this.billingModel.find({ tenantId }).exec();
  }

  async findOne(id: string): Promise<Billing | null> {
    return this.billingModel.findById(id).exec();
  }

  async create(createBillingDto: Billing, tenantId: string): Promise<Billing> {
    const createdBilling = new this.billingModel({
      ...createBillingDto,
      tenantId,
    });
    return createdBilling.save();
  }

  async update(
    id: string,
    updateBillingDto: Billing,
    tenantId: string,
  ): Promise<Billing | null> {
    return this.billingModel
      .findByIdAndUpdate(id, { ...updateBillingDto, tenantId }, { new: true })
      .exec();
  }

  async remove(id: string) {
    return this.billingModel.findByIdAndDelete(id).exec();
  }
}
