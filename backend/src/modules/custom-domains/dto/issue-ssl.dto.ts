import { IsIn, IsOptional } from 'class-validator';

export class IssueSslDto {
  @IsOptional()
  @IsIn(['acme', 'manual'])
  provider?: 'acme' | 'manual';
}
