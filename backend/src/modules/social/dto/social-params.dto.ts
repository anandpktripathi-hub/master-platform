import { IsMongoId, IsNotEmpty } from 'class-validator';

export class SocialIdParamDto {
  @IsMongoId()
  @IsNotEmpty()
  id!: string;
}
