import { api } from '@/store/api';


export interface MandiPriceRecord {
  id: string;
  cropName: string;
  cropNameBn: string;
  commodityGroup: string;
  division: string;
  district: string;
  marketName: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  priceUnit: string;
  trendDirection: 'UP' | 'DOWN' | 'STABLE';
  recordedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface FairPriceAdvisoryResult {
  cropName: string;
  cropNameBn: string;
  offeredPrice: number;
  benchmarkModalPrice: number;
  benchmarkMinPrice: number;
  benchmarkMaxPrice: number;
  priceUnit: string;
  marketName: string;
  division: string;
  district: string;
  deviationPercentage: number;
  pricingStatus: 'FAIR_MARKET' | 'BELOW_MARKET' | 'ABOVE_MARKET';
  adviceEn: string;
  adviceBn: string;
}

export interface MandiPriceFilters {
  search?: string;
  commodityGroup?: string;
  division?: string;
  district?: string;
}

export interface FairPriceAdvisoryQuery {
  cropName: string;
  district?: string;
  offeredPrice: number;
}

export interface CreateMandiPricePayload {
  cropName: string;
  cropNameBn: string;
  commodityGroup: string;
  division: string;
  district: string;
  marketName: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  priceUnit?: string;
  trendDirection?: 'UP' | 'DOWN' | 'STABLE';
  recordedDate: string;
}

export const agriIntelligenceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMandiPrices: builder.query<MandiPriceRecord[], MandiPriceFilters | void>({
      query: (filters) => ({
        url: '/agri-intelligence/mandi-prices',
        params: filters || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'MandiPrice' as const, id })),
              { type: 'MandiPrice', id: 'LIST' },
            ]
          : [{ type: 'MandiPrice', id: 'LIST' }],
    }),

    getFairPriceAdvisory: builder.query<FairPriceAdvisoryResult, FairPriceAdvisoryQuery>({
      query: (params) => ({
        url: '/agri-intelligence/fair-price-advisory',
        params,
      }),
    }),

    recordMandiPrice: builder.mutation<MandiPriceRecord, CreateMandiPricePayload>({
      query: (payload) => ({
        url: '/agri-intelligence/mandi-prices',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [{ type: 'MandiPrice', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetMandiPricesQuery,
  useLazyGetFairPriceAdvisoryQuery,
  useGetFairPriceAdvisoryQuery,
  useRecordMandiPriceMutation,
} = agriIntelligenceApi;
