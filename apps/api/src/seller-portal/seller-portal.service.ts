import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Shop } from '../shops/entities/shop.entity.js';
import { Order } from '../orders/entities/order.entity.js';
import { OrderItem } from '../orders/entities/order-item.entity.js';
import { OrderStatus } from '../orders/enums/order-status.enum.js';
import { getSellerAllowedNextStatuses } from '../orders/state-machine/order-state-machine.js';
import { Wallet } from '../wallets/entities/wallet.entity.js';
import { PayoutRequest, PayoutStatus } from '../payouts/entities/payout-request.entity.js';
import { Delivery } from '../deliveries/entities/delivery.entity.js';
import { User } from '../users/entities/user.entity.js';
import { OrdersService } from '../orders/orders.service.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { Role } from '../roles/enums/role.enum.js';
import { TransitionOrderDto } from '../orders/dto/transition-order.dto.js';
import { UpdateSellerShopDto } from './dto/update-seller-shop.dto.js';
import { SellerOrderQueryDto } from './dto/seller-query.dto.js';
import {
  SellerDashboardResponseDto,
  SellerDashboardRecentOrderDto,
} from './dto/seller-dashboard-response.dto.js';
import {
  SellerOrderDetailDto,
  SellerOrderListDto,
  SellerOrderSummaryDto,
} from './dto/seller-order-response.dto.js';
import { SellerAnalyticsService } from './seller-analytics.service.js';

interface OrderListRow {
  id: string;
  status: OrderStatus;
  payment_method: string;
  payment_status: string;
  seller_subtotal: string;
  item_count: string;
  created_at: Date;
  customer_name: string | null;
  customer_phone: string | null;
  contact_name: string | null;
  street_address: string | null;
  district: string | null;
  upazila: string | null;
}

@Injectable()
export class SellerPortalService {
  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(PayoutRequest)
    private readonly payoutRepository: Repository<PayoutRequest>,
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly ordersService: OrdersService,
    private readonly auditLogsService: AuditLogsService,
    private readonly analyticsService: SellerAnalyticsService,
    private readonly dataSource: DataSource,
  ) {}

  async getShopForSeller(sellerId: string, assertActive = false): Promise<Shop> {
    const shop = await this.shopRepository.findOne({ where: { sellerId } });
    if (!shop) {
      throw new NotFoundException('Shop not found for this seller');
    }
    if (assertActive && !shop.isActive) {
      throw new ForbiddenException(
        'Your shop has been deactivated or suspended by platform administration.',
      );
    }
    return shop;
  }

  async getShopProfile(sellerId: string) {
    const shop = await this.getShopForSeller(sellerId);
    const [stats] = await this.dataSource.query<
      Array<{ product_count: string; total_orders: string }>
    >(
      `SELECT
         (SELECT COUNT(*)::int FROM seller_products sp
           WHERE sp.shop_id = $1 AND sp.is_active = true) AS product_count,
         (SELECT COUNT(DISTINCT o.id)::int
            FROM order_items oi
            JOIN seller_products sp ON sp.id = oi.seller_product_id
            JOIN orders o ON o.id = oi.order_id
           WHERE sp.shop_id = $1) AS total_orders`,
      [shop.id],
    );

    return {
      ...shop,
      productCount: Number(stats?.product_count ?? 0),
      totalOrders: Number(stats?.total_orders ?? 0),
    };
  }

  async updateShopProfile(sellerId: string, dto: UpdateSellerShopDto) {
    const shop = await this.getShopForSeller(sellerId, true);

    // Drop undefined keys so a partial payload never clears unrelated columns,
    // and skip the query entirely when nothing was sent.
    const updates = Object.fromEntries(
      Object.entries(dto).filter(([, value]) => value !== undefined),
    );
    if (Object.keys(updates).length > 0) {
      await this.shopRepository.update(shop.id, updates);
    }

    return this.getShopProfile(sellerId);
  }

  // -------------------------------------------------------------- dashboard

  async getDashboardMetrics(sellerId: string): Promise<SellerDashboardResponseDto> {
    const shop = await this.getShopForSeller(sellerId);

    const [analytics, recentOrders, lowStockProducts, wallet] = await Promise.all([
      this.analyticsService.getAnalytics(sellerId, 7),
      this.getRecentOrders(shop.id, 5),
      this.getLowStockProducts(shop.id, 5),
      this.getWalletSnapshot(sellerId),
    ]);

    return {
      lowStockCount: analytics.inventory.lowStockCount,
      outOfStockCount: analytics.inventory.outOfStockCount,
      activeOrdersCount: analytics.orders.awaitingAction,
      pendingOrdersCount:
        analytics.orders.statusDistribution.find((row) => row.status === OrderStatus.PENDING)
          ?.count ?? 0,
      awaitingActionCount: analytics.orders.awaitingAction,
      completedOrdersCount: analytics.orders.completed,
      totalOrders: analytics.orders.lifetime,
      totalProducts: analytics.inventory.activeListings,
      totalSales: analytics.sales.lifetime,
      todaySales: analytics.sales.today,
      todayOrders: analytics.orders.today,
      monthSales: analytics.sales.thisMonth,
      monthOrders: analytics.orders.thisMonth,
      stockValue: analytics.inventory.stockValue,
      activeCouponsCount: analytics.promotions.activeCoupons,
      wallet,
      recentOrders,
      revenueData: analytics.revenueTrend.map((point) => ({
        name: point.date.slice(5),
        date: point.date,
        revenue: point.revenue,
        orders: point.orders,
      })),
      orderStatusDistribution: analytics.orders.statusDistribution,
      topProducts: analytics.bestSellers,
      lowStockProducts,
    };
  }

  private async getRecentOrders(
    shopId: string,
    limit: number,
  ): Promise<SellerDashboardRecentOrderDto[]> {
    const rows = await this.dataSource.query<
      Array<{
        id: string;
        customer_name: string | null;
        customer_phone: string | null;
        seller_subtotal: string;
        item_count: string;
        status: OrderStatus;
        created_at: Date;
      }>
    >(
      `SELECT o.id,
              NULLIF(TRIM(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, ''))), '')
                AS customer_name,
              u.phone AS customer_phone,
              COALESCE(SUM(oi.subtotal), 0)::float AS seller_subtotal,
              COUNT(oi.id)::int AS item_count,
              o.status,
              o.created_at
         FROM orders o
         JOIN order_items oi ON oi.order_id = o.id
         JOIN seller_products sp ON sp.id = oi.seller_product_id
         LEFT JOIN users u ON u.id = o.user_id
        WHERE sp.shop_id = $1
        GROUP BY o.id, u.first_name, u.last_name, u.phone, o.status, o.created_at
        ORDER BY o.created_at DESC
        LIMIT $2`,
      [shopId, limit],
    );

    return rows.map((row) => ({
      id: row.id,
      customerName: row.customer_name ?? 'Customer',
      customerPhone: row.customer_phone ?? null,
      totalAmount: Number(row.seller_subtotal),
      itemCount: Number(row.item_count),
      status: row.status,
      allowedNextStatuses: getSellerAllowedNextStatuses(row.status),
      createdAt: this.toIso(row.created_at),
    }));
  }

  private async getLowStockProducts(shopId: string, limit: number) {
    const rows = await this.dataSource.query<
      Array<{
        id: string;
        name_en: string;
        name_bn: string;
        sku: string | null;
        quantity: string;
        reserved_quantity: string;
        low_stock_threshold: string;
      }>
    >(
      `SELECT sp.id,
              p.name_en,
              p.name_bn,
              COALESCE(sp.seller_sku, pv.sku) AS sku,
              inv.quantity,
              inv.reserved_quantity,
              inv.low_stock_threshold
         FROM seller_products sp
         JOIN inventory inv ON inv.seller_product_id = sp.id
         JOIN product_variants pv ON pv.id = sp.product_variant_id
         JOIN products p ON p.id = pv.product_id
        WHERE sp.shop_id = $1
          AND sp.is_active = true
          AND (inv.quantity - inv.reserved_quantity) <= inv.low_stock_threshold
        ORDER BY (inv.quantity - inv.reserved_quantity) ASC
        LIMIT $2`,
      [shopId, limit],
    );

    return rows.map((row) => ({
      id: row.id,
      nameEn: row.name_en,
      nameBn: row.name_bn,
      sku: row.sku,
      quantity: Number(row.quantity),
      availableQuantity: Math.max(0, Number(row.quantity) - Number(row.reserved_quantity)),
      lowStockThreshold: Number(row.low_stock_threshold),
    }));
  }

  async getWalletSnapshot(sellerId: string) {
    const wallet = await this.walletRepository.findOne({ where: { userId: sellerId } });

    const pendingRow = await this.payoutRepository
      .createQueryBuilder('payout')
      .select('COALESCE(SUM(payout.amount), 0)', 'total')
      .where('payout.sellerId = :sellerId', { sellerId })
      .andWhere('payout.status = :status', { status: PayoutStatus.PENDING })
      .getRawOne<{ total: string }>();

    return {
      balance: Number(wallet?.balance ?? 0),
      pendingClearance: Number(wallet?.pendingClearance ?? 0),
      totalEarned: Number(wallet?.totalEarned ?? 0),
      totalWithdrawn: Number(wallet?.totalWithdrawn ?? 0),
      pendingPayoutAmount: Number(pendingRow?.total ?? 0),
      hasWallet: !!wallet,
    };
  }

  // ----------------------------------------------------------------- orders

  private readonly needsActionStatuses = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.PROCESSING,
  ];

  /**
   * Builds the shared WHERE fragment plus positional parameters so the summary
   * and count queries always stay in sync.
   */
  private buildOrderFilters(
    shopId: string,
    query: SellerOrderQueryDto,
  ): { where: string; params: unknown[] } {
    const params: unknown[] = [shopId];
    let where = '';

    if (query.status) {
      params.push(query.status);
      where += ` AND o.status = $${params.length}`;
    }

    if (query.needsAction === 'true') {
      params.push(this.needsActionStatuses);
      where += ` AND o.status = ANY($${params.length})`;
    }

    const search = query.search?.trim();
    if (search) {
      params.push(`%${search}%`);
      const idx = params.length;
      where += ` AND (
        o.id::text ILIKE $${idx}
        OR COALESCE(u.phone, '') ILIKE $${idx}
        OR COALESCE(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')), '') ILIKE $${idx}
      )`;
    }

    return { where, params };
  }

  async getOrders(sellerId: string, query: SellerOrderQueryDto): Promise<SellerOrderListDto> {
    const shop = await this.getShopForSeller(sellerId);
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

    const { where, params } = this.buildOrderFilters(shop.id, query);

    const rows = await this.dataSource.query<OrderListRow[]>(
      `SELECT o.id,
              o.status,
              o.payment_method,
              o.payment_status,
              COALESCE(SUM(oi.subtotal), 0)::float AS seller_subtotal,
              COUNT(oi.id)::int AS item_count,
              o.created_at,
              NULLIF(TRIM(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, ''))), '')
                AS customer_name,
              u.phone AS customer_phone,
              a.contact_name,
              a.street_address,
              d.name_en AS district,
              uz.name_en AS upazila
         FROM orders o
         JOIN order_items oi ON oi.order_id = o.id
         JOIN seller_products sp ON sp.id = oi.seller_product_id
         LEFT JOIN users u ON u.id = o.user_id
         LEFT JOIN addresses a ON a.id = o.address_id
         LEFT JOIN districts d ON d.id = a.district_id
         LEFT JOIN upazilas uz ON uz.id = a.upazila_id
        WHERE sp.shop_id = $1${where}
        GROUP BY o.id, u.first_name, u.last_name, u.phone,
                 a.contact_name, a.street_address, d.name_en, uz.name_en
        ORDER BY o.created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, (page - 1) * limit],
    );

    const [countRow] = await this.dataSource.query<Array<{ total: string; awaiting: string }>>(
      `SELECT COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE o.status IN ('PENDING','CONFIRMED','PROCESSING'))::int
                AS awaiting
         FROM (
           SELECT DISTINCT o.id, o.status
             FROM orders o
             JOIN order_items oi ON oi.order_id = o.id
             JOIN seller_products sp ON sp.id = oi.seller_product_id
             LEFT JOIN users u ON u.id = o.user_id
            WHERE sp.shop_id = $1${where}
         ) o`,
      params,
    );

    const total = Number(countRow?.total ?? 0);

    return {
      data: rows.map((row) => this.toOrderSummary(row)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      awaitingActionCount: Number(countRow?.awaiting ?? 0),
    };
  }

  private toIso(value: Date | string): string {
    return value instanceof Date ? value.toISOString() : String(value);
  }

  private toOrderSummary(row: OrderListRow): SellerOrderSummaryDto {
    return {
      id: row.id,
      reference: `#${row.id.replace(/-/g, '').slice(-8).toUpperCase()}`,
      status: row.status,
      sellerSubtotal: Number(row.seller_subtotal),
      itemCount: Number(row.item_count),
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      createdAt: this.toIso(row.created_at),
      customer: {
        name: row.customer_name?.trim() || 'Customer',
        phone: row.customer_phone ?? null,
        contactName: row.contact_name ?? null,
        streetAddress: row.street_address ?? null,
        district: row.district ?? null,
        upazila: row.upazila ?? null,
      },
      allowedNextStatuses: getSellerAllowedNextStatuses(row.status),
    };
  }

  async getOrderDetails(sellerId: string, orderId: string): Promise<SellerOrderDetailDto> {
    const shop = await this.getShopForSeller(sellerId);

    const order = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoinAndSelect('order.items', 'item')
      .innerJoinAndSelect('item.sellerProduct', 'sp')
      .leftJoinAndSelect('sp.productVariant', 'variant')
      .leftJoinAndSelect('variant.product', 'product')
      .leftJoinAndSelect('product.images', 'productImage')
      .innerJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.address', 'address')
      .leftJoinAndSelect('address.district', 'addressDistrict')
      .leftJoinAndSelect('address.upazila', 'addressUpazila')
      .leftJoinAndSelect('order.statusHistory', 'history')
      .where('order.id = :orderId', { orderId })
      .andWhere('sp.shopId = :shopId', { shopId: shop.id })
      .orderBy('history.createdAt', 'DESC')
      .getOne();

    if (!order) {
      throw new NotFoundException('Order not found or contains no items from your shop');
    }

    const sellerSubtotal = order.items.reduce((sum, item) => sum + Number(item.subtotal), 0);

    const items = order.items.map((item) => {
      const product = item.sellerProduct?.productVariant?.product;
      const images = product?.images ?? [];
      const primary = images.find((image) => image.isPrimary) ?? images[0];
      return {
        id: item.id,
        sellerProductId: item.sellerProductId,
        nameEn: product?.nameEn ?? '',
        nameBn: product?.nameBn ?? '',
        image: primary?.url ?? null,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
      };
    });

    const summary = this.toOrderSummary({
      id: order.id,
      status: order.status,
      payment_method: order.paymentMethod,
      payment_status: order.paymentStatus,
      seller_subtotal: String(sellerSubtotal),
      item_count: String(order.items.length),
      created_at: order.createdAt,
      customer_name: order.user
        ? [order.user.firstName, order.user.lastName].filter(Boolean).join(' ')
        : null,
      customer_phone: order.user?.phone ?? null,
      contact_name: order.address?.contactName ?? null,
      street_address: order.address?.streetAddress ?? null,
      district: order.address?.district?.nameEn ?? null,
      upazila: order.address?.upazila?.nameEn ?? null,
    });

    const delivery = await this.deliveryRepository.findOne({
      where: { orderId: order.id },
      relations: ['rider'],
    });

    const riderName = delivery?.rider
      ? [delivery.rider.firstName, delivery.rider.lastName].filter(Boolean).join(' ') || 'Assigned Rider'
      : null;
    const riderPhone = delivery?.rider?.phone ?? null;
    const deliveryStatus = delivery?.status ?? null;
    const deliveryNote = delivery?.notes ?? null;

    return {
      ...summary,
      customerUserId: order.user?.id ?? null,
      items,
      statusHistory: [...(order.statusHistory ?? [])]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map((history) => ({
          status: history.status,
          note: history.reason ?? history.remark ?? null,
          createdAt: this.toIso(history.createdAt),
        })),
      riderName,
      riderPhone,
      deliveryStatus,
      note: deliveryNote,
    };
  }

  async transitionOrderStatus(
    sellerId: string,
    orderId: string,
    dto: TransitionOrderDto,
    context?: { ip?: string; userAgent?: string },
  ): Promise<SellerOrderDetailDto> {
    const shop = await this.getShopForSeller(sellerId, true);

    // Verify order exists and contains items from this shop
    const order = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoin('order.items', 'item')
      .innerJoin('item.sellerProduct', 'sp')
      .where('order.id = :orderId', { orderId })
      .andWhere('sp.shopId = :shopId', { shopId: shop.id })
      .getOne();

    if (!order) {
      throw new NotFoundException('Order not found or contains no items from your shop');
    }

    await this.ordersService.transitionOrder(orderId, dto, {
      id: sellerId,
      roles: [Role.SELLER],
      ip: context?.ip,
      userAgent: context?.userAgent,
    });

    await this.auditLogsService.record({
      actorId: sellerId,
      actorName: shop.nameEn,
      action: 'SELLER_ORDER_STATUS_UPDATED',
      targetType: 'Order',
      targetId: orderId,
      details: `Transitioned order to ${dto.targetStatus}. Reason: ${dto.reason || 'None provided'}`,
    });

    return this.getOrderDetails(sellerId, orderId);
  }

  async updateSellerAvatar(sellerId: string, avatarUrl: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: sellerId } });
    if (!user) {
      throw new NotFoundException('Seller user not found');
    }

    user.avatar = avatarUrl;
    await this.userRepository.save(user);

    await this.auditLogsService.record({
      actorId: sellerId,
      actorName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || null,
      action: 'SELLER_AVATAR_UPDATED',
      targetType: 'User',
      targetId: sellerId,
      details: `Avatar updated to ${avatarUrl}`,
    });

    return user;
  }
}
