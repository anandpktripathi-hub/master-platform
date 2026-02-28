import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CmsSeoAuditPageIdParamDto {
  @ApiProperty({ description: 'CMS page id' })
  @IsString()
  @IsNotEmpty()
  pageId!: string;
}
