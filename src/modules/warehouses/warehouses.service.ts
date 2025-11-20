// warehouses/warehouses.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { Warehouse } from './models/warehouse.model';
@Injectable()
export class WarehousesService {
  constructor(
    @InjectModel(Warehouse)
    private warehouseModel: typeof Warehouse,
  ) {}

  async create(createWarehouseDto: CreateWarehouseDto): Promise<Warehouse> {
    // Check if code already exists
    const existingWarehouse = await this.warehouseModel.findOne({
      where: { code: createWarehouseDto.code },
    });

    if (existingWarehouse) {
      throw new ConflictException('Warehouse with this code already exists');
    }

    return this.warehouseModel.create(createWarehouseDto);
  }

  async findAll(): Promise<Warehouse[]> {
    return this.warehouseModel.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']],
    });
  }

  async findOne(id: number): Promise<Warehouse> {
    const warehouse = await this.warehouseModel.findByPk(id);
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }
    return warehouse;
  }

  async update(
    id: number,
    updateWarehouseDto: UpdateWarehouseDto,
  ): Promise<Warehouse> {
    const warehouse = await this.warehouseModel.findByPk(id);
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    // If code is being updated, check for duplicates
    if (updateWarehouseDto.code && updateWarehouseDto.code !== warehouse.code) {
      const existingWarehouse = await this.warehouseModel.findOne({
        where: { code: updateWarehouseDto.code },
      });

      if (existingWarehouse) {
        throw new ConflictException('Warehouse with this code already exists');
      }
    }

    await warehouse.update(updateWarehouseDto);
    return warehouse;
  }

  async remove(id: number): Promise<{ message: string }> {
    const warehouse = await this.warehouseModel.findByPk(id);
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    await warehouse.update({ isActive: false });
    return { message: 'Warehouse deactivated successfully' };
  }

  async searchWarehouses(searchTerm: string): Promise<Warehouse[]> {
    return this.warehouseModel.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${searchTerm}%` } },
          { code: { [Op.iLike]: `%${searchTerm}%` } },
          { contactPerson: { [Op.iLike]: `%${searchTerm}%` } },
        ],
        isActive: true,
      },
    });
  }
}
