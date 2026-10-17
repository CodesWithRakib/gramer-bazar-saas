import { api } from '@/store/api';

export type SericultureCraftType =
  | 'RAJSHAHI_MULBERRY_SILK'
  | 'ENDI_ERI_SILK'
  | 'TUKRA_MATKA_SILK'
  | 'NARAYANGANJ_DHAKAI_JAMDANI'
  | 'TANGAIL_HANDLOOM_TAANT'
  | 'MIRPUR_BANARASI_KATAN'
  | 'HILL_TRACTS_CHAKMA_PINON_HADI'
  | 'KHADI_HANDSPUN_COTTON';

export type SilkGrade =
  | 'GRADE_A_PREMIUM_EXPORT'
  | 'GRADE_B_DOMESTIC_STANDARD'
  | 'GRADE_C_COMMERCIAL_BLENDED';

export type YarnMaterial =
  | 'PURE_MULBERRY_SILK_100'
  | 'PURE_ENDI_SILK_100'
  | 'GASSED_MERCERIZED_COTTON'
  | 'FINE_KHADI_COTTON_COUNT_100'
  | 'SILK_COTTON_BLEND'
  | 'ZARI_METALLIC_THREAD';

export type AuthenticityStatus =
  | 'BSDB_BHB_CERTIFIED'
  | 'GI_REGISTERED_ORIGIN'
  | 'ARTISAN_SELF_DECLARED'
  | 'LAB_BURN_TEST_VERIFIED';

export type WeavingLoomType =
  | 'TRADITIONAL_PIT_LOOM'
  | 'FLY_SHUTTLE_FRAME_LOOM'
  | 'INDIGENOUS_BACKSTRAP_LOOM'
  | 'SEMI_AUTOMATIC_PEDAL_LOOM';

export type ArtisanOrderEscrowStatus =
  | 'ORDER_PLACED_ESCROW_LOCKED'
  | 'WARPING_LOOM_MOUNTED'
  | 'IN_WEAVING_PROGRESS'
  | 'FINISHED_BOARD_INSPECTED'
  | 'DISPATCHED_TO_BUYER'
  | 'ESCROW_RELEASED_TO_WEAVER'
  | 'DISPUTED_NON_COMPLIANT';

export type CocoonType = 'BIVOLTINE' | 'MULTIVOLTINE';

export interface HandloomArtisanProduct {
  id: string;
  artisanId: string;
  artisanName: string;
  craftType: SericultureCraftType;
  titleBn: string;
  titleEn: string;
  originDistrict: string;
  weavingVillage: string;
  loomType: WeavingLoomType;
  yarnMaterial: YarnMaterial;
  threadCountWarp: number;
  threadCountWeft: number;
  silkGrade: SilkGrade;
  authenticityStatus: AuthenticityStatus;
  giCertificateNumber: string | null;
  weavingDurationDays: number;
  artisanWageBdt: number;
  priceBdt: number;
  stockQuantity: number;
  mediaGalleryUrls: string[];
  burnTestResultNotes: string | null;
  dimensionsLengthMeters: number;
  dimensionsWidthInches: number;
  isCustomOrderAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SericultureCocoonBatch {
  id: string;
  lotNumber: string;
  farmerId: string;
  farmerName: string;
  farmingDistrict: string;
  mulberryVariety: string;
  cocoonType: CocoonType;
  freshCocoonWeightKg: number;
  shellRatioPercentage: number;
  estimatedRawSilkFilamentKg: number;
  reelingFactoryName: string | null;
  pricePerKgBdt: number;
  isInspectedByBSDB: boolean;
  bsdbInspectorName: string | null;
  harvestDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArtisanCustomOrder {
  id: string;
  orderNumber: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string | null;
  artisanId: string;
  artisanName: string;
  craftType: SericultureCraftType;
  customMotifDescription: string;
  primaryColorHex: string;
  zariSpecification: string;
  agreedPriceBdt: number;
  advanceEscrowBdt: number;
  estimatedDeliveryDays: number;
  orderStatus: ArtisanOrderEscrowStatus;
  weftProgressPercentage: number;
  inspectionNotes: string | null;
  dispatchedTrackingNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SericultureOverviewStats {
  totalArtisanProducts: number;
  totalCocoonBatches: number;
  totalCocoonWeightKg: number;
  totalActiveCustomOrders: number;
  totalEscrowLockedBdt: number;
  registeredGIProductsCount: number;
}

export interface CocoonReelingResult {
  freshCocoonWeightKg: number;
  cocoonType: CocoonType;
  shellRatioPercentage: number;
  rendittaRatio: number;
  rendittaExplanation: string;
  estimatedRawSilkFilamentKg: number;
  chrysalisPupaeByProductKg: number;
  cocoonFarmgateTotalBdt: number;
  reeledRawSilkValueBdt: number;
  chrysalisProteinValueBdt: number;
  netValueAddedBdt: number;
  valueAdditionPercentage: number;
  recommendationBn: string;
}

export interface FairWageResult {
  craftType: SericultureCraftType;
  weavingDays: number;
  dailyArtisanFairWageBdt: number;
  totalArtisanWageBdt: number;
  rawYarnCostBdt: number;
  zariCostBdt: number;
  loomWarpingPrepCostBdt: number;
  netProductionCostBdt: number;
  cooperativeFairMarginBdt: number;
  fairTransparentRetailPriceBdt: number;
  artisanWageSharePercentage: number;
  directBenefitIncreasePercentage: number;
  wageVerdictBn: string;
}

export const sericultureHandloomApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSericultureOverviewStats: builder.query<{ success: boolean; data: SericultureOverviewStats }, void>({
      query: () => '/sericulture-handloom/stats/overview',
      providesTags: ['ArtisanProduct', 'CocoonBatch', 'CustomOrder'],
    }),

    getHandloomCatalog: builder.query<
      { success: boolean; data: HandloomArtisanProduct[] },
      {
        craftType?: SericultureCraftType;
        originDistrict?: string;
        silkGrade?: SilkGrade;
        loomType?: WeavingLoomType;
        search?: string;
      }
    >({
      query: (params) => ({
        url: '/sericulture-handloom/catalog',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'ArtisanProduct' as const, id })),
              { type: 'ArtisanProduct', id: 'LIST' },
            ]
          : [{ type: 'ArtisanProduct', id: 'LIST' }],
    }),

    getHandloomProductById: builder.query<{ success: boolean; data: HandloomArtisanProduct }, string>({
      query: (id) => `/sericulture-handloom/catalog/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'ArtisanProduct', id }],
    }),

    calculateCocoonReeling: builder.mutation<
      { success: boolean; data: CocoonReelingResult },
      { freshCocoonWeightKg: number; cocoonType?: CocoonType; shellRatioPercentage?: number }
    >({
      query: (body) => ({
        url: '/sericulture-handloom/calculate/cocoon-reeling',
        method: 'POST',
        body,
      }),
    }),

    calculateFairWage: builder.mutation<
      { success: boolean; data: FairWageResult },
      {
        craftType: SericultureCraftType;
        weavingDays: number;
        yarnMaterial?: YarnMaterial;
        lengthMeters?: number;
        zariType?: string;
      }
    >({
      query: (body) => ({
        url: '/sericulture-handloom/calculate/fair-wage',
        method: 'POST',
        body,
      }),
    }),

    getCocoonBatches: builder.query<{ success: boolean; data: SericultureCocoonBatch[] }, void>({
      query: () => '/sericulture-handloom/cocoons',
      providesTags: [{ type: 'CocoonBatch', id: 'LIST' }],
    }),

    createHandloomProduct: builder.mutation<
      { success: boolean; data: HandloomArtisanProduct },
      Partial<HandloomArtisanProduct>
    >({
      query: (body) => ({
        url: '/sericulture-handloom/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'ArtisanProduct', id: 'LIST' }],
    }),

    createCocoonBatch: builder.mutation<
      { success: boolean; data: SericultureCocoonBatch },
      Partial<SericultureCocoonBatch>
    >({
      query: (body) => ({
        url: '/sericulture-handloom/cocoons',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'CocoonBatch', id: 'LIST' }],
    }),

    createCustomOrder: builder.mutation<
      { success: boolean; data: ArtisanCustomOrder },
      {
        artisanId: string;
        artisanName: string;
        craftType: SericultureCraftType;
        customMotifDescription: string;
        primaryColorHex?: string;
        zariSpecification?: string;
        agreedPriceBdt: number;
        estimatedDeliveryDays?: number;
      }
    >({
      query: (body) => ({
        url: '/sericulture-handloom/orders/custom',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'CustomOrder', id: 'MY_LIST' }, { type: 'CustomOrder', id: 'ALL_LIST' }],
    }),

    getMyCustomOrders: builder.query<{ success: boolean; data: ArtisanCustomOrder[] }, void>({
      query: () => '/sericulture-handloom/orders/my',
      providesTags: [{ type: 'CustomOrder', id: 'MY_LIST' }],
    }),

    getArtisanOrders: builder.query<{ success: boolean; data: ArtisanCustomOrder[] }, void>({
      query: () => '/sericulture-handloom/orders/artisan',
      providesTags: [{ type: 'CustomOrder', id: 'ARTISAN_LIST' }],
    }),

    getAllAdminOrders: builder.query<{ success: boolean; data: ArtisanCustomOrder[] }, void>({
      query: () => '/sericulture-handloom/orders/all',
      providesTags: [{ type: 'CustomOrder', id: 'ALL_LIST' }],
    }),

    updateLoomProgress: builder.mutation<
      { success: boolean; data: ArtisanCustomOrder },
      {
        id: string;
        orderStatus: ArtisanOrderEscrowStatus;
        weftProgressPercentage?: number;
        inspectionNotes?: string;
        dispatchedTrackingNumber?: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/sericulture-handloom/orders/${id}/progress`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [
        { type: 'CustomOrder', id: 'MY_LIST' },
        { type: 'CustomOrder', id: 'ARTISAN_LIST' },
        { type: 'CustomOrder', id: 'ALL_LIST' },
      ],
    }),

    settleCustomOrder: builder.mutation<{ success: boolean; data: ArtisanCustomOrder }, string>({
      query: (id) => ({
        url: `/sericulture-handloom/orders/${id}/settle`,
        method: 'PATCH',
      }),
      invalidatesTags: [
        { type: 'CustomOrder', id: 'MY_LIST' },
        { type: 'CustomOrder', id: 'ARTISAN_LIST' },
        { type: 'CustomOrder', id: 'ALL_LIST' },
      ],
    }),
  }),
});

export const {
  useGetSericultureOverviewStatsQuery,
  useGetHandloomCatalogQuery,
  useGetHandloomProductByIdQuery,
  useCalculateCocoonReelingMutation,
  useCalculateFairWageMutation,
  useGetCocoonBatchesQuery,
  useCreateHandloomProductMutation,
  useCreateCocoonBatchMutation,
  useCreateCustomOrderMutation,
  useGetMyCustomOrdersQuery,
  useGetArtisanOrdersQuery,
  useGetAllAdminOrdersQuery,
  useUpdateLoomProgressMutation,
  useSettleCustomOrderMutation,
} = sericultureHandloomApi;
