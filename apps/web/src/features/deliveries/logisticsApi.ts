import { api } from '@/store/api';
import { PaginationMeta } from '../catalog/catalogApi';
import { User } from '../users/usersApi';
import { WarehouseHub } from '../warehouses/warehousesApi';

export enum DispatchRunStatus {
  PLANNED = 'PLANNED',
  ASSIGNED = 'ASSIGNED',
  IN_TRANSIT = 'IN_TRANSIT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum WaypointStatus {
  PENDING = 'PENDING',
  ARRIVED = 'ARRIVED',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

export interface WaypointStop {
  sequence: number;
  deliveryId: string;
  orderId: string;
  orderNumber?: string;
  recipientName: string;
  recipientPhone: string;
  division: string;
  district: string;
  upazila: string;
  union?: string;
  villageAddress: string;
  lat?: number;
  lng?: number;
  codAmount: number;
  status: WaypointStatus;
  notes?: string;
  arrivedAt?: string;
  completedAt?: string;
}

export interface DispatchCluster {
  id: string;
  runCode: string;
  title: string;
  hubId?: string | null;
  hub?: WarehouseHub | null;
  riderId?: string | null;
  rider?: User | null;
  division: string;
  district: string;
  upazila: string;
  status: DispatchRunStatus;
  totalDistanceKm: number;
  estimatedDurationMinutes: number;
  fuelAllowanceBdt: number;
  requiresFerryCrossing: boolean;
  ferryGhatName?: string | null;
  ferryWaitMinutes: number;
  waypoints: WaypointStop[];
  dispatchedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClusterSuggestion {
  division: string;
  district: string;
  upazila: string;
  deliveryCount: number;
  totalCodAmount: number;
  estimatedDistanceKm: number;
  estimatedDurationMinutes: number;
  fuelAllowanceBdt: number;
  requiresFerryCrossing: boolean;
  ferryGhatName: string | null;
  deliveries: Array<{
    deliveryId: string;
    orderId: string;
    recipientName: string;
    recipientPhone: string;
    union?: string;
    villageAddress: string;
    codAmount: number;
  }>;
}

export interface CreateDispatchClusterDto {
  title: string;
  hubId?: string;
  riderId?: string;
  division: string;
  district: string;
  upazila: string;
  deliveryIds: string[];
  ferryGhatName?: string;
}

export interface ProgressWaypointDto {
  status: WaypointStatus;
  notes?: string;
}

export const logisticsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSuggestedClusters: builder.query<ClusterSuggestion[], { district?: string; hubId?: string } | void>({
      query: (params) => ({
        url: '/deliveries/logistics/suggested',
        params: params || undefined,
      }),
      providesTags: ['DispatchCluster', 'Order'],
    }),

    getDispatchRuns: builder.query<
      { data: DispatchCluster[]; meta: PaginationMeta },
      { page?: number; limit?: number; status?: DispatchRunStatus; district?: string } | void
    >({
      query: (params) => ({
        url: '/deliveries/logistics/runs',
        params: params || undefined,
      }),
      providesTags: ['DispatchCluster'],
    }),

    getRiderActiveRun: builder.query<DispatchCluster | null, void>({
      query: () => '/deliveries/logistics/rider/active-run',
      providesTags: ['DispatchCluster'],
    }),

    createDispatchRun: builder.mutation<DispatchCluster, CreateDispatchClusterDto>({
      query: (body) => ({
        url: '/deliveries/logistics/runs',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['DispatchCluster', 'Order'],
    }),

    updateDispatchRunStatus: builder.mutation<
      DispatchCluster,
      { id: string; status: DispatchRunStatus }
    >({
      query: ({ id, status }) => ({
        url: `/deliveries/logistics/runs/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['DispatchCluster', 'Order'],
    }),

    progressWaypoint: builder.mutation<
      DispatchCluster,
      { id: string; sequence: number; status: WaypointStatus; notes?: string }
    >({
      query: ({ id, sequence, status, notes }) => ({
        url: `/deliveries/logistics/runs/${id}/waypoints/${sequence}/progress`,
        method: 'PATCH',
        body: { status, notes },
      }),
      invalidatesTags: ['DispatchCluster', 'Order'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSuggestedClustersQuery,
  useGetDispatchRunsQuery,
  useGetRiderActiveRunQuery,
  useCreateDispatchRunMutation,
  useUpdateDispatchRunStatusMutation,
  useProgressWaypointMutation,
} = logisticsApi;
