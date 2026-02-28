import { IsMongoId } from 'class-validator';

export class HrmIdParamDto {
  @IsMongoId()
  id!: string;
}
