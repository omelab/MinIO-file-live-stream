import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DailyStockSummary } from './models/daily-stock-summary.model';
import { DistributionHouseStockLog } from './models/distribution-house-stock-log.model';
import { WarehouseStockLog } from './models/warehouse-stock-log.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      DistributionHouseStockLog,
      WarehouseStockLog,
      DailyStockSummary,
    ]),
  ],
  exports: [SequelizeModule],
})
export class StockLogsModule {}
