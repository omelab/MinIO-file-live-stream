import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule, SequelizeModuleOptions } from '@nestjs/sequelize';
import authConfig from './config/auth.config';
import databaseConfig from './config/database.config'; // default import
import minioConfig from './config/minio.config';
import { AuthModule } from './modules/auth/auth.module';
import { FileUploadModule } from './modules/file-upload/file-upload.module';
import { InventoryModule } from './modules/inventory/inventory.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [minioConfig, databaseConfig, authConfig],
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get<SequelizeModuleOptions>('database');
        if (!dbConfig) {
          throw new Error('Database configuration not found');
        }
        return dbConfig;
      },
      inject: [ConfigService],
    }),
    AuthModule,
    InventoryModule,
    FileUploadModule,
    // ProductsModule,
    // DistributionHousesModule,
    // WarehousesModule,
    // TransportsModule,
    // StockTransfersModule,
    // StockLogsModule,
    // StockReportsModule,
  ],
})
export class AppModule {}
