import { register } from './config/prometheus.config';
import { setupSwagger } from './config/swagger.config';
import { ValidationPipe } from './pipes/validation.pipe';
import { errorHandler } from './middleware/error.handler';
import logger from './config/logger.config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api/v1');
  app.use(helmet());
  app.enableCors();
  
  await logger.info('Application is running');
  
  app.use(errorHandler);
  
  setupSwagger(app);
  
  // Metrics endpoint (optional - comment out if not needed)
  // app.get('/metrics', (req, res) => {
  //   res.setHeader('Content-Type', register.contentType);
  //   res.end(register.metrics());
  // });
  
  await app.listen(4000);
  console.log('Backend is running on http://localhost:4000');
}

bootstrap();
