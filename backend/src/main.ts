import { setupSwagger } from './config/swagger.config';
import { errorHandler } from './middleware/error.handler';
import logger from './config/logger.config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  // Security: Helmet for HTTP headers
  app.use(helmet());

  // Security: CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Security: Global validation pipe with strict settings
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  logger.info('Application is running with security hardening enabled');

  app.use(errorHandler);

  setupSwagger(app);

  // Metrics endpoint (optional - comment out if not needed)
  // app.get('/metrics', (req, res) => {
  //   res.setHeader('Content-Type', register.contentType);
  //   res.end(register.metrics());
  // });

  await app.listen(4000);
  console.log('Backend is running on http://localhost:4000');
  console.log(
    'Security features enabled: Helmet, CORS, Rate Limiting, Input Validation',
  );
}

void bootstrap();
