import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BillingHierarchyAssignment } from '../../common/schemas/billing-hierarchy.schema';

@Injectable()
export class BillingHierarchyService {
  constructor(
    @InjectModel(BillingHierarchyAssignment.name)
    private readonly assignmentModel: Model<BillingHierarchyAssignment>,
  ) {}

  async assignNodesToBilling(
    billingId: string,
    nodeIds: string[],
  ): Promise<BillingHierarchyAssignment> {
    return this.assignmentModel.findOneAndUpdate(
      { billingId },
      {
        billingId,
        hierarchyNodes: nodeIds.map((id) => new Types.ObjectId(id)),
      },
      { upsert: true, new: true },
    );
  }

  async getNodesForBilling(
    billingId: string,
  ): Promise<BillingHierarchyAssignment | null> {
    return this.assignmentModel
      .findOne({ billingId })
      .populate('hierarchyNodes');
  }

  async removeAssignment(billingId: string): Promise<void> {
    await this.assignmentModel.deleteOne({ billingId });
  }
}
