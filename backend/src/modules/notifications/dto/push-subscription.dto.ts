import { IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PushSubscriptionKeysDto {
  @IsString()
  @IsNotEmpty()
  p256dh!: string;

  @IsString()
  @IsNotEmpty()
  auth!: string;
}

export class SubscribePushSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  endpoint!: string;

  @IsObject()
  @ValidateNested()
  @Type(() => PushSubscriptionKeysDto)
  keys!: PushSubscriptionKeysDto;
}

export class UnsubscribePushSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  endpoint!: string;
}
