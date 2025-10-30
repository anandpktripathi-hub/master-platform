import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../../database/schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private productModel: Model<Product>) {}

  async findAll(page = 1, limit = 10): Promise<{ data: Product[]; total: number }> {
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      this.productModel.find().populate('category').skip(skip).limit(limit).lean().exec(),
      this.productModel.countDocuments(),
    ]);
    return { data: products, total };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).populate('category').lean().exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }
}
