import { PartialType } from '@nestjs/swagger';
import { CreateStockLogDto } from './create-stock-log.dto';

export class UpdateStockLogDto extends PartialType(CreateStockLogDto) {}
