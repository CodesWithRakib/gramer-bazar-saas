import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category } from '../entities/category.entity.js';
import { Product } from '../entities/product.entity.js';
import { CreateCategoryDto } from '../dto/create-category.dto.js';
import { UpdateCategoryDto } from '../dto/update-category.dto.js';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    if (createCategoryDto.parentId) {
      const parent = await this.categoriesRepository.findOne({
        where: { id: createCategoryDto.parentId },
      });
      if (!parent) {
        throw new NotFoundException(`Parent category with ID ${createCategoryDto.parentId} not found`);
      }
    }
    const category = this.categoriesRepository.create(createCategoryDto);
    return this.categoriesRepository.save(category);
  }

  async findAll(
    page?: number,
    limit?: number,
    search?: string,
    parentId?: string,
    rootsOnly?: boolean,
  ) {
    if (!page || !limit) {
      const whereClause: Record<string, unknown> = {};
      if (rootsOnly) {
        whereClause.parentId = IsNull();
      } else if (parentId) {
        whereClause.parentId = parentId;
      }
      return this.categoriesRepository.find({
        where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
        relations: ['parent', 'children'],
        order: { sortOrder: 'ASC', nameEn: 'ASC' },
      });
    }

    const query = this.categoriesRepository.createQueryBuilder('category')
      .leftJoinAndSelect('category.parent', 'parent')
      .leftJoinAndSelect('category.children', 'children')
      .orderBy('category.sortOrder', 'ASC')
      .addOrderBy('category.nameEn', 'ASC');

    if (rootsOnly) {
      query.andWhere('category.parentId IS NULL');
    } else if (parentId) {
      query.andWhere('category.parentId = :parentId', { parentId });
    }

    if (search) {
      query.andWhere(
        '(category.nameEn ILIKE :search OR category.nameBn ILIKE :search OR category.slug ILIKE :search)',
        { search: `%${search}%` },
      );
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

  async getTree(): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { parentId: IsNull() },
      relations: ['children'],
      order: {
        sortOrder: 'ASC',
        nameEn: 'ASC',
        children: {
          sortOrder: 'ASC',
          nameEn: 'ASC',
        },
      },
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    if (updateCategoryDto.parentId && updateCategoryDto.parentId === id) {
      throw new BadRequestException('A category cannot be its own parent');
    }
    Object.assign(category, updateCategoryDto);
    return this.categoriesRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);

    // Safe deletion: Check for child subcategories
    const childCount = await this.categoriesRepository.count({
      where: { parentId: id },
    });
    if (childCount > 0) {
      throw new BadRequestException(
        `Cannot delete category "${category.nameEn}" because it has ${childCount} subcategories. Please reassign or delete them first.`,
      );
    }

    // Safe deletion: Check for products in this category or subcategory
    const productCount = await this.productsRepository.count({
      where: [{ categoryId: id }, { subCategoryId: id }],
    });
    if (productCount > 0) {
      throw new BadRequestException(
        `Cannot delete category "${category.nameEn}" because ${productCount} products are assigned to it. Please reassign products or deactivate the category instead.`,
      );
    }

    await this.categoriesRepository.remove(category);
  }
}
