import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class TenantDashboardStatsDto {
  @ApiProperty() users!: number;
  @ApiProperty() posTotalSales!: number;
  @ApiProperty() posTotalOrders!: number;
  @ApiProperty() cmsTotalViewsLast30Days!: number;
  @ApiProperty() cmsUniqueVisitorsLast30Days!: number;
}

class TenantDashboardPosSummaryDto {
  @ApiProperty() totalSales!: number;
  @ApiProperty() totalOrders!: number;
}

class TenantDashboardNotificationDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiProperty() message!: string;
  @ApiPropertyOptional() linkUrl?: string;
  @ApiProperty() read!: boolean;
  @ApiPropertyOptional({ description: 'Timestamp (ISO string)' })
  createdAt?: string;
}

export class TenantDashboardResponseDto {
  @ApiProperty({ type: TenantDashboardStatsDto })
  stats!: TenantDashboardStatsDto;

  @ApiPropertyOptional({ description: 'CMS analytics payload', type: Object })
  cms?: Record<string, any> | null;

  @ApiPropertyOptional({ type: TenantDashboardPosSummaryDto })
  pos?: TenantDashboardPosSummaryDto | null;

  @ApiProperty({ type: TenantDashboardNotificationDto, isArray: true })
  notifications!: TenantDashboardNotificationDto[];

  @ApiProperty({ description: 'Accessible feature list/payload', type: Object, isArray: true })
  features!: any[];
}
