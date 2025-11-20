import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // Swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle(configService.get<string>('APP_NAME') || 'API Documentation')
    .setDescription(
      configService.get<string>('APP_DESCRIPTION') || 'API description',
    )
    .setVersion(configService.get<string>('APP_VERSION') || '1.0')
    // .addTag('auth', 'Authentication endpoints')
    // .addTag('users', 'User management endpoints')
    // .addTag('file-upload', 'File upload endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // Enable CORS if needed
  app.enableCors();

  await app.listen(3005);
  console.log(`Application is running on: http://localhost:3005`);
  console.log(`Swagger documentation: http://localhost:3005/api`);
}

// Add void operator to explicitly ignore the Promise
void bootstrap();
