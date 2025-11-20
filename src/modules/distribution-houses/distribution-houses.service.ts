// distribution-houses/distribution-houses.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { CreateDistributionHouseDto } from './dto/create-distribution-house.dto';
import { UpdateDistributionHouseDto } from './dto/update-distribution-house.dto';
import { DistributionHouse } from './models/distribution-house.model';

@Injectable()
export class DistributionHousesService {
  constructor(
    @InjectModel(DistributionHouse)
    private distributionHouseModel: typeof DistributionHouse,
  ) {}

  async create(
    createDistributionHouseDto: CreateDistributionHouseDto,
  ): Promise<DistributionHouse> {
    // Check if code already exists
    const existingDh = await this.distributionHouseModel.findOne({
      where: { code: createDistributionHouseDto.code },
    });

    if (existingDh) {
      throw new ConflictException(
        'Distribution house with this code already exists',
      );
    }

    return this.distributionHouseModel.create(createDistributionHouseDto);
  }

  async findAll(): Promise<DistributionHouse[]> {
    return this.distributionHouseModel.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']],
    });
  }

  async findOne(id: number): Promise<DistributionHouse> {
    const distributionHouse = await this.distributionHouseModel.findByPk(id);
    if (!distributionHouse) {
      throw new NotFoundException(`Distribution house with ID ${id} not found`);
    }
    return distributionHouse;
  }

  async update(
    id: number,
    updateDistributionHouseDto: UpdateDistributionHouseDto,
  ): Promise<DistributionHouse> {
    const distributionHouse = await this.distributionHouseModel.findByPk(id);
    if (!distributionHouse) {
      throw new NotFoundException(`Distribution house with ID ${id} not found`);
    }

    // If code is being updated, check for duplicates
    if (
      updateDistributionHouseDto.code &&
      updateDistributionHouseDto.code !== distributionHouse.code
    ) {
      const existingDh = await this.distributionHouseModel.findOne({
        where: { code: updateDistributionHouseDto.code },
      });

      if (existingDh) {
        throw new ConflictException(
          'Distribution house with this code already exists',
        );
      }
    }

    await distributionHouse.update(updateDistributionHouseDto);
    return distributionHouse;
  }

  async remove(id: number): Promise<{ message: string }> {
    const distributionHouse = await this.distributionHouseModel.findByPk(id);
    if (!distributionHouse) {
      throw new NotFoundException(`Distribution house with ID ${id} not found`);
    }

    await distributionHouse.update({ isActive: false });
    return { message: 'Distribution house deactivated successfully' };
  }

  async searchDistributionHouses(
    searchTerm: string,
  ): Promise<DistributionHouse[]> {
    return this.distributionHouseModel.findAll({
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
