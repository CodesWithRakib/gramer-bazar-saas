import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Product } from '../catalog/entities/product.entity.js';
import { OrderStatus } from '../orders/enums/order-status.enum.js';
import { Role } from '../roles/enums/role.enum.js';
import { DemandEvent } from './entities/demand-event.entity.js';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(DemandEvent)
    private readonly demandEventRepository: Repository<DemandEvent>,
  ) {}

  async getDashboardMetrics() {
    // Basic metrics
    const totalOrders = await this.orderRepository.count();
    const pendingOrders = await this.orderRepository.count({ where: { status: OrderStatus.PENDING } });
    
    // Calculate total sales (sum of delivered/completed orders)
    const salesResult = await this.orderRepository.createQueryBuilder('order')
      .where('order.status = :status', { status: OrderStatus.DELIVERED })
      .select('SUM(order.total)', 'total')
      .getRawOne();
      
    const totalSales = Number(salesResult?.total) || 0;

    // User metrics
    const totalCustomers = await this.userRepository.createQueryBuilder('user')
      .innerJoin('user.roles', 'role')
      .where('role.name = :role', { role: Role.CUSTOMER })
      .getCount();

    const totalSellers = await this.userRepository.createQueryBuilder('user')
      .innerJoin('user.roles', 'role')
      .where('role.name = :role', { role: Role.SELLER })
      .getCount();
      
    const totalRiders = await this.userRepository.createQueryBuilder('user')
      .innerJoin('user.roles', 'role')
      .where('role.name = :role', { role: Role.RIDER })
      .getCount();

    const totalProducts = await this.productRepository.count();

    // Recent orders (last 5)
    const recentOrders = await this.orderRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
      relations: ['user'],
    });

    // Revenue trend (last 7 days)
    const revenueTrendRaw = await this.orderRepository.createQueryBuilder('order')
      .select("TO_CHAR(order.createdAt, 'Dy')", 'name')
      .addSelect("SUM(order.total)", 'revenue')
      .where('order.status = :status', { status: OrderStatus.DELIVERED })
      .andWhere("order.createdAt >= NOW() - INTERVAL '7 days'")
      .groupBy("TO_CHAR(order.createdAt, 'Dy')")
      .orderBy("MIN(order.createdAt)", 'ASC')
      .getRawMany();

    const revenueData = revenueTrendRaw.map((r: any) => ({
      name: r.name,
      revenue: Number(r.revenue),
    }));

    return {
      metrics: {
        totalOrders,
        pendingOrders,
        totalSales,
        totalCustomers,
        totalSellers,
        totalRiders,
        totalProducts,
      },
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        customerName: o.user ? `${o.user.firstName} ${o.user.lastName}` : 'Unknown',
        totalAmount: o.total,
        status: o.status,
        createdAt: o.createdAt,
      })),
      revenueData,
    };
  }

  async recordBulkEvents(events: any[], userId?: string) {
    if (!events || !events.length) return { success: true };
    
    const demandEvents = this.demandEventRepository.create(events.map(e => ({
      ...e,
      userId: userId || null, // Authenticated user if available
    })));
    
    await this.demandEventRepository.insert(demandEvents);
    return { success: true };
  }

  async getDemandAnalytics() {
    // 1. Popular Products (by VIEW, ADD_TO_CART, PURCHASE)
    const popularProductsRaw = await this.demandEventRepository.createQueryBuilder('event')
      .select('event.productId', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect("COUNT(CASE WHEN event.eventType = 'VIEW' THEN 1 END)", 'views')
      .addSelect("COUNT(CASE WHEN event.eventType = 'ADD_TO_CART' THEN 1 END)", 'carts')
      .addSelect("COUNT(CASE WHEN event.eventType = 'PURCHASE' THEN 1 END)", 'purchases')
      .leftJoin(Product, 'product', 'product.id = event.productId')
      .where('event.productId IS NOT NULL')
      .groupBy('event.productId')
      .addGroupBy('product.name')
      .orderBy('views', 'DESC')
      .limit(10)
      .getRawMany();

    const popularProducts = popularProductsRaw.map((p: any) => ({
      productId: p.productId,
      productName: p.productName || 'Unknown Product',
      views: Number(p.views),
      carts: Number(p.carts),
      purchases: Number(p.purchases),
    }));

    // 2. Popular Searches
    const popularSearchesRaw = await this.demandEventRepository.createQueryBuilder('event')
      .select('event.searchQuery', 'query')
      .addSelect('COUNT(*)', 'count')
      .where("event.eventType = 'SEARCH'")
      .andWhere('event.searchQuery IS NOT NULL')
      .groupBy('event.searchQuery')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const popularSearches = popularSearchesRaw.map((s: any) => ({
      query: s.query,
      count: Number(s.count),
    }));

    // 3. Purchase Trends (Last 7 days)
    const purchaseTrendsRaw = await this.demandEventRepository.createQueryBuilder('event')
      .select("TO_CHAR(event.created_at, 'YYYY-MM-DD')", 'date')
      .addSelect("COUNT(CASE WHEN event.eventType = 'PURCHASE' THEN 1 END)", 'purchases')
      .addSelect("COUNT(CASE WHEN event.eventType = 'ADD_TO_CART' THEN 1 END)", 'carts')
      .where("event.eventType IN ('PURCHASE', 'ADD_TO_CART')")
      .andWhere("event.created_at >= NOW() - INTERVAL '7 days'")
      .groupBy("TO_CHAR(event.created_at, 'YYYY-MM-DD')")
      .orderBy('date', 'ASC')
      .getRawMany();

    const purchaseTrends = purchaseTrendsRaw.map((t: any) => ({
      date: t.date,
      purchases: Number(t.purchases),
      carts: Number(t.carts),
    }));

    // 4. Category Demand
    const categoryDemandRaw = await this.demandEventRepository.createQueryBuilder('event')
      .select('event.categoryId', 'categoryId')
      .addSelect('COUNT(*)', 'count')
      .where('event.categoryId IS NOT NULL')
      .groupBy('event.categoryId')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    const categoryDemand = categoryDemandRaw.map((c: any) => ({
      categoryId: c.categoryId,
      count: Number(c.count),
    }));

    // 5. Frequently Unavailable Products (Viewed but no stock)
    // For MVP we just find products with high views in the analytics table 
    // and inner join their current inventory to check if it's 0.
    const unavailableRaw = await this.demandEventRepository.createQueryBuilder('event')
      .select('event.productId', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect('COUNT(*)', 'views')
      .innerJoin('seller_products', 'sp', 'sp.product_id = event.productId')
      .innerJoin('inventory', 'inv', 'inv.id = sp.inventory_id AND inv.quantity = 0')
      .leftJoin(Product, 'product', 'product.id = event.productId')
      .where("event.eventType = 'VIEW'")
      .groupBy('event.productId')
      .addGroupBy('product.name')
      .orderBy('views', 'DESC')
      .limit(10)
      .getRawMany();

    const frequentlyUnavailable = unavailableRaw.map((u: any) => ({
      productId: u.productId,
      productName: u.productName || 'Unknown Product',
      views: Number(u.views),
    }));

    // 6. Requested Products
    const requestedProductsRaw = await this.demandEventRepository.createQueryBuilder('event')
      .select('event.productRequestId', 'productRequestId')
      .addSelect("COUNT(CASE WHEN event.eventType = 'REQUEST' THEN 1 END)", 'requests')
      .addSelect("COUNT(CASE WHEN event.eventType = 'PURCHASE' THEN 1 END)", 'purchases')
      .where('event.productRequestId IS NOT NULL')
      .groupBy('event.productRequestId')
      .orderBy('requests', 'DESC')
      .limit(10)
      .getRawMany();

    const requestedProducts = requestedProductsRaw.map((r: any) => ({
      productRequestId: r.productRequestId,
      requests: Number(r.requests),
      purchases: Number(r.purchases),
      conversionRate: r.requests > 0 ? (Number(r.purchases) / Number(r.requests)) * 100 : 0,
    }));

    return {
      popularProducts,
      popularSearches,
      purchaseTrends,
      categoryDemand,
      frequentlyUnavailable,
      requestedProducts,
    };
  }
}
