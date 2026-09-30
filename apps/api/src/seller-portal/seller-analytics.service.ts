import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Shop } from '../shops/entities/shop.entity.js';

export interface SellerAnalytics {
  shopId: string;
  generatedAt: string;
  sales: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    lifetime: number;
    averageOrderValueThisMonth: number;
    unitsSoldThisMonth: number;
  };
  orders: {
    today: number;
    thisMonth: number;
    lifetime: number;
    awaitingAction: number;
    completed: number;
    cancelled: number;
    statusDistribution: Array<{ status: string; count: number }>;
  };
  inventory: {
    activeListings: number;
    lowStockCount: number;
    outOfStockCount: number;
    stockValue: number;
  };
  promotions: {
    activeCoupons: number;
    totalCoupons: number;
  };
  bestSellers: Array<{
    listingId: string;
    productId: string;
    nameEn: string;
    nameBn: string;
    image: string | null;
    quantitySold: number;
    revenue: number;
  }>;
  revenueByCategory: Array<{
    categoryId: string;
    nameEn: string;
    nameBn: string;
    revenue: number;
    quantitySold: number;
  }>;
  revenueTrend: Array<{ date: string; revenue: number; orders: number }>;
}

/**
 * Read-only analytics for the seller dashboard and reports workspace.
 *
 * All monetary figures are derived from DELIVERED order items — the only order
 * state where the seller's sale is settled. Nothing is estimated or mocked;
 * every tile maps to a live aggregate query scoped to the seller's shop.
 */
@Injectable()
export class SellerAnalyticsService {
  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    private readonly dataSource: DataSource,
  ) {}

  private async resolveShopId(sellerId: string): Promise<string | null> {
    const shop = await this.shopRepository.findOne({
      where: { sellerId },
      select: ['id'],
    });
    return shop?.id ?? null;
  }

  async getAnalytics(sellerId: string, trendDays = 30): Promise<SellerAnalytics> {
    const empty: SellerAnalytics = {
      shopId: '',
      generatedAt: new Date().toISOString(),
      sales: {
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        lifetime: 0,
        averageOrderValueThisMonth: 0,
        unitsSoldThisMonth: 0,
      },
      orders: {
        today: 0,
        thisMonth: 0,
        lifetime: 0,
        awaitingAction: 0,
        completed: 0,
        cancelled: 0,
        statusDistribution: [],
      },
      inventory: {
        activeListings: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        stockValue: 0,
      },
      promotions: { activeCoupons: 0, totalCoupons: 0 },
      bestSellers: [],
      revenueByCategory: [],
      revenueTrend: [],
    };

    const shopId = await this.resolveShopId(sellerId);
    if (!shopId) return empty;

    const days = Math.min(90, Math.max(7, trendDays));

    const settledBase = `
      FROM order_items oi
      JOIN seller_products sp ON sp.id = oi.seller_product_id
      JOIN orders o ON o.id = oi.order_id
     WHERE sp.shop_id = $1 AND o.status = 'DELIVERED'
    `;

    const [salesRow] = await this.dataSource.query<
      Array<{
        today: string;
        this_week: string;
        this_month: string;
        lifetime: string;
        units_month: string;
      }>
    >(
      `SELECT
         COALESCE(SUM(oi.subtotal) FILTER (WHERE o.created_at::date = CURRENT_DATE), 0)::float AS today,
         COALESCE(SUM(oi.subtotal) FILTER (WHERE o.created_at >= date_trunc('week', NOW())), 0)::float AS this_week,
         COALESCE(SUM(oi.subtotal) FILTER (WHERE o.created_at >= date_trunc('month', NOW())), 0)::float AS this_month,
         COALESCE(SUM(oi.subtotal), 0)::float AS lifetime,
         COALESCE(SUM(oi.quantity) FILTER (WHERE o.created_at >= date_trunc('month', NOW())), 0)::int AS units_month
       ${settledBase}`,
      [shopId],
    );

    const [ordersRow] = await this.dataSource.query<
      Array<{
        today: string;
        this_month: string;
        lifetime: string;
        awaiting: string;
        completed: string;
        cancelled: string;
      }>
    >(
      `SELECT
         COUNT(DISTINCT o.id) FILTER (WHERE o.created_at::date = CURRENT_DATE)::int AS today,
         COUNT(DISTINCT o.id) FILTER (WHERE o.created_at >= date_trunc('month', NOW()))::int AS this_month,
         COUNT(DISTINCT o.id)::int AS lifetime,
         COUNT(DISTINCT o.id) FILTER (WHERE o.status IN ('PENDING','CONFIRMED','PROCESSING'))::int AS awaiting,
         COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'DELIVERED')::int AS completed,
         COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'CANCELLED')::int AS cancelled
       FROM order_items oi
       JOIN seller_products sp ON sp.id = oi.seller_product_id
       JOIN orders o ON o.id = oi.order_id
      WHERE sp.shop_id = $1`,
      [shopId],
    );

    const statusRows = await this.dataSource.query<Array<{ status: string; count: string }>>(
      `SELECT o.status AS status, COUNT(DISTINCT o.id)::int AS count
         FROM order_items oi
         JOIN seller_products sp ON sp.id = oi.seller_product_id
         JOIN orders o ON o.id = oi.order_id
        WHERE sp.shop_id = $1
        GROUP BY o.status`,
      [shopId],
    );

    const [inventoryRow] = await this.dataSource.query<
      Array<{
        active_listings: string;
        low_stock: string;
        out_of_stock: string;
        stock_value: string;
      }>
    >(
      `SELECT
         COUNT(*)::int AS active_listings,
         COUNT(*) FILTER (
           WHERE (inv.quantity - inv.reserved_quantity) > 0
             AND (inv.quantity - inv.reserved_quantity) <= inv.low_stock_threshold
         )::int AS low_stock,
         COUNT(*) FILTER (WHERE (inv.quantity - inv.reserved_quantity) <= 0)::int AS out_of_stock,
         COALESCE(SUM(COALESCE(sp.discount_price, sp.price) * GREATEST(inv.quantity - inv.reserved_quantity, 0)), 0)::float AS stock_value
       FROM seller_products sp
       JOIN inventory inv ON inv.seller_product_id = sp.id
      WHERE sp.shop_id = $1 AND sp.is_active = true`,
      [shopId],
    );

    const [couponRow] = await this.dataSource.query<
      Array<{ active_coupons: string; total_coupons: string }>
    >(
      `SELECT
         COUNT(*) FILTER (
           WHERE is_active = true
             AND (start_date IS NULL OR start_date <= NOW())
             AND (end_date IS NULL OR end_date >= NOW())
         )::int AS active_coupons,
         COUNT(*)::int AS total_coupons
       FROM coupons
      WHERE "shopId" = $1`,
      [shopId],
    );

    const bestSellers = await this.dataSource.query<
      Array<{
        listing_id: string;
        product_id: string;
        name_en: string;
        name_bn: string;
        image: string | null;
        quantity_sold: string;
        revenue: string;
      }>
    >(
      `SELECT sp.id AS listing_id,
              p.id AS product_id,
              p.name_en,
              p.name_bn,
              (SELECT pi.url FROM product_images pi
                WHERE pi.product_id = p.id
                ORDER BY pi.is_primary DESC, pi.sort_order ASC LIMIT 1) AS image,
              COALESCE(SUM(oi.quantity), 0)::int AS quantity_sold,
              COALESCE(SUM(oi.subtotal), 0)::float AS revenue
         FROM order_items oi
         JOIN seller_products sp ON sp.id = oi.seller_product_id
         JOIN product_variants pv ON pv.id = sp.product_variant_id
         JOIN products p ON p.id = pv.product_id
         JOIN orders o ON o.id = oi.order_id
        WHERE sp.shop_id = $1 AND o.status = 'DELIVERED'
        GROUP BY sp.id, p.id, p.name_en, p.name_bn
        ORDER BY quantity_sold DESC, revenue DESC
        LIMIT 10`,
      [shopId],
    );

    const revenueByCategory = await this.dataSource.query<
      Array<{
        category_id: string;
        name_en: string;
        name_bn: string;
        revenue: string;
        quantity_sold: string;
      }>
    >(
      `SELECT c.id AS category_id,
              c.name_en,
              c.name_bn,
              COALESCE(SUM(oi.subtotal), 0)::float AS revenue,
              COALESCE(SUM(oi.quantity), 0)::int AS quantity_sold
         FROM order_items oi
         JOIN seller_products sp ON sp.id = oi.seller_product_id
         JOIN product_variants pv ON pv.id = sp.product_variant_id
         JOIN products p ON p.id = pv.product_id
         JOIN categories c ON c.id = p.category_id
         JOIN orders o ON o.id = oi.order_id
        WHERE sp.shop_id = $1 AND o.status = 'DELIVERED'
        GROUP BY c.id, c.name_en, c.name_bn
        ORDER BY revenue DESC
        LIMIT 12`,
      [shopId],
    );

    const revenueTrend = await this.dataSource.query<
      Array<{ day: string; revenue: string; orders: string }>
    >(
      `SELECT to_char(d.day, 'YYYY-MM-DD') AS day,
              COALESCE((
                SELECT SUM(oi.subtotal)
                  FROM order_items oi
                  JOIN seller_products sp ON sp.id = oi.seller_product_id AND sp.shop_id = $1
                  JOIN orders o ON o.id = oi.order_id
                 WHERE o.created_at::date = d.day AND o.status = 'DELIVERED'
              ), 0)::float AS revenue,
              COALESCE((
                SELECT COUNT(DISTINCT o.id)
                  FROM order_items oi
                  JOIN seller_products sp ON sp.id = oi.seller_product_id AND sp.shop_id = $1
                  JOIN orders o ON o.id = oi.order_id
                 WHERE o.created_at::date = d.day AND o.status = 'DELIVERED'
              ), 0)::int AS orders
         FROM generate_series(CURRENT_DATE - ($2::int - 1), CURRENT_DATE, '1 day') AS d(day)
        ORDER BY d.day ASC`,
      [shopId, days],
    );

    const sales = {
      today: Number(salesRow?.today ?? 0),
      thisWeek: Number(salesRow?.this_week ?? 0),
      thisMonth: Number(salesRow?.this_month ?? 0),
      lifetime: Number(salesRow?.lifetime ?? 0),
      unitsSoldThisMonth: Number(salesRow?.units_month ?? 0),
      averageOrderValueThisMonth: 0,
    };

    const completedThisMonth = await this.dataSource.query<Array<{ count: string }>>(
      `SELECT COUNT(DISTINCT o.id)::int AS count
         FROM order_items oi
         JOIN seller_products sp ON sp.id = oi.seller_product_id
         JOIN orders o ON o.id = oi.order_id
        WHERE sp.shop_id = $1
          AND o.status = 'DELIVERED'
          AND o.created_at >= date_trunc('month', NOW())`,
      [shopId],
    );

    const completedCount = Number(completedThisMonth[0]?.count ?? 0);
    sales.averageOrderValueThisMonth =
      completedCount > 0 ? Math.round((sales.thisMonth / completedCount) * 100) / 100 : 0;

    return {
      shopId,
      generatedAt: new Date().toISOString(),
      sales,
      orders: {
        today: Number(ordersRow?.today ?? 0),
        thisMonth: Number(ordersRow?.this_month ?? 0),
        lifetime: Number(ordersRow?.lifetime ?? 0),
        awaitingAction: Number(ordersRow?.awaiting ?? 0),
        completed: Number(ordersRow?.completed ?? 0),
        cancelled: Number(ordersRow?.cancelled ?? 0),
        statusDistribution: statusRows.map((row) => ({
          status: row.status,
          count: Number(row.count),
        })),
      },
      inventory: {
        activeListings: Number(inventoryRow?.active_listings ?? 0),
        lowStockCount: Number(inventoryRow?.low_stock ?? 0),
        outOfStockCount: Number(inventoryRow?.out_of_stock ?? 0),
        stockValue: Number(inventoryRow?.stock_value ?? 0),
      },
      promotions: {
        activeCoupons: Number(couponRow?.active_coupons ?? 0),
        totalCoupons: Number(couponRow?.total_coupons ?? 0),
      },
      bestSellers: bestSellers.map((row) => ({
        listingId: row.listing_id,
        productId: row.product_id,
        nameEn: row.name_en,
        nameBn: row.name_bn,
        image: row.image,
        quantitySold: Number(row.quantity_sold),
        revenue: Number(row.revenue),
      })),
      revenueByCategory: revenueByCategory.map((row) => ({
        categoryId: row.category_id,
        nameEn: row.name_en,
        nameBn: row.name_bn,
        revenue: Number(row.revenue),
        quantitySold: Number(row.quantity_sold),
      })),
      revenueTrend: revenueTrend.map((row) => ({
        date: row.day,
        revenue: Number(row.revenue),
        orders: Number(row.orders),
      })),
    };
  }
}
