import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../catalog/entities/category.entity.js';
import { ProductType } from '../../catalog/entities/product-type.entity.js';

export interface PublicCategoryNode extends Category {
  productTypes: ProductType[];
  breadcrumb?: Array<{ id: string; nameEn: string; nameBn: string; slug: string; path: string | null }>;
}

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(ProductType)
    private readonly productTypesRepository: Repository<ProductType>,
  ) {}

  /** Counts distinct active products under each category node (including descendants). */
  private async productCounts(): Promise<Map<string, number>> {
    const rows: Array<{ id: string; count: number }> = await this.categoriesRepository.manager.query(`
      SELECT c.id,
        (
          SELECT COUNT(DISTINCT p.id)::int
          FROM products p
          JOIN categories pc ON pc.id = p.category_id
          WHERE p.is_active = true
            AND (pc.path = c.path OR pc.path LIKE c.path || '/%')
        ) AS count
      FROM categories c
      WHERE c.is_active = true
    `);
    return new Map(rows.map((r) => [r.id, Number(r.count)]));
  }

  private buildTree(categories: Category[]): PublicCategoryNode[] {
    const byId = new Map<string, PublicCategoryNode>();
    for (const category of categories) {
      const node = category as PublicCategoryNode;
      node.children = [];
      node.productTypes = [];
      byId.set(node.id, node);
    }
    const roots: PublicCategoryNode[] = [];
    for (const node of byId.values()) {
      if (node.parentId && byId.has(node.parentId)) {
        byId.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }
    const sort = (nodes: PublicCategoryNode[]) => {
      nodes.sort((a, b) => a.sortOrder - b.sortOrder || a.nameEn.localeCompare(b.nameEn));
      for (const node of nodes) sort(node.children as PublicCategoryNode[]);
    };
    sort(roots);
    return roots;
  }

  async findAllActive(): Promise<Category[]> {
    const categories = await this.categoriesRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', nameEn: 'ASC' },
    });
    const counts = await this.productCounts();
    return categories.map((category) => {
      category.productCount = counts.get(category.id) ?? 0;
      return category;
    });
  }

  async getTree(): Promise<PublicCategoryNode[]> {
    const [categories, counts, productTypes] = await Promise.all([
      this.categoriesRepository.find({
        where: { isActive: true },
        order: { sortOrder: 'ASC', nameEn: 'ASC' },
      }),
      this.productCounts(),
      this.productTypesRepository.find({ where: { isActive: true }, order: { sortOrder: 'ASC' } }),
    ]);

    const tree = this.buildTree(categories);
    const typesByCategory = new Map<string, ProductType[]>();
    for (const productType of productTypes) {
      const list = typesByCategory.get(productType.categoryId) ?? [];
      list.push(productType);
      typesByCategory.set(productType.categoryId, list);
    }
    const attach = (nodes: PublicCategoryNode[]) => {
      for (const node of nodes) {
        node.productCount = counts.get(node.id) ?? 0;
        node.productTypes = typesByCategory.get(node.id) ?? [];
        attach(node.children as PublicCategoryNode[]);
      }
    };
    attach(tree);
    return tree;
  }

  async findBySlug(slug: string): Promise<PublicCategoryNode | null> {
    const category = await this.categoriesRepository.findOne({
      where: { slug, isActive: true },
    });
    if (!category) return null;

    const [children, productTypes, counts] = await Promise.all([
      this.categoriesRepository.find({
        where: { parentId: category.id, isActive: true },
        order: { sortOrder: 'ASC', nameEn: 'ASC' },
      }),
      this.productTypesRepository.find({
        where: { categoryId: category.id, isActive: true },
        order: { sortOrder: 'ASC' },
      }),
      this.productCounts(),
    ]);

    const breadcrumb = category.path ? await this.resolveBreadcrumb(category.path) : [];

    const node = category as PublicCategoryNode;
    node.children = children;
    node.productTypes = productTypes;
    node.productCount = counts.get(category.id) ?? 0;
    node.breadcrumb = breadcrumb;
    return node;
  }

  /**
   * Resolves ancestors from the materialized path so breadcrumbs work at any
   * depth without loading the whole tree.
   */
  private async resolveBreadcrumb(
    path: string,
  ): Promise<Array<{ id: string; nameEn: string; nameBn: string; slug: string; path: string | null }>> {
    const segments = path.split('/');
    const paths = segments.map((_, index) => segments.slice(0, index + 1).join('/'));
    const ancestors = await this.categoriesRepository
      .createQueryBuilder('category')
      .where('category.path IN (:...paths)', { paths })
      .orderBy('category.level', 'ASC')
      .getMany();
    return ancestors.map((a) => ({
      id: a.id,
      nameEn: a.nameEn,
      nameBn: a.nameBn,
      slug: a.slug,
      path: a.path,
    }));
  }

  async findBySlugOrFail(slug: string): Promise<PublicCategoryNode> {
    const category = await this.findBySlug(slug);
    if (!category) {
      throw new NotFoundException(`Category with slug ${slug} not found`);
    }
    return category;
  }
}
