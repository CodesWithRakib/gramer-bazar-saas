import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from '../entities/shop.entity.js';
import { CreateShopDto } from '../dto/create-shop.dto.js';
import { UpdateShopDto } from '../dto/update-shop.dto.js';

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(Shop)
    private readonly shopsRepository: Repository<Shop>,
  ) {}

  async create(createShopDto: CreateShopDto): Promise<Shop> {
    const shop = this.shopsRepository.create(createShopDto);
    return this.shopsRepository.save(shop);
  }

  async findAll(): Promise<Shop[]> {
    return this.shopsRepository.find({ relations: ['seller'] });
  }

  async findOne(id: string): Promise<Shop> {
    const shop = await this.shopsRepository.findOne({
      where: { id },
      relations: ['seller'],
    });
    if (!shop) {
      throw new NotFoundException(`Shop with ID ${id} not found`);
    }
    return shop;
  }

  async update(id: string, updateShopDto: UpdateShopDto): Promise<Shop> {
    const shop = await this.findOne(id);
    Object.assign(shop, updateShopDto);
    return this.shopsRepository.save(shop);
  }

  async remove(id: string): Promise<void> {
    const shop = await this.findOne(id);
    await this.shopsRepository.remove(shop);
  }
}
