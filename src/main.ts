import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('File Upload API')
    .setDescription('API for file upload with MinIO')
    .setVersion('1.0')
    .addTag('file-upload')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Enable CORS if needed
  app.enableCors();

  await app.listen(3005);
  console.log(`Application is running on: http://localhost:3005`);
  console.log(`Swagger documentation: http://localhost:3005/api`);
}

// Add void operator to explicitly ignore the Promise
void bootstrap();
