import { IsIn, IsMongoId, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  subject!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  message!: string;
}

export class UpdateTicketStatusDto {
  @IsIn(['open', 'in_progress', 'resolved', 'closed'])
  status!: 'open' | 'in_progress' | 'resolved' | 'closed';
}

export class TicketIdParamDto {
  @IsMongoId()
  id!: string;
}
