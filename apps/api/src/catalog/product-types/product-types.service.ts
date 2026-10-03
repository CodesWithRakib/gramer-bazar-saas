import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository, SelectQueryBuilder } from 'typeorm';
import { ProductType } from '../entities/product-type.entity.js';
import { ProductTypeAttribute } from '../entities/product-type-attribute.entity.js';
import { Attribute } from '../entities/attribute.entity.js';
import { AttributeOption } from '../entities/attribute-option.entity.js';
import { Category } from '../entities/category.entity.js';
import { AttributeDataType } from '../enums/attribute-data-type.enum.js';
import {
  CreateProductTypeDto,
  UpdateProductTypeDto,
} from '../dto/product-type.dto.js';
import { SetProductTypeAttributesDto } from '../dto/attribute.dto.js';
import { slugify } from '../../common/utils/slug.js';

/** Normalized filter input shared by listing, facets and search. */
export interface CatalogFilterInput {
  categoryId?: string;
  categoryPath?: string;
  productTypeId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  /** Map of attribute slug -> selected option slugs / raw values. */
  attributeFilters?: Record<string, string[]>;
}

export interface FacetOption {
  id: string;
  slug: string;
  value: string;
  valueBn: string | null;
  count: number;
}

export interface FacetGroup {
  attributeId: string;
  slug: string;
  nameEn: string;
  nameBn: string;
  dataType: AttributeDataType;
  unit: string | null;
  options: FacetOption[];
  min?: number;
  max?: number;
}

export interface CatalogFacets {
  productTypeId: string | null;
  productTypeIds: string[];
  groups: FacetGroup[];
  priceRange: { min: number; max: number } | null;
  brands: Array<{ id: string; slug: string; nameEn: string; nameBn: string; count: number }>;
  inStockCount: number;
  totalCount: number;
}

interface BaseQuery {
  joins: string;
  where: string;
  params: unknown[];
}

@Injectable()
export class ProductTypesService {
  constructor(
    @InjectRepository(ProductType)
    private readonly productTypesRepository: Repository<ProductType>,
    @InjectRepository(ProductTypeAttribute)
    private readonly mappingsRepository: Repository<ProductTypeAttribute>,
    @InjectRepository(Attribute)
    private readonly attributesRepository: Repository<Attribute>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    private readonly dataSource: DataSource,
  ) {}

  private async assertSlugAvailable(slug: string, excludeId?: string): Promise<void> {
    const existing = await this.productTypesRepository.findOne({ where: { slug } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(`A product type with slug "${slug}" already exists`);
    }
  }

  async create(dto: CreateProductTypeDto): Promise<ProductType> {
    const category = await this.categoriesRepository.findOne({ where: { id: dto.categoryId } });
    if (!category) {
      throw new BadRequestException('Selected category does not exist');
    }
    const slug = slugify(dto.slug || dto.nameEn, 'product-type', 120);
    await this.assertSlugAvailable(slug);

    const productType = this.productTypesRepository.create({
      categoryId: dto.categoryId,
      nameEn: dto.nameEn.trim(),
      nameBn: dto.nameBn.trim(),
      slug,
      descriptionEn: dto.descriptionEn ?? null,
      descriptionBn: dto.descriptionBn ?? null,
      icon: dto.icon ?? null,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
    });
    return this.productTypesRepository.save(productType);
  }

  async findAll(filters: {
    categoryId?: string;
    categoryPath?: string;
    isActive?: boolean;
    search?: string;
    includeMappings?: boolean;
  }) {
    const query = this.productTypesRepository
      .createQueryBuilder('pt')
      .leftJoinAndSelect('pt.category', 'category')
      .orderBy('pt.sortOrder', 'ASC')
      .addOrderBy('pt.nameEn', 'ASC');

    if (filters.includeMappings) {
      query
        .leftJoinAndSelect('pt.attributeMappings', 'mapping')
        .leftJoinAndSelect('mapping.attribute', 'attribute')
        .leftJoinAndSelect('attribute.options', 'option')
        .orderBy('pt.sortOrder', 'ASC')
        .addOrderBy('pt.nameEn', 'ASC')
        .addOrderBy('mapping.sortOrder', 'ASC')
        .addOrderBy('option.sortOrder', 'ASC');
    }

    if (filters.isActive !== undefined) {
      query.andWhere('pt.isActive = :isActive', { isActive: filters.isActive });
    }
    if (filters.categoryId) {
      query.andWhere('pt.categoryId = :categoryId', { categoryId: filters.categoryId });
    }
    if (filters.categoryPath) {
      query.andWhere("(category.path = :path OR category.path LIKE :pathPrefix)", {
        path: filters.categoryPath,
        pathPrefix: `${filters.categoryPath}/%`,
      });
    }
    if (filters.search) {
      query.andWhere(
        '(pt.nameEn ILIKE :search OR pt.nameBn ILIKE :search OR pt.slug ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }
    return query.getMany();
  }

  async findOne(id: string, includeMappings = true): Promise<ProductType> {
    const productType = await this.productTypesRepository.findOne({
      where: { id },
      relations: includeMappings
        ? ['category', 'attributeMappings', 'attributeMappings.attribute']
        : ['category'],
    });
    if (!productType) {
      throw new NotFoundException(`Product type with ID ${id} not found`);
    }
    return productType;
  }

  async findBySlug(slug: string): Promise<ProductType> {
    const productType = await this.productTypesRepository.findOne({
      where: { slug },
      relations: ['category', 'attributeMappings', 'attributeMappings.attribute'],
    });
    if (!productType) {
      throw new NotFoundException(`Product type with slug ${slug} not found`);
    }
    return productType;
  }

  async update(id: string, dto: UpdateProductTypeDto): Promise<ProductType> {
    const productType = await this.findOne(id, false);

    if (dto.categoryId && dto.categoryId !== productType.categoryId) {
      const category = await this.categoriesRepository.findOne({ where: { id: dto.categoryId } });
      if (!category) {
        throw new BadRequestException('Selected category does not exist');
      }
    }
    if (dto.slug && dto.slug !== productType.slug) {
      const slug = slugify(dto.slug, 'product-type', 120);
      await this.assertSlugAvailable(slug, id);
      productType.slug = slug;
    }

    Object.assign(productType, {
      categoryId: dto.categoryId ?? productType.categoryId,
      nameEn: dto.nameEn ?? productType.nameEn,
      nameBn: dto.nameBn ?? productType.nameBn,
      descriptionEn: dto.descriptionEn ?? productType.descriptionEn,
      descriptionBn: dto.descriptionBn ?? productType.descriptionBn,
      icon: dto.icon ?? productType.icon,
      sortOrder: dto.sortOrder ?? productType.sortOrder,
      isActive: dto.isActive ?? productType.isActive,
    });
    return this.productTypesRepository.save(productType);
  }

  async remove(id: string): Promise<void> {
    const productType = await this.findOne(id, false);
    const rows: Array<{ count: string }> = await this.dataSource.query(
      'SELECT COUNT(*)::int AS count FROM products WHERE product_type_id = $1',
      [id],
    );
    const productCount = Number(rows[0]?.count ?? 0);
    if (productCount > 0) {
      throw new BadRequestException(
        `Cannot delete product type "${productType.nameEn}" because ${productCount} products use it. Deactivate it instead.`,
      );
    }
    await this.productTypesRepository.remove(productType);
  }

  // ------------------------------------------------------- attribute mappings

  async getMappings(productTypeId: string): Promise<ProductTypeAttribute[]> {
    return this.mappingsRepository.find({
      where: { productTypeId },
      relations: ['attribute', 'attribute.options'],
      order: { sortOrder: 'ASC' },
    });
  }

  async setMappings(
    productTypeId: string,
    dto: SetProductTypeAttributesDto,
  ): Promise<ProductTypeAttribute[]> {
    const productType = await this.findOne(productTypeId, false);

    const attributeIds = dto.mappings.map((m) => m.attributeId);
    if (new Set(attributeIds).size !== attributeIds.length) {
      throw new BadRequestException('Duplicate attribute in mapping list');
    }
    if (attributeIds.length > 0) {
      const found = await this.attributesRepository.count({ where: { id: In(attributeIds) } });
      if (found !== attributeIds.length) {
        throw new BadRequestException('One or more attributes do not exist');
      }
    }

    await this.mappingsRepository.delete({ productTypeId: productType.id });
    if (dto.mappings.length === 0) return [];

    const rows = dto.mappings.map((mapping, index) =>
      this.mappingsRepository.create({
        productTypeId: productType.id,
        attributeId: mapping.attributeId,
        isRequired: mapping.isRequired ?? false,
        isFilterable: mapping.isFilterable ?? true,
        specGroup: mapping.specGroup ?? null,
        sortOrder: mapping.sortOrder ?? index,
      }),
    );
    await this.mappingsRepository.save(rows);
    return this.getMappings(productTypeId);
  }

  // ---------------------------------------------------------------- filters

  /** Resolves which product types are in scope for a category/product-type filter. */
  async resolveProductTypeIds(filter: CatalogFilterInput): Promise<string[]> {
    if (filter.productTypeId) {
      return [filter.productTypeId];
    }
    const query = this.productTypesRepository
      .createQueryBuilder('pt')
      .leftJoin('pt.category', 'category')
      .where('pt.isActive = true');

    if (filter.categoryId) {
      query.andWhere('pt.categoryId = :categoryId', { categoryId: filter.categoryId });
    } else if (filter.categoryPath) {
      query.andWhere('(category.path = :path OR category.path LIKE :pathPrefix)', {
        path: filter.categoryPath,
        pathPrefix: `${filter.categoryPath}/%`,
      });
    } else {
      return [];
    }
    const rows = await query.select('pt.id', 'id').getRawMany<{ id: string }>();
    return rows.map((r) => r.id);
  }

  /**
   * Builds the reusable SQL join/where fragment used by listing, facets and
   * search so dynamic attribute filters behave identically everywhere.
   */
  private buildBaseQuery(filter: CatalogFilterInput, paramStart = 1): BaseQuery {
    const joins = [
      'JOIN product_variants pv ON pv.product_id = p.id AND pv.is_active = true',
      'JOIN seller_products sp ON sp.product_variant_id = pv.id AND sp.is_active = true',
      'JOIN shops s ON s.id = sp.shop_id AND s.is_active = true',
    ];
    const where = ['p.is_active = true'];
    const params: unknown[] = [];
    let index = paramStart;

    if (filter.categoryId || filter.categoryPath) {
      joins.push('JOIN categories cat ON cat.id = p.category_id');
      if (filter.categoryId) {
        where.push(`(cat.id = $${index} OR cat.parent_id = $${index})`);
        params.push(filter.categoryId);
        index += 1;
      } else {
        where.push(`(cat.path = $${index} OR cat.path LIKE $${index} || '/%')`);
        params.push(filter.categoryPath);
        index += 1;
      }
    }

    if (filter.productTypeId) {
      where.push(`p.product_type_id = $${index}`);
      params.push(filter.productTypeId);
      index += 1;
    }
    if (filter.brandId) {
      where.push(`p.brand_id = $${index}`);
      params.push(filter.brandId);
      index += 1;
    }
    if (filter.minPrice !== undefined) {
      where.push(`sp.price >= $${index}`);
      params.push(filter.minPrice);
      index += 1;
    }
    if (filter.maxPrice !== undefined) {
      where.push(`sp.price <= $${index}`);
      params.push(filter.maxPrice);
      index += 1;
    }
    if (filter.inStock) {
      joins.push('JOIN inventory inv ON inv.seller_product_id = sp.id');
      where.push('inv.quantity > 0');
    }

    for (const [slug, values] of Object.entries(filter.attributeFilters ?? {})) {
      if (!values || values.length === 0) continue;
      where.push(
        `EXISTS (
           SELECT 1 FROM product_attribute_values pavf
           LEFT JOIN attribute_options aof ON aof.id = pavf.option_id
           JOIN attributes af ON af.id = pavf.attribute_id
           WHERE pavf.product_id = p.id
             AND af.slug = $${index}
             AND (aof.slug = ANY($${index + 1}::text[]) OR pavf.value_text = ANY($${index + 1}::text[]))
         )`,
      );
      params.push(slug, values);
      index += 2;
    }

    return { joins: joins.join('\n'), where: where.join(' AND '), params };
  }

  /** Returns filter options/schema and live counts for a category or product type. */
  async getFacets(filter: CatalogFilterInput): Promise<CatalogFacets> {
    const productTypeIds = await this.resolveProductTypeIds(filter);
    const base = this.buildBaseQuery(filter);

    const scopeFilter =
      productTypeIds.length > 0 ? `AND p.product_type_id = ANY($${base.params.length + 1}::uuid[])` : '';
    const scopeParams = productTypeIds.length > 0 ? [...base.params, productTypeIds] : base.params;

    // 1. Applicable filterable attributes with their options.
    let attributes: Attribute[] = [];
    if (productTypeIds.length > 0) {
      const mappings = await this.mappingsRepository.find({
        where: { productTypeId: In(productTypeIds), isFilterable: true },
        relations: ['attribute', 'attribute.options'],
        order: { sortOrder: 'ASC' },
      });
      const seen = new Map<string, Attribute>();
      for (const mapping of mappings) {
        const attribute = mapping.attribute;
        if (attribute && attribute.isActive && attribute.isFilterable && !seen.has(attribute.id)) {
          seen.set(attribute.id, attribute);
        }
      }
      attributes = [...seen.values()];
    }

    const groups: FacetGroup[] = [];
    for (const attribute of attributes) {
      if (
        attribute.dataType === AttributeDataType.SELECT ||
        attribute.dataType === AttributeDataType.MULTI_SELECT ||
        attribute.dataType === AttributeDataType.RANGE
      ) {
        const rows: Array<{
          id: string;
          slug: string;
          value: string;
          value_bn: string | null;
          count: string;
        }> = await this.dataSource.query(
          `SELECT ao.id, ao.slug, ao.value, ao.value_bn, COUNT(DISTINCT p.id)::int AS count
             FROM attribute_options ao
             LEFT JOIN product_attribute_values pav
               ON pav.option_id = ao.id
             LEFT JOIN products p ON p.id = pav.product_id
             ${base.joins}
             ${scopeFilter}
             WHERE ao.attribute_id = $${scopeParams.length + 1}
               AND ao.is_active = true
               AND (${base.where})
             GROUP BY ao.id, ao.slug, ao.value, ao.value_bn, ao.sort_order
             ORDER BY ao.sort_order ASC, ao.value ASC`,
          [...scopeParams, attribute.id],
        );
        groups.push({
          attributeId: attribute.id,
          slug: attribute.slug,
          nameEn: attribute.nameEn,
          nameBn: attribute.nameBn,
          dataType: attribute.dataType,
          unit: attribute.unit,
          options: rows.map((row) => ({
            id: row.id,
            slug: row.slug,
            value: row.value,
            valueBn: row.value_bn,
            count: Number(row.count),
          })),
        });
      } else if (attribute.dataType === AttributeDataType.NUMBER) {
        const rows: Array<{ min: string | null; max: string | null }> =
          await this.dataSource.query(
            `SELECT MIN(pav.value_number)::float AS min, MAX(pav.value_number)::float AS max
               FROM product_attribute_values pav
               JOIN products p ON p.id = pav.product_id
               ${base.joins}
               ${scopeFilter}
               WHERE pav.attribute_id = $${scopeParams.length + 1} AND (${base.where})`,
            [...scopeParams, attribute.id],
          );
        if (rows[0] && rows[0].min !== null) {
          groups.push({
            attributeId: attribute.id,
            slug: attribute.slug,
            nameEn: attribute.nameEn,
            nameBn: attribute.nameBn,
            dataType: attribute.dataType,
            unit: attribute.unit,
            options: [],
            min: Number(rows[0].min),
            max: Number(rows[0].max),
          });
        }
      }
    }

    // 2. Brand facet.
    const brandRows: Array<{
      id: string;
      slug: string;
      name_en: string;
      name_bn: string;
      count: string;
    }> = await this.dataSource.query(
      `SELECT b.id, b.slug, b.name_en, b.name_bn, COUNT(DISTINCT p.id)::int AS count
         FROM brands b
         JOIN products p ON p.brand_id = b.id
         ${base.joins}
         ${scopeFilter}
         WHERE b.is_active = true AND (${base.where})
         GROUP BY b.id, b.slug, b.name_en, b.name_bn
         HAVING COUNT(DISTINCT p.id) > 0
         ORDER BY count DESC, b.name_en ASC
         LIMIT 50`,
      scopeParams,
    );

    // 3. Price range + totals.
    const summaryRows: Array<{
      min_price: string | null;
      max_price: string | null;
      total: string;
      in_stock: string;
    }> = await this.dataSource.query(
      `SELECT MIN(sp.price)::float AS min_price, MAX(sp.price)::float AS max_price,
              COUNT(DISTINCT p.id)::int AS total,
              COUNT(DISTINCT p.id) FILTER (WHERE COALESCE(inv.quantity, 1) > 0)::int AS in_stock
         FROM products p
         ${base.joins}
         LEFT JOIN inventory inv ON inv.seller_product_id = sp.id
         ${scopeFilter}
         WHERE ${base.where}`,
      scopeParams,
    );
    const summary = summaryRows[0];

    return {
      productTypeId: filter.productTypeId ?? null,
      productTypeIds,
      groups,
      priceRange:
        summary && summary.min_price !== null
          ? { min: Number(summary.min_price), max: Number(summary.max_price) }
          : null,
      brands: brandRows.map((row) => ({
        id: row.id,
        slug: row.slug,
        nameEn: row.name_en,
        nameBn: row.name_bn,
        count: Number(row.count),
      })),
      inStockCount: Number(summary?.in_stock ?? 0),
      totalCount: Number(summary?.total ?? 0),
    };
  }

  /**
   * Applies dynamic attribute filters to a TypeORM product query builder.
   * Reused by the public search and admin product listing so filtering behaves
   * identically everywhere without category-specific branching.
   */
  applyAttributeFilters<Entity extends object>(
    queryBuilder: SelectQueryBuilder<Entity>,
    productAlias: string,
    attributeFilters?: Record<string, string[]>,
  ): void {
    if (!attributeFilters) return;
    let counter = 0;
    for (const [slug, values] of Object.entries(attributeFilters)) {
      if (!values || values.length === 0) continue;
      const key = `af${counter}`;
      counter += 1;
      queryBuilder.andWhere(
        `EXISTS (
          SELECT 1 FROM product_attribute_values pav_${key}
          LEFT JOIN attribute_options ao_${key} ON ao_${key}.id = pav_${key}.option_id
          JOIN attributes a_${key} ON a_${key}.id = pav_${key}.attribute_id
          WHERE pav_${key}.product_id = ${productAlias}.id
            AND a_${key}.slug = :${key}_slug
            AND (
              ao_${key}.slug IN (:...${key}_values)
              OR pav_${key}.value_text IN (:...${key}_values)
              OR CAST(pav_${key}.value_number AS text) IN (:...${key}_values)
            )
        )`,
        { [`${key}_slug`]: slug, [`${key}_values`]: values },
      );
    }
  }
}
