import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileUploadModule } from './modules/file-upload/file-upload.module';
import minioConfig from './config/minio.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [minioConfig],
    }),
    FileUploadModule,
  ],
})
export class AppModule {}
