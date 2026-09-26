import type { Schema } from './common.js';

export type DashboardMetrics = Schema<'DashboardMetricsSummaryDto'>;
export type RecentOrderSummary = Schema<'RecentOrderSummaryDto'>;
export type RevenueTrendItem = Schema<'RevenueTrendItemDto'>;
export type AdminDashboardResponse = Schema<'AdminDashboardResponseDto'>;
export type DemandAnalyticsResponse = Schema<'DemandAnalyticsResponseDto'>;

export type BulkCreateDemandEventRequest = Schema<'BulkCreateDemandEventDto'>;
export type CreateDemandEventRequest = Schema<'CreateDemandEventDto'>;
