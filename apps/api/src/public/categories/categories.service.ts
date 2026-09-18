import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../catalog/entities/category.entity.js';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async findAllActive(): Promise<Category[]> {
    // Only return active categories. Order by nameEn for now.
    // Real-world scenarios might need a specific sort_order column.
    return this.categoriesRepository.find({
      where: { isActive: true },
      relations: ['children'],
      order: { nameEn: 'ASC' },
    });
  }
}
