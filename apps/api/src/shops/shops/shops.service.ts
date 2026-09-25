import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Shop } from '../entities/shop.entity.js';
import { SellerProduct } from '../../inventory/entities/seller-product.entity.js';
import { CreateShopDto } from '../dto/create-shop.dto.js';
import { UpdateShopDto } from '../dto/update-shop.dto.js';

export interface ShopProductsFilter {
  categoryId?: string;
  categorySlug?: string;
  subCategoryId?: string;
  brandId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  minRating?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class ShopsService {
  constructor(
    @InjectRepository(Shop)
    private readonly shopsRepository: Repository<Shop>,
    @InjectRepository(SellerProduct)
    private readonly sellerProductsRepository: Repository<SellerProduct>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createShopDto: CreateShopDto): Promise<Shop> {
    const shop = this.shopsRepository.create(createShopDto);
    return this.shopsRepository.save(shop);
  }

  async findAll(): Promise<Shop[]> {
    return this.shopsRepository.find({
      where: { isActive: true },
      relations: ['seller'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(idOrSlug: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    const shop = await this.shopsRepository.findOne({
      where: isUuid ? [{ id: idOrSlug }, { slug: idOrSlug }] : { slug: idOrSlug },
      relations: ['seller'],
    });

    if (!shop) {
      throw new NotFoundException(`Shop not found`);
    }

    // Aggregate stats: productCount, averageRating, totalReviews
    const stats = await this.dataSource.query(`
      SELECT 
        COUNT(DISTINCT sp.id)::int as product_count,
        COALESCE(AVG(r.rating), 0)::float as average_rating,
        COUNT(DISTINCT r.id)::int as total_reviews
      FROM seller_products sp
      LEFT JOIN product_variants pv ON pv.id = sp.product_variant_id
      LEFT JOIN reviews r ON r.product_id = pv.product_id AND r.is_approved = true
      WHERE sp.shop_id = $1 AND sp.is_active = true
    `, [shop.id]);

    const stat = stats[0] || {};

    return {
      ...shop,
      productCount: stat.product_count || 0,
      averageRating: parseFloat((stat.average_rating || 0).toFixed(1)),
      totalReviews: stat.total_reviews || 0,
    };
  }

  async getShopProducts(idOrSlug: string, filter: ShopProductsFilter) {
    const shop = await this.findOne(idOrSlug);

    const page = Math.max(1, Number(filter.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filter.limit) || 20));

    // Base query builder using SellerProduct entity repository
    const query = this.sellerProductsRepository.createQueryBuilder('sp')
      .leftJoinAndSelect('sp.productVariant', 'pv')
      .leftJoinAndSelect('pv.product', 'p')
      .leftJoinAndSelect('p.category', 'cat')
      .leftJoinAndSelect('p.subCategory', 'subCat')
      .leftJoinAndSelect('p.images', 'images')
      .leftJoinAndSelect('p.brand', 'brand')
      .leftJoinAndSelect('sp.shop', 'shop')
      .leftJoinAndSelect('sp.inventory', 'inv')
      .where('sp.shopId = :shopId', { shopId: shop.id })
      .andWhere('sp.isActive = true')
      .andWhere('pv.isActive = true')
      .andWhere('p.isActive = true');

    if (filter.search) {
      query.andWhere(
        '(p.nameEn ILIKE :search OR p.nameBn ILIKE :search OR pv.sku ILIKE :search)',
        { search: `%${filter.search}%` },
      );
    }

    if (filter.categoryId) {
      query.andWhere('(p.categoryId = :catId OR p.subCategoryId = :catId)', { catId: filter.categoryId });
    } else if (filter.categorySlug) {
      query.andWhere('(cat.slug = :catSlug OR subCat.slug = :catSlug)', { catSlug: filter.categorySlug });
    }

    if (filter.subCategoryId) {
      query.andWhere('p.subCategoryId = :subCatId', { subCatId: filter.subCategoryId });
    }

    if (filter.brandId) {
      query.andWhere('p.brandId = :brandId', { brandId: filter.brandId });
    }

    if (filter.minPrice !== undefined) {
      query.andWhere(
        '(sp.discountPrice >= :minPrice OR (sp.discountPrice IS NULL AND sp.price >= :minPrice))',
        { minPrice: filter.minPrice },
      );
    }

    if (filter.maxPrice !== undefined) {
      query.andWhere(
        '(sp.discountPrice <= :maxPrice OR (sp.discountPrice IS NULL AND sp.price <= :maxPrice))',
        { maxPrice: filter.maxPrice },
      );
    }

    if (filter.inStock) {
      query.andWhere('(inv.quantity - inv.reservedQuantity) > 0');
    }

    // Sorting
    switch (filter.sort) {
      case 'price_asc':
        query.orderBy('sp.price', 'ASC');
        break;
      case 'price_desc':
        query.orderBy('sp.price', 'DESC');
        break;
      case 'rating':
        query.orderBy('p.averageRating', 'DESC');
        break;
      case 'oldest':
        query.orderBy('sp.createdAt', 'ASC');
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

    // Ensure pv.images fallback to p.images
    items.forEach((item: any) => {
      if (item.productVariant && (!item.productVariant.images || item.productVariant.images.length === 0)) {
        const pImages = item.productVariant.product?.images;
        if (pImages && pImages.length > 0) {
          item.productVariant.images = pImages
            .sort((a: any, b: any) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
            .map((img: any) => img.url);
        }
      }
    });

    // Query categories with products in this shop
    const categories: Array<{
      id: string;
      nameEn: string;
      nameBn: string;
      slug: string;
      icon: string | null;
      count: number;
      productCount: number;
    }> = await this.dataSource.query(`
      SELECT c.id, c.name_en as "nameEn", c.name_bn as "nameBn", c.slug, c.icon,
        COUNT(DISTINCT sp.id)::int as count,
        COUNT(DISTINCT sp.id)::int as "productCount"
      FROM seller_products sp
      JOIN product_variants pv ON pv.id = sp.product_variant_id
      JOIN products p ON p.id = pv.product_id
      JOIN categories c ON c.id = p.category_id
      WHERE sp.shop_id = $1 AND sp.is_active = true AND pv.is_active = true AND p.is_active = true
      GROUP BY c.id, c.name_en, c.name_bn, c.slug, c.icon
      HAVING COUNT(DISTINCT sp.id) > 0
      ORDER BY count DESC
    `, [shop.id]);

    // Query brands with products in this shop
    const brands: Array<{
      id: string;
      nameEn: string;
      nameBn: string;
      slug: string;
      logo: string | null;
      count: number;
    }> = await this.dataSource.query(`
      SELECT b.id, b.name_en as "nameEn", b.name_bn as "nameBn", b.slug, b.logo,
        COUNT(DISTINCT sp.id)::int as count
      FROM seller_products sp
      JOIN product_variants pv ON pv.id = sp.product_variant_id
      JOIN products p ON p.id = pv.product_id
      JOIN brands b ON b.id = p.brand_id
      WHERE sp.shop_id = $1 AND sp.is_active = true AND pv.is_active = true AND p.is_active = true AND b.is_active = true
      GROUP BY b.id, b.name_en, b.name_bn, b.slug, b.logo
      HAVING COUNT(DISTINCT sp.id) > 0
      ORDER BY count DESC, b.name_en ASC
    `, [shop.id]);

    return {
      shop,
      data: items,
      categories,
      brands,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, updateShopDto: UpdateShopDto): Promise<Shop> {
    const shop = await this.findOne(id);
    Object.assign(shop, updateShopDto);
    return this.shopsRepository.save(shop);
  }

  async remove(id: string): Promise<void> {
    const shop = await this.findOne(id);
    await this.shopsRepository.remove(shop);
  }
}
