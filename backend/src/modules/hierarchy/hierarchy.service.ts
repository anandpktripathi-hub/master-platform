import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HierarchyNode } from './hierarchy.schema';

@Injectable()
export class HierarchyService {
  constructor(
    @InjectModel(HierarchyNode.name)
    private readonly nodeModel: Model<HierarchyNode>,
  ) {}

  async createNode(data: Partial<HierarchyNode>): Promise<HierarchyNode> {
    return this.nodeModel.create(data);
  }

  async getNodeById(id: string): Promise<HierarchyNode> {
    const node = await this.nodeModel.findById(id);
    if (!node) throw new NotFoundException('Node not found');
    return node;
  }

  async getChildren(parentId: string): Promise<HierarchyNode[]> {
    return this.nodeModel.find({ parent: parentId });
  }

  async updateNode(
    id: string,
    data: Partial<HierarchyNode>,
  ): Promise<HierarchyNode> {
    const updated = await this.nodeModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`HierarchyNode with id ${id} not found`);
    }
    return updated as HierarchyNode;
  }

  async deleteNode(id: string): Promise<void> {
    await this.nodeModel.findByIdAndDelete(id);
  }

  async getTree(rootType: string = 'module'): Promise<HierarchyNode[]> {
    return this.nodeModel.find({ type: rootType, parent: null });
  }
}
