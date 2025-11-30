import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './product.schema';
import { CreateProductDto, UpdateProductDto } from './product.dto';

@Injectable()
export class ProductsService {
  constructor(@InjectModel('Product') private productModel: Model<Product>) {}

  async create(createProductDto: CreateProductDto) {
    const product = await this.productModel.create(createProductDto);
    return product;
  }

  async findAll(page: number = 1, limit: number = 10, search?: string, categoryId?: string) {
    const skip = (page - 1) * limit;
    
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (categoryId) {
      filter.categoryId = categoryId;
    }

    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('categoryId')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.productModel.countDocuments(filter),
    ]);

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const product = await this.productModel.findById(id).populate('categoryId');
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async search(query: string) {
    return this.productModel
      .find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { sku: { $regex: query, $options: 'i' } },
        ],
      })
      .populate('categoryId')
      .limit(20);
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    Object.assign(product, updateProductDto);
    await product.save();

    return product;
  }

  async remove(id: string) {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await product.deleteOne();
    return { message: 'Product deleted successfully' };
  }

  async updateStock(id: string, quantity: number) {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    product.stock += quantity;
    await product.save();

    return product;
  }
}
