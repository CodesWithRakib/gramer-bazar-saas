import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { SellerProduct } from '../../inventory/entities/seller-product.entity.js';
import { MedicineInventoryService } from '../../catalog/medicine/medicine-inventory.service.js';

export interface CartValidateItem {
  sellerProductId: string;
  quantity: number;
}

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(SellerProduct)
    private readonly sellerProductRepo: Repository<SellerProduct>,
    private readonly medicineInventory: MedicineInventoryService,
  ) {}

  async validateCart(items: CartValidateItem[]) {
    if (!items || items.length === 0) return { items: [], total: 0 };

    const sellerProductIds = items.map((item) => item.sellerProductId);
    const dbProducts = await this.sellerProductRepo.find({
      where: { id: In(sellerProductIds), isActive: true },
      relations: ['inventory', 'productVariant', 'productVariant.product'],
    });

    // Expiry-aware availability. Only batch-tracked (medicine) variants return
    // an entry here; everything else falls back to the plain inventory quantity.
    const variantIds = dbProducts
      .map((product) => product.productVariant?.id)
      .filter((id): id is string => Boolean(id));
    const availability = await this.medicineInventory.evaluateVariants(variantIds);

    const validatedItems = items.map((item) => {
      const dbProduct = dbProducts.find((p) => p.id === item.sellerProductId);

      if (!dbProduct) {
        return {
          ...item,
          currentPrice: 0,
          originalPrice: 0,
          isValid: false,
          error: 'Product no longer available',
        };
      }

      const variantAvailability = dbProduct.productVariant
        ? availability.get(dbProduct.productVariant.id)
        : undefined;
      const hasBatchTracking = variantAvailability?.hasBatches ?? false;
      const availableQuantity = hasBatchTracking
        ? variantAvailability!.available
        : dbProduct.inventory?.quantity || 0;
      const isExpired = hasBatchTracking && (variantAvailability!.isUnavailable || availableQuantity <= 0);
      const isStockSufficient = availableQuantity >= item.quantity;
      const currentPrice = dbProduct.discountPrice ?? dbProduct.price;

      return {
        ...item,
        availableQuantity,
        currentPrice: Number(currentPrice),
        originalPrice: Number(dbProduct.price),
        isValid: !isExpired && isStockSufficient,
        error: isExpired
          ? 'No unexpired stock is available for this medicine'
          : isStockSufficient
            ? null
            : 'Insufficient stock',
        requiresPrescription:
          (dbProduct.productVariant?.product as { requiresPrescription?: boolean } | undefined)
            ?.requiresPrescription ?? false,
        nameEn: dbProduct.productVariant.nameEn || dbProduct.productVariant.product.nameEn,
        nameBn: dbProduct.productVariant.nameBn || dbProduct.productVariant.product.nameBn,
      };
    });

    const total = validatedItems
      .filter((item) => item.isValid)
      .reduce((sum, item) => sum + item.currentPrice * item.quantity, 0);

    return {
      items: validatedItems,
      total,
      isValid: validatedItems.every((item) => item.isValid),
    };
  }
}
