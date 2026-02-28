import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Product,
  ProductDocument,
} from '../../database/schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (typeof value !== 'string' || !Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`Invalid ${fieldName}`);
    }
    return new Types.ObjectId(value);
  }

  private normalizePage(page: number | undefined): number {
    if (!Number.isFinite(page as number)) return 1;
    const p = Math.floor(page as number);
    return p < 1 ? 1 : p;
  }

  private normalizeLimit(limit: number | undefined): number {
    if (!Number.isFinite(limit as number)) return 10;
    const l = Math.floor(limit as number);
    if (l < 1) return 10;
    return Math.min(l, 100);
  }

  async countAll(tenantId: string): Promise<number> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    return this.productModel.countDocuments({ tenantId: tenantObjectId });
  }

  async countActive(tenantId: string): Promise<number> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    return this.productModel.countDocuments({ tenantId: tenantObjectId, isActive: true });
  }

  async findAll(
    tenantId: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: any[]; total: number }> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    const pageNorm = this.normalizePage(page);
    const limitNorm = this.normalizeLimit(limit);
    const skip = (pageNorm - 1) * limitNorm;
    const [products, total] = await Promise.all([
      this.productModel
        .find({ tenantId: tenantObjectId })
        .populate('category')
        .skip(skip)
        .limit(limitNorm)
        .lean()
        .exec(),
      this.productModel.countDocuments({ tenantId: tenantObjectId }),
    ]);
    return { data: products, total };
  }

  async findOne(tenantId: string, id: string): Promise<ProductDocument> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    const productObjectId = this.toObjectId(id, 'productId');
    const product = await this.productModel
      .findOne({ _id: productObjectId, tenantId: tenantObjectId })
      .populate('category')
      .lean()
      .exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product as unknown as ProductDocument;
  }
}
