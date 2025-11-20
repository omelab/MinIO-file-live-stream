import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { StockReportsService } from './stock-reports.service';

@ApiTags('Stock Reports')
@ApiBearerAuth('access-token')
@Controller('stock-reports')
export class StockReportsController {
  constructor(private readonly stockReportsService: StockReportsService) {}

  @Get('current-stock')
  @ApiOperation({ summary: 'Get current stock by location and product' })
  @ApiQuery({
    name: 'locationType',
    required: true,
    enum: ['distribution', 'warehouse'],
  })
  @ApiQuery({ name: 'locationId', required: true, type: Number })
  @ApiQuery({ name: 'productId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Return current stock' })
  async getCurrentStock(
    @Query('locationType') locationType: 'distribution' | 'warehouse',
    @Query('locationId', ParseIntPipe) locationId: number,
    @Query('productId', ParseIntPipe) productId?: number,
  ) {
    return this.stockReportsService.getCurrentStock(
      locationType,
      locationId,
      productId,
    );
  }

  @Get('stock-movement')
  @ApiOperation({ summary: 'Get stock movement history' })
  @ApiQuery({
    name: 'locationType',
    required: true,
    enum: ['distribution', 'warehouse'],
  })
  @ApiQuery({ name: 'locationId', required: true, type: Number })
  @ApiQuery({ name: 'productId', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Return stock movement history' })
  async getStockMovement(
    @Query('locationType') locationType: 'distribution' | 'warehouse',
    @Query('locationId', ParseIntPipe) locationId: number,
    @Query('productId', ParseIntPipe) productId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.stockReportsService.getStockMovement(
      locationType,
      locationId,
      productId,
      startDate,
      endDate,
    );
  }

  @Get('daily-summary')
  @ApiOperation({ summary: 'Get daily stock summary' })
  @ApiQuery({ name: 'date', required: true })
  @ApiQuery({
    name: 'locationType',
    required: false,
    enum: ['distribution', 'warehouse'],
  })
  @ApiResponse({ status: 200, description: 'Return daily stock summary' })
  async getDailySummary(
    @Query('date') date: string,
    @Query('locationType') locationType?: 'distribution' | 'warehouse',
  ) {
    return this.stockReportsService.getDailySummary(date, locationType);
  }

  @Get('stock-alerts')
  @ApiOperation({ summary: 'Get stock level alerts' })
  @ApiQuery({
    name: 'locationType',
    required: false,
    enum: ['distribution', 'warehouse'],
  })
  @ApiQuery({ name: 'locationId', required: false, type: Number })
  @ApiQuery({
    name: 'alertType',
    required: false,
    enum: ['low-stock', 'over-stock', 'expired', 'expiring-soon'],
  })
  @ApiQuery({ name: 'threshold', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Return stock alerts' })
  async getStockAlerts(
    @Query('locationType') locationType?: 'distribution' | 'warehouse',
    @Query('locationId', ParseIntPipe) locationId?: number,
    @Query('alertType')
    alertType?: 'low-stock' | 'over-stock' | 'expired' | 'expiring-soon',
    @Query('threshold', ParseIntPipe) threshold?: number,
  ) {
    return this.stockReportsService.getStockAlerts(
      locationType,
      locationId,
      alertType,
      threshold,
    );
  }

  @Get('stock-turnover')
  @ApiOperation({ summary: 'Get stock turnover rate report' })
  @ApiQuery({ name: 'productId', required: false, type: Number })
  @ApiQuery({
    name: 'locationType',
    required: false,
    enum: ['distribution', 'warehouse'],
  })
  @ApiQuery({ name: 'locationId', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['daily', 'weekly', 'monthly', 'quarterly'],
  })
  @ApiResponse({ status: 200, description: 'Return stock turnover rates' })
  async getStockTurnover(
    @Query('productId', ParseIntPipe) productId?: number,
    @Query('locationType') locationType?: 'distribution' | 'warehouse',
    @Query('locationId', ParseIntPipe) locationId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('period') period?: 'daily' | 'weekly' | 'monthly' | 'quarterly',
  ) {
    return this.stockReportsService.getStockTurnover(
      productId,
      locationType,
      locationId,
      startDate,
      endDate,
      period,
    );
  }

  @Get('aging-analysis')
  @ApiOperation({ summary: 'Get stock aging analysis' })
  @ApiQuery({
    name: 'locationType',
    required: false,
    enum: ['distribution', 'warehouse'],
  })
  @ApiQuery({ name: 'locationId', required: false, type: Number })
  @ApiQuery({ name: 'productCategory', required: false })
  @ApiQuery({
    name: 'agingBuckets',
    required: false,
    description: 'Comma-separated aging buckets in days (e.g., "30,60,90,180")',
  })
  @ApiResponse({ status: 200, description: 'Return aging analysis' })
  async getAgingAnalysis(
    @Query('locationType') locationType?: 'distribution' | 'warehouse',
    @Query('locationId', ParseIntPipe) locationId?: number,
    @Query('productCategory') productCategory?: string,
    @Query('agingBuckets') agingBuckets?: string,
  ) {
    return this.stockReportsService.getAgingAnalysis(
      locationType,
      locationId,
      productCategory,
      agingBuckets,
    );
  }

  @Get('stock-valuation')
  @ApiOperation({ summary: 'Get stock valuation report' })
  @ApiQuery({
    name: 'locationType',
    required: false,
    enum: ['distribution', 'warehouse'],
  })
  @ApiQuery({ name: 'locationId', required: false, type: Number })
  @ApiQuery({
    name: 'valuationMethod',
    required: false,
    enum: ['FIFO', 'LIFO', 'weighted-average'],
  })
  @ApiQuery({ name: 'asOfDate', required: false })
  @ApiResponse({ status: 200, description: 'Return stock valuation' })
  async getStockValuation(
    @Query('locationType') locationType?: 'distribution' | 'warehouse',
    @Query('locationId', ParseIntPipe) locationId?: number,
    @Query('valuationMethod')
    valuationMethod?: 'FIFO' | 'LIFO' | 'weighted-average',
    @Query('asOfDate') asOfDate?: string,
  ) {
    return this.stockReportsService.getStockValuation(
      locationType,
      locationId,
      valuationMethod,
      asOfDate,
    );
  }

  // @Get('stock-reconciliation')
  // @ApiOperation({ summary: 'Get stock reconciliation report' })
  // @ApiQuery({
  //   name: 'locationType',
  //   required: true,
  //   enum: ['distribution', 'warehouse'],
  // })
  // @ApiQuery({ name: 'locationId', required: true, type: Number })
  // @ApiQuery({ name: 'startDate', required: true, type: String })
  // @ApiQuery({ name: 'endDate', required: true, type: String })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Return reconciliation report',
  // })
  // async getStockReconciliation(
  //   @Query('locationType') locationType: 'distribution' | 'warehouse',
  //   @Query('locationId', ParseIntPipe) locationId: number,
  //   @Query('startDate') startDate: string,
  //   @Query('endDate') endDate: string,
  // ): Promise<StockReconciliationReport> {
  //   return await this.stockReportsService.getStockReconciliation(
  //     locationType,
  //     locationId,
  //     startDate,
  //     endDate,
  //   );
  // }

  @Get('fast-moving-items')
  @ApiOperation({ summary: 'Get fast moving items report' })
  @ApiQuery({
    name: 'locationType',
    required: false,
    enum: ['distribution', 'warehouse'],
  })
  @ApiQuery({ name: 'locationId', required: false, type: Number })
  @ApiQuery({ name: 'topN', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiResponse({ status: 200, description: 'Return fast moving items' })
  async getFastMovingItems(
    @Query('locationType') locationType?: 'distribution' | 'warehouse',
    @Query('locationId', ParseIntPipe) locationId?: number,
    @Query('topN', ParseIntPipe) topN?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.stockReportsService.getFastMovingItems(
      locationType,
      locationId,
      topN,
      startDate,
      endDate,
    );
  }

  @Get('slow-moving-items')
  @ApiOperation({ summary: 'Get slow moving items report' })
  @ApiQuery({
    name: 'locationType',
    required: false,
    enum: ['distribution', 'warehouse'],
  })
  @ApiQuery({ name: 'locationId', required: false, type: Number })
  @ApiQuery({ name: 'thresholdDays', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiResponse({ status: 200, description: 'Return slow moving items' })
  async getSlowMovingItems(
    @Query('locationType') locationType?: 'distribution' | 'warehouse',
    @Query('locationId', ParseIntPipe) locationId?: number,
    @Query('thresholdDays', ParseIntPipe) thresholdDays?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.stockReportsService.getSlowMovingItems(
      locationType,
      locationId,
      thresholdDays,
      startDate,
      endDate,
    );
  }

  // @Get('stock-forecast')
  // @ApiOperation({ summary: 'Get stock demand forecast' })
  // @ApiQuery({ name: 'productId', required: false, type: Number })
  // @ApiQuery({
  //   name: 'locationType',
  //   required: false,
  //   enum: ['distribution', 'warehouse'],
  // })
  // @ApiQuery({ name: 'locationId', required: false, type: Number })
  // @ApiQuery({
  //   name: 'forecastPeriod',
  //   required: false,
  //   enum: ['7days', '30days', '90days'],
  // })
  // @ApiQuery({
  //   name: 'method',
  //   required: false,
  //   enum: ['moving-average', 'exponential-smoothing'],
  // })
  // @ApiResponse({ status: 200, description: 'Return stock forecast' })
  // async getStockForecast(
  //   @Query('productId', ParseIntPipe) productId?: number,
  //   @Query('locationType') locationType?: 'distribution' | 'warehouse',
  //   @Query('locationId', ParseIntPipe) locationId?: number,
  //   @Query('forecastPeriod') forecastPeriod?: '7days' | '30days' | '90days',
  //   @Query('method') method?: 'moving-average' | 'exponential-smoothing',
  // ) {
  //   return this.stockReportsService.getStockForecast(
  //     productId,
  //     locationType,
  //     locationId,
  //     forecastPeriod,
  //     method,
  //   );
  // }
}
