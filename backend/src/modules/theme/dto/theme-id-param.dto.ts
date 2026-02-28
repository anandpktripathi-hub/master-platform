import { IsMongoId, IsNotEmpty } from 'class-validator';

export class ThemeIdParamDto {
  @IsMongoId()
  @IsNotEmpty()
  id!: string;
}
