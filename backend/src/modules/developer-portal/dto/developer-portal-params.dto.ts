import { IsMongoId } from 'class-validator';

export class ApiKeyIdParamDto {
  @IsMongoId()
  keyId!: string;
}

export class WebhookLogIdParamDto {
  @IsMongoId()
  logId!: string;
}
