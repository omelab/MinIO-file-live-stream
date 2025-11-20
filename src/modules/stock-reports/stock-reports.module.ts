import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DistributionHousesModule } from '../distribution-houses/distribution-houses.module';
import { DistributionHouse } from '../distribution-houses/models/distribution-house.model';
import { Product } from '../products/models/product.model';
import { ProductsModule } from '../products/products.module';
import { StockLogsModule } from '../stock-logs/stock-logs.module';
import { Warehouse } from '../warehouses/models/warehouse.model';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { StockReportsController } from './stock-reports.controller';
import { StockReportsService } from './stock-reports.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Product, DistributionHouse, Warehouse]),
    ProductsModule,
    DistributionHousesModule,
    WarehousesModule,
    StockLogsModule,
  ],
  providers: [StockReportsService],
  controllers: [StockReportsController],
  exports: [StockReportsService],
})
export class StockReportsModule {}
