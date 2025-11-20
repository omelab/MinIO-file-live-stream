// stock-reports/stock-reports.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, QueryTypes } from 'sequelize';
import { DistributionHouse } from '../distribution-houses/models/distribution-house.model';
import { Product } from '../products/models/product.model';
import { DailyStockSummary } from '../stock-logs/models/daily-stock-summary.model';
import { DistributionHouseStockLog } from '../stock-logs/models/distribution-house-stock-log.model';
import { WarehouseStockLog } from '../stock-logs/models/warehouse-stock-log.model';
import { Warehouse } from '../warehouses/models/warehouse.model';
import {
  AgingAnalysis,
  CurrentStockItem,
  StockAlert,
  StockTurnover,
} from './interface/stock-report.interface';

@Injectable()
export class StockReportsService {
  constructor(
    @InjectModel(DistributionHouseStockLog)
    private dhStockLogModel: typeof DistributionHouseStockLog,
    @InjectModel(WarehouseStockLog)
    private whStockLogModel: typeof WarehouseStockLog,
    @InjectModel(DailyStockSummary)
    private dailyStockSummaryModel: typeof DailyStockSummary,
    @InjectModel(Product)
    private productModel: typeof Product,
    @InjectModel(DistributionHouse)
    private distributionHouseModel: typeof DistributionHouse,
    @InjectModel(Warehouse)
    private warehouseModel: typeof Warehouse,
  ) {}

  async getCurrentStock(
    locationType: 'distribution' | 'warehouse',
    locationId: number,
    productId?: number,
  ) {
    if (locationType === 'distribution') {
      return this.getDistributionHouseCurrentStock(locationId, productId);
    } else {
      return this.getWarehouseCurrentStock(locationId, productId);
    }
  }

  private async getDistributionHouseCurrentStock(
    distributionHouseId: number,
    productId?: number,
  ) {
    const whereClause: any = { distributionHouseId };
    if (productId) {
      whereClause.productId = productId;
    }

    const subquery = `
      SELECT DISTINCT ON (product_id) *
      FROM distribution_house_stock_log
      WHERE distribution_house_id = :distributionHouseId
      ${productId ? 'AND product_id = :productId' : ''}
      ORDER BY product_id, date DESC, created_at DESC
    `;

    if (!this.dhStockLogModel.sequelize) {
      throw new InternalServerErrorException(
        'Database connection not available',
      );
    }

    const [results] = await this.dhStockLogModel.sequelize.query(subquery, {
      replacements: { distributionHouseId, productId },
      model: DistributionHouseStockLog,
      mapToModel: true,
    });

    const stockData = Array.isArray(results) ? results : [results];

    const enrichedData = await Promise.all(
      stockData.map(async (stock) => {
        const product = await Product.findByPk(stock.productId);
        const distributionHouse = await DistributionHouse.findByPk(
          stock.distributionHouseId,
        );

        return {
          productId: stock.productId,
          productName: product?.productName,
          sku: product?.sku,
          distributionHouseId: stock.distributionHouseId,
          distributionHouseName: distributionHouse?.name,
          currentStock: stock.closingStock,
          lastUpdated: stock.createdAt,
        };
      }),
    );

    return enrichedData;
  }

  private async getWarehouseCurrentStock(
    warehouseId: number,
    productId?: number,
  ) {
    const whereClause: any = { warehouseId };
    if (productId) {
      whereClause.productId = productId;
    }

    const subquery = `
      SELECT DISTINCT ON (product_id) *
      FROM warehouse_stock_log
      WHERE warehouse_id = :warehouseId
      ${productId ? 'AND product_id = :productId' : ''}
      ORDER BY product_id, date DESC, created_at DESC
    `;

    if (!this.whStockLogModel.sequelize) {
      throw new InternalServerErrorException(
        'Database connection not available',
      );
    }

    const [results] = await this.whStockLogModel.sequelize.query(subquery, {
      replacements: { warehouseId, productId },
      model: WarehouseStockLog,
      mapToModel: true,
    });

    const stockData = Array.isArray(results) ? results : [results];

    const enrichedData = await Promise.all(
      stockData.map(async (stock) => {
        const product = await Product.findByPk(stock.productId);
        const warehouse = await Warehouse.findByPk(stock.warehouseId);

        return {
          productId: stock.productId,
          productName: product?.productName,
          sku: product?.sku,
          warehouseId: stock.warehouseId,
          warehouseName: warehouse?.name,
          currentStock: stock.closingStock,
          lastUpdated: stock.createdAt,
        };
      }),
    );

    return enrichedData;
  }

  async getStockMovement(
    locationType: 'distribution' | 'warehouse',
    locationId: number,
    productId?: number,
    startDate?: string,
    endDate?: string,
  ): Promise<any[]> {
    const whereClause: any = {};

    if (locationType === 'distribution') {
      whereClause.distributionHouseId = locationId;
    } else {
      whereClause.warehouseId = locationId;
    }

    if (productId) {
      whereClause.productId = productId;
    }

    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else if (startDate) {
      whereClause.date = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      whereClause.date = { [Op.lte]: new Date(endDate) };
    }

    let stockLogs;
    if (locationType === 'distribution') {
      stockLogs = await this.dhStockLogModel.findAll({
        where: whereClause,
        include: [
          { model: Product, attributes: ['productName', 'sku'] },
          { model: DistributionHouse, attributes: ['name'] },
        ],
        order: [
          ['date', 'DESC'],
          ['createdAt', 'DESC'],
        ],
      });
    } else {
      stockLogs = await this.whStockLogModel.findAll({
        where: whereClause,
        include: [
          { model: Product, attributes: ['productName', 'sku'] },
          { model: Warehouse, attributes: ['name'] },
        ],
        order: [
          ['date', 'DESC'],
          ['createdAt', 'DESC'],
        ],
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return stockLogs ?? [];
  }

  async getDailySummary(
    date: string,
    locationType?: 'distribution' | 'warehouse',
  ) {
    const whereClause: any = { date: new Date(date) };

    if (locationType) {
      whereClause.locationType = locationType;
    }

    const dailySummary = await this.dailyStockSummaryModel.findAll({
      where: whereClause,
      include: [{ model: Product, attributes: ['productName', 'sku'] }],
      order: [
        ['locationType', 'ASC'],
        ['locationId', 'ASC'],
        ['productId', 'ASC'],
      ],
    });

    return dailySummary;
  }

  async generateStockAgingReport(
    locationType: 'distribution' | 'warehouse',
    locationId: number,
  ) {
    const currentStock = await this.getCurrentStock(locationType, locationId);

    return (currentStock as CurrentStockItem[]).map((item) => ({
      ...item,
      agingDays: 0, // This would be calculated based on first receipt date
      category: 'Current' as const,
    }));
  }

  async getStockAlerts(
    locationType?: 'distribution' | 'warehouse',
    locationId?: number,
    alertType?: 'low-stock' | 'over-stock' | 'expired' | 'expiring-soon',
    threshold?: number,
  ): Promise<StockAlert[]> {
    const alerts: StockAlert[] = [];

    console.log(threshold);

    // Get current stock for all locations or specific location
    let currentStock: CurrentStockItem[] = [];

    if (locationType && locationId) {
      currentStock = (await this.getCurrentStock(
        locationType,
        locationId,
      )) as CurrentStockItem[];
    } else {
      // Get stock for all locations
      const dhStock = (await this.getDistributionHouseCurrentStock(
        locationId!,
      )) as CurrentStockItem[];
      const whStock = (await this.getWarehouseCurrentStock(
        locationId!,
      )) as CurrentStockItem[];
      currentStock = [...dhStock, ...whStock];
    }

    for (const stock of currentStock) {
      const product = await this.productModel.findByPk(stock.productId);

      if (!product) continue;

      const minStock = product.minStockLevel || 10;
      const maxStock = product.maxStockLevel || 100;
      const currentStockLevel = stock.currentStock;

      // Check for low stock alerts
      if (
        (!alertType || alertType === 'low-stock') &&
        currentStockLevel <= minStock
      ) {
        alerts.push({
          productId: stock.productId,
          productName: stock.productName ?? '',
          currentStock: currentStockLevel,
          minStock,
          maxStock,
          alertType: 'low-stock',
          severity:
            currentStockLevel <= minStock * 0.5
              ? 'high'
              : currentStockLevel <= minStock * 0.8
                ? 'medium'
                : 'low',
        });
      }

      // Check for over stock alerts
      if (
        (!alertType || alertType === 'over-stock') &&
        currentStockLevel >= maxStock * 1.2
      ) {
        alerts.push({
          productId: stock.productId,
          productName: stock.productName ?? '',
          currentStock: currentStockLevel,
          minStock,
          maxStock,
          alertType: 'over-stock',
          severity:
            currentStockLevel >= maxStock * 1.5
              ? 'high'
              : currentStockLevel >= maxStock * 1.3
                ? 'medium'
                : 'low',
        });
      }
    }

    // Filter by alert type if specified
    if (alertType) {
      return alerts.filter((alert) => alert.alertType === alertType);
    }

    return alerts;
  }

  async getStockTurnover(
    productId?: number,
    locationType?: 'distribution' | 'warehouse',
    locationId?: number,
    startDate?: string,
    endDate?: string,
    period?: 'daily' | 'weekly' | 'monthly' | 'quarterly',
  ): Promise<StockTurnover[]> {
    if (!this.dhStockLogModel.sequelize) {
      throw new InternalServerErrorException(
        'Database connection not available',
      );
    }

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    let periodFormat = '%Y-%m';
    switch (period) {
      case 'daily':
        periodFormat = '%Y-%m-%d';
        break;
      case 'weekly':
        periodFormat = '%Y-%u';
        break;
      case 'monthly':
        periodFormat = '%Y-%m';
        break;
      case 'quarterly':
        periodFormat = '%Y-%q';
        break;
    }

    const query = `
      SELECT 
        product_id as "productId",
        p.product_name as "productName",
        SUM(CASE WHEN movement_type = 'OUT' THEN quantity ELSE 0 END) as "costOfGoodsSold",
        AVG(closing_stock) as "averageInventory",
        COUNT(*) as "movementCount"
      FROM distribution_house_stock_log dhsl
      INNER JOIN products p ON dhsl.product_id = p.id
      WHERE date BETWEEN :start AND :end
      ${productId ? 'AND product_id = :productId' : ''}
      ${locationId ? 'AND distribution_house_id = :locationId' : ''}
      GROUP BY product_id, p.product_name, DATE_FORMAT(date, :periodFormat)
      ORDER BY "costOfGoodsSold" DESC
    `;

    const results = await this.dhStockLogModel.sequelize.query(query, {
      replacements: {
        start,
        end,
        productId,
        locationId,
        periodFormat,
      },
      type: QueryTypes.SELECT,
    });

    return (results as any[]).map((row) => ({
      productId: row.productId,
      productName: row.productName,
      beginningInventory: 0, // Would need beginning period data
      endingInventory: 0, // Would need ending period data
      costOfGoodsSold: parseFloat(row.costOfGoodsSold) || 0,
      averageInventory: parseFloat(row.averageInventory) || 0,
      turnoverRate:
        parseFloat(row.averageInventory) > 0
          ? parseFloat(row.costOfGoodsSold) / parseFloat(row.averageInventory)
          : 0,
      turnoverDays:
        parseFloat(row.averageInventory) > 0
          ? 365 /
            (parseFloat(row.costOfGoodsSold) / parseFloat(row.averageInventory))
          : 0,
    }));
  }

  async getAgingAnalysis(
    locationType?: 'distribution' | 'warehouse',
    locationId?: number,
    productCategory?: string,
    agingBuckets?: string,
  ): Promise<AgingAnalysis[]> {
    const buckets = agingBuckets
      ? agingBuckets.split(',').map(Number)
      : [30, 60, 90, 180];

    if (!this.dhStockLogModel.sequelize) {
      throw new InternalServerErrorException(
        'Database connection not available',
      );
    }

    const query = `
      WITH first_receipt AS (
        SELECT 
          product_id,
          MIN(date) as first_receipt_date
        FROM distribution_house_stock_log
        WHERE movement_type = 'IN'
        GROUP BY product_id
      )
      SELECT 
        dhsl.product_id as "productId",
        p.product_name as "productName",
        dhsl.closing_stock as "currentStock",
        DATEDIFF(NOW(), fr.first_receipt_date) as "agingDays"
      FROM distribution_house_stock_log dhsl
      INNER JOIN products p ON dhsl.product_id = p.id
      INNER JOIN first_receipt fr ON dhsl.product_id = fr.product_id
      WHERE dhsl.date = (SELECT MAX(date) FROM distribution_house_stock_log WHERE product_id = dhsl.product_id)
      ${locationId ? 'AND dhsl.distribution_house_id = :locationId' : ''}
      ${productCategory ? 'AND p.category = :productCategory' : ''}
    `;

    const results = await this.dhStockLogModel.sequelize.query(query, {
      replacements: { locationId, productCategory },
      type: QueryTypes.SELECT,
    });

    return (results as any[]).map((row) => {
      const agingDays = parseInt(row.agingDays) || 0;
      const currentStock = parseInt(row.currentStock) || 0;

      const agingBuckets = buckets.map((bucket, index) => {
        const prevBucket = index === 0 ? 0 : buckets[index - 1];
        let quantity = 0;

        if (index === buckets.length - 1 && agingDays > prevBucket) {
          quantity = currentStock;
        } else if (agingDays > prevBucket && agingDays <= bucket) {
          quantity = currentStock;
        }

        return {
          bucket:
            index === buckets.length - 1
              ? `Over ${prevBucket}+ days`
              : `${prevBucket}-${bucket} days`,
          quantity,
          value: quantity * 100, // Assuming average product value of 100
          percentage: currentStock > 0 ? (quantity / currentStock) * 100 : 0,
        };
      });

      return {
        productId: row.productId,
        productName: row.productName,
        currentStock,
        agingBuckets,
      };
    });
  }

  async getStockValuation(
    locationType?: 'distribution' | 'warehouse',
    locationId?: number,
    valuationMethod?: 'FIFO' | 'LIFO' | 'weighted-average',
    asOfDate?: string,
  ) {
    const currentStock = (await this.getCurrentStock(
      locationType || 'distribution',
      locationId!,
    )) as CurrentStockItem[];

    const valuationDate = asOfDate ? new Date(asOfDate) : new Date();

    // This is a simplified valuation calculation
    // In a real scenario, you would calculate based on purchase costs
    const valuationResults = await Promise.all(
      currentStock.map(async (stock) => {
        const product = await this.productModel.findByPk(stock.productId);
        const averageCost = product?.costPrice || 100; // Default cost

        return {
          productId: stock.productId,
          productName: stock.productName,
          currentStock: stock.currentStock,
          unitCost: averageCost,
          totalValue: stock.currentStock * averageCost,
          valuationMethod: valuationMethod || 'weighted-average',
          asOfDate: valuationDate,
        };
      }),
    );

    return {
      totalValuation: valuationResults.reduce(
        (sum, item) => sum + item.totalValue,
        0,
      ),
      items: valuationResults,
      valuationDate,
      valuationMethod: valuationMethod || 'weighted-average',
    };
  }

  async getFastMovingItems(
    locationType?: 'distribution' | 'warehouse',
    locationId?: number,
    topN?: number,
    startDate?: string,
    endDate?: string,
  ) {
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    if (!this.dhStockLogModel.sequelize) {
      throw new InternalServerErrorException(
        'Database connection not available',
      );
    }

    const query = `
      SELECT 
        product_id as "productId",
        p.product_name as "productName",
        SUM(CASE WHEN movement_type = 'OUT' THEN quantity ELSE 0 END) as "totalSold",
        COUNT(*) as "movementCount"
      FROM distribution_house_stock_log dhsl
      INNER JOIN products p ON dhsl.product_id = p.id
      WHERE date BETWEEN :start AND :end
      AND movement_type = 'OUT'
      ${locationId ? 'AND distribution_house_id = :locationId' : ''}
      GROUP BY product_id, p.product_name
      ORDER BY "totalSold" DESC
      ${topN ? 'LIMIT :topN' : ''}
    `;

    const results = await this.dhStockLogModel.sequelize.query(query, {
      replacements: { start, end, locationId, topN },
      type: QueryTypes.SELECT,
    });

    return results;
  }

  async getSlowMovingItems(
    locationType?: 'distribution' | 'warehouse',
    locationId?: number,
    thresholdDays?: number,
    startDate?: string,
    endDate?: string,
  ) {
    const threshold = thresholdDays || 90;
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    if (!this.dhStockLogModel.sequelize) {
      throw new InternalServerErrorException(
        'Database connection not available',
      );
    }

    const query = `
      WITH product_movement AS (
        SELECT 
          product_id,
          MAX(date) as last_movement_date,
          SUM(CASE WHEN movement_type = 'OUT' THEN quantity ELSE 0 END) as total_sold
        FROM distribution_house_stock_log
        WHERE date BETWEEN :start AND :end
        ${locationId ? 'AND distribution_house_id = :locationId' : ''}
        GROUP BY product_id
        HAVING total_sold < 10 OR DATEDIFF(NOW(), last_movement_date) > :threshold
      )
      SELECT 
        pm.product_id as "productId",
        p.product_name as "productName",
        pm.last_movement_date as "lastMovementDate",
        pm.total_sold as "totalSold",
        DATEDIFF(NOW(), pm.last_movement_date) as "daysSinceLastMovement"
      FROM product_movement pm
      INNER JOIN products p ON pm.product_id = p.id
      ORDER BY "daysSinceLastMovement" DESC
    `;

    const results = await this.dhStockLogModel.sequelize.query(query, {
      replacements: { start, end, locationId, threshold },
      type: QueryTypes.SELECT,
    });

    return results;
  }

  // async generateStockAgingReport(
  //   locationType: 'distribution' | 'warehouse',
  //   locationId: number,
  // ) {
  //   const currentStock = await this.getCurrentStock(locationType, locationId);

  //   return (currentStock as CurrentStockItem[]).map((item) => ({
  //     ...item,
  //     agingDays: 0,
  //     category: 'Current' as const,
  //   }));
  // }

  // async getStockReconciliation(
  //   locationType: 'distribution' | 'warehouse',
  //   locationId: number,
  //   startDate: string,
  //   endDate: string,
  // ): Promise<StockReconciliationReport> {
  //   try {
  //     const start = new Date(startDate);
  //     const end = new Date(endDate);

  //     // Validate dates
  //     if (isNaN(start.getTime()) || isNaN(end.getTime())) {
  //       throw new BadRequestException('Invalid date format');
  //     }

  //     if (start > end) {
  //       throw new BadRequestException('Start date cannot be after end date');
  //     }

  //     const reconciliationReport: StockReconciliationReport = {
  //       locationType,
  //       locationId,
  //       period: { startDate: start, endDate: end },
  //       openingStock: await this.getOpeningStock(
  //         locationType,
  //         locationId,
  //         start,
  //       ),
  //       closingStock: await this.getCurrentStock(locationType, locationId),
  //       transactions: await this.getTransactionsInPeriod(
  //         locationType,
  //         locationId,
  //         start,
  //         end,
  //       ),
  //       discrepancies: await this.calculateDiscrepancies(
  //         locationType,
  //         locationId,
  //         start,
  //         end,
  //       ),
  //     };

  //     return reconciliationReport;
  //   } catch (error) {
  //     if (error instanceof BadRequestException) {
  //       throw error;
  //     }
  //     throw new InternalServerErrorException(
  //       'Failed to generate reconciliation report',
  //     );
  //   }
  // }
}
