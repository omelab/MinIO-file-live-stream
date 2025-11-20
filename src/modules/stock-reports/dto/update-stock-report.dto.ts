import { PartialType } from '@nestjs/swagger';
import { CreateStockReportDto } from './create-stock-report.dto';

export class UpdateStockReportDto extends PartialType(CreateStockReportDto) {}
