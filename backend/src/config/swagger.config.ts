import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Smetasc SaaS Backend')
    .setDescription('API documentation for Smetasc SaaS Backend')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // Keep existing Swagger UI path for backward compatibility.
  SwaggerModule.setup('api', app, document);

  // Also expose a versioned docs path aligned with the API global prefix.
  SwaggerModule.setup('api/v1/docs', app, document);

  // Stable OpenAPI JSON endpoints (used by the frontend docs page).
  const httpServer = app.getHttpAdapter().getInstance();
  httpServer.get('/api/docs-json', (_req: any, res: any) => res.json(document));
  httpServer.get('/api/v1/docs-json', (_req: any, res: any) => res.json(document));
}
