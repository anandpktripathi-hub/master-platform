import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';
// Load environment variables from common locations.
// In production, prefer real environment variables from the host/container.
// Allow opting-in to dotenv via ENV_FILE (explicit) even in production.
const envFile = process.env.ENV_FILE;
if (envFile) {
  dotenv.config({ path: path.resolve(process.cwd(), envFile) });
} else if (process.env.NODE_ENV !== 'production') {
  // We prefer process.cwd() so this works both in dev (nest start --watch)
  // and when running compiled output from dist/.
  const cwdEnv = path.resolve(process.cwd(), '.env');
  const parentEnv = path.resolve(process.cwd(), '..', '.env');
  dotenv.config({ path: cwdEnv });
  dotenv.config({ path: parentEnv });
}
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
  // Auth
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    missing.push('JWT_SECRET');
  }

  // Database
  if (
    process.env.NODE_ENV === 'production' &&
    !process.env.DATABASE_URI &&
    !process.env.DATABASE_URL
  ) {
    missing.push('DATABASE_URI');
  }
  // Payments
  if (!process.env.STRIPE_SECRET_KEY) {
    // Do not hard-fail boot if Stripe isn't configured.
    // Many environments (local dev, staging, some tenants) may run without Stripe.
    logger.warn('STRIPE_SECRET_KEY is not set; Stripe payments will be disabled');
  }

  // SMTP/email
  if (!process.env.SMTP_HOST) {
    // Optional: email settings can also come from DB; log a warning instead
    logger.warn(
      'SMTP_HOST is not set; email delivery depends on DB settings only',
    );
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
      logger.warn(
        'PLATFORM_PRIMARY_DOMAIN is not set; domain/SSL configuration may be incomplete',
      );
    }
  }

  if (missing.length > 0) {
    logger.error(
      `Missing critical environment variables: ${missing.join(', ')}`,
    );
    throw new InternalServerErrorException(
      `Missing critical environment variables: ${missing.join(', ')}`,
    );
  }
}

async function bootstrap() {
  // Critical environment validation for production-like deployments
  // Run this before NestFactory.create() so we fail fast without doing any
  // expensive module initialization or external connections.
  validateCriticalEnv();

  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();

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

  // Prefer the standard PORT env var (used by Docker/Heroku/etc.), then platform override.
  const port = Number(process.env.PORT || process.env.PLATFORM_BACKEND_PORT || 4000);
  await app.listen(port);
  console.log(`Backend is running on http://localhost:${port}`);
  console.log(
    'Security features enabled: Helmet, CORS, Rate Limiting, Input Validation',
  );
}
bootstrap().catch((err) => {
  console.error('[BOOTSTRAP] Failed to start application:', err);
  process.exit(1);
});
