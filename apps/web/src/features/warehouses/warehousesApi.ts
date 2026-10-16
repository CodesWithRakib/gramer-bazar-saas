import { api } from '@/store/api';

export interface WarehouseHub {
  id: string;
  nameEn: string;
  nameBn: string;
  code: string;
  hubType: 'CENTRAL' | 'DIVISIONAL' | 'DISTRICT' | 'UPAZILA_UNION';
  division: string;
  district: string;
  upazila?: string | null;
  union?: string | null;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  contactName?: string | null;
  contactPhone?: string | null;
  maxCapacityCubicMeters?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HubStock {
  id: string;
  hubId: string;
  productVariantId: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  reorderPoint: number;
  reorderQuantity: number;
  lastRestockedAt?: string | null;
  hub?: WarehouseHub;
  productVariant?: {
    id: string;
    sku: string;
    nameEn: string;
    nameBn: string;
    price: number;
    images?: string[];
    product?: {
      id: string;
      nameEn: string;
      nameBn: string;
    };
  };
}

export interface StockTransfer {
  id: string;
  trackingNumber: string;
  sourceHubId: string;
  destinationHubId: string;
  productVariantId: string;
  quantity: number;
  status: 'INITIATED' | 'IN_TRANSIT' | 'RECEIVED' | 'CANCELLED';
  initiatedById: string;
  notes?: string | null;
  dispatchedAt?: string | null;
  receivedAt?: string | null;
  cancelledAt?: string | null;
  sourceHub?: WarehouseHub;
  destinationHub?: WarehouseHub;
  productVariant?: {
    id: string;
    sku: string;
    nameEn: string;
    nameBn: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateWarehouseHubDto {
  nameEn: string;
  nameBn: string;
  code: string;
  hubType: 'CENTRAL' | 'DIVISIONAL' | 'DISTRICT' | 'UPAZILA_UNION';
  division: string;
  district: string;
  upazila?: string;
  union?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  contactName?: string;
  contactPhone?: string;
  maxCapacityCubicMeters?: number;
}

export interface AllocateHubStockDto {
  productVariantId: string;
  quantityOnHand: number;
  reorderPoint?: number;
  reorderQuantity?: number;
}

export interface CreateStockTransferDto {
  sourceHubId: string;
  destinationHubId: string;
  productVariantId: string;
  quantity: number;
  notes?: string;
}

export interface UpdateStockTransferStatusDto {
  status: 'IN_TRANSIT' | 'RECEIVED' | 'CANCELLED';
  notes?: string;
}

export const warehousesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWarehouseHubs: builder.query<
      WarehouseHub[],
      { division?: string; district?: string; isActive?: boolean } | void
    >({
      query: (params) => ({
        url: '/warehouses/hubs',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'WarehouseHub' as const, id })),
              { type: 'WarehouseHub', id: 'LIST' },
            ]
          : [{ type: 'WarehouseHub', id: 'LIST' }],
    }),

    getWarehouseHubById: builder.query<WarehouseHub, string>({
      query: (id) => `/warehouses/hubs/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'WarehouseHub', id }],
    }),

    createWarehouseHub: builder.mutation<WarehouseHub, CreateWarehouseHubDto>({
      query: (body) => ({
        url: '/warehouses/hubs',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'WarehouseHub', id: 'LIST' }],
    }),

    getHubStocks: builder.query<HubStock[], string>({
      query: (hubId) => `/warehouses/hubs/${hubId}/stocks`,
      providesTags: (_res, _err, hubId) => [{ type: 'HubStock' as const, id: hubId }],
    }),

    allocateHubStock: builder.mutation<HubStock, { hubId: string; data: AllocateHubStockDto }>({
      query: ({ hubId, data }) => ({
        url: `/warehouses/hubs/${hubId}/stocks`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_res, _err, { hubId }) => [
        { type: 'HubStock', id: hubId },
        { type: 'WarehouseHub', id: 'LIST' },
      ],
    }),

    getStockTransfers: builder.query<
      StockTransfer[],
      { hubId?: string; status?: string } | void
    >({
      query: (params) => ({
        url: '/warehouses/transfers',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'StockTransfer' as const, id })),
              { type: 'StockTransfer', id: 'LIST' },
            ]
          : [{ type: 'StockTransfer', id: 'LIST' }],
    }),

    createStockTransfer: builder.mutation<StockTransfer, CreateStockTransferDto>({
      query: (body) => ({
        url: '/warehouses/transfers',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'StockTransfer', id: 'LIST' },
        { type: 'HubStock' as const },
      ],
    }),

    updateStockTransferStatus: builder.mutation<
      StockTransfer,
      { id: string; data: UpdateStockTransferStatusDto }
    >({
      query: ({ id, data }) => ({
        url: `/warehouses/transfers/${id}/status`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: [
        { type: 'StockTransfer', id: 'LIST' },
        { type: 'HubStock' as const },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetWarehouseHubsQuery,
  useGetWarehouseHubByIdQuery,
  useCreateWarehouseHubMutation,
  useGetHubStocksQuery,
  useAllocateHubStockMutation,
  useGetStockTransfersQuery,
  useCreateStockTransferMutation,
  useUpdateStockTransferStatusMutation,
} = warehousesApi;
