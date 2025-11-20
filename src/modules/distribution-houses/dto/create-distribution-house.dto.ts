import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDistributionHouseDto {
  @ApiProperty({ example: 'Dhaka Distribution Center' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'DHAKA-DC-01' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: '123 Main Street, Dhaka', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiProperty({ example: '+8801712345678', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'dhaka@company.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
