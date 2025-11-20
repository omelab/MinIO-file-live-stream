export interface TransportAttributes {
  transportId: number;
  vehicleNumber: string;
  driverName: string | null;
  driverPhone: string | null;
  vehicleType: string | null;
  capacity: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransportCreationAttributes {
  vehicleNumber: string;
  driverName?: string | null;
  driverPhone?: string | null;
  vehicleType?: string | null;
  capacity?: number | null;
  isActive?: boolean;
}
