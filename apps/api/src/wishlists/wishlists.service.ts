import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { WishlistItem } from './entities/wishlist-item.entity.js';
import { Product } from '../catalog/entities/product.entity.js';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(WishlistItem)
    private readonly wishlistRepository: Repository<WishlistItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  async getUserWishlist(userId: string) {
    const items = await this.wishlistRepository.find({
      where: { userId },
      relations: [
        'product',
        'product.category',
        'product.subCategory',
        'product.brand',
        'product.images',
        'product.variants',
      ],
      order: { createdAt: 'DESC' },
    });

    const validItems = items.filter((item) => !!item.product);
    if (!validItems.length) {
      return [];
    }

    const productIds = validItems.map((item) => item.productId);

    // 1. Fetch available stock and pricing across sellers in batch
    const stockAndPricing: Array<{
      product_id: string;
      total_available: string | number;
      min_price: string | number | null;
      min_regular_price: string | number | null;
    }> = await this.dataSource.query(`
      SELECT 
        p.id as product_id,
        COALESCE(SUM(i.quantity - i.reserved_quantity), 0)::int as total_available,
        MIN(COALESCE(sp.discount_price, sp.price))::float as min_price,
        MIN(sp.price)::float as min_regular_price
      FROM products p
      JOIN product_variants pv ON pv.product_id = p.id
      JOIN seller_products sp ON sp.product_variant_id = pv.id
      LEFT JOIN inventory i ON i.seller_product_id = sp.id
      WHERE p.id = ANY($1) AND sp.is_active = true AND pv.is_active = true
      GROUP BY p.id
    `, [productIds]);

    const sellerMap = new Map(stockAndPricing.map((s) => [s.product_id, s]));

    // 2. Fetch rating and review counts in batch
    const ratings: Array<{
      product_id: string;
      total_reviews: string | number;
      average_rating: string | number;
    }> = await this.dataSource.query(`
      SELECT 
        product_id, 
        COUNT(id)::int as total_reviews, 
        COALESCE(AVG(rating), 0)::float as average_rating
      FROM reviews
      WHERE product_id = ANY($1) AND is_approved = true
      GROUP BY product_id
    `, [productIds]);

    const ratingsMap = new Map(ratings.map((r) => [r.product_id, r]));

    return validItems.map((item) => {
      const sellerData = sellerMap.get(item.productId);
      const ratingData = ratingsMap.get(item.productId);

      const totalStock = sellerData ? Number(sellerData.total_available) : (item.product.stock || 0);
      const isAvailable = totalStock > 0;

      const price = item.product.price != null
        ? Number(item.product.price)
        : (sellerData?.min_price != null ? Number(sellerData.min_price) : 0);

      const compareAtPrice = item.product.compareAtPrice != null
        ? Number(item.product.compareAtPrice)
        : (sellerData?.min_regular_price != null && Number(sellerData.min_regular_price) > price
            ? Number(sellerData.min_regular_price)
            : null);

      const images = (item.product.images || []).sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      });

      return {
        id: item.id,
        productId: item.productId,
        product: {
          id: item.product.id,
          nameEn: item.product.nameEn,
          nameBn: item.product.nameBn,
          slug: item.product.slug,
          shortDescriptionEn: item.product.shortDescriptionEn,
          shortDescriptionBn: item.product.shortDescriptionBn,
          descriptionEn: item.product.descriptionEn,
          descriptionBn: item.product.descriptionBn,
          sku: item.product.sku,
          barcode: item.product.barcode,
          price,
          compareAtPrice,
          stock: totalStock,
          totalStock,
          unit: item.product.unit,
          status: item.product.status,
          isFeatured: item.product.isFeatured,
          isActive: item.product.isActive,
          isAvailable,
          categoryId: item.product.categoryId,
          category: item.product.category,
          subCategoryId: item.product.subCategoryId,
          subCategory: item.product.subCategory,
          brandId: item.product.brandId,
          brand: item.product.brand,
          images,
          variants: item.product.variants,
          averageRating: ratingData ? Number(ratingData.average_rating) : 0,
          totalReviews: ratingData ? Number(ratingData.total_reviews) : 0,
          createdAt: item.product.createdAt,
          updatedAt: item.product.updatedAt,
        },
        createdAt: item.createdAt,
      };
    });
  }

  async addProductToWishlist(userId: string, productId: string) {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const exists = await this.wishlistRepository.findOne({
      where: { userId, productId },
    });

    if (exists) {
      throw new BadRequestException('Product already in wishlist');
    }

    const item = this.wishlistRepository.create({ userId, productId });
    await this.wishlistRepository.save(item);
    return { success: true, message: 'Added to wishlist' };
  }

  async removeProductFromWishlist(userId: string, productId: string) {
    const item = await this.wishlistRepository.findOne({
      where: { userId, productId },
    });

    if (!item) throw new NotFoundException('Wishlist item not found');

    await this.wishlistRepository.remove(item);
    return { success: true, message: 'Removed from wishlist' };
  }
}
