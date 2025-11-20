import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateDhToDhTransferDto,
  CreateDhToWhTransferDto,
  CreateWhToWhTransferDto,
  CustomerReturnToWarehouseDto,
  ProductionToDhTransferDto,
  PurchaseToDhTransferDto,
  SaleFromWarehouseDto,
  WarehouseToDhReturnDto,
} from './dto/create-stock-transfer.dto';
import { StockTransfersService } from './stock-transfers.service';

@ApiTags('Stock Transfers')
@ApiBearerAuth()
@Controller('stock-transfers')
export class StockTransfersController {
  constructor(private readonly stockTransfersService: StockTransfersService) {}

  @Post('dh-to-dh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Transfer stock between distribution houses' })
  @ApiResponse({ status: 200, description: 'Transfer completed successfully' })
  @ApiResponse({
    status: 404,
    description: 'Distribution house or product not found',
  })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  async transferDhToDh(
    @Body() transferDto: CreateDhToDhTransferDto,
  ): Promise<{ message: string; transferId: number }> {
    return await this.stockTransfersService.transferDhToDh(transferDto);
  }

  @Post('dh-to-wh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Transfer stock from distribution house to warehouse',
  })
  @ApiResponse({ status: 200, description: 'Transfer completed successfully' })
  @ApiResponse({
    status: 404,
    description: 'Distribution house, warehouse or product not found',
  })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  async transferDhToWh(
    @Body() transferDto: CreateDhToWhTransferDto,
  ): Promise<{ message: string; transferId: number }> {
    return await this.stockTransfersService.transferDhToWh(transferDto);
  }

  @Post('wh-to-wh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Transfer stock between warehouses' })
  @ApiResponse({ status: 200, description: 'Transfer completed successfully' })
  @ApiResponse({ status: 404, description: 'Warehouse or product not found' })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  async transferWhToWh(
    @Body() transferDto: CreateWhToWhTransferDto,
  ): Promise<{ message: string; transferId: number }> {
    return await this.stockTransfersService.transferWhToWh(transferDto);
  }

  @Post('production-to-dh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Transfer production stock to distribution house' })
  @ApiResponse({
    status: 200,
    description: 'Production transfer completed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Distribution house or product not found',
  })
  @ApiResponse({ status: 400, description: 'Invalid product or quantity' })
  async productionToDistributionHouse(
    @Body() transferDto: ProductionToDhTransferDto,
  ): Promise<{ message: string; transferId: number }> {
    return await this.stockTransfersService.productionToDistributionHouse(
      transferDto,
    );
  }

  @Post('purchase-to-dh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Transfer purchased stock to distribution house' })
  @ApiResponse({
    status: 200,
    description: 'Purchase transfer completed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Distribution house or product not found',
  })
  @ApiResponse({ status: 400, description: 'Invalid product or quantity' })
  async purchaseToDistributionHouse(
    @Body() transferDto: PurchaseToDhTransferDto,
  ): Promise<{ message: string; transferId: number }> {
    return await this.stockTransfersService.purchaseToDistributionHouse(
      transferDto,
    );
  }

  @Post('sale-from-warehouse')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sell stock from warehouse to customer' })
  @ApiResponse({ status: 200, description: 'Sale completed successfully' })
  @ApiResponse({ status: 404, description: 'Warehouse or product not found' })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  async saleFromWarehouse(
    @Body() saleDto: SaleFromWarehouseDto,
  ): Promise<{ message: string; saleId: number }> {
    return await this.stockTransfersService.saleFromWarehouse(saleDto);
  }

  @Post('customer-return-to-warehouse')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process customer return to warehouse' })
  @ApiResponse({
    status: 200,
    description: 'Customer return processed successfully',
  })
  @ApiResponse({ status: 404, description: 'Warehouse or product not found' })
  @ApiResponse({ status: 400, description: 'Invalid return data' })
  async customerReturnToWarehouse(
    @Body() returnDto: CustomerReturnToWarehouseDto,
  ): Promise<{ message: string; returnId: number }> {
    return await this.stockTransfersService.customerReturnToWarehouse(
      returnDto,
    );
  }

  @Post('wh-to-dh-return')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Return stock from warehouse to distribution house',
  })
  @ApiResponse({ status: 200, description: 'Return completed successfully' })
  @ApiResponse({
    status: 404,
    description: 'Warehouse, distribution house or product not found',
  })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  async warehouseToDistributionHouseReturn(
    @Body() returnDto: WarehouseToDhReturnDto,
  ): Promise<{ message: string; returnId: number }> {
    return await this.stockTransfersService.warehouseToDistributionHouseReturn(
      returnDto,
    );
  }
}
