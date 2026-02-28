import { IsMongoId } from 'class-validator';

export class DashboardIdParamDto {
  @IsMongoId()
  id!: string;
}
