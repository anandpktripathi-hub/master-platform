import { IsNotEmpty } from 'class-validator';

export class FigmaImportDto {
  @IsNotEmpty()
  figmaUrl!: string;

  @IsNotEmpty()
  accessToken!: string;

  @IsNotEmpty()
  tenantId!: string;
}
