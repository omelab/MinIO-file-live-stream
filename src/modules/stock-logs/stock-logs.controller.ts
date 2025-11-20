import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateStockLogDto } from './dto/create-stock-log.dto';
import { UpdateStockLogDto } from './dto/update-stock-log.dto';
import { StockLogsService } from './stock-logs.service';

@Controller('Stock Logs')
export class StockLogsController {
  constructor(private readonly stockLogsService: StockLogsService) {}

  @Post()
  create(@Body() createStockLogDto: CreateStockLogDto) {
    return this.stockLogsService.create(createStockLogDto);
  }

  @Get()
  findAll() {
    return this.stockLogsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockLogsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStockLogDto: UpdateStockLogDto,
  ) {
    return this.stockLogsService.update(+id, updateStockLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockLogsService.remove(+id);
  }
}
