import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ImportType } from '../enums/cms.enums';

export class CmsFileImportUploadBodyDto {
  @ApiProperty({
    description: 'Import type',
    enum: ImportType,
    example: ImportType.ZIP,
  })
  @IsEnum(ImportType)
  importType!: ImportType;
}

export class CmsFileImportImportIdParamDto {
  @ApiProperty({ description: 'Import record id' })
  @IsString()
  @IsNotEmpty()
  importId!: string;
}
