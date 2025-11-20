// warehouse.model.ts
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
import {
  WarehouseAttributes,
  WarehouseCreationAttributes,
} from '../interface/warehouse.interface';

@Table({
  tableName: 'warehouses',
  underscored: true,
})
export class Warehouse extends Model<
  WarehouseAttributes,
  WarehouseCreationAttributes
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare warehouseId: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(50),
    unique: true,
    allowNull: false,
  })
  declare code: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare address: string | null;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare contactPerson: string | null;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  declare phone: string | null;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare email: string | null;

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
