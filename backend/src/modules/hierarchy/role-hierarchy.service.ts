import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RoleHierarchyAssignment } from '../../common/schemas/role-hierarchy.schema';

@Injectable()
export class RoleHierarchyService {
  constructor(
    @InjectModel(RoleHierarchyAssignment.name)
    private readonly assignmentModel: Model<RoleHierarchyAssignment>,
  ) {}

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} must be a valid ObjectId`);
    }
    return new Types.ObjectId(value);
  }

  async assignNodesToRole(
    roleName: string,
    nodeIds: string[],
  ): Promise<RoleHierarchyAssignment> {
    const trimmedRoleName = String(roleName || '').trim();
    if (!trimmedRoleName) {
      throw new BadRequestException('roleName is required');
    }

    return this.assignmentModel
      .findOneAndUpdate(
        { roleName: trimmedRoleName },
        {
          roleName: trimmedRoleName,
          hierarchyNodes: nodeIds.map((id) => this.toObjectId(id, 'nodeIds')),
        },
        { upsert: true, new: true },
      )
      .exec();
  }

  async getNodesForRole(
    roleName: string,
  ): Promise<RoleHierarchyAssignment | null> {
    const trimmedRoleName = String(roleName || '').trim();
    if (!trimmedRoleName) {
      throw new BadRequestException('roleName is required');
    }

    return this.assignmentModel
      .findOne({ roleName: trimmedRoleName })
      .populate('hierarchyNodes')
      .exec();
  }

  async removeAssignment(roleName: string): Promise<void> {
    const trimmedRoleName = String(roleName || '').trim();
    if (!trimmedRoleName) {
      throw new BadRequestException('roleName is required');
    }

    await this.assignmentModel.deleteOne({ roleName: trimmedRoleName }).exec();
  }
}
