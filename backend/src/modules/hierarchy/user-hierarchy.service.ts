import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserHierarchyAssignment } from '../../common/schemas/user-hierarchy.schema';

@Injectable()
export class UserHierarchyService {
  constructor(
    @InjectModel(UserHierarchyAssignment.name)
    private readonly assignmentModel: Model<UserHierarchyAssignment>,
  ) {}

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} must be a valid ObjectId`);
    }
    return new Types.ObjectId(value);
  }

  async assignNodesToUser(
    userId: string,
    nodeIds: string[],
  ): Promise<UserHierarchyAssignment> {
    const trimmedUserId = String(userId || '').trim();
    if (!trimmedUserId) {
      throw new BadRequestException('userId is required');
    }

    return this.assignmentModel
      .findOneAndUpdate(
        { userId: trimmedUserId },
        {
          userId: trimmedUserId,
          hierarchyNodes: nodeIds.map((id) => this.toObjectId(id, 'nodeIds')),
        },
        { upsert: true, new: true },
      )
      .exec();
  }

  async getNodesForUser(
    userId: string,
  ): Promise<UserHierarchyAssignment | null> {
    const trimmedUserId = String(userId || '').trim();
    if (!trimmedUserId) {
      throw new BadRequestException('userId is required');
    }

    return this.assignmentModel
      .findOne({ userId: trimmedUserId })
      .populate('hierarchyNodes')
      .exec();
  }

  async removeAssignment(userId: string): Promise<void> {
    const trimmedUserId = String(userId || '').trim();
    if (!trimmedUserId) {
      throw new BadRequestException('userId is required');
    }

    await this.assignmentModel.deleteOne({ userId: trimmedUserId }).exec();
  }
}
