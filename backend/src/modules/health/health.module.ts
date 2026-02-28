import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  HealthCheckEvent,
  HealthCheckEventSchema,
} from '../../database/schemas/health-check-event.schema';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HealthCheckEvent.name, schema: HealthCheckEventSchema },
    ]),
  ],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
