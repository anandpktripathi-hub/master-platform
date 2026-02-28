import { Module } from '@nestjs/common';
import { LoggerController } from './logger.controller';
import { AppLoggerService } from './logger.service';

@Module({
	controllers: [LoggerController],
	providers: [AppLoggerService],
	exports: [AppLoggerService],
})
export class LoggerModule {}

