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
import { Product } from '../../products/models/product.model';
import { Transport } from '../../transports/models/transport.model';
import { Warehouse } from '../../warehouses/models/warehouse.model';

@Table({
  tableName: 'warehouse_stock_log',
  underscored: true,
})
export class WarehouseStockLog extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Warehouse)
  @Column(DataType.INTEGER)
  declare warehouseId: number;

  @Column(DataType.DATE)
  declare date: Date;

  @ForeignKey(() => Product)
  @Column(DataType.INTEGER)
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

  @Column(DataType.INTEGER)
  declare referenceId: number;

  @ForeignKey(() => Transport)
  @Column(DataType.INTEGER)
  declare transportId: number;

  @Column(DataType.TEXT)
  declare notes: string;

  @Column(DataType.INTEGER)
  declare createdBy: number;

  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;

  // Associations
  @BelongsTo(() => Warehouse)
  declare warehouse: Warehouse;

  @BelongsTo(() => Product)
  declare product: Product;

  @BelongsTo(() => Transport)
  declare transport: Transport;
}
