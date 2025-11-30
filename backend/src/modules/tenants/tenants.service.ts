import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tenant, TenantDocument } from '../../database/schemas/tenant.schema';
import { PlanKey } from '../../config/plans.config';

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel(Tenant.name)
    private readonly tenantModel: Model<TenantDocument>,
  ) {}

  async createTenant(name: string, createdByUserId: Types.ObjectId, planKey: PlanKey = 'FREE') {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const tenant = new this.tenantModel({
      name,
      slug,
      companyName: name,
      createdByUserId,
      planKey,
      status: 'trialing',
      isActive: true,
    });
    return tenant.save();
  }

  async getCurrentTenant(tenantId: string) {
    return this.tenantModel.findById(tenantId).lean();
  }
}
