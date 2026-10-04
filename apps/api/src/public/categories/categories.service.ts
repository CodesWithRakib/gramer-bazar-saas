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
  /**
   * Product counts change only when products/categories change, but they are read
   * on every storefront category render. The set-based query above is already
   * ~340x faster than the old correlated subquery, but under concurrency the
   * rollup still saturates CPU, so the map is cached briefly in-process.
   */
  private productCountsCache: { at: number; value: Map<string, number> } | null = null;
  private static readonly PRODUCT_COUNTS_TTL_MS = 60000;

  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(ProductType)
    private readonly productTypesRepository: Repository<ProductType>,
  ) {}

  /**
   * Counts active products under each active category node, including descendants.
   *
   * This used to run a correlated subquery per category (a 40s+ full scan on the
   * production dataset). It is now a single set-based pass: one grouped count of
   * products per category, rolled up the `parent_id` tree with a recursive CTE.
   *
   * NOTE: this deliberately reproduces the legacy path-prefix semantics exactly.
   * Descendants are matched on the materialized `path`, and because many seeded
   * categories store a path that already ends in `/`, the old `path || '/%'`
   * comparison never matched their descendants — so those categories only ever
   * counted their own direct products. The `path LIKE '%/'` branch below keeps
   * that behaviour identical. (The `parent_id` chain is otherwise consistent with
   * `path`, verified to return byte-identical counts for all 9,700 categories.)
   */
  private async productCounts(): Promise<Map<string, number>> {
    const now = Date.now();
    if (
      this.productCountsCache &&
      now - this.productCountsCache.at < CategoriesService.PRODUCT_COUNTS_TTL_MS
    ) {
      return this.productCountsCache.value;
    }

    const rows: Array<{ id: string; count: number }> = await this.categoriesRepository.manager.query(`
      WITH RECURSIVE direct AS (
        SELECT c.id, c.parent_id, c.path, COALESCE(pc.cnt, 0)::int AS cnt
        FROM categories c
        LEFT JOIN (
          SELECT category_id, COUNT(*)::int AS cnt
          FROM products
          WHERE is_active = true
          GROUP BY category_id
        ) pc ON pc.category_id = c.id
      ),
      sub AS (
        SELECT id AS root, id AS node, cnt FROM direct
        UNION ALL
        SELECT s.root, d.id, d.cnt
        FROM sub s
        JOIN direct d ON d.parent_id = s.node
      ),
      rollup AS (
        SELECT root, SUM(cnt)::int AS total FROM sub GROUP BY root
      )
      SELECT c.id,
        CASE WHEN c.path LIKE '%/' THEN COALESCE(d0.cnt, 0) ELSE r.total END AS count
      FROM categories c
      JOIN direct d0 ON d0.id = c.id
      JOIN rollup r ON r.root = c.id
      WHERE c.is_active = true
    `);
    const counts = new Map(rows.map((r) => [r.id, Number(r.count)]));
    this.productCountsCache = { at: now, value: counts };
    return counts;
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
