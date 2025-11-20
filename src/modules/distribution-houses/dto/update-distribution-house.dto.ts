import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateDistributionHouseDto {
  @ApiProperty({ example: 'Dhaka Main Distribution', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'DHAKA-MAIN', required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ example: '456 Updated Street, Dhaka', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'Jane Smith', required: false })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiProperty({ example: '+8801712345679', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'info@dhaka.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
