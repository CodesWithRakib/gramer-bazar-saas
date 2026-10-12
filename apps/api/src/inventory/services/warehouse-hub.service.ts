import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { WarehouseHub } from '../entities/warehouse-hub.entity.js';
import { HubStock } from '../entities/hub-stock.entity.js';
import { StockTransfer, StockTransferStatus } from '../entities/stock-transfer.entity.js';
import {
  CreateWarehouseHubDto,
  AllocateHubStockDto,
  CreateStockTransferDto,
} from '../dto/warehouse-hub.dto.js';

@Injectable()
export class WarehouseHubService {
  private readonly logger = new Logger(WarehouseHubService.name);

  constructor(
    @InjectRepository(WarehouseHub)
    private readonly hubRepo: Repository<WarehouseHub>,
    @InjectRepository(HubStock)
    private readonly hubStockRepo: Repository<HubStock>,
    @InjectRepository(StockTransfer)
    private readonly transferRepo: Repository<StockTransfer>,
    private readonly dataSource: DataSource,
  ) {}

  async createHub(dto: CreateWarehouseHubDto): Promise<WarehouseHub> {
    const existing = await this.hubRepo.findOne({ where: { code: dto.code } });
    if (existing) {
      throw new BadRequestException(`Warehouse hub with code "${dto.code}" already exists.`);
    }

    const hub = this.hubRepo.create(dto);
    return this.hubRepo.save(hub);
  }

  async findAllHubs(filters?: {
    division?: string;
    district?: string;
    isActive?: boolean;
  }): Promise<WarehouseHub[]> {
    const qb = this.hubRepo.createQueryBuilder('hub');

    if (filters?.division) {
      qb.andWhere('hub.division ILIKE :division', { division: `%${filters.division}%` });
    }
    if (filters?.district) {
      qb.andWhere('hub.district ILIKE :district', { district: `%${filters.district}%` });
    }
    if (filters?.isActive !== undefined) {
      qb.andWhere('hub.isActive = :isActive', { isActive: filters.isActive });
    }

    return qb.orderBy('hub.name', 'ASC').getMany();
  }

  async findOneHub(id: string): Promise<WarehouseHub> {
    const hub = await this.hubRepo.findOne({ where: { id } });
    if (!hub) {
      throw new NotFoundException(`Warehouse hub with ID "${id}" not found.`);
    }
    return hub;
  }

  async getHubStocks(hubId: string): Promise<HubStock[]> {
    await this.findOneHub(hubId);
    return this.hubStockRepo.find({
      where: { hubId },
      relations: ['sellerProduct', 'sellerProduct.shop'],
    });
  }

  async allocateStock(hubId: string, dto: AllocateHubStockDto): Promise<HubStock> {
    await this.findOneHub(hubId);

    let stock = await this.hubStockRepo.findOne({
      where: { hubId, sellerProductId: dto.sellerProductId },
    });

    if (!stock) {
      stock = this.hubStockRepo.create({
        hubId,
        sellerProductId: dto.sellerProductId,
        quantity: dto.quantity,
        batchNumber: dto.batchNumber ?? null,
      });
    } else {
      stock.quantity = dto.quantity;
      if (dto.batchNumber) stock.batchNumber = dto.batchNumber;
    }

    return this.hubStockRepo.save(stock);
  }

  async createTransfer(dto: CreateStockTransferDto): Promise<StockTransfer> {
    if (dto.fromHubId === dto.toHubId) {
      throw new BadRequestException('Source and destination warehouse hubs must be different.');
    }

    await this.findOneHub(dto.fromHubId);
    await this.findOneHub(dto.toHubId);

    const fromStock = await this.hubStockRepo.findOne({
      where: { hubId: dto.fromHubId, sellerProductId: dto.sellerProductId },
    });

    if (!fromStock) {
      throw new BadRequestException('Product does not exist at source warehouse hub.');
    }

    const available = fromStock.quantity - fromStock.reservedQuantity;
    if (available < dto.quantity) {
      throw new BadRequestException(
        `Insufficient available stock at source hub (Available: ${available}, Requested: ${dto.quantity}).`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      fromStock.reservedQuantity += dto.quantity;
      await queryRunner.manager.save(fromStock);

      const transferNumber = `TRF-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

      const transfer = this.transferRepo.create({
        transferNumber,
        fromHubId: dto.fromHubId,
        toHubId: dto.toHubId,
        sellerProductId: dto.sellerProductId,
        quantity: dto.quantity,
        status: StockTransferStatus.PENDING,
        notes: dto.notes ?? null,
      });

      const saved = await queryRunner.manager.save(transfer);
      await queryRunner.commitTransaction();

      this.logger.log(`Stock transfer initiated: ${transferNumber} (${dto.quantity} units)`);
      return saved;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async updateTransferStatus(
    transferId: string,
    nextStatus: StockTransferStatus,
    notes?: string,
  ): Promise<StockTransfer> {
    const transfer = await this.transferRepo.findOne({
      where: { id: transferId },
    });
    if (!transfer) {
      throw new NotFoundException(`Stock transfer with ID "${transferId}" not found.`);
    }

    if (transfer.status === nextStatus) return transfer;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const fromStock = await queryRunner.manager.findOne(HubStock, {
        where: { hubId: transfer.fromHubId, sellerProductId: transfer.sellerProductId },
      });

      if (nextStatus === StockTransferStatus.IN_TRANSIT) {
        if (transfer.status !== StockTransferStatus.PENDING) {
          throw new BadRequestException('Only PENDING transfers can transition to IN_TRANSIT.');
        }
        if (fromStock) {
          fromStock.quantity -= transfer.quantity;
          fromStock.reservedQuantity -= transfer.quantity;
          await queryRunner.manager.save(fromStock);
        }
        transfer.dispatchedAt = new Date();
      } else if (nextStatus === StockTransferStatus.RECEIVED) {
        if (
          transfer.status !== StockTransferStatus.IN_TRANSIT &&
          transfer.status !== StockTransferStatus.PENDING
        ) {
          throw new BadRequestException('Transfer must be PENDING or IN_TRANSIT to be received.');
        }

        // If transitioning straight from PENDING, deduct from source
        if (transfer.status === StockTransferStatus.PENDING && fromStock) {
          fromStock.quantity -= transfer.quantity;
          fromStock.reservedQuantity -= transfer.quantity;
          await queryRunner.manager.save(fromStock);
        }

        // Credit to destination hub stock
        let toStock = await queryRunner.manager.findOne(HubStock, {
          where: { hubId: transfer.toHubId, sellerProductId: transfer.sellerProductId },
        });

        if (!toStock) {
          toStock = this.hubStockRepo.create({
            hubId: transfer.toHubId,
            sellerProductId: transfer.sellerProductId,
            quantity: transfer.quantity,
          });
        } else {
          toStock.quantity += transfer.quantity;
        }

        await queryRunner.manager.save(toStock);
        transfer.receivedAt = new Date();
      } else if (nextStatus === StockTransferStatus.CANCELLED) {
        if (transfer.status === StockTransferStatus.RECEIVED) {
          throw new BadRequestException('Cannot cancel a transfer that has already been received.');
        }

        // Release reserved quantity if cancelled before transit
        if (transfer.status === StockTransferStatus.PENDING && fromStock) {
          fromStock.reservedQuantity -= transfer.quantity;
          await queryRunner.manager.save(fromStock);
        } else if (transfer.status === StockTransferStatus.IN_TRANSIT && fromStock) {
          // In transit cancellation restores source stock
          fromStock.quantity += transfer.quantity;
          await queryRunner.manager.save(fromStock);
        }
      }

      transfer.status = nextStatus;
      if (notes) transfer.notes = notes;

      const updated = await queryRunner.manager.save(transfer);
      await queryRunner.commitTransaction();

      this.logger.log(
        `Stock transfer ${transfer.transferNumber} status updated to ${nextStatus}`,
      );
      return updated;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async listTransfers(filters?: {
    hubId?: string;
    status?: StockTransferStatus;
  }): Promise<StockTransfer[]> {
    const qb = this.transferRepo
      .createQueryBuilder('transfer')
      .leftJoinAndSelect('transfer.fromHub', 'fromHub')
      .leftJoinAndSelect('transfer.toHub', 'toHub')
      .leftJoinAndSelect('transfer.sellerProduct', 'sellerProduct');

    if (filters?.hubId) {
      qb.andWhere('(transfer.fromHubId = :hubId OR transfer.toHubId = :hubId)', {
        hubId: filters.hubId,
      });
    }
    if (filters?.status) {
      qb.andWhere('transfer.status = :status', { status: filters.status });
    }

    return qb.orderBy('transfer.createdAt', 'DESC').getMany();
  }
}
