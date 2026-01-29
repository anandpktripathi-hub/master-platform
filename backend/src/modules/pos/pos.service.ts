import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WarehouseStock, WarehouseStockDocument } from '../../database/schemas/warehouse-stock.schema';
import { StockMovement, StockMovementDocument } from '../../database/schemas/stock-movement.schema';
import { PosOrder, PosOrderDocument } from '../../database/schemas/pos-order.schema';
import { Product, ProductDocument } from '../../database/schemas/product.schema';

interface OrderItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
}

interface CreateOrderInput {
  items: OrderItemInput[];
  paymentMethod?: string;
  customerName?: string;
}

interface AdjustStockInput {
  productId: string;
  quantityDelta: number;
  type: 'sale' | 'purchase' | 'adjustment';
  reason?: string;
  minStock?: number;
}

@Injectable()
export class PosService {
  constructor(
    @InjectModel(WarehouseStock.name) private readonly stockModel: Model<WarehouseStockDocument>,
    @InjectModel(StockMovement.name) private readonly movementModel: Model<StockMovementDocument>,
    @InjectModel(PosOrder.name) private readonly orderModel: Model<PosOrderDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) {}

  private toObjectId(id: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID');
    }
    return new Types.ObjectId(id);
  }

  async getSummary(tenantId: string): Promise<{ totalSales: number; totalOrders: number; lowStockItems: number }> {
    const tenantObjectId = this.toObjectId(tenantId);

    const [salesAgg, ordersCount, lowStockItems] = await Promise.all([
      this.orderModel
        .aggregate([
          { $match: { tenantId: tenantObjectId } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ])
        .exec(),
      this.orderModel.countDocuments({ tenantId: tenantObjectId }).exec(),
      this.stockModel.countDocuments({ tenantId: tenantObjectId, $expr: { $lte: ['$quantity', '$minStock'] } }).exec(),
    ]);

    const totalSales = salesAgg[0]?.total || 0;

    return { totalSales, totalOrders: ordersCount, lowStockItems };
  }

  async listStock(tenantId: string) {
    const tenantObjectId = this.toObjectId(tenantId);
    return this.stockModel
      .find({ tenantId: tenantObjectId })
      .populate('productId')
      .lean()
      .exec();
  }

  async adjustStock(tenantId: string, input: AdjustStockInput) {
    const tenantObjectId = this.toObjectId(tenantId);
    const productObjectId = this.toObjectId(input.productId);

    const product = await this.productModel.findById(productObjectId).lean().exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const stock = await this.stockModel
      .findOneAndUpdate(
        { tenantId: tenantObjectId, productId: productObjectId },
        {
          $inc: { quantity: input.quantityDelta },
          $set: { minStock: input.minStock ?? 0 },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec();

    await this.movementModel.create({
      tenantId: tenantObjectId,
      productId: productObjectId,
      type: input.type,
      quantityDelta: input.quantityDelta,
      reason: input.reason,
    });

    if (stock.quantity < 0) {
      // Rollback-like safeguard
      await this.stockModel.updateOne(
        { _id: stock._id },
        { $inc: { quantity: -input.quantityDelta } },
      );
      throw new BadRequestException('Stock cannot be negative');
    }

    return stock;
  }

  async listOrders(tenantId: string, limit = 50) {
    const tenantObjectId = this.toObjectId(tenantId);
    return this.orderModel
      .find({ tenantId: tenantObjectId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();
  }

  async createOrder(tenantId: string, input: CreateOrderInput) {
    const tenantObjectId = this.toObjectId(tenantId);

    if (!input.items || input.items.length === 0) {
      throw new BadRequestException('Order must have at least one item');
    }

    const productIds = input.items.map((i) => this.toObjectId(i.productId));
    const products = await this.productModel
      .find({ _id: { $in: productIds } })
      .lean()
      .exec();

    const productMap = new Map<string, any>();
    products.forEach((p: any) => productMap.set(String(p._id), p));

    const items = input.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new NotFoundException(`Product not found: ${item.productId}`);
      }
      if (item.quantity <= 0) {
        throw new BadRequestException('Quantity must be greater than zero');
      }
      const unitPrice = item.unitPrice ?? product.price;
      const lineTotal = unitPrice * item.quantity;
      return {
        productId: this.toObjectId(item.productId),
        nameSnapshot: product.name,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
      };
    });

    const totalAmount = items.reduce((sum, i) => sum + i.lineTotal, 0);

    const session = await this.orderModel.db.startSession();
    session.startTransaction();

    try {
      const order = await this.orderModel.create([
        {
          tenantId: tenantObjectId,
          items,
          totalAmount,
          status: 'completed',
          paymentMethod: input.paymentMethod,
          customerName: input.customerName,
        },
      ], { session });

      // Decrement stock and create movements
      for (const item of items) {
        const stock = await this.stockModel
          .findOneAndUpdate(
            { tenantId: tenantObjectId, productId: item.productId },
            { $inc: { quantity: -item.quantity } },
            { upsert: true, new: true, setDefaultsOnInsert: true, session },
          )
          .exec();

        if (stock.quantity < 0) {
          throw new BadRequestException('Insufficient stock for sale');
        }

        await this.movementModel.create([
          {
            tenantId: tenantObjectId,
            productId: item.productId,
            orderId: order[0]._id,
            type: 'sale',
            quantityDelta: -item.quantity,
            reason: 'POS sale',
          },
        ], { session });
      }

      await session.commitTransaction();
      session.endSession();

      return order[0];
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
