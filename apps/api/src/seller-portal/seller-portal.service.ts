import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Shop } from '../shops/entities/shop.entity.js';
import { SellerProduct } from '../inventory/entities/seller-product.entity.js';
import { Inventory } from '../inventory/entities/inventory.entity.js';
import { Order } from '../orders/entities/order.entity.js';
import { OrderItem } from '../orders/entities/order-item.entity.js';
import { ProductVariant } from '../catalog/entities/product-variant.entity.js';
import { UpdateSellerShopDto } from './dto/update-seller-shop.dto.js';
import { AddSellerProductDto } from './dto/add-seller-product.dto.js';
import { UpdateSellerProductDto } from './dto/update-seller-product.dto.js';
import { OrderStatus } from '../orders/enums/order-status.enum.js';

@Injectable()
export class SellerPortalService {
  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(SellerProduct)
    private readonly sellerProductRepository: Repository<SellerProduct>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly dataSource: DataSource,
  ) {}

  private async getShopForSeller(sellerId: string): Promise<Shop> {
    const shop = await this.shopRepository.findOne({ where: { sellerId } });
    if (!shop) {
      throw new NotFoundException('Shop not found for this seller');
    }
    return shop;
  }

  async getDashboardMetrics(sellerId: string) {
    const shop = await this.getShopForSeller(sellerId);
    
    // Low stock count
    const lowStockCount = await this.inventoryRepository
      .createQueryBuilder('inv')
      .innerJoin('inv.sellerProduct', 'sp')
      .where('sp.shopId = :shopId', { shopId: shop.id })
      .andWhere('(inv.quantity - inv.reservedQuantity) <= inv.lowStockThreshold')
      .getCount();

    // Pending/Active orders count (orders that have items from this shop and are not delivered/cancelled)
    const activeOrdersCount = await this.orderItemRepository
      .createQueryBuilder('item')
      .innerJoin('item.sellerProduct', 'sp')
      .innerJoin('item.order', 'order')
      .where('sp.shopId = :shopId', { shopId: shop.id })
      .andWhere('order.status NOT IN (:...statuses)', { 
        statuses: [OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.FAILED] 
      })
      .select('order.id')
      .distinct(true)
      .getCount();

    // Total sales (Sum of delivered order items for this shop)
    const salesData = await this.orderItemRepository
      .createQueryBuilder('item')
      .innerJoin('item.sellerProduct', 'sp')
      .innerJoin('item.order', 'order')
      .where('sp.shopId = :shopId', { shopId: shop.id })
      .andWhere('order.status = :status', { status: OrderStatus.DELIVERED })
      .select('SUM(item.subtotal)', 'totalSales')
      .getRawOne();

    // Recent Orders (last 5 items, mapped to orders)
    const recentOrderItems = await this.orderItemRepository
      .createQueryBuilder('item')
      .innerJoin('item.sellerProduct', 'sp')
      .innerJoinAndSelect('item.order', 'order')
      .innerJoinAndSelect('order.user', 'user')
      .where('sp.shopId = :shopId', { shopId: shop.id })
      .orderBy('order.createdAt', 'DESC')
      .limit(5)
      .getMany();

    const recentOrders = recentOrderItems.map(item => ({
      id: item.order.id,
      customerName: item.order.user ? `${item.order.user.firstName} ${item.order.user.lastName}` : 'Unknown',
      totalAmount: item.subtotal,
      status: item.order.status,
      createdAt: item.order.createdAt,
    }));

    // Revenue Trend (last 7 days)
    const revenueTrendRaw = await this.orderItemRepository
      .createQueryBuilder('item')
      .innerJoin('item.sellerProduct', 'sp')
      .innerJoin('item.order', 'order')
      .select("TO_CHAR(order.createdAt, 'Dy')", 'name')
      .addSelect("SUM(item.subtotal)", 'revenue')
      .where('sp.shopId = :shopId', { shopId: shop.id })
      .andWhere('order.status = :status', { status: OrderStatus.DELIVERED })
      .andWhere("order.createdAt >= NOW() - INTERVAL '7 days'")
      .groupBy("TO_CHAR(order.createdAt, 'Dy')")
      .orderBy("MIN(order.createdAt)", 'ASC')
      .getRawMany();

    const revenueData = revenueTrendRaw.map(r => ({
      name: r.name,
      revenue: Number(r.revenue),
    }));

    return {
      lowStockCount,
      activeOrdersCount,
      totalSales: parseFloat(salesData?.totalSales || '0'),
      recentOrders,
      revenueData,
    };
  }

  async getShopProfile(sellerId: string) {
    return this.getShopForSeller(sellerId);
  }

  async updateShopProfile(sellerId: string, dto: UpdateSellerShopDto) {
    const shop = await this.getShopForSeller(sellerId);

    // Drop undefined keys so a partial payload never clears unrelated columns,
    // and skip the query entirely when nothing was sent.
    const updates = Object.fromEntries(
      Object.entries(dto).filter(([, value]) => value !== undefined),
    );
    if (Object.keys(updates).length > 0) {
      await this.shopRepository.update(shop.id, updates);
    }

    return this.getShopForSeller(sellerId);
  }

  // --- Products ---

  async getProducts(sellerId: string, search?: string) {
    const shop = await this.getShopForSeller(sellerId);
    const query = this.sellerProductRepository.createQueryBuilder('sp')
      .leftJoinAndSelect('sp.inventory', 'inventory')
      .leftJoinAndSelect('sp.productVariant', 'variant')
      .leftJoinAndSelect('variant.product', 'product')
      .where('sp.shopId = :shopId', { shopId: shop.id });

    if (search) {
      query.andWhere(
        '(product.nameEn ILIKE :search OR product.nameBn ILIKE :search OR variant.sku ILIKE :search OR sp.sellerSku ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    return query.getMany();
  }

  async addProduct(sellerId: string, dto: AddSellerProductDto) {
    const shop = await this.getShopForSeller(sellerId);
    
    return this.dataSource.transaction(async (manager) => {
      // Check if variant exists
      const variant = await manager.findOne(ProductVariant, { where: { id: dto.productVariantId } });
      if (!variant) throw new NotFoundException('Product variant not found');

      // Check if seller already has this product
      const existing = await manager.findOne(SellerProduct, {
        where: { shopId: shop.id, productVariantId: dto.productVariantId }
      });
      if (existing) throw new BadRequestException('Product already exists in your shop');

      const sellerProduct = new SellerProduct();
      sellerProduct.shopId = shop.id;
      sellerProduct.productVariantId = dto.productVariantId;
      sellerProduct.price = dto.price;
      sellerProduct.discountPrice = dto.discountPrice || null;
      sellerProduct.sellerSku = dto.sellerSku || null;

      const savedSp = await manager.save(SellerProduct, sellerProduct);

      const inventory = new Inventory();
      inventory.sellerProductId = savedSp.id;
      inventory.quantity = dto.quantity;
      if (dto.lowStockThreshold !== undefined) {
        inventory.lowStockThreshold = dto.lowStockThreshold;
      }

      await manager.save(Inventory, inventory);

      return manager.findOne(SellerProduct, {
        where: { id: savedSp.id },
        relations: ['inventory', 'productVariant', 'productVariant.product'],
      });
    });
  }

  async updateProduct(sellerId: string, id: string, dto: UpdateSellerProductDto) {
    const shop = await this.getShopForSeller(sellerId);
    
    return this.dataSource.transaction(async (manager) => {
      const sellerProduct = await manager.findOne(SellerProduct, {
        where: { id, shopId: shop.id },
        relations: ['inventory']
      });

      if (!sellerProduct) throw new NotFoundException('Seller product not found');

      if (dto.price !== undefined) sellerProduct.price = dto.price;
      if (dto.discountPrice !== undefined) sellerProduct.discountPrice = dto.discountPrice;
      if (dto.isActive !== undefined) sellerProduct.isActive = dto.isActive;

      await manager.save(SellerProduct, sellerProduct);

      if (dto.quantity !== undefined || dto.lowStockThreshold !== undefined) {
        if (dto.quantity !== undefined) {
          // Validate quantity doesn't drop below reserved
          if (dto.quantity < sellerProduct.inventory.reservedQuantity) {
            throw new BadRequestException(`Cannot set quantity below reserved quantity (${sellerProduct.inventory.reservedQuantity})`);
          }
          sellerProduct.inventory.quantity = dto.quantity;
        }
        if (dto.lowStockThreshold !== undefined) {
          sellerProduct.inventory.lowStockThreshold = dto.lowStockThreshold;
        }
        await manager.save(Inventory, sellerProduct.inventory);
      }

      return manager.findOne(SellerProduct, {
        where: { id: sellerProduct.id },
        relations: ['inventory', 'productVariant', 'productVariant.product'],
      });
    });
  }

  // --- Orders ---

  async getOrders(sellerId: string) {
    const shop = await this.getShopForSeller(sellerId);
    
    // Get distinct orders that contain items from this seller's shop
    const orders = await this.orderRepository.createQueryBuilder('order')
      .innerJoinAndSelect('order.items', 'item')
      .innerJoin('item.sellerProduct', 'sp')
      .innerJoinAndSelect('order.user', 'user')
      .where('sp.shopId = :shopId', { shopId: shop.id })
      .orderBy('order.createdAt', 'DESC')
      .getMany();

    // Since the join filters the items in the result to ONLY those of this shop, 
    // the returned order.items array will only contain the seller's items. 
    // This correctly isolates data so seller A doesn't see seller B's items in the same order.
    return orders;
  }

  async getOrderDetails(sellerId: string, orderId: string) {
    const shop = await this.getShopForSeller(sellerId);
    
    const order = await this.orderRepository.createQueryBuilder('order')
      .innerJoinAndSelect('order.items', 'item')
      .innerJoinAndSelect('item.sellerProduct', 'sp')
      .leftJoinAndSelect('sp.productVariant', 'variant')
      .leftJoinAndSelect('variant.product', 'product')
      .innerJoinAndSelect('order.user', 'user')
      .innerJoinAndSelect('order.address', 'address')
      .leftJoinAndSelect('order.statusHistory', 'history')
      .where('order.id = :orderId', { orderId })
      .andWhere('sp.shopId = :shopId', { shopId: shop.id })
      .orderBy('history.createdAt', 'DESC')
      .getOne();

    if (!order) {
      throw new NotFoundException('Order not found or contains no items from your shop');
    }

    // Adjust the order total to reflect only this seller's items
    const sellerSubtotal = order.items.reduce((sum, item) => sum + Number(item.subtotal), 0);
    // (Note: delivery fee and discounts are complex to split. For a multi-vendor cart, it should be handled explicitly. 
    // Here we'll just expose the items and subtotal to the seller)
    
    return {
      ...order,
      sellerSubtotal
    };
  }
}
