import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import helmet from 'helmet';
import compression from 'compression';

const BOOT_START_MS = Date.now();
function bootLog(message: string): void {
  if (process.env.NODE_ENV === 'production') return;
  const delta = Date.now() - BOOT_START_MS;
  // Keep logs concise; helps diagnose startup hangs in dev.
  // Avoid logging secrets or full error objects here.
  console.log(`[root-bootstrap +${delta}ms] ${message}`);
}

function installDevMongoFailureGuard(): void {
  const mongoOptional =
    process.env.NODE_ENV !== 'production' &&
    String(process.env.MONGO_REQUIRED || '').toLowerCase() !== 'true';

  if (!mongoOptional) return;

  let logged = false;

  const isMongoRefused = (value: unknown): boolean => {
    const message =
      typeof value === 'string'
        ? value
        : (value as any)?.message
          ? String((value as any).message)
          : '';

    return (
      message.includes('MongoServerSelectionError') ||
      (message.includes('ECONNREFUSED') && message.includes('27017'))
    );
  };

  const logOnce = (value: unknown) => {
    if (logged) return;
    logged = true;
    const message =
      typeof value === 'string'
        ? value
        : (value as any)?.message
          ? String((value as any).message)
          : String(value);

    // eslint-disable-next-line no-console
    console.warn(
      `[root-dev] MongoDB connection failed (${message}). ` +
        `Continuing to run without DB. Start MongoDB on localhost:27017 or set DATABASE_URL to a reachable instance.`,
    );
  };

  process.on('unhandledRejection', (reason) => {
    if (isMongoRefused(reason)) {
      logOnce(reason);
      return;
    }

    // Unknown unhandled rejections should still fail fast.
    // eslint-disable-next-line no-console
    console.error('[root-dev] Unhandled promise rejection:', reason);
    process.exit(1);
  });

  process.on('uncaughtException', (err) => {
    if (isMongoRefused(err)) {
      logOnce(err);
      return;
    }

    // eslint-disable-next-line no-console
    console.error('[root-dev] Uncaught exception:', err);
    process.exit(1);
  });
}

function validateCriticalEnv(): void {
  if (process.env.NODE_ENV !== 'production') return;

  const missing: string[] = [];

  // Auth
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-secret-key') {
    missing.push('JWT_SECRET');
  }

  // Database
  if (!process.env.DATABASE_URL) {
    missing.push('DATABASE_URL');
  }

  if (missing.length > 0) {
    throw new Error(`Missing critical environment variables: ${missing.join(', ')}`);
  }
}

async function bootstrap() {
  try {
    installDevMongoFailureGuard();
    bootLog('bootstrap() start');
    validateCriticalEnv();

    bootLog('NestFactory.create(AppModule) begin');
    const app = await NestFactory.create(AppModule);
    bootLog('NestFactory.create(AppModule) done');

    app.enableShutdownHooks();

    app.use(helmet());
    app.use(compression());

    const allowedOrigins = (process.env.FRONTEND_URL || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    app.enableCors({
      origin:
        allowedOrigins.length > 0
          ? allowedOrigins
          : ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
    });

    const apiPrefix = process.env.API_PREFIX || 'api';
    app.setGlobalPrefix(apiPrefix);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.useGlobalFilters(new GlobalExceptionFilter());

    const config = new DocumentBuilder()
      .setTitle('Master Platform API')
      .setDescription('Multi-Tenant SaaS Backend - Transformatrix Global')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Authentication')
      .addTag('Users')
      .addTag('Products')
      .addTag('Categories')
      .addTag('Orders')
      .build();

    bootLog('SwaggerModule.createDocument() begin');
    const document = SwaggerModule.createDocument(app, config);
    bootLog('SwaggerModule.createDocument() done');

    SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

    const httpServer = app.getHttpAdapter().getInstance();
    httpServer.get(`/${apiPrefix}/docs-json`, (_req: any, res: any) => {
      res.json(document);
    });

    const port = Number(process.env.PORT || 3000);
    bootLog(`app.listen(${port}) begin`);
    await app.listen(port);
    bootLog(`app.listen(${port}) done`);

    console.log(`\nRoot app is running on: http://localhost:${port}`);
    console.log(`API Documentation available at: http://localhost:${port}/api/docs\n`);
  } catch (error) {
    console.error('Error starting server:', (error as Error).message);
    process.exit(1);
  }
}

bootstrap();
