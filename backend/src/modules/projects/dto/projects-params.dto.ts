import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class ProjectIdParamDto {
  @ApiProperty({ description: 'Project id', example: '507f191e810c19729de860ea' })
  @IsMongoId()
  id!: string;
}

export class ProjectIdRouteParamDto {
  @ApiProperty({ description: 'Project id', example: '507f191e810c19729de860ea' })
  @IsMongoId()
  projectId!: string;
}

export class TaskIdParamDto {
  @ApiProperty({ description: 'Task id', example: '507f191e810c19729de860ea' })
  @IsMongoId()
  id!: string;
}
