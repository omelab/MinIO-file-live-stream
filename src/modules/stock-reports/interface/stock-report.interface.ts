export interface DistributionHouseCurrentStock {
  productId: number;
  productName?: string | null;
  sku?: string | null;
  distributionHouseId: number;
  distributionHouseName?: string | null;
  currentStock: number;
  lastUpdated: Date;
}

export interface WarehouseCurrentStock {
  productId: number;
  productName?: string | null;
  sku?: string | null;
  warehouseId: number;
  warehouseName?: string | null;
  currentStock: number;
  lastUpdated: Date;
}

export type CurrentStockItem =
  | DistributionHouseCurrentStock
  | WarehouseCurrentStock;

export interface StockAlert {
  productId: number;
  productName: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  alertType: 'low-stock' | 'over-stock' | 'expired' | 'expiring-soon';
  severity: 'low' | 'medium' | 'high';
}

export interface StockTurnover {
  productId: number;
  productName: string;
  beginningInventory: number;
  endingInventory: number;
  costOfGoodsSold: number;
  averageInventory: number;
  turnoverRate: number;
  turnoverDays: number;
}

export interface AgingAnalysis {
  productId: number;
  productName: string;
  currentStock: number;
  agingBuckets: {
    bucket: string;
    quantity: number;
    value: number;
    percentage: number;
  }[];
}
export interface StockReconciliationReport {
  locationType: 'distribution' | 'warehouse';
  locationId: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
  openingStock: StockItem[];
  closingStock: StockItem[];
  transactions: StockTransaction[];
  discrepancies: Discrepancy[];
}

export interface StockItem {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
}

export interface StockTransaction {
  id: number;
  type: 'in' | 'out' | 'adjustment';
  itemId: number;
  itemName: string;
  quantity: number;
  date: Date;
  reference: string;
}

export interface Discrepancy {
  itemId: number;
  itemName: string;
  expectedQuantity: number;
  actualQuantity: number;
  variance: number;
  variancePercentage: number;
}
