import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SellerProduct } from '../entities/seller-product.entity.js';
import { CreateSellerProductDto } from '../dto/create-seller-product.dto.js';
import { UpdateSellerProductDto } from '../dto/update-seller-product.dto.js';
import { Inventory } from '../entities/inventory.entity.js';

@Injectable()
export class SellerProductsService {
  constructor(
    @InjectRepository(SellerProduct)
    private readonly sellerProductsRepository: Repository<SellerProduct>,
  ) {}

  async create(createSellerProductDto: CreateSellerProductDto): Promise<SellerProduct> {
    const sellerProduct = this.sellerProductsRepository.create(createSellerProductDto);
    // Initialize default inventory when a seller product is created
    const inventory = new Inventory();
    inventory.quantity = 0;
    sellerProduct.inventory = inventory as any;
    
    return this.sellerProductsRepository.save(sellerProduct);
  }

  async findAll(): Promise<SellerProduct[]> {
    return this.sellerProductsRepository.find({ relations: ['shop', 'productVariant', 'inventory'] });
  }

  async findOne(id: string): Promise<SellerProduct> {
    const sellerProduct = await this.sellerProductsRepository.findOne({
      where: { id },
      relations: ['shop', 'productVariant', 'inventory'],
    });
    if (!sellerProduct) {
      throw new NotFoundException(`SellerProduct with ID ${id} not found`);
    }
    return sellerProduct;
  }

  async update(id: string, updateSellerProductDto: UpdateSellerProductDto): Promise<SellerProduct> {
    const sellerProduct = await this.findOne(id);
    Object.assign(sellerProduct, updateSellerProductDto);
    return this.sellerProductsRepository.save(sellerProduct);
  }

  async remove(id: string): Promise<void> {
    const sellerProduct = await this.findOne(id);
    await this.sellerProductsRepository.remove(sellerProduct);
  }
}
