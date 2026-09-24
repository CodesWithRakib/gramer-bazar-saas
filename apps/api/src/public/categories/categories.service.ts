import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category } from '../../catalog/entities/category.entity.js';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async findAllActive(): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { isActive: true },
      relations: ['parent', 'children'],
      order: { sortOrder: 'ASC', nameEn: 'ASC' },
    });
  }

  async getTree(): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { isActive: true, parentId: IsNull() },
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

  async findBySlug(slug: string): Promise<Category | null> {
    return this.categoriesRepository.findOne({
      where: { slug, isActive: true },
      relations: ['parent', 'children'],
    });
  }
}
