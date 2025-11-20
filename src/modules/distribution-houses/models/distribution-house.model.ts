// distribution-houses/distribution-house.model.ts
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
interface DistributionHouseCreationAttributes {
  name: string;
  code: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

@Table({
  tableName: 'distribution_houses',
  underscored: true,
})
export class DistributionHouse extends Model<
  DistributionHouse,
  DistributionHouseCreationAttributes
> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  declare distributionHouseId: number;

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

  @Column(DataType.TEXT)
  declare address: string;

  @Column(DataType.STRING(255))
  declare contactPerson: string;

  @Column(DataType.STRING(20))
  declare phone: string;

  @Column(DataType.STRING(255))
  declare email: string;

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
