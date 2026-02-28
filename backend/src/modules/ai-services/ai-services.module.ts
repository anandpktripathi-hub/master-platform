import { Module } from '@nestjs/common';
import { AiServicesController } from './ai-services.controller';
import { AiServicesService } from './ai-services.service';
import { WorkspaceSharedModule } from '../../workspaces/workspace-shared.module';

/**
 * AI Services Module provides scaffolding for integrating AI capabilities
 * like OpenAI GPT for content generation, customer support automation,
 * copywriting assistance, and analytics insights.
 */
@Module({
  imports: [WorkspaceSharedModule],
  controllers: [AiServicesController],
  providers: [AiServicesService],
  exports: [AiServicesService],
})
export class AiServicesModule {}
