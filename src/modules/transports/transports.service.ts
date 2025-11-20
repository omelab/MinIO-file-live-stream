// transports/transports.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { CreateTransportDto } from './dto/create-transport.dto';
import { UpdateTransportDto } from './dto/update-transport.dto';
import { Transport } from './models/transport.model';

@Injectable()
export class TransportsService {
  constructor(
    @InjectModel(Transport)
    private transportModel: typeof Transport,
  ) {}

  async create(createTransportDto: CreateTransportDto): Promise<Transport> {
    // Check if vehicle number already exists
    const existingTransport = await this.transportModel.findOne({
      where: { vehicleNumber: createTransportDto.vehicleNumber },
    });

    if (existingTransport) {
      throw new ConflictException(
        'Transport with this vehicle number already exists',
      );
    }

    return this.transportModel.create(createTransportDto);
  }

  async findAll(): Promise<Transport[]> {
    return this.transportModel.findAll({
      where: { isActive: true },
      order: [['vehicleNumber', 'ASC']],
    });
  }

  async findOne(id: number): Promise<Transport> {
    const transport = await this.transportModel.findByPk(id);
    if (!transport) {
      throw new NotFoundException(`Transport with ID ${id} not found`);
    }
    return transport;
  }

  async update(
    id: number,
    updateTransportDto: UpdateTransportDto,
  ): Promise<Transport> {
    const transport = await this.transportModel.findByPk(id);
    if (!transport) {
      throw new NotFoundException(`Transport with ID ${id} not found`);
    }

    // If vehicle number is being updated, check for duplicates
    if (
      updateTransportDto.vehicleNumber &&
      updateTransportDto.vehicleNumber !== transport.vehicleNumber
    ) {
      const existingTransport = await this.transportModel.findOne({
        where: { vehicleNumber: updateTransportDto.vehicleNumber },
      });

      if (existingTransport) {
        throw new ConflictException(
          'Transport with this vehicle number already exists',
        );
      }
    }

    await transport.update(updateTransportDto);
    return transport;
  }

  async remove(id: number): Promise<{ message: string }> {
    const transport = await this.transportModel.findByPk(id);
    if (!transport) {
      throw new NotFoundException(`Transport with ID ${id} not found`);
    }

    await transport.update({ isActive: false });
    return { message: 'Transport deactivated successfully' };
  }

  async searchTransports(searchTerm: string): Promise<Transport[]> {
    return this.transportModel.findAll({
      where: {
        [Op.or]: [
          { vehicleNumber: { [Op.iLike]: `%${searchTerm}%` } },
          { driverName: { [Op.iLike]: `%${searchTerm}%` } },
          { vehicleType: { [Op.iLike]: `%${searchTerm}%` } },
        ],
        isActive: true,
      },
    });
  }
}
