import { IsString, IsArray, IsNumber, IsEnum } from 'class-validator';
import { Types } from 'mongoose';

export class CreateOrderDto {
  @IsArray()
  items: Array<{
    productId: Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
  }>;

  @IsNumber()
  totalAmount: number;
}

export class UpdateOrderDto {
  @IsString()
  status: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
}
