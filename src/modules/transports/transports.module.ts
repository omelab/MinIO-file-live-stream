import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Transport } from './models/transport.model';
import { TransportsController } from './transports.controller';
import { TransportsService } from './transports.service';

@Module({
  imports: [SequelizeModule.forFeature([Transport])],
  providers: [TransportsService],
  controllers: [TransportsController],
  exports: [TransportsService],
})
export class TransportsModule {}
