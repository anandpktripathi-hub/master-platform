import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category } from './category.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel('Category') private categoryModel: Model<Category>) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const { name, parentId } = createCategoryDto;

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const existingCategory = await this.categoryModel.findOne({ slug });
    if (existingCategory) {
      throw new BadRequestException('Category with this name already exists');
    }

    let level = 0;
    let ancestors: Types.ObjectId[] = [];

    if (parentId) {
      const parent = await this.categoryModel.findById(parentId);
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
      level = parent.level + 1;
      ancestors = [...parent.ancestors, parent._id as Types.ObjectId];
    }

    const category = await this.categoryModel.create({
      ...createCategoryDto,
      slug,
      level,
      ancestors,
    });

    return category;
  }

  async findAll() {
    return this.categoryModel.find().populate('parentId').sort({ level: 1, name: 1 });
  }

  async findById(id: string) {
    const category = await this.categoryModel.findById(id).populate('parentId');
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async findChildren(id: string) {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return this.categoryModel.find({ parentId: id });
  }

  async getCategoryTree() {
    const categories = await this.categoryModel.find().sort({ level: 1, name: 1 });
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

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryModel.findById(id);
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

  async remove(id: string) {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const hasChildren = await this.categoryModel.findOne({ parentId: id });
    if (hasChildren) {
      throw new BadRequestException('Cannot delete category with children. Delete children first.');
    }

    await category.deleteOne();
    return { message: 'Category deleted successfully' };
  }
}
