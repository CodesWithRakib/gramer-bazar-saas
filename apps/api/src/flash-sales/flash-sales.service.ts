import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlashSale } from './entities/flash-sale.entity.js';
import { FlashSaleItem } from './entities/flash-sale-item.entity.js';
import { CreateFlashSaleDto } from './dto/create-flash-sale.dto.js';
import { UpdateFlashSaleDto } from './dto/update-flash-sale.dto.js';

@Injectable()
export class FlashSalesService {
  constructor(
    @InjectRepository(FlashSale)
    private readonly flashSaleRepository: Repository<FlashSale>,
    @InjectRepository(FlashSaleItem)
    private readonly flashSaleItemRepository: Repository<FlashSaleItem>,
  ) {}

  async create(createDto: CreateFlashSaleDto) {
    const flashSale = this.flashSaleRepository.create({
      name: createDto.name,
      startDate: new Date(createDto.startDate),
      endDate: new Date(createDto.endDate),
      isActive: createDto.isActive ?? true,
      bannerImage: createDto.bannerImage,
    });

    const savedFlashSale = await this.flashSaleRepository.save(flashSale);

    if (createDto.items && createDto.items.length > 0) {
      const items = createDto.items.map((item) =>
        this.flashSaleItemRepository.create({
          ...item,
          flashSaleId: savedFlashSale.id,
        }),
      );
      await this.flashSaleItemRepository.save(items);
    }

    return this.findOne(savedFlashSale.id);
  }

  async findAllActive() {
    const now = new Date();
    return this.flashSaleRepository
      .createQueryBuilder('fs')
      .leftJoinAndSelect('fs.items', 'items')
      .leftJoinAndSelect('items.sellerProduct', 'sp')
      .leftJoinAndSelect('sp.productVariant', 'pv')
      .leftJoinAndSelect('pv.product', 'p')
      .leftJoinAndSelect('p.images', 'images')
      .leftJoinAndSelect('sp.shop', 'shop')
      .leftJoinAndSelect('sp.inventory', 'inventory')
      .where('fs.isActive = :isActive', { isActive: true })
      .andWhere('fs.startDate <= :now', { now })
      .andWhere('fs.endDate >= :now', { now })
      .getMany();
  }

  async findAll(page: number = 1, limit: number = 10) {
    const [data, total] = await this.flashSaleRepository
      .createQueryBuilder('fs')
      .leftJoinAndSelect('fs.items', 'items')
      .orderBy('fs.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const flashSale = await this.flashSaleRepository
      .createQueryBuilder('fs')
      .leftJoinAndSelect('fs.items', 'items')
      .leftJoinAndSelect('items.sellerProduct', 'sp')
      .leftJoinAndSelect('sp.productVariant', 'pv')
      .leftJoinAndSelect('pv.product', 'p')
      .leftJoinAndSelect('p.images', 'images')
      .leftJoinAndSelect('sp.shop', 'shop')
      .leftJoinAndSelect('sp.inventory', 'inventory')
      .where('fs.id = :id', { id })
      .getOne();

    if (!flashSale) throw new NotFoundException('Flash sale not found');
    return flashSale;
  }

  async update(id: string, updateDto: UpdateFlashSaleDto) {
    await this.findOne(id);

    const updatePayload: Partial<FlashSale> = {};
    if (updateDto.name !== undefined) updatePayload.name = updateDto.name;
    if (updateDto.startDate !== undefined) updatePayload.startDate = new Date(updateDto.startDate);
    if (updateDto.endDate !== undefined) updatePayload.endDate = new Date(updateDto.endDate);
    if (updateDto.isActive !== undefined) updatePayload.isActive = updateDto.isActive;
    if (updateDto.bannerImage !== undefined) updatePayload.bannerImage = updateDto.bannerImage;

    if (Object.keys(updatePayload).length > 0) {
      await this.flashSaleRepository.update(id, updatePayload);
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    const flashSale = await this.flashSaleRepository.findOne({ where: { id } });
    if (!flashSale) throw new NotFoundException('Flash sale not found');
    await this.flashSaleRepository.remove(flashSale);
    return { success: true };
  }
}
