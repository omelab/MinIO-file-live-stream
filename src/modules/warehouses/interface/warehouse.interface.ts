// warehouse.interface.ts
export interface WarehouseAttributes {
  warehouseId: number;
  name: string;
  code: string;
  address: string | null;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WarehouseCreationAttributes
  extends Omit<WarehouseAttributes, 'warehouseId' | 'createdAt' | 'updatedAt'> {
  // These fields are auto-generated, so they're optional for creation
  warehouseId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
