import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 14 Pro' })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({ example: 'IPH14-PRO-128' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: 'Latest iPhone model', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'pcs', required: false })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateProductDto {
  @ApiProperty({ example: 'iPhone 14 Pro Max', required: false })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiProperty({ example: 'IPH14-PRO-MAX-128', required: false })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'box', required: false })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
