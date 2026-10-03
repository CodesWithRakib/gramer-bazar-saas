import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SellerProduct } from '../../inventory/entities/seller-product.entity.js';
import { Brand } from '../../catalog/entities/brand.entity.js';
import {
  CatalogFilterInput,
  ProductTypesService,
} from '../../catalog/product-types/product-types.service.js';
import { ProductAttributeValuesService } from '../../catalog/products/product-attribute-values.service.js';
import { SearchCatalogDto } from './dto/search-catalog.dto.js';
import { PaginationUtils } from '../../common/utils/pagination.util.js';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(SellerProduct)
    private readonly sellerProductRepo: Repository<SellerProduct>,
    @InjectRepository(Brand)
    private readonly brandRepo: Repository<Brand>,
    private readonly productTypesService: ProductTypesService,
    private readonly attributeValuesService: ProductAttributeValuesService,
  ) {}

  /** Dynamic filter facets derived entirely from the product type schema. */
  async getFacets(filter: CatalogFilterInput) {
    return this.productTypesService.getFacets(filter);
  }

  private parseAttributeFilters(raw?: string): Record<string, string[]> | undefined {
    if (!raw) return undefined;
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const normalized: Record<string, string[]> = {};
      for (const [key, value] of Object.entries(parsed)) {
        if (Array.isArray(value)) {
          const values = value.map((item) => String(item)).filter((item) => item.length > 0);
          if (values.length > 0) normalized[key] = values;
        } else if (value !== null && value !== undefined && value !== '') {
          normalized[key] = [String(value)];
        }
      }
      return normalized;
    } catch {
      return undefined;
    }
  }

  async getBrands() {
    return this.brandRepo.find({
      where: { isActive: true },
      order: { nameEn: 'ASC' },
    });
  }

  async search(searchDto: SearchCatalogDto) {
    const {
      q,
      categoryId,
      subCategoryId,
      minPrice,
      maxPrice,
      cursor,
      limit = 30,
      sort = 'newest',
    } = searchDto;

    const query = this.sellerProductRepo
      .createQueryBuilder('sp')
      .leftJoinAndSelect('sp.productVariant', 'pv')
      .leftJoinAndSelect('pv.product', 'p')
      .leftJoinAndSelect('p.category', 'cat')
      .leftJoinAndSelect('p.subCategory', 'subCat')
      .leftJoinAndSelect('p.images', 'images')
      .leftJoinAndSelect('p.brand', 'b')
      .leftJoinAndSelect('sp.shop', 'shop')
      .leftJoinAndSelect('sp.inventory', 'inv')
      .where('sp.isActive = :isActive', { isActive: true })
      .andWhere('pv.isActive = :isActive', { isActive: true })
      .andWhere('p.isActive = :isActive', { isActive: true })
      .andWhere('shop.isActive = :isActive', { isActive: true });

    if (q) {
      query.andWhere(
        '(p.nameEn ILIKE :q OR p.nameBn ILIKE :q OR pv.nameEn ILIKE :q OR pv.nameBn ILIKE :q OR p.slug ILIKE :q OR EXISTS (SELECT 1 FROM product_attribute_values qav LEFT JOIN attribute_options qao ON qao.id = qav.option_id WHERE qav.product_id = p.id AND (qav.value_text ILIKE :q OR qao.value ILIKE :q OR qao.value_bn ILIKE :q)))',
        { q: `%${q}%` },
      );
    }

    // Category filter resolves the whole subtree via the materialized path, so
    // any taxonomy depth works without extra relations.
    if (categoryId) {
      query.andWhere(
        `(p.categoryId = :categoryId OR p.subCategoryId = :categoryId OR p.categoryId IN (
           WITH RECURSIVE descendants AS (
             SELECT id FROM categories WHERE id = :categoryId
             UNION ALL
             SELECT c.id FROM categories c JOIN descendants d ON c.parent_id = d.id
           )
           SELECT id FROM descendants
         ))`,
        { categoryId },
      );
    }

    if (searchDto.categoryPath) {
      query.andWhere("(cat.path = :categoryPath OR cat.path LIKE :categoryPathPrefix)", {
        categoryPath: searchDto.categoryPath,
        categoryPathPrefix: `${searchDto.categoryPath}/%`,
      });
    }

    if (searchDto.categorySlug) {
      query.andWhere('(cat.slug = :categorySlug OR subCat.slug = :categorySlug)', {
        categorySlug: searchDto.categorySlug,
      });
    }

    if (subCategoryId) {
      query.andWhere('p.subCategoryId = :subCategoryId', { subCategoryId });
    }

    if (searchDto.subCategorySlug) {
      query.andWhere('subCat.slug = :subCategorySlug', {
        subCategorySlug: searchDto.subCategorySlug,
      });
    }

    if (searchDto.productTypeId) {
      query.andWhere('p.productTypeId = :productTypeId', {
        productTypeId: searchDto.productTypeId,
      });
    }

    const attributeFilters = this.parseAttributeFilters(searchDto.attributes);
    if (attributeFilters) {
      this.productTypesService.applyAttributeFilters(query, 'p', attributeFilters);
    }

    if (minPrice !== undefined) {
      query.andWhere('sp.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      query.andWhere('sp.price <= :maxPrice', { maxPrice });
    }

    if (searchDto.brandId) {
      query.andWhere('p.brandId = :brandId', { brandId: searchDto.brandId });
    }

    if (searchDto.minRating !== undefined && searchDto.minRating > 0) {
      query.andWhere('p.averageRating >= :minRating', { minRating: searchDto.minRating });
    }

    if (searchDto.inStock) {
      query.andWhere('inv.quantity > 0');
    }

    // ----------------------------------------------------
    // CURSOR & SORTING LOGIC
    // ----------------------------------------------------
    
    let cursorPayload: any = null;
    if (cursor) {
      cursorPayload = PaginationUtils.decodeCursor(cursor);
      if (cursorPayload.sort !== sort) {
        throw new BadRequestException('Cursor is incompatible with the requested sort');
      }
    }

    switch (sort) {
      case 'price_asc':
        if (cursorPayload) {
          query.andWhere('(sp.price > :price OR (sp.price = :price AND sp.id < :id))', {
            price: cursorPayload.price,
            id: cursorPayload.id,
          });
        }
        query.orderBy('sp.price', 'ASC').addOrderBy('sp.id', 'DESC');
        break;
      case 'price_desc':
        if (cursorPayload) {
          query.andWhere('(sp.price < :price OR (sp.price = :price AND sp.id < :id))', {
            price: cursorPayload.price,
            id: cursorPayload.id,
          });
        }
        query.orderBy('sp.price', 'DESC').addOrderBy('sp.id', 'DESC');
        break;
      case 'name_asc':
        if (cursorPayload) {
          query.andWhere('(p.nameEn > :name OR (p.nameEn = :name AND sp.id < :id))', {
            name: cursorPayload.name,
            id: cursorPayload.id,
          });
        }
        query.orderBy('p.nameEn', 'ASC').addOrderBy('sp.id', 'DESC');
        break;
      case 'newest':
      default:
        if (cursorPayload) {
          query.andWhere('(sp.createdAt < :createdAt OR (sp.createdAt = :createdAt AND sp.id < :id))', {
            createdAt: new Date(cursorPayload.createdAt),
            id: cursorPayload.id,
          });
        }
        query.orderBy('sp.createdAt', 'DESC').addOrderBy('sp.id', 'DESC');
        break;
    }

    const limitPlusOne = limit + 1;
    const items = await query.take(limitPlusOne).getMany();

    const hasNextPage = items.length > limit;
    const slicedItems = hasNextPage ? items.slice(0, limit) : items;
    
    let nextCursorPayload = null;
    if (hasNextPage) {
      const lastItem = slicedItems[slicedItems.length - 1];
      nextCursorPayload = { sort, id: lastItem.id } as Record<string, any>;
      
      switch (sort) {
        case 'price_asc':
        case 'price_desc':
          nextCursorPayload.price = Number(lastItem.price);
          break;
        case 'name_asc':
          nextCursorPayload.name = lastItem.productVariant.product.nameEn;
          break;
        case 'newest':
        default:
          nextCursorPayload.createdAt = lastItem.createdAt.toISOString();
          break;
      }
    }

    await this.populateProductsMetadata(slicedItems);

    return {
      data: slicedItems,
      meta: PaginationUtils.buildCursorMeta(items, limit, nextCursorPayload),
    };
  }

  private async populateProductsMetadata(items: SellerProduct[]): Promise<SellerProduct[]> {
    if (!items || items.length === 0) return items;

    // Ensure pv.images has images from p.images if variant images is null or empty
    items.forEach((item) => {
      if (
        item.productVariant &&
        (!item.productVariant.images || item.productVariant.images.length === 0)
      ) {
        const pImages = item.productVariant.product?.images;
        if (pImages && pImages.length > 0) {
          item.productVariant.images = pImages
            .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
            .map((img) => img.url);
        }
      }
    });

    // Fetch ratings and attach to products
    const productIds = items.map((i) => i.productVariant?.product?.id).filter(Boolean);
    if (productIds.length > 0) {
      const ratings = await this.sellerProductRepo.manager.query(
        `
        SELECT product_id, COUNT(id)::int as total_reviews, COALESCE(AVG(rating), 0)::float as average_rating
        FROM reviews
        WHERE product_id = ANY($1) AND is_approved = true
        GROUP BY product_id
      `,
        [productIds],
      );

      const ratingsMap = new Map<string, { total_reviews: number; average_rating: number }>(
        ratings.map((r: { product_id: string; total_reviews: number; average_rating: number }) => [
          r.product_id,
          r,
        ]),
      );

      items.forEach((item) => {
        if (item.productVariant?.product) {
          const ratingData = ratingsMap.get(item.productVariant.product.id);
          const p = item.productVariant.product as unknown as Record<string, unknown>;
          p.totalReviews = ratingData?.total_reviews || 0;
          p.averageRating = ratingData?.average_rating || 0;
        }
      });
    }

    return items;
  }

  async getFeatured(limit = 8) {
    const featuredItems = await this.sellerProductRepo
      .createQueryBuilder('sp')
      .leftJoinAndSelect('sp.productVariant', 'pv')
      .leftJoinAndSelect('pv.product', 'p')
      .leftJoinAndSelect('p.category', 'cat')
      .leftJoinAndSelect('p.subCategory', 'subCat')
      .leftJoinAndSelect('p.images', 'images')
      .leftJoinAndSelect('p.brand', 'b')
      .leftJoinAndSelect('sp.shop', 'shop')
      .leftJoinAndSelect('sp.inventory', 'inv')
      .where('sp.isActive = :isActive', { isActive: true })
      .andWhere('pv.isActive = :isActive', { isActive: true })
      .andWhere('p.isActive = :isActive', { isActive: true })
      .andWhere('shop.isActive = :isActive', { isActive: true })
      .andWhere('p.isFeatured = :isFeatured', { isFeatured: true })
      .orderBy('sp.createdAt', 'DESC')
      .take(limit)
      .getMany();

    if (featuredItems.length >= 4) {
      await this.populateProductsMetadata(featuredItems);
      return {
        data: featuredItems,
        meta: PaginationUtils.buildOffsetMeta(featuredItems.length, 1, limit),
      };
    }

    // If fewer than 4 marked featured, fall back to newest active products
    return this.search({ limit, sort: 'newest' } as SearchCatalogDto);
  }

  async getPopular(limit = 8) {
    // Sort by rating / customer demand
    const popularItems = await this.sellerProductRepo
      .createQueryBuilder('sp')
      .leftJoinAndSelect('sp.productVariant', 'pv')
      .leftJoinAndSelect('pv.product', 'p')
      .leftJoinAndSelect('p.category', 'cat')
      .leftJoinAndSelect('p.subCategory', 'subCat')
      .leftJoinAndSelect('p.images', 'images')
      .leftJoinAndSelect('p.brand', 'b')
      .leftJoinAndSelect('sp.shop', 'shop')
      .leftJoinAndSelect('sp.inventory', 'inv')
      .where('sp.isActive = :isActive', { isActive: true })
      .andWhere('pv.isActive = :isActive', { isActive: true })
      .andWhere('p.isActive = :isActive', { isActive: true })
      .andWhere('shop.isActive = :isActive', { isActive: true })
      .orderBy('sp.createdAt', 'DESC')
      .take(limit)
      .getMany();

    await this.populateProductsMetadata(popularItems);

    return {
      data: popularItems,
      meta: PaginationUtils.buildOffsetMeta(popularItems.length, 1, limit),
    };
  }

  async getRecentlyAdded(limit = 8) {
    const recentItems = await this.sellerProductRepo
      .createQueryBuilder('sp')
      .leftJoinAndSelect('sp.productVariant', 'pv')
      .leftJoinAndSelect('pv.product', 'p')
      .leftJoinAndSelect('p.category', 'cat')
      .leftJoinAndSelect('p.subCategory', 'subCat')
      .leftJoinAndSelect('p.images', 'images')
      .leftJoinAndSelect('p.brand', 'b')
      .leftJoinAndSelect('sp.shop', 'shop')
      .leftJoinAndSelect('sp.inventory', 'inv')
      .where('sp.isActive = :isActive', { isActive: true })
      .andWhere('pv.isActive = :isActive', { isActive: true })
      .andWhere('p.isActive = :isActive', { isActive: true })
      .andWhere('shop.isActive = :isActive', { isActive: true })
      .orderBy('sp.createdAt', 'DESC')
      .take(limit)
      .getMany();

    await this.populateProductsMetadata(recentItems);

    return {
      data: recentItems,
      meta: PaginationUtils.buildOffsetMeta(recentItems.length, 1, limit),
    };
  }

  private homepageCache: { timestamp: number; data: any } | null = null;

  async getHomepage() {
    const now = Date.now();
    if (this.homepageCache && now - this.homepageCache.timestamp < 30000) {
      return this.homepageCache.data;
    }

    // 1. Categories (7 root categories with productCount)
    const categories = await this.sellerProductRepo.manager.query(`
      SELECT c.id, c.name_en as "nameEn", c.name_bn as "nameBn", c.slug, c.icon, c.image,
             c.description_en as "descriptionEn", c.description_bn as "descriptionBn",
             COUNT(DISTINCT p.id)::int as "productCount"
      FROM categories c
      LEFT JOIN products p ON (p.category_id = c.id OR p.sub_category_id = c.id)
      WHERE c.is_active = true AND c.parent_id IS NULL
      GROUP BY c.id, c.name_en, c.name_bn, c.slug, c.icon, c.image, c.description_en, c.description_bn, c.sort_order
      ORDER BY c.sort_order ASC, c.name_en ASC
      LIMIT 8
    `);

    // 2. Featured Products (up to 8)
    const featuredRes = await this.getFeatured(8);

    // 3. Popular Products (up to 8)
    const popularRes = await this.getPopular(8);

    // 4. Recently Added Products (up to 8)
    const recentlyAddedRes = await this.getRecentlyAdded(8);

    // 5. Featured Shops (up to 6 verified active shops with stats)
    const shopsRaw = await this.sellerProductRepo.manager.query(`
      SELECT s.id, s.seller_id as "sellerId", s.name_en as "nameEn", s.name_bn as "nameBn",
             s.slug, s.short_description as "shortDescription", s.description,
             s.logo, s.banner, s.is_verified as "isVerified", s.is_active as "isActive",
             s.phone, s.district, s.upazila, s.area,
             COUNT(DISTINCT sp.id)::int as "productCount",
             COALESCE(AVG(r.rating), 0)::float as "averageRating",
             COUNT(DISTINCT r.id)::int as "totalReviews"
      FROM shops s
      LEFT JOIN seller_products sp ON sp.shop_id = s.id AND sp.is_active = true
      LEFT JOIN product_variants pv ON pv.id = sp.product_variant_id
      LEFT JOIN reviews r ON r.product_id = pv.product_id AND r.is_approved = true
      WHERE s.is_active = true
      GROUP BY s.id, s.seller_id, s.name_en, s.name_bn, s.slug, s.short_description,
               s.description, s.logo, s.banner, s.is_verified, s.is_active, s.phone,
               s.district, s.upazila, s.area, s.created_at
      ORDER BY s.is_verified DESC, "productCount" DESC, s.created_at DESC
      LIMIT 6
    `);

    const featuredShops = shopsRaw.map((s: any) => ({
      ...s,
      averageRating: parseFloat((s.averageRating || 0).toFixed(1)),
    }));

    // 6. Active Flash Sales / Offers
    const offers = await this.sellerProductRepo.manager.query(`
      SELECT fs.id, fs.name, fs."startDate" as "startDate", fs."endDate" as "endDate",
             fs."bannerImage" as "bannerImage", fs."isActive" as "isActive"
      FROM flash_sales fs
      WHERE fs."isActive" = true AND fs."startDate" <= NOW() AND fs."endDate" >= NOW()
      ORDER BY fs."startDate" ASC
      LIMIT 2
    `);

    // 7. Category Sections (top shelves)
    const categorySections = await this.getCategorySections();

    const data = {
      categories,
      featuredProducts: featuredRes.data || [],
      popularProducts: popularRes.data || [],
      featuredShops,
      offers,
      categorySections: categorySections.slice(0, 4),
      recentlyAdded: recentlyAddedRes.data || [],
    };

    this.homepageCache = { timestamp: now, data };
    return data;
  }

  async getSuggestions(q: string) {
    if (!q || q.trim().length < 2) {
      return { products: [], categories: [], brands: [] };
    }
    const term = `%${q.trim()}%`;

    const products = await this.sellerProductRepo
      .createQueryBuilder('sp')
      .leftJoinAndSelect('sp.productVariant', 'pv')
      .leftJoinAndSelect('pv.product', 'p')
      .leftJoinAndSelect('p.images', 'images')
      .where('sp.isActive = :isActive', { isActive: true })
      .andWhere('pv.isActive = :isActive', { isActive: true })
      .andWhere('p.isActive = :isActive', { isActive: true })
      .andWhere('(p.nameEn ILIKE :term OR p.nameBn ILIKE :term OR p.slug ILIKE :term)', { term })
      .take(5)
      .getMany();

    const formattedProducts = products.map((item) => {
      let thumbnail = item.productVariant?.images?.[0];
      if (!thumbnail && item.productVariant?.product?.images?.length) {
        thumbnail =
          item.productVariant.product.images.find((img) => img.isPrimary)?.url ||
          item.productVariant.product.images[0]?.url;
      }
      return {
        id: item.id,
        nameEn: item.productVariant?.product?.nameEn || '',
        nameBn: item.productVariant?.product?.nameBn || '',
        slug: item.productVariant?.product?.slug || '',
        price: Number(item.price),
        unit: item.productVariant?.product?.unit || '',
        thumbnail: thumbnail || null,
      };
    });

    const categories = await this.sellerProductRepo.manager.query(
      `
      SELECT id, name_en as "nameEn", name_bn as "nameBn", slug, icon
      FROM categories
      WHERE is_active = true AND (name_en ILIKE $1 OR name_bn ILIKE $1 OR slug ILIKE $1)
      LIMIT 3
    `,
      [term],
    );

    const brands = await this.brandRepo
      .createQueryBuilder('b')
      .where('b.isActive = :isActive', { isActive: true })
      .andWhere('(b.nameEn ILIKE :term OR b.nameBn ILIKE :term)', { term })
      .take(3)
      .getMany();

    return {
      products: formattedProducts,
      categories,
      brands: brands.map((b) => ({
        id: b.id,
        nameEn: b.nameEn,
        nameBn: b.nameBn,
        slug: b.slug,
      })),
    };
  }

  async getCategorySections() {
    const rootCategories = await this.sellerProductRepo.manager.query(`
      SELECT c.id, c.name_en as "nameEn", c.name_bn as "nameBn", c.slug, c.icon, c.image,
             c.description_en as "descriptionEn", c.description_bn as "descriptionBn",
             COUNT(DISTINCT p.id)::int as "productCount"
      FROM categories c
      INNER JOIN products p ON (p.category_id = c.id OR p.sub_category_id = c.id)
      WHERE c.is_active = true AND c.parent_id IS NULL
      GROUP BY c.id, c.name_en, c.name_bn, c.slug, c.icon, c.image, c.description_en, c.description_bn, c.sort_order
      HAVING COUNT(DISTINCT p.id) > 0
      ORDER BY c.sort_order ASC, c.name_en ASC
    `);

    const sections = [];
    for (const cat of rootCategories) {
      const items = await this.sellerProductRepo
        .createQueryBuilder('sp')
        .leftJoinAndSelect('sp.productVariant', 'pv')
        .leftJoinAndSelect('pv.product', 'p')
        .leftJoinAndSelect('p.category', 'cat')
        .leftJoinAndSelect('p.subCategory', 'subCat')
        .leftJoinAndSelect('p.images', 'images')
        .leftJoinAndSelect('p.brand', 'b')
        .leftJoinAndSelect('sp.shop', 'shop')
        .leftJoinAndSelect('sp.inventory', 'inv')
        .where('sp.isActive = :isActive', { isActive: true })
        .andWhere('pv.isActive = :isActive', { isActive: true })
        .andWhere('p.isActive = :isActive', { isActive: true })
        .andWhere(
          '(p.categoryId = :catId OR p.subCategoryId IN (SELECT id FROM categories WHERE parent_id = :catId))',
          { catId: cat.id },
        )
        .orderBy('sp.createdAt', 'DESC')
        .take(8)
        .getMany();

      if (items.length > 0) {
        items.forEach((item) => {
          if (
            item.productVariant &&
            (!item.productVariant.images || item.productVariant.images.length === 0)
          ) {
            const pImages = item.productVariant.product?.images;
            if (pImages && pImages.length > 0) {
              item.productVariant.images = pImages
                .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
                .map((img) => img.url);
            }
          }
        });

        const productIds = items.map((i) => i.productVariant?.product?.id).filter(Boolean);
        if (productIds.length > 0) {
          const ratings = await this.sellerProductRepo.manager.query(
            `
            SELECT product_id, COUNT(id)::int as total_reviews, COALESCE(AVG(rating), 0)::float as average_rating
            FROM reviews
            WHERE product_id = ANY($1) AND is_approved = true
            GROUP BY product_id
          `,
            [productIds],
          );

          const ratingsMap = new Map<string, { total_reviews: number; average_rating: number }>(
            ratings.map(
              (r: { product_id: string; total_reviews: number; average_rating: number }) => [
                r.product_id,
                r,
              ],
            ),
          );

          items.forEach((item) => {
            if (item.productVariant?.product) {
              const ratingData = ratingsMap.get(item.productVariant.product.id);
              const p = item.productVariant.product as unknown as Record<string, unknown>;
              p.totalReviews = ratingData?.total_reviews || 0;
              p.averageRating = ratingData?.average_rating || 0;
            }
          });
        }

        const subCategories = await this.sellerProductRepo.manager.query(
          `
          SELECT c.id, c.name_en as "nameEn", c.name_bn as "nameBn", c.slug, COUNT(DISTINCT p.id)::int as "productCount"
          FROM categories c
          LEFT JOIN products p ON p.sub_category_id = c.id
          WHERE c.parent_id = $1 AND c.is_active = true
          GROUP BY c.id, c.name_en, c.name_bn, c.slug, c.sort_order
          ORDER BY c.sort_order ASC, c.name_en ASC
        `,
          [cat.id],
        );

        sections.push({
          category: {
            ...cat,
            subCategories,
          },
          products: items,
        });
      }
    }

    return sections;
  }

  async getProductDetails(slug: string) {
    const query = this.sellerProductRepo
      .createQueryBuilder('sp')
      .leftJoinAndSelect('sp.productVariant', 'pv')
      .leftJoinAndSelect('pv.product', 'p')
      .leftJoinAndSelect('p.category', 'cat')
      .leftJoinAndSelect('p.subCategory', 'subCat')
      .leftJoinAndSelect('p.productType', 'productType')
      .leftJoinAndSelect('p.images', 'images')
      .leftJoinAndSelect('p.brand', 'b')
      .leftJoinAndSelect('sp.shop', 'shop')
      .leftJoinAndSelect('sp.inventory', 'inv')
      .where('sp.isActive = :isActive', { isActive: true });

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    if (isUuid) {
      query.andWhere('(p.slug = :slug OR p.id = :slug OR sp.id = :slug)', {
        slug,
      });
    } else {
      query.andWhere('p.slug = :slug', { slug });
    }

    const items = await query.getMany();

    if (!items.length) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    // Ensure pv.images fallback to p.images
    items.forEach((item) => {
      if (
        item.productVariant &&
        (!item.productVariant.images || item.productVariant.images.length === 0)
      ) {
        const pImages = item.productVariant.product?.images;
        if (pImages && pImages.length > 0) {
          item.productVariant.images = pImages
            .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
            .map((img) => img.url);
        }
      }
    });

    const productIds = items.map((i) => i.productVariant?.product?.id).filter(Boolean);
    if (productIds.length > 0) {
      const ratings = await this.sellerProductRepo.manager.query(
        `
        SELECT product_id, COUNT(id)::int as total_reviews, COALESCE(AVG(rating), 0)::float as average_rating
        FROM reviews
        WHERE product_id = ANY($1) AND is_approved = true
        GROUP BY product_id
      `,
        [productIds],
      );

      const ratingsMap = new Map<string, { total_reviews: number; average_rating: number }>(
        ratings.map((r: { product_id: string; total_reviews: number; average_rating: number }) => [
          r.product_id,
          r,
        ]),
      );

      items.forEach((item) => {
        if (item.productVariant?.product) {
          const ratingData = ratingsMap.get(item.productVariant.product.id);
          const p = item.productVariant.product as unknown as Record<string, unknown>;
          p.totalReviews = ratingData?.total_reviews || 0;
          p.averageRating = ratingData?.average_rating || 0;
        }
      });
    }

    // Attach structured, grouped specifications for the detail page.
    const detailProductIds = [
      ...new Set(items.map((i) => i.productVariant?.product?.id).filter((id): id is string => !!id)),
    ];
    const specEntries = await Promise.all(
      detailProductIds.map(
        async (id) => [id, await this.attributeValuesService.getSpecGroups(id)] as const,
      ),
    );
    const specMap = new Map(specEntries);
    items.forEach((item) => {
      const product = item.productVariant?.product as unknown as
        | Record<string, unknown>
        | undefined;
      if (product && typeof product.id === 'string') {
        product.specGroups = specMap.get(product.id) ?? [];
      }
    });

    return items;
  }

  async getRelatedProducts(slug: string, limit = 5) {
    // First find the category of this product
    const currentProduct = await this.sellerProductRepo
      .createQueryBuilder('sp')
      .leftJoin('sp.productVariant', 'pv')
      .leftJoin('pv.product', 'p')
      .where('p.slug = :slug', { slug })
      .select(['p.categoryId'])
      .getRawOne();

    if (!currentProduct) {
      return [];
    }

    // Now find other seller products in the same category, excluding the same product slug
    const query = this.sellerProductRepo
      .createQueryBuilder('sp')
      .leftJoinAndSelect('sp.productVariant', 'pv')
      .leftJoinAndSelect('pv.product', 'p')
      .leftJoinAndSelect('p.category', 'cat')
      .leftJoinAndSelect('p.subCategory', 'subCat')
      .leftJoinAndSelect('p.images', 'images')
      .leftJoinAndSelect('p.brand', 'b')
      .leftJoinAndSelect('sp.shop', 'shop')
      .leftJoinAndSelect('sp.inventory', 'inv')
      .where('sp.isActive = :isActive', { isActive: true })
      .andWhere('p.categoryId = :categoryId', {
        categoryId: currentProduct.p_categoryId,
      })
      .andWhere('p.slug != :slug', { slug })
      .orderBy('sp.createdAt', 'DESC')
      .take(limit);

    const items = await query.getMany();

    // Ensure pv.images fallback to p.images
    items.forEach((item) => {
      if (
        item.productVariant &&
        (!item.productVariant.images || item.productVariant.images.length === 0)
      ) {
        const pImages = item.productVariant.product?.images;
        if (pImages && pImages.length > 0) {
          item.productVariant.images = pImages
            .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
            .map((img) => img.url);
        }
      }
    });

    const productIds = items.map((i) => i.productVariant?.product?.id).filter(Boolean);
    if (productIds.length > 0) {
      const ratings = await this.sellerProductRepo.manager.query(
        `
        SELECT product_id, COUNT(id)::int as total_reviews, COALESCE(AVG(rating), 0)::float as average_rating
        FROM reviews
        WHERE product_id = ANY($1) AND is_approved = true
        GROUP BY product_id
      `,
        [productIds],
      );

      const ratingsMap = new Map<string, { total_reviews: number; average_rating: number }>(
        ratings.map((r: { product_id: string; total_reviews: number; average_rating: number }) => [
          r.product_id,
          r,
        ]),
      );

      items.forEach((item) => {
        if (item.productVariant?.product) {
          const ratingData = ratingsMap.get(item.productVariant.product.id);
          const p = item.productVariant.product as unknown as Record<string, unknown>;
          p.totalReviews = ratingData?.total_reviews || 0;
          p.averageRating = ratingData?.average_rating || 0;
        }
      });
    }

    return items;
  }
}
