import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CouponIdParamDto {
  @ApiProperty({ description: 'Coupon id' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  couponId!: string;
}
