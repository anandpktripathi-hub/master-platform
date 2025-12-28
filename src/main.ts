import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    app.use(helmet());
    app.use(compression());

    app.enableCors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    });

    app.setGlobalPrefix(process.env.API_PREFIX || 'api');

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
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.PORT || 4000;
    await app.listen(port);

    console.log(
      `\n🚀 Master Platform Backend is running on: http://localhost:${port}`,
    );
    console.log(
      `📚 API Documentation available at: http://localhost:${port}/api/docs\n`,
    );
  } catch (error) {
    console.error('Error starting server:', (error as Error).message);
    process.exit(1);
  }
}

bootstrap();
