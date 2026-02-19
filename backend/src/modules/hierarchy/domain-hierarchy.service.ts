import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DomainHierarchyAssignment } from '../../common/schemas/domain-hierarchy.schema';

@Injectable()
export class DomainHierarchyService {
  constructor(
    @InjectModel(DomainHierarchyAssignment.name)
    private readonly assignmentModel: Model<DomainHierarchyAssignment>,
  ) {}

  async assignNodesToDomain(
    domainId: string,
    nodeIds: string[],
  ): Promise<DomainHierarchyAssignment> {
    return this.assignmentModel.findOneAndUpdate(
      { domainId },
      { domainId, hierarchyNodes: nodeIds.map((id) => new Types.ObjectId(id)) },
      { upsert: true, new: true },
    );
  }

  async getNodesForDomain(
    domainId: string,
  ): Promise<DomainHierarchyAssignment | null> {
    return this.assignmentModel
      .findOne({ domainId })
      .populate('hierarchyNodes');
  }

  async removeAssignment(domainId: string): Promise<void> {
    await this.assignmentModel.deleteOne({ domainId });
  }
}
