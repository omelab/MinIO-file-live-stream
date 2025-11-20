import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTransportDto {
  @ApiProperty({ example: 'DHK-11-1234' })
  @IsString()
  @IsNotEmpty()
  vehicleNumber: string;

  @ApiProperty({ example: 'Abdul Karim', required: false })
  @IsOptional()
  @IsString()
  driverName?: string;

  @ApiProperty({ example: '+8801712345678', required: false })
  @IsOptional()
  @IsString()
  driverPhone?: string;

  @ApiProperty({ example: 'Truck', required: false })
  @IsOptional()
  @IsString()
  vehicleType?: string;

  @ApiProperty({ example: 5000, required: false })
  @IsOptional()
  @IsNumber()
  capacity?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
