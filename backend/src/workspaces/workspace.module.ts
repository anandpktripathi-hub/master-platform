import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceSharedModule } from './workspace-shared.module';

@Module({
  imports: [
    WorkspaceSharedModule,
  ],
  controllers: [WorkspaceController],
})
export class WorkspaceModule {}
