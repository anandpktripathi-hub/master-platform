import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tenant, TenantDocument } from '../../database/schemas/tenant.schema';

@Injectable()
export class TenantService {
  constructor(
    @InjectModel(Tenant.name)
    private readonly tenantModel: Model<TenantDocument>,
  ) {}

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (!value || !Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} is invalid`);
    }
    return new Types.ObjectId(value);
  }

  async getCurrentTenant(tenantId: string): Promise<Tenant | null> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');

    return this.tenantModel.findById(tenantObjectId).lean<Tenant>().exec();
  }
}
