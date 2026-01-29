import { IsNotEmpty } from 'class-validator';

export class ImportZipDto {
  @IsNotEmpty()
  tenantId!: string;
}
