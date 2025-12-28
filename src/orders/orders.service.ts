import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderStatus } from './order.schema';
import { CreateOrderDto, UpdateOrderStatusDto } from './order.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel('Order') private orderModel: Model<Order>,
    private emailService: EmailService,
  ) {}

  async create(
    createOrderDto: CreateOrderDto,
    userId: string,
    tenantId: string,
  ) {
    const orderNumber = `ORD-${Date.now()}`;

    const order = await this.orderModel.create({
      ...createOrderDto,
      tenantId,
      orderNumber,
      customerId: userId,
      status: 'PENDING',
      paymentStatus: 'PENDING',
    });

    return order;
  }

  async findAll(tenantId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find({ tenantId })
        .populate('customerId')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.orderModel.countDocuments({ tenantId }),
    ]);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, tenantId: string) {
    const order = await this.orderModel
      .findOne({ _id: id, tenantId })
      .populate('customerId');
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async findByCustomer(customerId: string, tenantId: string) {
    return this.orderModel
      .find({ customerId, tenantId })
      .populate('customerId')
      .sort({ createdAt: -1 });
  }

  async updateStatus(
    id: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
    tenantId: string,
  ) {
    const order = await this.orderModel.findOne({ _id: id, tenantId });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: [],
      CANCELLED: [],
    };

    const allowedStatuses = validTransitions[order.status];
    if (!allowedStatuses.includes(updateOrderStatusDto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${order.status} to ${updateOrderStatusDto.status}`,
      );
    }

    order.status = updateOrderStatusDto.status;
    await order.save();

    return order;
  }

  async cancel(id: string, tenantId: string) {
    const order = await this.orderModel.findOne({ _id: id, tenantId });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (['DELIVERED', 'CANCELLED'].includes(order.status)) {
      throw new BadRequestException(
        `Cannot cancel order with status ${order.status}`,
      );
    }

    order.status = 'CANCELLED';
    order.cancelledAt = new Date();
    await order.save();

    return order;
  }
}
