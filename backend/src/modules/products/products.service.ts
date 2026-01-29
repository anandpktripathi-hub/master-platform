import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Product,
  ProductDocument,
} from '../../database/schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async countAll(): Promise<number> {
    return this.productModel.countDocuments();
  }

  async countActive(): Promise<number> {
    return this.productModel.countDocuments({ isActive: true });
  }

  async findAll(page = 1, limit = 10): Promise<{ data: any[]; total: number }> {
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      this.productModel
        .find()
        .populate('category')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.productModel.countDocuments(),
    ]);
    return { data: products, total };
  }

  async findOne(id: string): Promise<ProductDocument> {
    const product = await this.productModel
      .findById(id)
      .populate('category')
      .lean()
      .exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product as unknown as ProductDocument;
  }
}
