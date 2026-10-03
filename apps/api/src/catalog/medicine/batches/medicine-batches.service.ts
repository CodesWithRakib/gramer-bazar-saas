import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicineBatch } from '../../entities/medicine-batch.entity.js';
import { ProductVariant } from '../../entities/product-variant.entity.js';
import { BatchStatus } from '../../enums/medicine-batch-status.enum.js';
import { CreateMedicineBatchDto, UpdateMedicineBatchDto } from '../../dto/medicine-batch.dto.js';

@Injectable()
export class MedicineBatchesService {
  constructor(
    @InjectRepository(MedicineBatch)
    private readonly batchesRepository: Repository<MedicineBatch>,
    @InjectRepository(ProductVariant)
    private readonly variantsRepository: Repository<ProductVariant>,
  ) {}

  async create(dto: CreateMedicineBatchDto): Promise<MedicineBatch> {
    const variant = await this.variantsRepository.findOne({
      where: { id: dto.productVariantId },
    });
    if (!variant) {
      throw new BadRequestException('Selected product variant does not exist');
    }

    const existing = await this.batchesRepository.findOne({
      where: {
        productVariantId: dto.productVariantId,
        batchNumber: dto.batchNumber,
      },
    });
    if (existing) {
      throw new BadRequestException(
        `Batch number "${dto.batchNumber}" already exists for this variant`,
      );
    }

    const isPastExpiry = new Date(dto.expiryDate).getTime() < Date.now();
    const initialStatus = isPastExpiry ? BatchStatus.EXPIRED : (dto.status ?? BatchStatus.ACTIVE);

    return this.batchesRepository.save(
      this.batchesRepository.create({
        productVariantId: dto.productVariantId,
        batchNumber: dto.batchNumber,
        manufacturingDate: dto.manufacturingDate ?? null,
        expiryDate: dto.expiryDate,
        quantity: dto.quantity,
        reservedQuantity: 0,
        supplier: dto.supplier ?? null,
        purchaseCost: dto.purchaseCost ?? null,
        status: initialStatus,
      }),
    );
  }

  async findAll(options?: {
    productVariantId?: string;
    status?: BatchStatus;
    search?: string;
  }): Promise<MedicineBatch[]> {
    const query = this.batchesRepository
      .createQueryBuilder('batch')
      .leftJoinAndSelect('batch.productVariant', 'variant')
      .orderBy('batch.expiryDate', 'ASC');

    if (options?.productVariantId) {
      query.andWhere('batch.productVariantId = :productVariantId', {
        productVariantId: options.productVariantId,
      });
    }

    if (options?.status) {
      query.andWhere('batch.status = :status', { status: options.status });
    }

    if (options?.search) {
      query.andWhere(
        '(batch.batchNumber ILIKE :search OR batch.supplier ILIKE :search OR variant.nameEn ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<MedicineBatch> {
    const batch = await this.batchesRepository.findOne({
      where: { id },
      relations: ['productVariant'],
    });
    if (!batch) throw new NotFoundException('Medicine batch not found');
    return batch;
  }

  async update(id: string, dto: UpdateMedicineBatchDto): Promise<MedicineBatch> {
    const batch = await this.findOne(id);

    if (dto.batchNumber && dto.batchNumber !== batch.batchNumber) {
      const clash = await this.batchesRepository.findOne({
        where: {
          productVariantId: batch.productVariantId,
          batchNumber: dto.batchNumber,
        },
      });
      if (clash && clash.id !== id) {
        throw new BadRequestException(
          `Batch number "${dto.batchNumber}" is already in use for this variant`,
        );
      }
      batch.batchNumber = dto.batchNumber;
    }

    if (dto.manufacturingDate !== undefined) batch.manufacturingDate = dto.manufacturingDate ?? null;
    if (dto.expiryDate !== undefined) {
      batch.expiryDate = dto.expiryDate;
      if (new Date(dto.expiryDate).getTime() < Date.now()) {
        batch.status = BatchStatus.EXPIRED;
      }
    }
    if (dto.quantity !== undefined) batch.quantity = dto.quantity;
    if (dto.reservedQuantity !== undefined) batch.reservedQuantity = dto.reservedQuantity;
    if (dto.supplier !== undefined) batch.supplier = dto.supplier ?? null;
    if (dto.purchaseCost !== undefined) batch.purchaseCost = dto.purchaseCost ?? null;
    if (dto.status !== undefined) batch.status = dto.status;

    return this.batchesRepository.save(batch);
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);
    await this.batchesRepository.delete(id);
    return { success: true, message: 'Batch removed successfully' };
  }
}
