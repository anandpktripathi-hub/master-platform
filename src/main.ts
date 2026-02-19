import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import helmet from 'helmet';
import compression from 'compression';

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
    validateCriticalEnv();
    const app = await NestFactory.create(AppModule);

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

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

    const httpServer = app.getHttpAdapter().getInstance();
    httpServer.get(`/${apiPrefix}/docs-json`, (_req: any, res: any) => {
      res.json(document);
    });

    const port = Number(process.env.PORT || 3000);
    await app.listen(port);

    console.log(`\nRoot app is running on: http://localhost:${port}`);
    console.log(`API Documentation available at: http://localhost:${port}/api/docs\n`);
  } catch (error) {
    console.error('Error starting server:', (error as Error).message);
    process.exit(1);
  }
}

bootstrap();
