import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserHierarchyAssignment } from '@common-schemas/user-hierarchy.schema';

@Injectable()
export class UserHierarchyService {
  constructor(
    @InjectModel(UserHierarchyAssignment.name) private readonly assignmentModel: Model<UserHierarchyAssignment>,
  ) {}

  async assignNodesToUser(userId: string, nodeIds: string[]): Promise<UserHierarchyAssignment> {
    return this.assignmentModel.findOneAndUpdate(
      { userId },
      { userId, hierarchyNodes: nodeIds.map(id => new Types.ObjectId(id)) },
      { upsert: true, new: true },
    );
  }

  async getNodesForUser(userId: string): Promise<UserHierarchyAssignment | null> {
    return this.assignmentModel.findOne({ userId }).populate('hierarchyNodes');
  }

  async removeAssignment(userId: string): Promise<void> {
    await this.assignmentModel.deleteOne({ userId });
  }
}
