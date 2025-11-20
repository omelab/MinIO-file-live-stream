// warehouses/warehouses.controller.ts
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

import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { Warehouse } from './models/warehouse.model';
import { WarehousesService } from './warehouses.service';

@ApiTags('Warehouse Management')
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new warehouse' })
  @ApiResponse({ status: 201, description: 'Warehouse created successfully' })
  @ApiResponse({
    status: 409,
    description: 'Warehouse with this code already exists',
  })
  async create(
    @Body() createWarehouseDto: CreateWarehouseDto,
  ): Promise<Warehouse> {
    return this.warehousesService.create(createWarehouseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active warehouses' })
  @ApiResponse({ status: 200, description: 'Return all warehouses' })
  async findAll(): Promise<Warehouse[]> {
    return this.warehousesService.findAll();
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search warehouses by name, code or contact person',
  })
  @ApiQuery({ name: 'q', required: true, description: 'Search term' })
  @ApiResponse({ status: 200, description: 'Return search results' })
  async searchWarehouses(@Query('q') searchTerm: string): Promise<Warehouse[]> {
    return this.warehousesService.searchWarehouses(searchTerm);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get warehouse by ID' })
  @ApiResponse({ status: 200, description: 'Return warehouse' })
  @ApiResponse({ status: 404, description: 'Warehouse not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Warehouse> {
    return this.warehousesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update warehouse' })
  @ApiResponse({ status: 200, description: 'Warehouse updated successfully' })
  @ApiResponse({ status: 404, description: 'Warehouse not found' })
  @ApiResponse({
    status: 409,
    description: 'Warehouse with this code already exists',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWarehouseDto: UpdateWarehouseDto,
  ): Promise<Warehouse> {
    return this.warehousesService.update(id, updateWarehouseDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate warehouse' })
  @ApiResponse({
    status: 200,
    description: 'Warehouse deactivated successfully',
  })
  @ApiResponse({ status: 404, description: 'Warehouse not found' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.warehousesService.remove(id);
  }
}
