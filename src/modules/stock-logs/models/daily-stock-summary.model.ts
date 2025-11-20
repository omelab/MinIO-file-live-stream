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

@Table({
  tableName: 'daily_stock_summary',
  underscored: true,
})
export class DailyStockSummary extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  declare id: number;

  @Column(DataType.DATE)
  declare date: Date;

  @Column(DataType.STRING(20))
  declare locationType: string;

  @Column(DataType.BIGINT)
  declare locationId: number;

  @ForeignKey(() => Product)
  @Column(DataType.BIGINT)
  declare productId: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare closingStock: number;

  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;

  // Associations
  @BelongsTo(() => Product)
  declare product: Product;
}
