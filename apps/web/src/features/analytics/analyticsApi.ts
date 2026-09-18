import { api } from '../../store/api';

export const analyticsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardMetrics: builder.query<any, void>({
      query: () => '/analytics/dashboard',
      providesTags: ['Order', 'User', 'Catalog'], // Invalidate if any of these change
    }),
  }),
});

export const { useGetDashboardMetricsQuery } = analyticsApi;
