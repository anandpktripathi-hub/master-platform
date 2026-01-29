import { Module } from '@nestjs/common';
import { AiServicesController } from './ai-services.controller';
import { AiServicesService } from './ai-services.service';

/**
 * AI Services Module provides scaffolding for integrating AI capabilities
 * like OpenAI GPT for content generation, customer support automation,
 * copywriting assistance, and analytics insights.
 */
@Module({
  controllers: [AiServicesController],
  providers: [AiServicesService],
  exports: [AiServicesService],
})
export class AiServicesModule {}
