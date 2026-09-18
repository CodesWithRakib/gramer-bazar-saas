import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariant } from '../entities/product-variant.entity.js';
import { CreateProductVariantDto } from '../dto/create-product-variant.dto.js';
import { UpdateProductVariantDto } from '../dto/update-product-variant.dto.js';

@Injectable()
export class ProductVariantsService {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly variantsRepository: Repository<ProductVariant>,
  ) {}

  async create(createProductVariantDto: CreateProductVariantDto): Promise<ProductVariant> {
    const variant = this.variantsRepository.create(createProductVariantDto);
    return this.variantsRepository.save(variant);
  }

  async findAll(): Promise<ProductVariant[]> {
    return this.variantsRepository.find({ relations: ['product'] });
  }

  async findOne(id: string): Promise<ProductVariant> {
    const variant = await this.variantsRepository.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!variant) {
      throw new NotFoundException(`Product Variant with ID ${id} not found`);
    }
    return variant;
  }

  async update(id: string, updateProductVariantDto: UpdateProductVariantDto): Promise<ProductVariant> {
    const variant = await this.findOne(id);
    Object.assign(variant, updateProductVariantDto);
    return this.variantsRepository.save(variant);
  }

  async remove(id: string): Promise<void> {
    const variant = await this.findOne(id);
    await this.variantsRepository.remove(variant);
  }
}
