// transport.model.ts
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
  TransportAttributes,
  TransportCreationAttributes,
} from '../interface/transport.interface';

@Table({
  tableName: 'transports',
  underscored: true,
})
export class Transport extends Model<
  TransportAttributes,
  TransportCreationAttributes
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  declare transportId: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare vehicleNumber: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true, // Make sure this matches your database
  })
  declare driverName: string | null;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  declare driverPhone: string | null;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  declare vehicleType: string | null;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  declare capacity: number | null;

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
