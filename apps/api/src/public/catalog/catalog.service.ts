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

    if (subCategoryId) {
      query.andWhere('p.subCategoryId = :subCategoryId', { subCategoryId });
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

    switch (sort) {
      case 'price_asc':
        query.orderBy('sp.price', 'ASC');
        break;
      case 'price_desc':
        query.orderBy('sp.price', 'DESC');
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
