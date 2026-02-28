import { IsMongoId } from 'class-validator';

export class DomainIdParamDto {
  @IsMongoId()
  domainId!: string;
}
