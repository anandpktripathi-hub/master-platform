import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BillingHierarchyAssignment } from '../../common/schemas/billing-hierarchy.schema';

@Injectable()
export class BillingHierarchyService {
  constructor(
    @InjectModel(BillingHierarchyAssignment.name)
    private readonly assignmentModel: Model<BillingHierarchyAssignment>,
  ) {}

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} must be a valid ObjectId`);
    }
    return new Types.ObjectId(value);
  }

  async assignNodesToBilling(
    billingId: string,
    nodeIds: string[],
  ): Promise<BillingHierarchyAssignment> {
    const trimmedBillingId = String(billingId || '').trim();
    if (!trimmedBillingId) {
      throw new BadRequestException('billingId is required');
    }

    return this.assignmentModel
      .findOneAndUpdate(
        { billingId: trimmedBillingId },
        {
          billingId: trimmedBillingId,
          hierarchyNodes: nodeIds.map((id) => this.toObjectId(id, 'nodeIds')),
        },
        { upsert: true, new: true },
      )
      .exec();
  }

  async getNodesForBilling(
    billingId: string,
  ): Promise<BillingHierarchyAssignment | null> {
    const trimmedBillingId = String(billingId || '').trim();
    if (!trimmedBillingId) {
      throw new BadRequestException('billingId is required');
    }

    return this.assignmentModel
      .findOne({ billingId: trimmedBillingId })
      .populate('hierarchyNodes')
      .exec();
  }

  async removeAssignment(billingId: string): Promise<void> {
    const trimmedBillingId = String(billingId || '').trim();
    if (!trimmedBillingId) {
      throw new BadRequestException('billingId is required');
    }

    await this.assignmentModel
      .deleteOne({ billingId: trimmedBillingId })
      .exec();
  }
}
