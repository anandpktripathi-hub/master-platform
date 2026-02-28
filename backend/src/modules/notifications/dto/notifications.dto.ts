import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserNotificationDto {
  @ApiProperty({ description: 'Notification id' })
  _id!: string;

  @ApiProperty({ description: 'Tenant id' })
  tenantId!: string;

  @ApiProperty({ description: 'User id' })
  userId!: string;

  @ApiProperty({ description: 'Event key' })
  eventKey!: string;

  @ApiProperty({ description: 'Title' })
  title!: string;

  @ApiProperty({ description: 'Message' })
  message!: string;

  @ApiPropertyOptional({ description: 'Optional link URL' })
  linkUrl?: string;

  @ApiProperty({ description: 'Read status' })
  read!: boolean;

  @ApiPropertyOptional({ description: 'Creation timestamp (ISO string)' })
  createdAt?: string;
}

export class MarkAllReadResponseDto {
  @ApiProperty({ description: 'Number of notifications updated to read=true' })
  updated!: number;
}
