import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RoleHierarchyAssignment } from '@common-schemas/role-hierarchy.schema';

@Injectable()
export class RoleHierarchyService {
  constructor(
    @InjectModel(RoleHierarchyAssignment.name) private readonly assignmentModel: Model<RoleHierarchyAssignment>,
  ) {}

  async assignNodesToRole(roleName: string, nodeIds: string[]): Promise<RoleHierarchyAssignment> {
    return this.assignmentModel.findOneAndUpdate(
      { roleName },
      { roleName, hierarchyNodes: nodeIds.map(id => new Types.ObjectId(id)) },
      { upsert: true, new: true },
    );
  }

  async getNodesForRole(roleName: string): Promise<RoleHierarchyAssignment | null> {
    return this.assignmentModel.findOne({ roleName }).populate('hierarchyNodes');
  }

  async removeAssignment(roleName: string): Promise<void> {
    await this.assignmentModel.deleteOne({ roleName });
  }
}
