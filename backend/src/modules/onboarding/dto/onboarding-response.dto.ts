import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class SeedSampleCrmDto {
  @ApiProperty() companyId!: string;
  @ApiProperty() contactId!: string;
  @ApiProperty() dealId!: string;
  @ApiProperty() taskId!: string;
}

class SeedSampleSocialDto {
  @ApiProperty() postId!: string;
}

class SeedSampleSupportDto {
  @ApiProperty() ticketId!: string;
}

class SeedSampleDirectoryDto {
  @ApiProperty() tenantId!: string;
}

export class SeedSampleDataResponseDto {
  @ApiProperty({ description: 'Whether sample data was created' })
  created!: boolean;

  @ApiPropertyOptional({ description: 'If not created, reason' })
  reason?: string;

  @ApiPropertyOptional({ type: SeedSampleCrmDto })
  crm?: SeedSampleCrmDto;

  @ApiPropertyOptional({ type: SeedSampleSocialDto })
  social?: SeedSampleSocialDto;

  @ApiPropertyOptional({ type: SeedSampleSupportDto })
  support?: SeedSampleSupportDto;

  @ApiPropertyOptional({ type: SeedSampleDirectoryDto })
  directory?: SeedSampleDirectoryDto;
}

export class GetSampleStatusResponseDto {
  @ApiProperty() crmSample!: boolean;
  @ApiProperty() supportSample!: boolean;
  @ApiProperty() socialSample!: boolean;
  @ApiProperty() directorySample!: boolean;
}
