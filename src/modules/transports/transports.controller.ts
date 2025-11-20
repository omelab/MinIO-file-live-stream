// transports/transports.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateTransportDto } from './dto/create-transport.dto';
import { UpdateTransportDto } from './dto/update-transport.dto';
import { Transport } from './models/transport.model';
import { TransportsService } from './transports.service';

@ApiTags('Transports Management')
@Controller('transports')
export class TransportsController {
  constructor(private readonly transportsService: TransportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transport' })
  @ApiResponse({ status: 201, description: 'Transport created successfully' })
  @ApiResponse({
    status: 409,
    description: 'Transport with this vehicle number already exists',
  })
  async create(
    @Body() createTransportDto: CreateTransportDto,
  ): Promise<Transport> {
    return await this.transportsService.create(createTransportDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active transports' })
  @ApiResponse({ status: 200, description: 'Return all transports' })
  async findAll(): Promise<Transport[]> {
    return await this.transportsService.findAll();
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search transports by vehicle number, driver name or vehicle type',
  })
  @ApiQuery({ name: 'q', required: true, description: 'Search term' })
  @ApiResponse({ status: 200, description: 'Return search results' })
  async searchTransports(@Query('q') searchTerm: string): Promise<Transport[]> {
    return this.transportsService.searchTransports(searchTerm);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transport by ID' })
  @ApiResponse({ status: 200, description: 'Return transport' })
  @ApiResponse({ status: 404, description: 'Transport not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Transport> {
    return this.transportsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update transport' })
  @ApiResponse({ status: 200, description: 'Transport updated successfully' })
  @ApiResponse({ status: 404, description: 'Transport not found' })
  @ApiResponse({
    status: 409,
    description: 'Transport with this vehicle number already exists',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTransportDto: UpdateTransportDto,
  ): Promise<Transport> {
    return this.transportsService.update(id, updateTransportDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate transport' })
  @ApiResponse({
    status: 200,
    description: 'Transport deactivated successfully',
  })
  @ApiResponse({ status: 404, description: 'Transport not found' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.transportsService.remove(id);
  }
}
