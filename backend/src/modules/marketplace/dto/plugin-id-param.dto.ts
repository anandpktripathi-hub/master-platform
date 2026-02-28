import { MinLength, IsString } from 'class-validator';

export class PluginIdParamDto {
  @IsString()
  @MinLength(1)
  pluginId!: string;
}
