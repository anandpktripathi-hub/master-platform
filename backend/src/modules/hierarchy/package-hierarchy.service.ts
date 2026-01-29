import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PackageHierarchyAssignment } from '@common-schemas/package-hierarchy.schema';

@Injectable()
export class PackageHierarchyService {
  constructor(
    @InjectModel(PackageHierarchyAssignment.name) private readonly assignmentModel: Model<PackageHierarchyAssignment>,
  ) {}

  async assignNodesToPackage(packageId: string, nodeIds: string[]): Promise<PackageHierarchyAssignment> {
    return this.assignmentModel.findOneAndUpdate(
      { packageId },
      { packageId, hierarchyNodes: nodeIds.map(id => new Types.ObjectId(id)) },
      { upsert: true, new: true },
    );
  }

  async getNodesForPackage(packageId: string): Promise<PackageHierarchyAssignment | null> {
    return this.assignmentModel.findOne({ packageId }).populate('hierarchyNodes');
  }

  async removeAssignment(packageId: string): Promise<void> {
    await this.assignmentModel.deleteOne({ packageId });
  }
}
