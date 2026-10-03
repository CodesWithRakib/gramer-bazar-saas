import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, DataSource } from 'typeorm';
import { Category } from '../entities/category.entity.js';
import { Product } from '../entities/product.entity.js';
import { CreateCategoryDto } from '../dto/create-category.dto.js';
import { UpdateCategoryDto } from '../dto/update-category.dto.js';
import { slugify } from '../../common/utils/slug.js';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  /** Computes level + materialized path for a category under its parent. */
  private async computeLineage(
    parentId: string | null | undefined,
    slug: string,
  ): Promise<{ level: number; path: string }> {
    if (!parentId) {
      return { level: 0, path: slug };
    }
    const parent = await this.categoriesRepository.findOne({ where: { id: parentId } });
    if (!parent) {
      throw new NotFoundException(`Parent category with ID ${parentId} not found`);
    }
    const parentPath = parent.path ?? parent.slug;
    return { level: (parent.level ?? 0) + 1, path: `${parentPath}/${slug}` };
  }

  /**
   * Recomputes level/path for the whole tree. Category counts are small enough
   * (even at thousands) that a single recursive pass is cheap and always keeps
   * the materialized path consistent after a move.
   */
  private async rebuildTreePaths(): Promise<void> {
    await this.dataSource.query(`
      WITH RECURSIVE tree AS (
        SELECT id, slug::text AS path, 0 AS level
        FROM categories
        WHERE parent_id IS NULL
        UNION ALL
        SELECT c.id, (tree.path || '/' || c.slug)::text, tree.level + 1
        FROM categories c
        JOIN tree ON c.parent_id = tree.id
      )
      UPDATE categories c
      SET path = tree.path, level = tree.level
      FROM tree
      WHERE c.id = tree.id
        AND (c.path IS DISTINCT FROM tree.path OR c.level IS DISTINCT FROM tree.level)
    `);
  }

  private async assertNoCycle(categoryId: string, parentId: string): Promise<void> {
    if (categoryId === parentId) {
      throw new BadRequestException('A category cannot be its own parent');
    }
    const rows: Array<{ id: string }> = await this.dataSource.query(
      `WITH RECURSIVE descendants AS (
         SELECT id FROM categories WHERE id = $1
         UNION ALL
         SELECT c.id FROM categories c JOIN descendants d ON c.parent_id = d.id
       )
       SELECT id FROM descendants WHERE id = $2`,
      [categoryId, parentId],
    );
    if (rows.length > 0) {
      throw new BadRequestException('A category cannot be moved under its own descendant');
    }
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    if (createCategoryDto.parentId) {
      const parent = await this.categoriesRepository.findOne({
        where: { id: createCategoryDto.parentId },
      });
      if (!parent) {
        throw new NotFoundException(
          `Parent category with ID ${createCategoryDto.parentId} not found`,
        );
      }
    }
    const slug = createCategoryDto.slug || slugify(createCategoryDto.nameEn, 'category', 120);
    const lineage = await this.computeLineage(createCategoryDto.parentId, slug);
    const category = this.categoriesRepository.create({
      ...createCategoryDto,
      slug,
      ...lineage,
    });
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

    const query = this.categoriesRepository
      .createQueryBuilder('category')
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

  /** Builds a nested tree at arbitrary depth from the flat category set. */
  private buildTree(categories: Category[]): Category[] {
    const byId = new Map<string, Category>();
    for (const category of categories) {
      category.children = [];
      byId.set(category.id, category);
    }
    const roots: Category[] = [];
    for (const category of categories) {
      if (category.parentId && byId.has(category.parentId)) {
        byId.get(category.parentId)!.children.push(category);
      } else {
        roots.push(category);
      }
    }
    const sort = (nodes: Category[]) => {
      nodes.sort((a, b) => a.sortOrder - b.sortOrder || a.nameEn.localeCompare(b.nameEn));
      for (const node of nodes) sort(node.children);
    };
    sort(roots);
    return roots;
  }

  async getTree(): Promise<Category[]> {
    const categories = await this.categoriesRepository.find({
      order: { sortOrder: 'ASC', nameEn: 'ASC' },
    });
    return this.buildTree(categories);
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
    const nextParentId =
      updateCategoryDto.parentId !== undefined ? updateCategoryDto.parentId : category.parentId;
    const nextSlug = updateCategoryDto.slug ?? category.slug;

    if (nextParentId) {
      await this.assertNoCycle(id, nextParentId);
    }

    Object.assign(category, updateCategoryDto);

    const lineageChanged =
      updateCategoryDto.parentId !== undefined || updateCategoryDto.slug !== undefined;
    if (lineageChanged) {
      category.slug = nextSlug;
      const lineage = await this.computeLineage(nextParentId, nextSlug);
      category.level = lineage.level;
      category.path = lineage.path;
    }

    const saved = await this.categoriesRepository.save(category);
    if (lineageChanged) {
      await this.rebuildTreePaths();
    }
    return this.findOne(saved.id);
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
