import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class GetCurrentStockDto {
  @ApiProperty({
    enum: ['distribution', 'warehouse'],
    description: 'Location type',
  })
  @IsEnum(['distribution', 'warehouse'])
  locationType: 'distribution' | 'warehouse';

  @ApiProperty({ description: 'Location ID' })
  @Type(() => Number)
  @IsNumber()
  locationId: number;

  @ApiPropertyOptional({ description: 'Product ID (optional)' })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  productId?: number;
}
