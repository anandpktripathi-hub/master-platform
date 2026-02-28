import { Injectable, LoggerService } from '@nestjs/common';
import winstonLogger from '../config/logger.config';

type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';

@Injectable()
export class AppLoggerService implements LoggerService {
  getLevel(): string {
    return (winstonLogger.level || 'info').toString();
  }

  getTransports(): string[] {
    const transports = (winstonLogger.transports || []) as Array<{ constructor?: { name?: string } }>;
    return transports.map((t) => t?.constructor?.name || 'Transport');
  }

  log(message: any, context?: string) {
    winstonLogger.info(String(message), context ? { context } : undefined);
  }

  error(message: any, trace?: string, context?: string) {
    winstonLogger.error(String(message), {
      ...(context ? { context } : null),
      ...(trace ? { trace } : null),
    });
  }

  warn(message: any, context?: string) {
    winstonLogger.warn(String(message), context ? { context } : undefined);
  }

  debug?(message: any, context?: string) {
    winstonLogger.debug(String(message), context ? { context } : undefined);
  }

  verbose?(message: any, context?: string) {
    winstonLogger.verbose(String(message), context ? { context } : undefined);
  }

  writeTestLog(params: { level: LogLevel; message: string; context?: string }) {
    const level = params.level;
    const msg = params.message;
    const meta = params.context ? { context: params.context } : undefined;

    switch (level) {
      case 'error':
        winstonLogger.error(msg, meta);
        break;
      case 'warn':
        winstonLogger.warn(msg, meta);
        break;
      case 'debug':
        winstonLogger.debug(msg, meta);
        break;
      case 'verbose':
        winstonLogger.verbose(msg, meta);
        break;
      default:
        winstonLogger.info(msg, meta);
        break;
    }
  }
}
