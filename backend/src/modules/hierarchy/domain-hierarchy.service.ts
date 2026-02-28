import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DomainHierarchyAssignment } from '../../common/schemas/domain-hierarchy.schema';

@Injectable()
export class DomainHierarchyService {
  constructor(
    @InjectModel(DomainHierarchyAssignment.name)
    private readonly assignmentModel: Model<DomainHierarchyAssignment>,
  ) {}

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} must be a valid ObjectId`);
    }
    return new Types.ObjectId(value);
  }

  async assignNodesToDomain(
    domainId: string,
    nodeIds: string[],
  ): Promise<DomainHierarchyAssignment> {
    const trimmedDomainId = String(domainId || '').trim();
    if (!trimmedDomainId) {
      throw new BadRequestException('domainId is required');
    }

    return this.assignmentModel
      .findOneAndUpdate(
        { domainId: trimmedDomainId },
        {
          domainId: trimmedDomainId,
          hierarchyNodes: nodeIds.map((id) => this.toObjectId(id, 'nodeIds')),
        },
        { upsert: true, new: true },
      )
      .exec();
  }

  async getNodesForDomain(
    domainId: string,
  ): Promise<DomainHierarchyAssignment | null> {
    const trimmedDomainId = String(domainId || '').trim();
    if (!trimmedDomainId) {
      throw new BadRequestException('domainId is required');
    }

    return this.assignmentModel
      .findOne({ domainId: trimmedDomainId })
      .populate('hierarchyNodes')
      .exec();
  }

  async removeAssignment(domainId: string): Promise<void> {
    const trimmedDomainId = String(domainId || '').trim();
    if (!trimmedDomainId) {
      throw new BadRequestException('domainId is required');
    }

    await this.assignmentModel.deleteOne({ domainId: trimmedDomainId }).exec();
  }
}
