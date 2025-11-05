import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PresignedUploadRequestDto {
  @ApiProperty({ description: 'Name of the file to upload' })
  @IsString()
  filename: string;

  @ApiProperty({ 
    description: 'Content type of the file', 
    required: false,
    example: 'image/jpeg' 
  })
  @IsOptional()
  @IsString()
  contentType?: string;
}