import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PackageHierarchyAssignment } from '../../common/schemas/package-hierarchy.schema';

@Injectable()
export class PackageHierarchyService {
  constructor(
    @InjectModel(PackageHierarchyAssignment.name)
    private readonly assignmentModel: Model<PackageHierarchyAssignment>,
  ) {}

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} must be a valid ObjectId`);
    }
    return new Types.ObjectId(value);
  }

  async assignNodesToPackage(
    packageId: string,
    nodeIds: string[],
  ): Promise<PackageHierarchyAssignment> {
    const trimmedPackageId = String(packageId || '').trim();
    if (!trimmedPackageId) {
      throw new BadRequestException('packageId is required');
    }

    return this.assignmentModel
      .findOneAndUpdate(
        { packageId: trimmedPackageId },
        {
          packageId: trimmedPackageId,
          hierarchyNodes: nodeIds.map((id) => this.toObjectId(id, 'nodeIds')),
        },
        { upsert: true, new: true },
      )
      .exec();
  }

  async getNodesForPackage(
    packageId: string,
  ): Promise<PackageHierarchyAssignment | null> {
    const trimmedPackageId = String(packageId || '').trim();
    if (!trimmedPackageId) {
      throw new BadRequestException('packageId is required');
    }

    return this.assignmentModel
      .findOne({ packageId: trimmedPackageId })
      .populate('hierarchyNodes')
      .exec();
  }

  async removeAssignment(packageId: string): Promise<void> {
    const trimmedPackageId = String(packageId || '').trim();
    if (!trimmedPackageId) {
      throw new BadRequestException('packageId is required');
    }

    await this.assignmentModel
      .deleteOne({ packageId: trimmedPackageId })
      .exec();
  }
}
