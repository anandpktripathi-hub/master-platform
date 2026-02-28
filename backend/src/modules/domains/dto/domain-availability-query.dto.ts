import { IsIn, IsString } from 'class-validator';

export class DomainAvailabilityQueryDto {
  @IsIn(['path', 'subdomain'])
  type!: 'path' | 'subdomain';

  @IsString()
  value!: string;
}
