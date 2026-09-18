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
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });

    // Determine availability for each product
    const wishlistWithAvailability = await Promise.all(items.map(async (item) => {
      // Find if any variant has active seller products with stock
      const result = await this.dataSource.query(`
        SELECT SUM(i.quantity - i.reserved_quantity) as total_available
        FROM products p
        JOIN product_variants pv ON pv.product_id = p.id
        JOIN seller_products sp ON sp.product_variant_id = pv.id
        JOIN inventory i ON i.seller_product_id = sp.id
        WHERE p.id = $1 AND sp.is_active = true AND pv.is_active = true
      `, [item.productId]);

      const totalAvailable = result[0]?.total_available ? parseInt(result[0].total_available) : 0;
      const isAvailable = totalAvailable > 0;

      return {
        id: item.id,
        productId: item.productId,
        product: {
          nameEn: item.product.nameEn,
          nameBn: item.product.nameBn,
          slug: item.product.slug,
          isAvailable,
        },
        createdAt: item.createdAt,
      };
    }));

    return wishlistWithAvailability;
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
