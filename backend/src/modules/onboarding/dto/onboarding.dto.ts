import { IsMongoId } from 'class-validator';

export class SeedSampleDataParamsDto {
  @IsMongoId()
  tenantId!: string;

  @IsMongoId()
  userId!: string;
}

export class GetSampleStatusParamsDto {
  @IsMongoId()
  tenantId!: string;
}
