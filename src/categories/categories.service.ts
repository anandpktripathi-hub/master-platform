import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category } from './category.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel('Category') private categoryModel: Model<Category>) {}

  async create(createCategoryDto: CreateCategoryDto, tenantId: string) {
    const { name, parentId } = createCategoryDto;

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const existingCategory = await this.categoryModel.findOne({ slug, tenantId });
    if (existingCategory) {
      throw new BadRequestException('Category with this name already exists');
    }

    let level = 0;
    let ancestors: Types.ObjectId[] = [];

    if (parentId) {
      const parent = await this.categoryModel.findOne({ _id: parentId, tenantId });
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
      level = parent.level + 1;
      ancestors = [...parent.ancestors, parent._id as Types.ObjectId];
    }

    const category = await this.categoryModel.create({
      ...createCategoryDto,
      tenantId,
      slug,
      level,
      ancestors,
    });

    return category;
  }

  async findAll(tenantId: string) {
    return this.categoryModel.find({ tenantId }).populate('parentId').sort({ level: 1, name: 1 });
  }

  async findById(id: string, tenantId: string) {
    const category = await this.categoryModel.findOne({ _id: id, tenantId }).populate('parentId');
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async findChildren(id: string, tenantId: string) {
    const category = await this.categoryModel.findOne({ _id: id, tenantId });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return this.categoryModel.find({ parentId: id, tenantId });
  }

  async getCategoryTree(tenantId: string) {
    const categories = await this.categoryModel.find({ tenantId }).sort({ level: 1, name: 1 });
    return this.buildTree(categories);
  }

  private buildTree(categories: any[], parentId: any = null): any[] {
    const tree: any[] = [];
    const filteredCategories = categories.filter(cat => {
      if (parentId === null) {
        return cat.parentId === null || cat.parentId === undefined;
      }
      return cat.parentId && cat.parentId.toString() === parentId.toString();
    });

    for (const category of filteredCategories) {
      const node = {
        ...category.toObject(),
        children: this.buildTree(categories, category._id),
      };
      tree.push(node);
    }

    return tree;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, tenantId: string) {
    const category = await this.categoryModel.findOne({ _id: id, tenantId });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const slug = updateCategoryDto.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      (updateCategoryDto as any).slug = slug;
    }

    Object.assign(category, updateCategoryDto);
    await category.save();

    return category;
  }

  async remove(id: string, tenantId: string) {
    const category = await this.categoryModel.findOne({ _id: id, tenantId });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const hasChildren = await this.categoryModel.findOne({ parentId: id, tenantId });
    if (hasChildren) {
      throw new BadRequestException('Cannot delete category with children. Delete children first.');
    }

    await category.deleteOne();
    return { message: 'Category deleted successfully' };
  }
}
