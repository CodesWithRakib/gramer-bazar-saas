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
    const categories = await this.categoriesRepository.find({
      where: { isActive: true },
      relations: ['parent', 'children'],
      order: { sortOrder: 'ASC', nameEn: 'ASC' },
    });

    const countRows = await this.categoriesRepository.manager.query(`
      SELECT c.id, COUNT(DISTINCT p.id)::int as count
      FROM categories c
      LEFT JOIN products p ON (p.category_id = c.id OR p.sub_category_id = c.id)
      WHERE c.is_active = true
      GROUP BY c.id
    `);
    const countMap = new Map<string, number>(countRows.map((r: { id: string; count: number }) => [r.id, r.count]));

    return categories.map(cat => {
      const parentCount = countMap.get(cat.id) || 0;
      let childrenTotal = 0;
      if (cat.children) {
        cat.children.forEach(child => {
          const cCount = countMap.get(child.id) || 0;
          child.productCount = cCount;
          childrenTotal += cCount;
        });
      }
      cat.productCount = Math.max(parentCount, childrenTotal);
      return cat;
    });
  }

  async getTree(): Promise<Category[]> {
    const categories = await this.categoriesRepository.find({
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

    const countRows = await this.categoriesRepository.manager.query(`
      SELECT c.id, COUNT(DISTINCT p.id)::int as count
      FROM categories c
      LEFT JOIN products p ON (p.category_id = c.id OR p.sub_category_id = c.id)
      WHERE c.is_active = true
      GROUP BY c.id
    `);
    const countMap = new Map<string, number>(countRows.map((r: { id: string; count: number }) => [r.id, r.count]));

    return categories.map(cat => {
      const parentCount = countMap.get(cat.id) || 0;
      let childrenTotal = 0;
      if (cat.children) {
        cat.children.forEach(child => {
          const cCount = countMap.get(child.id) || 0;
          child.productCount = cCount;
          childrenTotal += cCount;
        });
      }
      cat.productCount = Math.max(parentCount, childrenTotal);
      return cat;
    });
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const category = await this.categoriesRepository.findOne({
      where: { slug, isActive: true },
      relations: ['parent', 'children'],
    });

    if (!category) return null;

    const countRows = await this.categoriesRepository.manager.query(`
      SELECT c.id, COUNT(DISTINCT p.id)::int as count
      FROM categories c
      LEFT JOIN products p ON (p.category_id = c.id OR p.sub_category_id = c.id)
      WHERE c.id = $1 OR c.parent_id = $1
      GROUP BY c.id
    `, [category.id]);
    const countMap = new Map<string, number>(countRows.map((r: { id: string; count: number }) => [r.id, r.count]));

    const parentCount = countMap.get(category.id) || 0;
    let childrenTotal = 0;
    if (category.children) {
      category.children.forEach(child => {
        const cCount = countMap.get(child.id) || 0;
        child.productCount = cCount;
        childrenTotal += cCount;
      });
    }
    category.productCount = Math.max(parentCount, childrenTotal);

    return category;
  }
}
