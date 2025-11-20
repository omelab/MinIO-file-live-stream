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
import { DistributionHousesService } from './distribution-houses.service';
import { CreateDistributionHouseDto } from './dto/create-distribution-house.dto';
import { UpdateDistributionHouseDto } from './dto/update-distribution-house.dto';
import { DistributionHouse } from './models/distribution-house.model';

@ApiTags('Distribution Houses')
@Controller('distribution-houses')
export class DistributionHousesController {
  constructor(
    private readonly distributionHousesService: DistributionHousesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new distribution house' })
  @ApiResponse({
    status: 201,
    description: 'Distribution house created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Distribution house with this code already exists',
  })
  async create(
    @Body() createDistributionHouseDto: CreateDistributionHouseDto,
  ): Promise<DistributionHouse> {
    return this.distributionHousesService.create(createDistributionHouseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active distribution houses' })
  @ApiResponse({ status: 200, description: 'Return all distribution houses' })
  async findAll(): Promise<DistributionHouse[]> {
    return this.distributionHousesService.findAll();
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search distribution houses by name, code or contact person',
  })
  @ApiQuery({ name: 'q', required: true, description: 'Search term' })
  @ApiResponse({ status: 200, description: 'Return search results' })
  async searchDistributionHouses(
    @Query('q') searchTerm: string,
  ): Promise<DistributionHouse[]> {
    return this.distributionHousesService.searchDistributionHouses(searchTerm);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get distribution house by ID' })
  @ApiResponse({ status: 200, description: 'Return distribution house' })
  @ApiResponse({ status: 404, description: 'Distribution house not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DistributionHouse> {
    return this.distributionHousesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update distribution house' })
  @ApiResponse({
    status: 200,
    description: 'Distribution house updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Distribution house not found' })
  @ApiResponse({
    status: 409,
    description: 'Distribution house with this code already exists',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDistributionHouseDto: UpdateDistributionHouseDto,
  ): Promise<DistributionHouse> {
    return this.distributionHousesService.update(
      id,
      updateDistributionHouseDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate distribution house' })
  @ApiResponse({
    status: 200,
    description: 'Distribution house deactivated successfully',
  })
  @ApiResponse({ status: 404, description: 'Distribution house not found' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.distributionHousesService.remove(id);
  }
}
