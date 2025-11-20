// auth/dto/logout.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LogoutDto {
  @ApiProperty({ example: 'your-refresh-token' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
