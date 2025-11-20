import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DistributionHousesController } from './distribution-houses.controller';
import { DistributionHousesService } from './distribution-houses.service';
import { DistributionHouse } from './models/distribution-house.model';

@Module({
  imports: [SequelizeModule.forFeature([DistributionHouse])],
  providers: [DistributionHousesService],
  controllers: [DistributionHousesController],
  exports: [DistributionHousesService],
})
export class DistributionHousesModule {}
