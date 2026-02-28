import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HierarchyNode } from './hierarchy.schema';
import { CreateHierarchyNodeDto, UpdateHierarchyNodeDto } from './dto/hierarchy.dto';

const HIERARCHY_NODE_TYPES = [
  'module',
  'submodule',
  'feature',
  'subfeature',
  'option',
  'suboption',
  'point',
  'subpoint',
] as const;

@Injectable()
export class HierarchyService {
  constructor(
    @InjectModel(HierarchyNode.name)
    private readonly nodeModel: Model<HierarchyNode>,
  ) {}

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} must be a valid ObjectId`);
    }
    return new Types.ObjectId(value);
  }

  private assertValidRootType(rootType?: string): void {
    if (!rootType) return;
    if (!(HIERARCHY_NODE_TYPES as readonly string[]).includes(rootType)) {
      throw new BadRequestException('rootType is invalid');
    }
  }

  async createNode(data: CreateHierarchyNodeDto): Promise<HierarchyNode> {
    const parentObjectId =
      typeof data.parent === 'string' && data.parent
        ? this.toObjectId(data.parent, 'parent')
        : null;

    if (parentObjectId) {
      const parentExists = await this.nodeModel
        .exists({ _id: parentObjectId })
        .exec();
      if (!parentExists) {
        throw new NotFoundException('Parent node not found');
      }
    }

    return this.nodeModel.create({
      name: data.name,
      type: data.type,
      parent: parentObjectId,
      description: data.description,
      isActive: data.isActive,
    });
  }

  async getNodeById(id: string): Promise<HierarchyNode> {
    const node = await this.nodeModel
      .findById(this.toObjectId(id, 'id'))
      .exec();
    if (!node) throw new NotFoundException('Node not found');
    return node;
  }

  async getChildren(parentId: string): Promise<HierarchyNode[]> {
    return this.nodeModel
      .find({ parent: this.toObjectId(parentId, 'parentId') })
      .exec();
  }

  async updateNode(
    id: string,
    data: UpdateHierarchyNodeDto,
  ): Promise<HierarchyNode> {
    const nodeObjectId = this.toObjectId(id, 'id');

    const updatePayload: Partial<HierarchyNode> = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.type !== undefined) updatePayload.type = data.type;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.isActive !== undefined) updatePayload.isActive = data.isActive;

    if (data.parent !== undefined) {
      const parentObjectId = data.parent
        ? this.toObjectId(data.parent, 'parent')
        : null;
      if (parentObjectId && parentObjectId.equals(nodeObjectId)) {
        throw new BadRequestException('parent cannot equal id');
      }
      if (parentObjectId) {
        const parentExists = await this.nodeModel
          .exists({ _id: parentObjectId })
          .exec();
        if (!parentExists) {
          throw new NotFoundException('Parent node not found');
        }
      }
      updatePayload.parent = parentObjectId;
    }

    const updated = await this.nodeModel
      .findByIdAndUpdate(nodeObjectId, updatePayload, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`HierarchyNode with id ${id} not found`);
    }
    return updated as HierarchyNode;
  }

  async deleteNode(id: string): Promise<void> {
    const deleted = await this.nodeModel
      .findByIdAndDelete(this.toObjectId(id, 'id'))
      .exec();
    if (!deleted) {
      throw new NotFoundException('Node not found');
    }
  }

  async getTree(rootType: string = 'module'): Promise<HierarchyNode[]> {
    this.assertValidRootType(rootType);
    return this.nodeModel.find({ type: rootType, parent: null }).exec();
  }
}
