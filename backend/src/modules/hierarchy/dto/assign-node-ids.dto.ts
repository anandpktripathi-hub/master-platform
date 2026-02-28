import { ArrayNotEmpty, IsArray, IsMongoId } from 'class-validator';

export class AssignNodeIdsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  nodeIds!: string[];
}
