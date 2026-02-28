import { ApiProperty } from '@nestjs/swagger';

export class CurrentTenantResponseDto {
  @ApiProperty({ description: 'Tenant object', type: Object })
  tenant!: Record<string, any>;
}
