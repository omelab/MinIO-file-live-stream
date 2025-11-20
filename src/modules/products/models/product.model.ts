// products/product.model.ts
import {
  AutoIncrement,
  Column,
  CreatedAt,
  DataType,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

// Define creation attributes interface
interface ProductCreationAttributes {
  productName: string;
  sku: string;
  description?: string;
  unit?: string;
  isActive?: boolean;
}

@Table({
  tableName: 'products',
  underscored: true,
})
export class Product extends Model<Product, ProductCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  declare productId: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare productName: string;

  @Column({
    type: DataType.STRING(100),
    unique: true,
  })
  declare sku: string;

  @Column(DataType.TEXT)
  declare description: string;

  @Column({
    type: DataType.STRING(50),
    defaultValue: 'pcs',
  })
  declare unit: string;

  @Column({
    type: DataType.DECIMAL(10, 2), // 10 digits total, 2 decimal places
    defaultValue: 0.0,
  })
  declare price: number;

  @Column({
    type: DataType.DECIMAL(10, 2), // 10 digits total, 2 decimal places
    defaultValue: 0.0,
    field: 'cost_price',
  })
  declare costPrice: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0.0,
    validate: {
      min: 0, // Prevent negative values
    },
  })
  declare minStockLevel: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 100.0, // Reasonable default
    validate: {
      min: 0,
    },
  })
  declare maxStockLevel: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  declare isActive: boolean;

  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  declare updatedAt: Date;
}
