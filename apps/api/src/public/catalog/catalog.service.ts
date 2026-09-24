import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SellerProduct } from '../../inventory/entities/seller-product.entity.js';
import { Brand } from '../../catalog/entities/brand.entity.js';
import { SearchCatalogDto } from './dto/search-catalog.dto.js';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(SellerProduct)
    private readonly sellerProductRepo: Repository<SellerProduct>,
    @InjectRepository(Brand)
    private readonly brandRepo: Repository<Brand>,
  ) {}

  async getBrands() {
    return this.brandRepo.find({ where: { isActive: true }, order: { nameEn: 'ASC' } });
  }

  async search(searchDto: SearchCatalogDto) {
    const { q, categoryId, subCategoryId, minPrice, maxPrice, page = 1, limit = 20, sort = 'newest' } = searchDto;

    const query = this.sellerProductRepo.createQueryBuilder('sp')
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
        '(p.nameEn ILIKE :q OR p.nameBn ILIKE :q OR pv.nameEn ILIKE :q OR pv.nameBn ILIKE :q OR p.slug ILIKE :q)',
        { q: `%${q}%` }
      );
    }

    if (categoryId) {
      query.andWhere('(p.categoryId = :categoryId OR p.subCategoryId = :categoryId)', { categoryId });
    }

    if (searchDto.categorySlug) {
      query.andWhere('(cat.slug = :categorySlug OR subCat.slug = :categorySlug)', { categorySlug: searchDto.categorySlug });
    }

    if (subCategoryId) {
      query.andWhere('p.subCategoryId = :subCategoryId', { subCategoryId });
    }

    if (searchDto.subCategorySlug) {
      query.andWhere('subCat.slug = :subCategorySlug', { subCategorySlug: searchDto.subCategorySlug });
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

    switch (sort) {
      case 'price_asc':
        query.orderBy('sp.price', 'ASC');
        break;
      case 'price_desc':
        query.orderBy('sp.price', 'DESC');
        break;
      case 'name_asc':
        query.orderBy('p.nameEn', 'ASC');
        break;
      case 'newest':
      default:
        query.orderBy('sp.createdAt', 'DESC');
        break;
    }

    const [items, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Ensure pv.images has images from p.images if variant images is null or empty
    items.forEach(item => {
      if (item.productVariant && (!item.productVariant.images || item.productVariant.images.length === 0)) {
        const pImages = item.productVariant.product?.images;
        if (pImages && pImages.length > 0) {
          item.productVariant.images = pImages
            .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
            .map(img => img.url);
        }
      }
    });

    // Fetch ratings and attach to products
    const productIds = items.map(i => i.productVariant?.product?.id).filter(Boolean);
    if (productIds.length > 0) {
      const ratings = await this.sellerProductRepo.manager.query(`
        SELECT product_id, COUNT(id)::int as total_reviews, COALESCE(AVG(rating), 0)::float as average_rating
        FROM reviews
        WHERE product_id = ANY($1) AND is_approved = true
        GROUP BY product_id
      `, [productIds]);

      const ratingsMap = new Map<string, { total_reviews: number; average_rating: number }>(
        ratings.map((r: { product_id: string; total_reviews: number; average_rating: number }) => [r.product_id, r])
      );

      items.forEach(item => {
        if (item.productVariant?.product) {
          const ratingData = ratingsMap.get(item.productVariant.product.id);
          const p = item.productVariant.product as unknown as Record<string, unknown>;
          p.totalReviews = ratingData?.total_reviews || 0;
          p.averageRating = ratingData?.average_rating || 0;
        }
      });
    }

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  async getFeatured() {
    return this.search({ limit: 10, sort: 'newest' } as SearchCatalogDto);
  }

  async getPopular(limit = 8) {
    return this.search({ limit, sort: 'price_asc' } as SearchCatalogDto);
  }

  async getSuggestions(q: string) {
    if (!q || q.trim().length < 2) {
      return { products: [], categories: [], brands: [] };
    }
    const term = `%${q.trim()}%`;

    const products = await this.sellerProductRepo.createQueryBuilder('sp')
      .leftJoinAndSelect('sp.productVariant', 'pv')
      .leftJoinAndSelect('pv.product', 'p')
      .leftJoinAndSelect('p.images', 'images')
      .where('sp.isActive = :isActive', { isActive: true })
      .andWhere('pv.isActive = :isActive', { isActive: true })
      .andWhere('p.isActive = :isActive', { isActive: true })
      .andWhere('(p.nameEn ILIKE :term OR p.nameBn ILIKE :term OR p.slug ILIKE :term)', { term })
      .take(5)
      .getMany();

    const formattedProducts = products.map(item => {
      let thumbnail = item.productVariant?.images?.[0];
      if (!thumbnail && item.productVariant?.product?.images?.length) {
        thumbnail = item.productVariant.product.images.find(img => img.isPrimary)?.url || item.productVariant.product.images[0]?.url;
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

    const categories = await this.sellerProductRepo.manager.query(`
      SELECT id, name_en as "nameEn", name_bn as "nameBn", slug, icon
      FROM categories
      WHERE is_active = true AND (name_en ILIKE $1 OR name_bn ILIKE $1 OR slug ILIKE $1)
      LIMIT 3
    `, [term]);

    const brands = await this.brandRepo.createQueryBuilder('b')
      .where('b.isActive = :isActive', { isActive: true })
      .andWhere('(b.nameEn ILIKE :term OR b.nameBn ILIKE :term)', { term })
      .take(3)
      .getMany();

    return {
      products: formattedProducts,
      categories,
      brands: brands.map(b => ({ id: b.id, nameEn: b.nameEn, nameBn: b.nameBn, slug: b.slug })),
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
      const items = await this.sellerProductRepo.createQueryBuilder('sp')
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
        .andWhere('(p.categoryId = :catId OR p.subCategoryId IN (SELECT id FROM categories WHERE parent_id = :catId))', { catId: cat.id })
        .orderBy('sp.createdAt', 'DESC')
        .take(8)
        .getMany();

      if (items.length > 0) {
        items.forEach(item => {
          if (item.productVariant && (!item.productVariant.images || item.productVariant.images.length === 0)) {
            const pImages = item.productVariant.product?.images;
            if (pImages && pImages.length > 0) {
              item.productVariant.images = pImages
                .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
                .map(img => img.url);
            }
          }
        });

        const productIds = items.map(i => i.productVariant?.product?.id).filter(Boolean);
        if (productIds.length > 0) {
          const ratings = await this.sellerProductRepo.manager.query(`
            SELECT product_id, COUNT(id)::int as total_reviews, COALESCE(AVG(rating), 0)::float as average_rating
            FROM reviews
            WHERE product_id = ANY($1) AND is_approved = true
            GROUP BY product_id
          `, [productIds]);

          const ratingsMap = new Map<string, { total_reviews: number; average_rating: number }>(
            ratings.map((r: { product_id: string; total_reviews: number; average_rating: number }) => [r.product_id, r])
          );

          items.forEach(item => {
            if (item.productVariant?.product) {
              const ratingData = ratingsMap.get(item.productVariant.product.id);
              const p = item.productVariant.product as unknown as Record<string, unknown>;
              p.totalReviews = ratingData?.total_reviews || 0;
              p.averageRating = ratingData?.average_rating || 0;
            }
          });
        }

        const subCategories = await this.sellerProductRepo.manager.query(`
          SELECT c.id, c.name_en as "nameEn", c.name_bn as "nameBn", c.slug, COUNT(DISTINCT p.id)::int as "productCount"
          FROM categories c
          LEFT JOIN products p ON p.sub_category_id = c.id
          WHERE c.parent_id = $1 AND c.is_active = true
          GROUP BY c.id, c.name_en, c.name_bn, c.slug, c.sort_order
          ORDER BY c.sort_order ASC, c.name_en ASC
        `, [cat.id]);

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
    const query = this.sellerProductRepo.createQueryBuilder('sp')
      .leftJoinAndSelect('sp.productVariant', 'pv')
      .leftJoinAndSelect('pv.product', 'p')
      .leftJoinAndSelect('p.category', 'cat')
      .leftJoinAndSelect('p.subCategory', 'subCat')
      .leftJoinAndSelect('p.images', 'images')
      .leftJoinAndSelect('p.brand', 'b')
      .leftJoinAndSelect('sp.shop', 'shop')
      .leftJoinAndSelect('sp.inventory', 'inv')
      .where('sp.isActive = :isActive', { isActive: true })
      .andWhere('p.slug = :slug', { slug });

    const items = await query.getMany();

    if (!items.length) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    // Ensure pv.images fallback to p.images
    items.forEach(item => {
      if (item.productVariant && (!item.productVariant.images || item.productVariant.images.length === 0)) {
        const pImages = item.productVariant.product?.images;
        if (pImages && pImages.length > 0) {
          item.productVariant.images = pImages
            .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
            .map(img => img.url);
        }
      }
    });

    const productIds = items.map(i => i.productVariant?.product?.id).filter(Boolean);
    if (productIds.length > 0) {
      const ratings = await this.sellerProductRepo.manager.query(`
        SELECT product_id, COUNT(id)::int as total_reviews, COALESCE(AVG(rating), 0)::float as average_rating
        FROM reviews
        WHERE product_id = ANY($1) AND is_approved = true
        GROUP BY product_id
      `, [productIds]);

      const ratingsMap = new Map<string, { total_reviews: number; average_rating: number }>(
        ratings.map((r: { product_id: string; total_reviews: number; average_rating: number }) => [r.product_id, r])
      );

      items.forEach(item => {
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

  async getRelatedProducts(slug: string, limit = 5) {
    // First find the category of this product
    const currentProduct = await this.sellerProductRepo.createQueryBuilder('sp')
      .leftJoin('sp.productVariant', 'pv')
      .leftJoin('pv.product', 'p')
      .where('p.slug = :slug', { slug })
      .select(['p.categoryId'])
      .getRawOne();

    if (!currentProduct) {
      return [];
    }

    // Now find other seller products in the same category, excluding the same product slug
    const query = this.sellerProductRepo.createQueryBuilder('sp')
      .leftJoinAndSelect('sp.productVariant', 'pv')
      .leftJoinAndSelect('pv.product', 'p')
      .leftJoinAndSelect('p.category', 'cat')
      .leftJoinAndSelect('p.subCategory', 'subCat')
      .leftJoinAndSelect('p.images', 'images')
      .leftJoinAndSelect('p.brand', 'b')
      .leftJoinAndSelect('sp.shop', 'shop')
      .leftJoinAndSelect('sp.inventory', 'inv')
      .where('sp.isActive = :isActive', { isActive: true })
      .andWhere('p.categoryId = :categoryId', { categoryId: currentProduct.p_categoryId })
      .andWhere('p.slug != :slug', { slug })
      .orderBy('sp.createdAt', 'DESC')
      .take(limit);

    const items = await query.getMany();

    // Ensure pv.images fallback to p.images
    items.forEach(item => {
      if (item.productVariant && (!item.productVariant.images || item.productVariant.images.length === 0)) {
        const pImages = item.productVariant.product?.images;
        if (pImages && pImages.length > 0) {
          item.productVariant.images = pImages
            .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
            .map(img => img.url);
        }
      }
    });

    const productIds = items.map(i => i.productVariant?.product?.id).filter(Boolean);
    if (productIds.length > 0) {
      const ratings = await this.sellerProductRepo.manager.query(`
        SELECT product_id, COUNT(id)::int as total_reviews, COALESCE(AVG(rating), 0)::float as average_rating
        FROM reviews
        WHERE product_id = ANY($1) AND is_approved = true
        GROUP BY product_id
      `, [productIds]);

      const ratingsMap = new Map<string, { total_reviews: number; average_rating: number }>(
        ratings.map((r: { product_id: string; total_reviews: number; average_rating: number }) => [r.product_id, r])
      );

      items.forEach(item => {
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
