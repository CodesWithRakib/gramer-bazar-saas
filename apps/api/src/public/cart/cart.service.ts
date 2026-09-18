import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { SellerProduct } from '../../inventory/entities/seller-product.entity.js';

export interface CartValidateItem {
  sellerProductId: string;
  quantity: number;
}

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(SellerProduct)
    private readonly sellerProductRepo: Repository<SellerProduct>,
  ) {}

  async validateCart(items: CartValidateItem[]) {
    if (!items || items.length === 0) return { items: [], total: 0 };

    const sellerProductIds = items.map(item => item.sellerProductId);
    const dbProducts = await this.sellerProductRepo.find({
      where: { id: In(sellerProductIds), isActive: true },
      relations: ['inventory', 'productVariant', 'productVariant.product'],
    });

    const validatedItems = items.map(item => {
      const dbProduct = dbProducts.find(p => p.id === item.sellerProductId);
      
      if (!dbProduct) {
        return {
          ...item,
          currentPrice: 0,
          originalPrice: 0,
          isValid: false,
          error: 'Product no longer available',
        };
      }

      const availableQuantity = dbProduct.inventory?.quantity || 0;
      const isStockSufficient = availableQuantity >= item.quantity;
      const currentPrice = dbProduct.discountPrice ?? dbProduct.price;

      return {
        ...item,
        availableQuantity,
        currentPrice: Number(currentPrice),
        originalPrice: Number(dbProduct.price),
        isValid: isStockSufficient,
        error: isStockSufficient ? null : 'Insufficient stock',
        nameEn: dbProduct.productVariant.nameEn || dbProduct.productVariant.product.nameEn,
        nameBn: dbProduct.productVariant.nameBn || dbProduct.productVariant.product.nameBn,
      };
    });

    const total = validatedItems
      .filter(item => item.isValid)
      .reduce((sum, item) => sum + item.currentPrice * item.quantity, 0);

    return {
      items: validatedItems,
      total,
      isValid: validatedItems.every(item => item.isValid),
    };
  }
}
