import { IsMongoId, IsNotEmpty } from 'class-validator';

export class VcardIdParamDto {
  @IsMongoId()
  @IsNotEmpty()
  id!: string;
}
