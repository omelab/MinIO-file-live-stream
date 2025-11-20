import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class StockTransferItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ example: 150.5, required: false })
  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @ApiProperty({ example: 'BATCH-001', required: false })
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @ApiProperty({ example: '2024-12-31', required: false })
  @IsOptional()
  @IsDateString()
  expiryDate?: Date;
}

export class ProductionToDhTransferDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  distributionHouseId: number;

  @ApiProperty({ example: 'PROD-001' })
  @IsString()
  @IsNotEmpty()
  productionOrderNumber: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  @IsNotEmpty()
  transferDate: Date;

  @ApiProperty({ example: 'Production batch completed', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [StockTransferItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockTransferItemDto)
  @IsNotEmpty()
  items: StockTransferItemDto[];

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  createdBy: number;
}

export class PurchaseToDhTransferDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  distributionHouseId: number;

  @ApiProperty({ example: 'PUR-001' })
  @IsString()
  @IsNotEmpty()
  purchaseOrderNumber: string;

  @ApiProperty({ example: 'Supplier Name' })
  @IsString()
  @IsNotEmpty()
  supplierName: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  @IsNotEmpty()
  transferDate: Date;

  @ApiProperty({ example: 'Purchase from supplier', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [StockTransferItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockTransferItemDto)
  @IsNotEmpty()
  items: StockTransferItemDto[];

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  createdBy: number;
}

export class SaleFromWarehouseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  warehouseId: number;

  @ApiProperty({ example: 'SALE-001' })
  @IsString()
  @IsNotEmpty()
  salesOrderNumber: string;

  @ApiProperty({ example: 'Customer Name' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  @IsNotEmpty()
  saleDate: Date;

  @ApiProperty({ example: 'Customer sale', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [StockTransferItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockTransferItemDto)
  @IsNotEmpty()
  items: StockTransferItemDto[];

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  createdBy: number;
}

export class CustomerReturnToWarehouseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  warehouseId: number;

  @ApiProperty({ example: 'RET-001' })
  @IsString()
  @IsNotEmpty()
  returnNumber: string;

  @ApiProperty({ example: 'SALE-001' })
  @IsString()
  @IsNotEmpty()
  originalSalesOrderNumber: string;

  @ApiProperty({ example: 'Customer Name' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  @IsNotEmpty()
  returnDate: Date;

  @ApiProperty({
    example: 'Damaged goods',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ example: 'Customer return processing', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [StockTransferItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockTransferItemDto)
  @IsNotEmpty()
  items: StockTransferItemDto[];

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  createdBy: number;
}

export class WarehouseToDhReturnDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  warehouseId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  distributionHouseId: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  transportId?: number;

  @ApiProperty({ example: 'WH-RET-001' })
  @IsString()
  @IsNotEmpty()
  returnNumber: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  @IsNotEmpty()
  returnDate: Date;

  @ApiProperty({
    example: 'Expired goods',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ example: 'Return to distribution house', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [StockTransferItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockTransferItemDto)
  @IsNotEmpty()
  items: StockTransferItemDto[];

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  createdBy: number;
}

export class CreateDhToDhTransferDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  fromDistributionHouseId: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsNotEmpty()
  toDistributionHouseId: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  transportId?: number;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  @IsNotEmpty()
  transferDate: Date;

  @ApiProperty({ example: 'Regular stock transfer', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [StockTransferItemDto] })
  @IsNotEmpty()
  items: StockTransferItemDto[];

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  createdBy: number;
}

export class CreateDhToWhTransferDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  fromDistributionHouseId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  toWarehouseId: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  transportId?: number;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  @IsNotEmpty()
  transferDate: Date;

  @ApiProperty({ example: 'Supply to warehouse', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [StockTransferItemDto] })
  @IsNotEmpty()
  items: StockTransferItemDto[];

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  createdBy: number;
}

export class CreateWhToWhTransferDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  fromWarehouseId: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsNotEmpty()
  toWarehouseId: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  transportId?: number;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  @IsNotEmpty()
  transferDate: Date;

  @ApiProperty({ example: 'Inter-warehouse transfer', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [StockTransferItemDto] })
  @IsNotEmpty()
  items: StockTransferItemDto[];

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  createdBy: number;
}
