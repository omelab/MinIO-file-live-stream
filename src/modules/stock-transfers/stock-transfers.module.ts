import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DistributionHousesModule } from '../distribution-houses/distribution-houses.module';
import { DistributionHouse } from '../distribution-houses/models/distribution-house.model';
import { Product } from '../products/models/product.model';
import { ProductsModule } from '../products/products.module';
import { DistributionHouseStockLog } from '../stock-logs/models/distribution-house-stock-log.model';
import { WarehouseStockLog } from '../stock-logs/models/warehouse-stock-log.model';
import { StockLogsModule } from '../stock-logs/stock-logs.module';
import { Transport } from '../transports/models/transport.model';
import { TransportsModule } from '../transports/transports.module';
import { Warehouse } from '../warehouses/models/warehouse.model';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { StockTransfersController } from './stock-transfers.controller';
import { StockTransfersService } from './stock-transfers.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      DistributionHouseStockLog,
      WarehouseStockLog,
      Warehouse,
      Product,
      DistributionHouse,
      Transport,
    ]),
    ProductsModule,
    DistributionHousesModule,
    WarehousesModule,
    TransportsModule,
    StockLogsModule,
  ],
  providers: [StockTransfersService],
  controllers: [StockTransfersController],
  exports: [StockTransfersService],
})
export class StockTransfersModule {}
