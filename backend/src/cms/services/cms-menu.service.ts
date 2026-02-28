// === CMS TYPES & ENUMS ===
import {
  CmsPageEntity,
  CmsPageVersionEntity,
  CmsPageTemplateEntity,
  CmsMenuItemEntity,
} from '../entities/cms.entities';
import { Model } from 'mongoose';
import { Repository } from 'typeorm';
// === END IMPORTS ===

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateMenuItemDto } from '../dto/create-menu-item.dto';
import { Types } from 'mongoose';

@Injectable()
export class CmsMenuService {
  constructor(
    @InjectModel(CmsMenuItemEntity.name)
    private menuItemRepo: Model<CmsMenuItemEntity>,
  ) {}

  private assertObjectId(value: string, fieldName: string): void {
    if (typeof value !== 'string' || !Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`Invalid ${fieldName}`);
    }
  }

  private assertNonEmptyString(value: string, fieldName: string): void {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new BadRequestException(`Invalid ${fieldName}`);
    }
  }

  async createMenuItem(
    tenantId: string,
    menuId: string,
    dto: CreateMenuItemDto,
  ): Promise<CmsMenuItemEntity> {
    this.assertNonEmptyString(tenantId, 'tenantId');
    this.assertNonEmptyString(menuId, 'menuId');
    const item = {
      tenantId,
      menuName: menuId,
      label: dto.label,
      url: dto.url,
      pageId: dto.pageId,
      sortOrder: dto.order || 0,
      parentItemId: dto.parentItemId,
      isVisible: dto.isVisible !== false,
    };
    return this.menuItemRepo.create(item);
  }

  async getMenu(
    tenantId: string,
    menuId: string,
  ): Promise<CmsMenuItemEntity[]> {
    this.assertNonEmptyString(tenantId, 'tenantId');
    this.assertNonEmptyString(menuId, 'menuId');
    return this.menuItemRepo
      .find({ tenantId, menuName: menuId })
      .sort({ sortOrder: 1 });
  }

  async buildMenuTree(tenantId: string, menuId: string): Promise<any[]> {
    this.assertNonEmptyString(tenantId, 'tenantId');
    this.assertNonEmptyString(menuId, 'menuId');
    const items = await this.getMenu(tenantId, menuId);
    const tree: any[] = [];
    const map = new Map();
    items.forEach((item) => {
      map.set(item._id, {
        ...item,
        children: [],
      });
    });
    items.forEach((item) => {
      if (item.parentItemId) {
        const parent = map.get(item.parentItemId);
        if (parent) {
          parent.children.push(map.get(item._id));
        }
      } else {
        tree.push(map.get(item._id));
      }
    });
    return tree;
  }

  async updateMenuItem(
    tenantId: string,
    itemId: string,
    dto: Partial<CreateMenuItemDto>,
  ): Promise<CmsMenuItemEntity> {
    this.assertNonEmptyString(tenantId, 'tenantId');
    this.assertObjectId(itemId, 'itemId');
    const item = await this.menuItemRepo.findOne({ _id: itemId, tenantId });
    if (!item) {
      throw new NotFoundException('Menu item not found');
    }
    const updateData: any = {};
    if (dto.label) updateData.label = dto.label;
    if (dto.url) updateData.url = dto.url;
    if (dto.order !== undefined) updateData.sortOrder = dto.order;
    if (dto.isVisible !== undefined) updateData.isVisible = dto.isVisible;
    await this.menuItemRepo.findByIdAndUpdate(itemId, updateData);
    const result = await this.menuItemRepo.findById(itemId);
    if (!result) throw new NotFoundException('Menu item not found');
    return result;
  }

  async deleteMenuItem(tenantId: string, itemId: string): Promise<void> {
    this.assertNonEmptyString(tenantId, 'tenantId');
    this.assertObjectId(itemId, 'itemId');
    const result = await this.menuItemRepo.deleteMany({
      _id: itemId,
      tenantId,
    });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Menu item not found');
    }
  }

  async reorderMenu(
    tenantId: string,
    menuId: string,
    order: { id: string; order: number }[],
  ): Promise<void> {
    this.assertNonEmptyString(tenantId, 'tenantId');
    this.assertNonEmptyString(menuId, 'menuId');
    for (const item of order) {
      this.assertObjectId(item.id, 'id');
      await this.menuItemRepo.findByIdAndUpdate(item.id, {
        sortOrder: item.order,
      });
    }
  }
}
