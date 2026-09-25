import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Brand } from '../entities/brand.entity.js';
import { Category } from '../entities/category.entity.js';
import { CreateBrandDto } from '../dto/create-brand.dto.js';
import { UpdateBrandDto } from '../dto/update-brand.dto.js';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandsRepository: Repository<Brand>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(createBrandDto: CreateBrandDto): Promise<Brand> {
    const { categoryIds, ...brandData } = createBrandDto;
    const brand = this.brandsRepository.create(brandData);

    if (categoryIds && categoryIds.length > 0) {
      brand.categories = await this.categoriesRepository.findBy({ id: In(categoryIds) });
    }

    return this.brandsRepository.save(brand);
  }

  async findAll(page?: number, limit?: number, search?: string, categoryId?: string, isActive?: boolean) {
    const query = this.brandsRepository.createQueryBuilder('brand')
      .leftJoinAndSelect('brand.categories', 'category')
      .orderBy('brand.nameEn', 'ASC');

    if (search) {
      query.andWhere('(brand.nameEn ILIKE :search OR brand.nameBn ILIKE :search)', { search: `%${search}%` });
    }

    if (categoryId) {
      query.andWhere('(category.id = :categoryId OR category.slug = :categoryId)', { categoryId });
    }

    if (isActive !== undefined) {
      query.andWhere('brand.isActive = :isActive', { isActive });
    }

    if (!page || !limit) {
      return query.getMany();
    }

    const [data, total] = await query
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

  async findOne(id: string): Promise<Brand> {
    const brand = await this.brandsRepository.findOne({
      where: { id },
      relations: ['categories'],
    });
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }
    return brand;
  }

  async findByCategory(categoryId: string): Promise<Brand[]> {
    return this.brandsRepository.createQueryBuilder('brand')
      .innerJoin('brand.categories', 'category')
      .where('(category.id = :categoryId OR category.slug = :categoryId)', { categoryId })
      .andWhere('brand.isActive = true')
      .orderBy('brand.nameEn', 'ASC')
      .getMany();
  }

  async update(id: string, updateBrandDto: UpdateBrandDto): Promise<Brand> {
    const brand = await this.findOne(id);
    const { categoryIds, ...brandData } = updateBrandDto;

    Object.assign(brand, brandData);

    if (categoryIds !== undefined) {
      if (categoryIds.length > 0) {
        brand.categories = await this.categoriesRepository.findBy({ id: In(categoryIds) });
      } else {
        brand.categories = [];
      }
    }

    return this.brandsRepository.save(brand);
  }

  async remove(id: string): Promise<void> {
    const brand = await this.findOne(id);
    await this.brandsRepository.remove(brand);
  }
}
