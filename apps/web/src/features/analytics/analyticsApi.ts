import { api } from '../../store/api';

export interface DashboardMetrics {
  metrics: {
    totalUsers: number;
    totalOrders: number;
    pendingOrders: number;
    totalCustomers: number;
    totalProducts: number;
    totalSales: number;
    activeSellers: number;
    totalSellers: number;
    totalRiders: number;
  };
  recentOrders: Array<{
    id: string;
    customerName: string;
    totalAmount: string | number;
    status: string;
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
    count: number;
  }>;
  frequentlyUnavailable: Array<{
    productId: string;
    productName: string;
    views: number;
  }>;
  requestedProducts: Array<{
    productRequestId: string;
    requests: number;
    purchases: number;
    conversionRate: number;
  }>;
}

export const analyticsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardMetrics: builder.query<DashboardMetrics, void>({
      query: () => '/admin/analytics/dashboard',
      providesTags: ['Order', 'User', 'Catalog'], // Invalidate if any of these change
    }),
    getDemandAnalytics: builder.query<DemandReport, void>({
      query: () => '/admin/analytics/demand',
    }),
  }),
});

export const { useGetDashboardMetricsQuery, useGetDemandAnalyticsQuery } = analyticsApi;
