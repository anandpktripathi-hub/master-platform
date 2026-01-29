import { IsString, IsNotEmpty } from 'class-validator';

export class MapDomainDto {
  @IsString()
  @IsNotEmpty()
  domain!: string;
}
