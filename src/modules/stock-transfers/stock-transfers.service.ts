import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import Decimal from 'decimal.js';
import { Sequelize, Transaction } from 'sequelize';
import { DistributionHouse } from '../distribution-houses/models/distribution-house.model';
import { Product } from '../products/models/product.model';
import { DistributionHouseStockLog } from '../stock-logs/models/distribution-house-stock-log.model';
import { WarehouseStockLog } from '../stock-logs/models/warehouse-stock-log.model';
import { Transport } from '../transports/models/transport.model';
import { Warehouse } from '../warehouses/models/warehouse.model';
import {
  CreateDhToDhTransferDto,
  CreateDhToWhTransferDto,
  CreateWhToWhTransferDto,
  CustomerReturnToWarehouseDto,
  ProductionToDhTransferDto,
  PurchaseToDhTransferDto,
  SaleFromWarehouseDto,
  WarehouseToDhReturnDto,
} from './dto/create-stock-transfer.dto';

@Injectable()
export class StockTransfersService {
  constructor(
    @InjectConnection()
    private readonly sequelize: Sequelize,
    @InjectModel(DistributionHouseStockLog)
    private dhStockLogModel: typeof DistributionHouseStockLog,
    @InjectModel(WarehouseStockLog)
    private whStockLogModel: typeof WarehouseStockLog,
    @InjectModel(Product)
    private productModel: typeof Product,
    @InjectModel(DistributionHouse)
    private distributionHouseModel: typeof DistributionHouse,
    @InjectModel(Warehouse)
    private warehouseModel: typeof Warehouse,
    @InjectModel(Transport)
    private transportModel: typeof Transport,
  ) {}

  async transferDhToDh(
    transferDto: CreateDhToDhTransferDto,
  ): Promise<{ message: string; transferId: number }> {
    if (!this.dhStockLogModel.sequelize) {
      throw new InternalServerErrorException(
        'Database connection not available',
      );
    }

    const transaction = await this.dhStockLogModel.sequelize.transaction();

    try {
      await this.validateTransferEntities({
        fromDhId: transferDto.fromDistributionHouseId,
        toDhId: transferDto.toDistributionHouseId,
        transportId: transferDto.transportId,
        transaction,
      });

      await this.validateProductsAndStock({
        locationId: transferDto.fromDistributionHouseId,
        locationType: 'distribution',
        items: transferDto.items,
        transaction,
      });

      const transferId = Date.now();

      for (const item of transferDto.items) {
        // Update FROM distribution house (stock out)
        await this.updateDistributionHouseStock({
          distributionHouseId: transferDto.fromDistributionHouseId,
          productId: item.productId,
          date: transferDto.transferDate,
          stockIn: 0,
          stockOut: item.quantity,
          referenceType: 'DH_to_DH_Transfer_Out',
          referenceId: transferId,
          transportId: transferDto.transportId,
          notes: transferDto.notes,
          createdBy: transferDto.createdBy,
          transaction,
        });

        // Update TO distribution house (stock in)
        await this.updateDistributionHouseStock({
          distributionHouseId: transferDto.toDistributionHouseId,
          productId: item.productId,
          date: transferDto.transferDate,
          stockIn: item.quantity,
          stockOut: 0,
          referenceType: 'DH_to_DH_Transfer_In',
          referenceId: transferId,
          transportId: transferDto.transportId,
          notes: transferDto.notes,
          createdBy: transferDto.createdBy,
          transaction,
        });
      }

      await transaction.commit();
      return {
        message: 'Distribution to distribution transfer completed successfully',
        transferId,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async transferDhToWh(
    transferDto: CreateDhToWhTransferDto,
  ): Promise<{ message: string; transferId: number }> {
    if (!this.dhStockLogModel.sequelize) {
      throw new InternalServerErrorException(
        'Database connection not available',
      );
    }

    const transaction = await this.dhStockLogModel.sequelize.transaction();

    try {
      await this.validateTransferEntities({
        fromDhId: transferDto.fromDistributionHouseId,
        toDhId: undefined,
        fromWhId: transferDto.toWarehouseId,
        transportId: transferDto.transportId,
        transaction,
      });

      await this.validateProductsAndStock({
        locationId: transferDto.fromDistributionHouseId,
        locationType: 'distribution',
        items: transferDto.items,
        transaction,
      });

      const transferId = Date.now();

      for (const item of transferDto.items) {
        // Update FROM distribution house (stock out)
        await this.updateDistributionHouseStock({
          distributionHouseId: transferDto.fromDistributionHouseId,
          productId: item.productId,
          date: transferDto.transferDate,
          stockIn: 0,
          stockOut: item.quantity,
          referenceType: 'DH_to_WH_Transfer_Out',
          referenceId: transferId,
          transportId: transferDto.transportId,
          notes: transferDto.notes,
          createdBy: transferDto.createdBy,
          transaction,
        });

        // Update TO warehouse (stock in)
        await this.updateWarehouseStock({
          warehouseId: transferDto.toWarehouseId,
          productId: item.productId,
          date: transferDto.transferDate,
          stockIn: item.quantity,
          stockOut: 0,
          referenceType: 'Receive_from_DH',
          referenceId: transferId,
          transportId: transferDto.transportId,
          notes: transferDto.notes,
          createdBy: transferDto.createdBy,
          transaction,
        });
      }

      await transaction.commit();
      return {
        message: 'Distribution to warehouse transfer completed successfully',
        transferId,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async transferWhToWh(
    transferDto: CreateWhToWhTransferDto,
  ): Promise<{ message: string; transferId: number }> {
    if (!this.whStockLogModel.sequelize) {
      throw new InternalServerErrorException(
        'Database connection not available',
      );
    }

    const transaction = await this.whStockLogModel.sequelize.transaction();
    const transferId: number = Date.now();

    try {
      // 1. Validate warehouses and transport
      await this.validateTransferEntities({
        fromDhId: undefined,
        toDhId: undefined,
        fromWhId: transferDto.fromWarehouseId,
        toWhId: transferDto.toWarehouseId,
        transportId: transferDto.transportId,
        transaction,
      });

      // 2. Validate products exist and stock is sufficient
      await this.validateProductsAndStock({
        locationId: transferDto.fromWarehouseId,
        locationType: 'warehouse',
        items: transferDto.items,
        transaction,
      });

      // 3. Loop through items and update stock
      for (const item of transferDto.items) {
        // FROM warehouse: stock out
        await this.updateWarehouseStock({
          warehouseId: transferDto.fromWarehouseId,
          productId: item.productId,
          date: transferDto.transferDate,
          stockIn: 0,
          stockOut: item.quantity,
          referenceType: 'WH_to_WH_Transfer_Out',
          referenceId: transferId,
          transportId: transferDto.transportId,
          notes: transferDto.notes,
          createdBy: transferDto.createdBy,
          transaction,
        });

        // TO warehouse: stock in
        await this.updateWarehouseStock({
          warehouseId: transferDto.toWarehouseId,
          productId: item.productId,
          date: transferDto.transferDate,
          stockIn: item.quantity,
          stockOut: 0,
          referenceType: 'WH_to_WH_Transfer_In',
          referenceId: transferId,
          transportId: transferDto.transportId,
          notes: transferDto.notes,
          createdBy: transferDto.createdBy,
          transaction,
        });
      }

      await transaction.commit();

      return {
        message: 'Warehouse to warehouse transfer completed successfully',
        transferId,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  private async validateTransferEntities(params: {
    fromDhId?: number;
    toDhId?: number;
    fromWhId?: number;
    toWhId?: number;
    transportId?: number;
    transaction: Transaction;
  }): Promise<void> {
    // Validate distribution houses
    if (params.fromDhId) {
      const fromDh = await this.distributionHouseModel.findByPk(
        params.fromDhId,
        {
          transaction: params.transaction,
        },
      );
      if (!fromDh) {
        throw new NotFoundException(
          `Source distribution house with ID ${params.fromDhId} not found`,
        );
      }
    }

    if (params.toDhId) {
      const toDh = await this.distributionHouseModel.findByPk(params.toDhId, {
        transaction: params.transaction,
      });
      if (!toDh) {
        throw new NotFoundException(
          `Destination distribution house with ID ${params.toDhId} not found`,
        );
      }
    }

    // Validate warehouses
    if (params.fromWhId) {
      const fromWh = await this.warehouseModel.findByPk(params.fromWhId, {
        transaction: params.transaction,
      });
      if (!fromWh) {
        throw new NotFoundException(
          `Source warehouse with ID ${params.fromWhId} not found`,
        );
      }
    }

    if (params.toWhId) {
      const toWh = await this.warehouseModel.findByPk(params.toWhId, {
        transaction: params.transaction,
      });
      if (!toWh) {
        throw new NotFoundException(
          `Destination warehouse with ID ${params.toWhId} not found`,
        );
      }
    }

    // Validate transport
    if (params.transportId) {
      const transport = await this.transportModel.findByPk(params.transportId, {
        transaction: params.transaction,
      });
      if (!transport) {
        throw new NotFoundException(
          `Transport with ID ${params.transportId} not found`,
        );
      }
    }
  }

  private async validateProductsAndStock(params: {
    locationId: number;
    locationType: 'distribution' | 'warehouse';
    items: any[];
    transaction: Transaction;
  }): Promise<void> {
    for (const item of params.items) {
      // Validate product exists
      const product = await this.productModel.findByPk(item.productId, {
        transaction: params.transaction,
      });
      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found`,
        );
      }

      // Check current stock
      const currentStock = await this.getCurrentStock({
        locationId: params.locationId,
        locationType: params.locationType,
        productId: item.productId,
        transaction: params.transaction,
      });

      if (currentStock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.productName}. Available: ${currentStock}, Requested: ${item.quantity}`,
        );
      }
    }
  }

  private async getCurrentStock(params: {
    locationId: number;
    locationType: 'distribution' | 'warehouse';
    productId: number;
    transaction: Transaction;
  }): Promise<number> {
    if (params.locationType === 'distribution') {
      const latestStock = await this.dhStockLogModel.findOne({
        where: {
          distributionHouseId: params.locationId,
          productId: params.productId,
        },
        order: [
          ['date', 'DESC'],
          ['createdAt', 'DESC'],
        ],
        transaction: params.transaction,
      });

      return latestStock ? Number(latestStock.closingStock) : 0;
    } else {
      const latestStock = await this.whStockLogModel.findOne({
        where: {
          warehouseId: params.locationId,
          productId: params.productId,
        },
        order: [
          ['date', 'DESC'],
          ['createdAt', 'DESC'],
        ],
        transaction: params.transaction,
      });

      return latestStock ? Number(latestStock.closingStock) : 0;
    }
  }

  private async updateDistributionHouseStock(params: {
    distributionHouseId: number;
    productId: number;
    date: Date;
    stockIn: number;
    stockOut: number;
    referenceType: string;
    referenceId: number;
    transportId?: number;
    notes?: string;
    createdBy: number;
    transaction: Transaction;
  }): Promise<void> {
    const { transaction } = params;

    // 1. Get the latest stock record (true order)
    const latestStock = await this.dhStockLogModel.findOne({
      where: {
        distributionHouseId: params.distributionHouseId,
        productId: params.productId,
      },
      order: [['id', 'DESC']], // Prevent floating error and wrong order
      transaction,
    });

    // 2. Convert values using Decimal
    const openingStock = new Decimal(latestStock?.closingStock ?? 0);
    const stockIn = new Decimal(params.stockIn);
    const stockOut = new Decimal(params.stockOut);

    // 3. Perfect precision calculation
    const closingStock = openingStock.plus(stockIn).minus(stockOut);

    // 4. Insert new row
    await this.dhStockLogModel.create(
      {
        distributionHouseId: params.distributionHouseId,
        productId: params.productId,
        date: params.date,
        openingStock: openingStock.toNumber(),
        stockIn: stockIn.toNumber(),
        stockOut: stockOut.toNumber(),
        closingStock: closingStock.toNumber(),
        referenceType: params.referenceType,
        referenceId: params.referenceId,
        transportId: params.transportId,
        notes: params.notes,
        createdBy: params.createdBy,
      },
      { transaction },
    );
  }
  private async updateWarehouseStock(params: {
    warehouseId: number;
    productId: number;
    date: Date;
    stockIn: number;
    stockOut: number;
    referenceType: string;
    referenceId: number;
    transportId?: number;
    notes?: string;
    createdBy: number;
    transaction: Transaction;
  }): Promise<void> {
    const { transaction } = params;

    // 1. Fetch the latest stock entry (true latest, by insertion order)
    const latestStock = await this.whStockLogModel.findOne({
      where: {
        warehouseId: params.warehouseId,
        productId: params.productId,
      },
      order: [['id', 'DESC']], // ensures correct opening stock
      transaction,
    });

    // 2. Use Decimal for accurate calculations
    const openingStock = new Decimal(latestStock?.closingStock ?? 0);
    const stockIn = new Decimal(params.stockIn);
    const stockOut = new Decimal(params.stockOut);

    // 3. Calculate closing stock
    const closingStock = openingStock.plus(stockIn).minus(stockOut);

    // 4. Insert new stock log record
    await this.whStockLogModel.create(
      {
        warehouseId: params.warehouseId,
        productId: params.productId,
        date: params.date,
        openingStock: openingStock.toNumber(),
        stockIn: stockIn.toNumber(),
        stockOut: stockOut.toNumber(),
        closingStock: closingStock.toNumber(),
        referenceType: params.referenceType,
        referenceId: params.referenceId,
        transportId: params.transportId,
        notes: params.notes,
        createdBy: params.createdBy,
      },
      { transaction },
    );
  }

  async productionToDistributionHouse(
    transferDto: ProductionToDhTransferDto,
  ): Promise<{ message: string; transferId: number }> {
    const transaction = await this.sequelize.transaction();

    try {
      // Validate distribution house exists
      await this.validateDistributionHouse(
        transferDto.distributionHouseId,
        transaction,
      );

      // Validate products exist
      await this.validateProducts(transferDto.items, transaction);

      const transferId = Date.now();

      for (const item of transferDto.items) {
        await this.updateDistributionHouseStock({
          distributionHouseId: transferDto.distributionHouseId,
          productId: item.productId,
          date: transferDto.transferDate,
          stockIn: item.quantity,
          stockOut: 0,
          referenceType: 'Production',
          referenceId: transferId,
          transportId: undefined,
          notes: `${transferDto.productionOrderNumber} - ${transferDto.notes || 'Production transfer'}`,
          createdBy: transferDto.createdBy,
          transaction,
        });
      }

      await transaction.commit();
      return {
        message:
          'Production to distribution house transfer completed successfully',
        transferId,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async purchaseToDistributionHouse(
    transferDto: PurchaseToDhTransferDto,
  ): Promise<{ message: string; transferId: number }> {
    const transaction = await this.sequelize.transaction();

    try {
      // Validate distribution house exists
      await this.validateDistributionHouse(
        transferDto.distributionHouseId,
        transaction,
      );

      // Validate products exist
      await this.validateProducts(transferDto.items, transaction);

      // Unique transfer ID
      const transferId = Date.now();

      for (const item of transferDto.items) {
        // Auto opening & closing handled inside updateDistributionHouseStock()
        await this.updateDistributionHouseStock({
          distributionHouseId: transferDto.distributionHouseId,
          productId: item.productId,
          date: transferDto.transferDate,
          stockIn: item.quantity,
          stockOut: 0,
          referenceType: 'Purchase',
          referenceId: transferId,
          transportId: undefined,
          notes: `${transferDto.purchaseOrderNumber} - ${transferDto.supplierName} - ${
            transferDto.notes || 'Purchase transfer'
          }`,
          createdBy: transferDto.createdBy,
          transaction,
        });
      }

      await transaction.commit();
      return {
        message:
          'Purchase to distribution house transfer completed successfully',
        transferId,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async saleFromWarehouse(
    saleDto: SaleFromWarehouseDto,
  ): Promise<{ message: string; saleId: number }> {
    const transaction = await this.sequelize.transaction();

    try {
      // Validate warehouse exists
      await this.validateWarehouse(saleDto.warehouseId, transaction);

      // Validate products exist and have sufficient stock
      await this.validateProductsAndStock({
        locationId: saleDto.warehouseId,
        locationType: 'warehouse',
        items: saleDto.items,
        transaction,
      });

      const saleId = Date.now();

      for (const item of saleDto.items) {
        await this.updateWarehouseStock({
          warehouseId: saleDto.warehouseId,
          productId: item.productId,
          date: saleDto.saleDate,
          stockIn: 0,
          stockOut: item.quantity,
          referenceType: 'Sale',
          referenceId: saleId,
          transportId: undefined,
          notes: `${saleDto.salesOrderNumber} - ${saleDto.customerName} - ${saleDto.notes || 'Customer sale'}`,
          createdBy: saleDto.createdBy,
          transaction,
        });
      }

      await transaction.commit();
      return {
        message: 'Sale from warehouse completed successfully',
        saleId,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async customerReturnToWarehouse(
    returnDto: CustomerReturnToWarehouseDto,
  ): Promise<{ message: string; returnId: number }> {
    const transaction = await this.sequelize.transaction();

    try {
      // Validate warehouse exists
      await this.validateWarehouse(returnDto.warehouseId, transaction);

      // Validate products exist
      await this.validateProducts(returnDto.items, transaction);

      const returnId = Date.now();

      for (const item of returnDto.items) {
        await this.updateWarehouseStock({
          warehouseId: returnDto.warehouseId,
          productId: item.productId,
          date: returnDto.returnDate,
          stockIn: item.quantity,
          stockOut: 0,
          referenceType: 'Customer_Return',
          referenceId: returnId,
          transportId: undefined,
          notes: `${returnDto.returnNumber} - ${returnDto.customerName} - ${returnDto.reason || 'Return'} - ${returnDto.notes || 'Customer return'}`,
          createdBy: returnDto.createdBy,
          transaction,
        });
      }

      await transaction.commit();
      return {
        message: 'Customer return to warehouse completed successfully',
        returnId,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async warehouseToDistributionHouseReturn(
    returnDto: WarehouseToDhReturnDto,
  ): Promise<{ message: string; returnId: number }> {
    const transaction = await this.sequelize.transaction();

    try {
      // Validate entities exist
      await this.validateWarehouse(returnDto.warehouseId, transaction);
      await this.validateDistributionHouse(
        returnDto.distributionHouseId,
        transaction,
      );

      if (returnDto.transportId) {
        await this.validateTransport(returnDto.transportId, transaction);
      }

      // Validate products exist and warehouse has sufficient stock
      await this.validateProductsAndStock({
        locationId: returnDto.warehouseId,
        locationType: 'warehouse',
        items: returnDto.items,
        transaction,
      });

      const returnId = Date.now();

      for (const item of returnDto.items) {
        // Update warehouse (stock out)
        await this.updateWarehouseStock({
          warehouseId: returnDto.warehouseId,
          productId: item.productId,
          date: returnDto.returnDate,
          stockIn: 0,
          stockOut: item.quantity,
          referenceType: 'WH_to_DH_Return_Out',
          referenceId: returnId,
          transportId: returnDto.transportId,
          notes: `${returnDto.returnNumber} - ${returnDto.reason || 'Return'} - ${returnDto.notes || 'Return to distribution house'}`,
          createdBy: returnDto.createdBy,
          transaction,
        });

        // Update distribution house (stock in)
        await this.updateDistributionHouseStock({
          distributionHouseId: returnDto.distributionHouseId,
          productId: item.productId,
          date: returnDto.returnDate,
          stockIn: item.quantity,
          stockOut: 0,
          referenceType: 'WH_to_DH_Return_In',
          referenceId: returnId,
          transportId: returnDto.transportId,
          notes: `${returnDto.returnNumber} - ${returnDto.reason || 'Return'} - ${returnDto.notes || 'Return from warehouse'}`,
          createdBy: returnDto.createdBy,
          transaction,
        });
      }

      await transaction.commit();
      return {
        message:
          'Warehouse to distribution house return completed successfully',
        returnId,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Helper methods
  private async validateDistributionHouse(
    distributionHouseId: number,
    transaction: Transaction,
  ): Promise<void> {
    const distributionHouse = await this.distributionHouseModel.findByPk(
      distributionHouseId,
      {
        transaction,
      },
    );

    if (!distributionHouse) {
      throw new NotFoundException(
        `Distribution house with ID ${distributionHouseId} not found`,
      );
    }

    if (!distributionHouse.isActive) {
      throw new BadRequestException(
        `Distribution house with ID ${distributionHouseId} is not active`,
      );
    }
  }

  private async validateWarehouse(
    warehouseId: number,
    transaction: Transaction,
  ): Promise<void> {
    const warehouse = await this.warehouseModel.findByPk(warehouseId, {
      transaction,
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${warehouseId} not found`);
    }

    if (!warehouse.isActive) {
      throw new BadRequestException(
        `Warehouse with ID ${warehouseId} is not active`,
      );
    }
  }

  private async validateTransport(
    transportId: number,
    transaction: Transaction,
  ): Promise<void> {
    const transport = await this.transportModel.findByPk(transportId, {
      transaction,
    });

    if (!transport) {
      throw new NotFoundException(`Transport with ID ${transportId} not found`);
    }

    if (!transport.isActive) {
      throw new BadRequestException(
        `Transport with ID ${transportId} is not active`,
      );
    }
  }

  private async validateProducts(
    items: Array<{ productId: number; quantity: number }>,
    transaction: Transaction,
  ): Promise<void> {
    for (const item of items) {
      const product = await this.productModel.findByPk(item.productId, {
        transaction,
      });

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found`,
        );
      }

      if (!product.isActive) {
        throw new BadRequestException(
          `Product ${product.productName} is not active`,
        );
      }

      if (item.quantity <= 0) {
        throw new BadRequestException(
          `Quantity must be greater than 0 for product ${product.productName}`,
        );
      }
    }
  }
}
