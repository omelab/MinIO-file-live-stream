// inventory/inventory.module.ts
import { Module } from '@nestjs/common';
import { DistributionHousesModule } from '../distribution-houses/distribution-houses.module';
import { ProductsModule } from '../products/products.module';
import { StockLogsModule } from '../stock-logs/stock-logs.module';
import { StockReportsModule } from '../stock-reports/stock-reports.module';
import { StockTransfersModule } from '../stock-transfers/stock-transfers.module';
import { TransportsModule } from '../transports/transports.module';
import { WarehousesModule } from '../warehouses/warehouses.module';

@Module({
  imports: [
    ProductsModule,
    DistributionHousesModule,
    WarehousesModule,
    TransportsModule,
    StockTransfersModule,
    StockReportsModule,
    StockLogsModule,
  ],
  exports: [
    ProductsModule,
    DistributionHousesModule,
    WarehousesModule,
    TransportsModule,
    StockTransfersModule,
    StockReportsModule,
  ],
})
export class InventoryModule {}
