import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Product } from '../catalog/entities/product.entity.js';
import { OrderStatus } from '../orders/enums/order-status.enum.js';
import { Role } from '../roles/enums/role.enum.js';
import { DemandEvent } from './entities/demand-event.entity.js';
import { Shop } from '../shops/entities/shop.entity.js';
import { SellerApplication } from '../applications/entities/seller-application.entity.js';
import { RiderApplication } from '../applications/entities/rider-application.entity.js';
import { ApplicationStatus } from '../applications/enums/application-status.enum.js';
import { PayoutRequest, PayoutStatus } from '../payouts/entities/payout-request.entity.js';
import { Dispute } from '../disputes/entities/dispute.entity.js';
import { DisputeStatus } from '../disputes/enums/dispute-status.enum.js';
import { ProductRequest } from '../product-requests/entities/product-request.entity.js';
import { Category } from '../catalog/entities/category.entity.js';

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
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(SellerApplication)
    private readonly sellerApplicationRepository: Repository<SellerApplication>,
    @InjectRepository(RiderApplication)
    private readonly riderApplicationRepository: Repository<RiderApplication>,
    @InjectRepository(PayoutRequest)
    private readonly payoutRequestRepository: Repository<PayoutRequest>,
    @InjectRepository(Dispute)
    private readonly disputeRepository: Repository<Dispute>,
    @InjectRepository(ProductRequest)
    private readonly productRequestRepository: Repository<ProductRequest>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async getDashboardMetrics() {
    // Basic metrics
    const totalOrders = await this.orderRepository.count();
    const pendingOrders = await this.orderRepository.count({
      where: { status: OrderStatus.PENDING },
    });

    // Calculate total sales (sum of delivered/completed orders)
    const salesResult = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.status = :status', { status: OrderStatus.DELIVERED })
      .select('SUM(order.total)', 'total')
      .getRawOne();

    const totalSales = Number(salesResult?.total) || 0;

    // User metrics
    const totalCustomers = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.roles', 'role')
      .where('role.name = :role', { role: Role.CUSTOMER })
      .getCount();

    const totalSellers = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.roles', 'role')
      .where('role.name = :role', { role: Role.SELLER })
      .getCount();

    const totalRiders = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.roles', 'role')
      .where('role.name = :role', { role: Role.RIDER })
      .getCount();

    const totalProducts = await this.productRepository.count();

    // Operational backlog metrics — real counts straight from the database.
    const [
      activeShops,
      pendingSellerApplications,
      pendingRiderApplications,
      pendingPayouts,
      openDisputes,
    ] = await Promise.all([
      this.shopRepository.count({ where: { isActive: true } }),
      this.sellerApplicationRepository.count({
        where: { status: ApplicationStatus.PENDING },
      }),
      this.riderApplicationRepository.count({
        where: { status: ApplicationStatus.PENDING },
      }),
      this.payoutRequestRepository.count({ where: { status: PayoutStatus.PENDING } }),
      this.disputeRepository.count({
        where: [{ status: DisputeStatus.OPEN }, { status: DisputeStatus.UNDER_REVIEW }],
      }),
    ]);

    // Recent orders (last 5)
    const recentOrders = await this.orderRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
      relations: ['user'],
    });

    // Revenue trend (last 7 days)
    const revenueTrendRaw = await this.orderRepository
      .createQueryBuilder('order')
      .select("TO_CHAR(order.createdAt, 'Dy')", 'name')
      .addSelect('SUM(order.total)', 'revenue')
      .where('order.status = :status', { status: OrderStatus.DELIVERED })
      .andWhere("order.createdAt >= NOW() - INTERVAL '7 days'")
      .groupBy("TO_CHAR(order.createdAt, 'Dy')")
      .orderBy('MIN(order.createdAt)', 'ASC')
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
        activeShops,
        pendingSellerApplications,
        pendingRiderApplications,
        pendingPayouts,
        openDisputes,
      },
      recentOrders: recentOrders.map((o) => ({
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

    const demandEvents = this.demandEventRepository.create(
      events.map((e) => ({
        ...e,
        userId: userId || null, // Authenticated user if available
      })),
    );

    await this.demandEventRepository.insert(demandEvents);
    return { success: true };
  }

  async getDemandAnalytics(from?: string, to?: string) {
    let dateFilter = '';
    let params: any = {};
    if (from && to) {
      dateFilter = 'event.created_at >= :from AND event.created_at <= :to';
      params = { from, to };
    }

    // 1. Popular Products (by VIEW, ADD_TO_CART, PURCHASE)
    const popularProductsRaw = await this.demandEventRepository
      .createQueryBuilder('event')
      .select('event.productId', 'productId')
      .addSelect('product.nameEn', 'productName')
      .addSelect('product.nameBn', 'productNameBn')
      .addSelect("COUNT(CASE WHEN event.eventType = 'VIEW' THEN 1 END)", 'views')
      .addSelect("COUNT(CASE WHEN event.eventType = 'ADD_TO_CART' THEN 1 END)", 'carts')
      .addSelect("COUNT(CASE WHEN event.eventType = 'PURCHASE' THEN 1 END)", 'purchases')
      .leftJoin(Product, 'product', 'product.id = event.productId')
      .where('event.productId IS NOT NULL')
      .andWhere(dateFilter || '1=1', params)
      .groupBy('event.productId')
      .addGroupBy('product.nameEn')
      .addGroupBy('product.nameBn')
      .orderBy('views', 'DESC')
      .limit(10)
      .getRawMany();

    const popularProducts = popularProductsRaw.map((p: any) => ({
      productId: p.productId,
      productName: p.productName || p.productNameBn || 'Unknown Product',
      views: Number(p.views),
      carts: Number(p.carts),
      purchases: Number(p.purchases),
    }));

    // 2. Popular Searches
    const popularSearchesRaw = await this.demandEventRepository
      .createQueryBuilder('event')
      .select('event.searchQuery', 'query')
      .addSelect('COUNT(*)', 'count')
      .where("event.eventType = 'SEARCH'")
      .andWhere('event.searchQuery IS NOT NULL')
      .andWhere(dateFilter || '1=1', params)
      .groupBy('event.searchQuery')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const popularSearches = popularSearchesRaw.map((s: any) => ({
      query: s.query,
      count: Number(s.count),
    }));

    // 3. Purchase Trends (Last 7 days)
    const purchaseTrendsRaw = await this.demandEventRepository
      .createQueryBuilder('event')
      .select("TO_CHAR(event.created_at, 'YYYY-MM-DD')", 'date')
      .addSelect("COUNT(CASE WHEN event.eventType = 'PURCHASE' THEN 1 END)", 'purchases')
      .addSelect("COUNT(CASE WHEN event.eventType = 'ADD_TO_CART' THEN 1 END)", 'carts')
      .where("event.eventType IN ('PURCHASE', 'ADD_TO_CART')")
      .andWhere(
        dateFilter
          ? dateFilter
          : "event.created_at >= NOW() - INTERVAL '7 days'",
        params,
      )
      .groupBy("TO_CHAR(event.created_at, 'YYYY-MM-DD')")
      .orderBy('date', 'ASC')
      .getRawMany();

    const purchaseTrends = purchaseTrendsRaw.map((t: any) => ({
      date: t.date,
      purchases: Number(t.purchases),
      carts: Number(t.carts),
    }));

    // 4. Category Demand
    const categoryDemandRaw = await this.demandEventRepository
      .createQueryBuilder('event')
      .select('event.categoryId', 'categoryId')
      .addSelect('category.nameEn', 'categoryName')
      .addSelect('category.nameBn', 'categoryNameBn')
      .addSelect('COUNT(*)', 'count')
      .leftJoin(Category, 'category', 'category.id = event.categoryId')
      .where('event.categoryId IS NOT NULL')
      .andWhere(dateFilter || '1=1', params)
      .groupBy('event.categoryId')
      .addGroupBy('category.nameEn')
      .addGroupBy('category.nameBn')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    const categoryDemand = categoryDemandRaw.map((c: any) => ({
      categoryId: c.categoryId,
      categoryName: c.categoryName || c.categoryNameBn || 'Unknown Category',
      count: Number(c.count),
    }));

    // 5. Frequently Unavailable Products (Viewed but no stock)
    const unavailableRaw = await this.demandEventRepository
      .createQueryBuilder('event')
      .select('event.productId', 'productId')
      .addSelect('product.nameEn', 'productName')
      .addSelect('product.nameBn', 'productNameBn')
      .addSelect('COUNT(*)', 'views')
      .leftJoin(Product, 'product', 'product.id = event.productId')
      .where("event.eventType = 'VIEW'")
      .andWhere('event.productId IS NOT NULL')
      .andWhere(
        `NOT EXISTS (
        SELECT 1 FROM product_variants pv
        JOIN seller_products sp ON sp.product_variant_id = pv.id AND sp.is_active = true
        JOIN inventory inv ON inv.seller_product_id = sp.id
        WHERE pv.product_id = event.productId 
          AND pv.is_active = true 
          AND (inv.quantity - inv.reserved_quantity) > 0
      )`,
      )
      .andWhere(dateFilter || '1=1', params)
      .groupBy('event.productId')
      .addGroupBy('product.nameEn')
      .addGroupBy('product.nameBn')
      .orderBy('views', 'DESC')
      .limit(10)
      .getRawMany();

    const frequentlyUnavailable = unavailableRaw.map((u: any) => ({
      productId: u.productId,
      productName: u.productName || u.productNameBn || 'Unknown Product',
      views: Number(u.views),
    }));

    // 6. Requested Products
    // Query directly from ProductRequest table instead of DemandEvent
    const requestedProductsRaw = await this.productRequestRepository
      .createQueryBuilder('request')
      .select('request.id', 'productRequestId')
      .addSelect('request.productName', 'productName')
      .addSelect('request.status', 'status')
      .addSelect("COUNT(request.id)", 'requests')
      .addSelect("SUM(CASE WHEN request.status = 'PRODUCT_ADDED' THEN 1 ELSE 0 END)", 'converted')
      .where(dateFilter ? dateFilter.replace(/event\.created_at/g, 'request.createdAt') : '1=1', params)
      .groupBy('request.id')
      .addGroupBy('request.productName')
      .addGroupBy('request.status')
      .orderBy('requests', 'DESC')
      .limit(10)
      .getRawMany();

    const requestedProducts = requestedProductsRaw.map((r: any) => ({
      productRequestId: r.productRequestId,
      productName: r.productName,
      requests: Number(r.requests),
      purchases: Number(r.converted), // Assuming PRODUCT_ADDED is closest to purchase for now
      conversionRate: Number(r.requests) > 0 ? (Number(r.converted) / Number(r.requests)) * 100 : 0,
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

  async getSalesAnalytics(from?: string, to?: string) {
    let orderDateFilter = '';
    let eventDateFilter = '';
    let params: any = {};
    if (from && to) {
      orderDateFilter = 'order.created_at >= :from AND order.created_at <= :to';
      eventDateFilter = 'event.created_at >= :from AND event.created_at <= :to';
      params = { from, to };
    }

    // Revenue by Day
    const revenueByDayRaw = await this.orderRepository
      .createQueryBuilder('order')
      .select("TO_CHAR(order.created_at, 'YYYY-MM-DD')", 'date')
      .addSelect('SUM(order.total)', 'revenue')
      .addSelect('COUNT(order.id)', 'orders')
      .where('order.status = :status', { status: OrderStatus.DELIVERED })
      .andWhere(orderDateFilter || '1=1', params)
      .groupBy("TO_CHAR(order.created_at, 'YYYY-MM-DD')")
      .orderBy('date', 'ASC')
      .getRawMany();

    const revenueByDay = revenueByDayRaw.map((r: any) => ({
      date: r.date,
      revenue: Number(r.revenue),
      orders: Number(r.orders),
    }));

    // Sales Funnel
    const funnelRaw = await this.demandEventRepository
      .createQueryBuilder('event')
      .select('event.eventType', 'type')
      .addSelect('COUNT(*)', 'count')
      .where("event.eventType IN ('VIEW', 'ADD_TO_CART', 'PURCHASE')")
      .andWhere(eventDateFilter || '1=1', params)
      .groupBy('event.eventType')
      .getRawMany();

    let views = 0;
    let carts = 0;
    let purchases = 0;

    funnelRaw.forEach((f: any) => {
      if (f.type === 'VIEW') views = Number(f.count);
      if (f.type === 'ADD_TO_CART') carts = Number(f.count);
      if (f.type === 'PURCHASE') purchases = Number(f.count);
    });

    const salesFunnel = [
      { step: 'Views', count: views },
      { step: 'Added to Cart', count: carts },
      { step: 'Purchased', count: purchases },
    ];

    // Payment Methods
    const paymentMethodsRaw = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.paymentMethod', 'method')
      .addSelect('SUM(order.total)', 'revenue')
      .addSelect('COUNT(order.id)', 'count')
      .where('order.status = :status', { status: OrderStatus.DELIVERED })
      .andWhere(orderDateFilter || '1=1', params)
      .groupBy('order.paymentMethod')
      .getRawMany();

    const paymentMethods = paymentMethodsRaw.map((p: any) => ({
      method: p.method,
      revenue: Number(p.revenue),
      count: Number(p.count),
    }));

    return {
      revenueByDay,
      salesFunnel,
      paymentMethods,
    };
  }

  async getProductsAnalytics(from?: string, to?: string) {
    let orderDateFilter = '';
    let params: any = {};
    if (from && to) {
      orderDateFilter = 'order.created_at >= :from AND order.created_at <= :to';
      params = { from, to };
    }

    // Top Products by Revenue (using orders/order_items)
    const topProductsRaw = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoin('order.items', 'item')
      .select('item.productId', 'productId')
      .addSelect('item.productNameEn', 'productName')
      .addSelect('item.productNameBn', 'productNameBn')
      .addSelect('SUM(item.price * item.quantity)', 'revenue')
      .addSelect('SUM(item.quantity)', 'sales')
      .where('order.status = :status', { status: OrderStatus.DELIVERED })
      .andWhere(orderDateFilter || '1=1', params)
      .groupBy('item.productId')
      .addGroupBy('item.productNameEn')
      .addGroupBy('item.productNameBn')
      .orderBy('revenue', 'DESC')
      .limit(10)
      .getRawMany();

    const topProducts = topProductsRaw.map((p: any) => ({
      productId: p.productId,
      name: p.productName || p.productNameBn || 'Unknown',
      revenue: Number(p.revenue),
      sales: Number(p.sales),
    }));

    return {
      topProducts,
    };
  }

  async getCustomersAnalytics(from?: string, to?: string) {
    let orderDateFilter = '';
    let userDateFilter = '';
    let params: any = {};
    if (from && to) {
      orderDateFilter = 'order.created_at >= :from AND order.created_at <= :to';
      userDateFilter = 'user.created_at >= :from AND user.created_at <= :to';
      params = { from, to };
    }

    // New vs Returning logic approximation:
    // "New" = Customers whose first order was in the period.
    // Actually, just returning basic counts for now to keep it performant
    const customersCountRaw = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.roles', 'role')
      .where('role.name = :role', { role: Role.CUSTOMER })
      .andWhere(userDateFilter || '1=1', params)
      .getCount();

    // Top Customers by Revenue
    const topCustomersRaw = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoin('order.user', 'user')
      .select('user.id', 'userId')
      .addSelect('user.firstName', 'firstName')
      .addSelect('user.lastName', 'lastName')
      .addSelect('user.email', 'email')
      .addSelect('SUM(order.total)', 'revenue')
      .addSelect('COUNT(order.id)', 'orders')
      .where('order.status = :status', { status: OrderStatus.DELIVERED })
      .andWhere(orderDateFilter || '1=1', params)
      .groupBy('user.id')
      .addGroupBy('user.firstName')
      .addGroupBy('user.lastName')
      .addGroupBy('user.email')
      .orderBy('revenue', 'DESC')
      .limit(10)
      .getRawMany();

    const topCustomers = topCustomersRaw.map((c: any) => ({
      userId: c.userId,
      name: `${c.firstName} ${c.lastName}`.trim() || 'Guest',
      email: c.email,
      revenue: Number(c.revenue),
      orders: Number(c.orders),
    }));

    return {
      newCustomersCount: customersCountRaw,
      topCustomers,
    };
  }
}
