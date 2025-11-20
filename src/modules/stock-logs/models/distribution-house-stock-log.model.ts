// stock-logs/distribution-house-stock-log.model.ts
import {
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { DistributionHouse } from '../../distribution-houses/models/distribution-house.model';
import { Product } from '../../products/models/product.model';
import { Transport } from '../../transports/models/transport.model';

@Table({
  tableName: 'distribution_house_stock_log',
  underscored: true,
})
export class DistributionHouseStockLog extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  declare id: number;

  @ForeignKey(() => DistributionHouse)
  @Column(DataType.BIGINT)
  declare distributionHouseId: number;

  @Column(DataType.DATE)
  declare date: Date;

  @ForeignKey(() => Product)
  @Column(DataType.BIGINT)
  declare productId: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
  })
  declare openingStock: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
  })
  declare stockIn: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
  })
  declare stockOut: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
  })
  declare closingStock: number;

  @Column(DataType.STRING(50))
  declare referenceType: string;

  @Column(DataType.BIGINT)
  declare referenceId: number;

  @ForeignKey(() => Transport)
  @Column(DataType.BIGINT)
  declare transportId: number;

  @Column(DataType.TEXT)
  declare notes: string;

  @Column(DataType.BIGINT)
  declare createdBy: number;

  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;

  // Associations
  @BelongsTo(() => DistributionHouse)
  declare distributionHouse: DistributionHouse;

  @BelongsTo(() => Product)
  declare product: Product;

  @BelongsTo(() => Transport)
  declare transport: Transport;
}
