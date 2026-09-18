import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SellerProduct } from '../../inventory/entities/seller-product.entity.js';
import { SearchCatalogDto } from './dto/search-catalog.dto.js';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(SellerProduct)
    private readonly sellerProductRepo: Repository<SellerProduct>,
  ) {}

  async search(searchDto: SearchCatalogDto) {
    const { q, categoryId, minPrice, maxPrice, page = 1, limit = 20, sort = 'newest' } = searchDto;

    const query = this.sellerProductRepo.createQueryBuilder('sp')
      .leftJoinAndSelect('sp.productVariant', 'pv')
      .leftJoinAndSelect('pv.product', 'p')
      .leftJoinAndSelect('p.category', 'cat')
      .leftJoinAndSelect('p.brand', 'b')
      .leftJoinAndSelect('sp.shop', 'shop')
      .leftJoinAndSelect('sp.inventory', 'inv')
      .where('sp.isActive = :isActive', { isActive: true })
      .andWhere('pv.isActive = :isActive', { isActive: true })
      .andWhere('p.isActive = :isActive', { isActive: true })
      .andWhere('shop.isActive = :isActive', { isActive: true });

    if (q) {
      query.andWhere(
        '(p.nameEn ILIKE :q OR p.nameBn ILIKE :q OR pv.nameEn ILIKE :q OR pv.nameBn ILIKE :q)',
        { q: `%${q}%` }
      );
    }

    if (categoryId) {
      query.andWhere('p.categoryId = :categoryId', { categoryId });
    }

    if (minPrice !== undefined) {
      query.andWhere('sp.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      query.andWhere('sp.price <= :maxPrice', { maxPrice });
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
    // Usually, you'd find by global product slug and include variants, OR find by seller product ID.
    // Assuming product slug applies to the global product.
    const query = this.sellerProductRepo.createQueryBuilder('sp')
      .leftJoinAndSelect('sp.productVariant', 'pv')
      .leftJoinAndSelect('pv.product', 'p')
      .leftJoinAndSelect('p.category', 'cat')
      .leftJoinAndSelect('p.brand', 'b')
      .leftJoinAndSelect('sp.shop', 'shop')
      .leftJoinAndSelect('sp.inventory', 'inv')
      .where('sp.isActive = :isActive', { isActive: true })
      .andWhere('p.slug = :slug', { slug });

    const items = await query.getMany();

    if (!items.length) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return items;
  }
}
