import { api } from '../../store/api';

export interface DashboardMetrics {
  metrics: {
    totalUsers?: number;
    totalOrders: number;
    pendingOrders: number;
    totalCustomers: number;
    totalProducts: number;
    totalSales: number;
    activeSellers?: number;
    totalSellers: number;
    totalRiders: number;
    activeShops?: number;
    pendingApplications?: number;
    pendingDisputes?: number;
  };
  recentOrders: Array<{
    id: string;
    customerName: string;
    totalAmount: string | number;
    status: string;
    createdAt?: string;
  }>;
  revenueData: Array<{
    name: string;
    revenue: number;
    orders?: number;
  }>;
  orderStatusDistribution?: Array<{
    name: string;
    count: number;
  }>;
  categoryPerformance?: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
  topProducts?: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
}

export interface DemandReport {
  popularProducts: Array<{
    productId: string;
    productName: string;
    views: number;
    carts: number;
    purchases: number;
  }>;
  popularSearches: Array<{
    query: string;
    count: number;
  }>;
  purchaseTrends: Array<{
    date: string;
    purchases: number;
    carts: number;
  }>;
  categoryDemand: Array<{
    categoryId: string;
    categoryName: string;
    count: number;
  }>;
  frequentlyUnavailable: Array<{
    productId: string;
    productName: string;
    views: number;
  }>;
  requestedProducts: Array<{
    productRequestId: string;
    productName?: string;
    requests: number;
    purchases: number;
    conversionRate: number;
  }>;
}

export interface SalesReport {
  revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
  salesFunnel: Array<{ step: string; count: number }>;
  paymentMethods: Array<{ method: string; revenue: number; count: number }>;
}

export interface ProductsReport {
  topProducts: Array<{ productId: string; name: string; revenue: number; sales: number }>;
}

export interface CustomersReport {
  newCustomersCount: number;
  topCustomers: Array<{ userId: string; name: string; email: string; revenue: number; orders: number }>;
}

export interface DateQuery {
  from?: string;
  to?: string;
}

export interface SeasonalDemandForecast {
  activeSeason: string;
  seasonEn: string;
  seasonBn: string;
  periodMonths: string;
  projectedSurgePercent: number;
  recommendedSafetyBufferPercent: number;
  insightsEn: string;
  insightsBn: string;
  commodities: Array<{
    nameEn: string;
    nameBn: string;
    forecastDemandKg: number;
    growthRate: string;
    riskLevel: string;
  }>;
  recentSearchVelocity: number;
  generatedAt: string;
}

export interface RegionalDemandBreakdown {
  regions: Array<{
    division: string;
    district: string;
    orderCount: number;
    totalGmv: number;
    avgOrderValue: number;
    densityTier: string;
  }>;
  totalRegionalOrders: number;
  analyzedAt: string;
}

export const analyticsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardMetrics: builder.query<DashboardMetrics, void>({
      query: () => '/admin/analytics/dashboard',
      providesTags: ['Order', 'User', 'Catalog'],
    }),
    getDemandAnalytics: builder.query<DemandReport, DateQuery | void>({
      query: (params) => ({
        url: '/admin/analytics/demand',
        params: params || undefined,
      }),
    }),
    getSalesAnalytics: builder.query<SalesReport, DateQuery | void>({
      query: (params) => ({
        url: '/admin/analytics/sales',
        params: params || undefined,
      }),
    }),
    getProductsAnalytics: builder.query<ProductsReport, DateQuery | void>({
      query: (params) => ({
        url: '/admin/analytics/products',
        params: params || undefined,
      }),
    }),
    getCustomersAnalytics: builder.query<CustomersReport, DateQuery | void>({
      query: (params) => ({
        url: '/admin/analytics/customers',
        params: params || undefined,
      }),
    }),
    getSeasonalDemandForecast: builder.query<SeasonalDemandForecast, string | void>({
      query: (season) => ({
        url: '/admin/analytics/forecasting/seasonal',
        params: season ? { season } : undefined,
      }),
    }),
    getRegionalDemandBreakdown: builder.query<RegionalDemandBreakdown, void>({
      query: () => '/admin/analytics/forecasting/regional',
    }),
  }),
});

export const {
  useGetDashboardMetricsQuery,
  useGetDemandAnalyticsQuery,
  useGetSalesAnalyticsQuery,
  useGetProductsAnalyticsQuery,
  useGetCustomersAnalyticsQuery,
  useGetSeasonalDemandForecastQuery,
  useGetRegionalDemandBreakdownQuery,
} = analyticsApi;
