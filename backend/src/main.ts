import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';
// Try loading .env from project root and dist directory
const rootEnv = path.resolve(__dirname, '../../.env');
const distEnv = path.resolve(__dirname, '.env');
dotenv.config({ path: rootEnv });
dotenv.config({ path: distEnv });
import { setupSwagger } from './config/swagger.config';
import { errorHandler } from './middleware/error.handler';
import logger from './config/logger.config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, InternalServerErrorException } from '@nestjs/common';
import helmet from 'helmet';
import { ValidationExceptionFilter } from './filters/validation-exception.filter';

// Global error handlers for unhandled rejections and exceptions
process.on('unhandledRejection', (reason) => {
  console.error('[GLOBAL] Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[GLOBAL] Uncaught Exception:', err);
  process.exit(1);
});

function validateCriticalEnv(): void {
  const missing: string[] = [];
  // Payments
  if (!process.env.STRIPE_SECRET_KEY) {
    missing.push('STRIPE_SECRET_KEY');
  }

  // SMTP/email
  if (!process.env.SMTP_HOST) {
    // Optional: email settings can also come from DB; log a warning instead
    logger.warn('SMTP_HOST is not set; email delivery depends on DB settings only');
  }

  // Currency conversion JSON format (if provided)
  const ratesRaw = process.env.CURRENCY_CONVERSION_RATES_JSON;
  if (ratesRaw) {
    try {
      const parsed = JSON.parse(ratesRaw);
      if (typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('CURRENCY_CONVERSION_RATES_JSON must be a JSON object');
      }
    } catch (err) {
      throw new InternalServerErrorException(
        'CURRENCY_CONVERSION_RATES_JSON is not valid JSON. Please fix or remove it.',
      );
    }
  }

  // Domain/SSL hints for production
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.PLATFORM_PRIMARY_DOMAIN) {
      logger.warn('PLATFORM_PRIMARY_DOMAIN is not set; domain/SSL configuration may be incomplete');
    }
  }

  if (missing.length > 0) {
    logger.error(`Missing critical environment variables: ${missing.join(', ')}`);
    throw new InternalServerErrorException(
      `Missing critical environment variables: ${missing.join(', ')}`,
    );
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Critical environment validation for production-like deployments
  validateCriticalEnv();

  app.setGlobalPrefix('api/v1');

  // Security: Helmet for HTTP headers
  app.use(helmet());

  // Security: CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-tenant-id',
      'x-workspace-id',
      'X-Tenant-Id',
      'X-Workspace-Id',
    ],
  });

  // Security: Global validation pipe with strict settings
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Register global validation exception filter
  app.useGlobalFilters(new ValidationExceptionFilter());
  logger.info('Application is running with security hardening enabled');

  app.use(errorHandler);

  setupSwagger(app);

  // Metrics endpoint (optional - comment out if not needed)
  // app.get('/metrics', (req, res) => {
  //   res.setHeader('Content-Type', register.contentType);
  //   res.end(register.metrics());
  // });

  const port = Number(process.env.PLATFORM_BACKEND_PORT || 4100);
  await app.listen(port);
  console.log(`Backend is running on http://localhost:${port}`);
  console.log(
    'Security features enabled: Helmet, CORS, Rate Limiting, Input Validation',
  );
}
void bootstrap();
