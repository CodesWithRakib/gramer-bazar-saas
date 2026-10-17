import { api } from '@/store/api';

export type GurType =
  | 'DATE_PALM_NOLEN_JHOLA'
  | 'DATE_PALM_PATALI_SOLID'
  | 'DATE_PALM_DANADAR'
  | 'SUGARCANE_ORGANIC_SOLID'
  | 'SUGARCANE_CRUMBLED_POWDER'
  | 'MOLASSES_CHITA_ORGANIC';

export type GurRegion =
  | 'JASHORE_KOTWALI'
  | 'JASHORE_JHIKARGACHA'
  | 'CHUADANGA_DAMURHUDA'
  | 'KUSHTIA_KUMARKHALI'
  | 'FARIDPUR_SADAR'
  | 'NATORE_LALPUR'
  | 'RAJSHAHI_BAGHA';

export type SapCollectionShift =
  | 'DAWN_JIRAN_PREMIUM'
  | 'DAY_DAULA_STANDARD'
  | 'EVENING_SWEET_INTAKE';

export type BoilingPanType =
  | 'TRADITIONAL_IRON_KARAI'
  | 'STAINLESS_STEEL_PAN'
  | 'EARTHEN_PIT_FURNACE';

export type HydrosulfiteTestResult =
  | 'NEGATIVE_ZERO_TOLERANCE_PASS'
  | 'POSITIVE_CONTAMINATED_SEIZED';

export type SugarSyrupAdulterationStatus =
  | 'GENUINE_PURE_SAP'
  | 'SUSPECTED_SUGAR_SYRUP_DILUTED'
  | 'HIGH_SUGAR_ADULTERATED';

export type GurPurityGrade =
  | 'GRADE_AAA_GI_CERTIFIED_HERITAGE'
  | 'GRADE_A_PURE_ARTISANAL'
  | 'COMMERCIAL_STANDARD'
  | 'REJECTED_ADULTERATED';

export type GurPackagingType =
  | 'TRADITIONAL_EARTHEN_POT_1KG'
  | 'FOOD_GRADE_GLASS_JAR_500G'
  | 'FOOD_GRADE_GLASS_JAR_1KG'
  | 'BAMBOO_LEAF_PATALI_BLOCK_2KG'
  | 'BULK_FOOD_TIN_10KG';

export type GurLotStatus =
  | 'AVAILABLE_FOR_SALE'
  | 'RESERVED_CONTRACT'
  | 'SOLD_OUT';

export interface DatePalmTappingBatch {
  id: string;
  batchNumber: string;
  gachhiCoopName: string;
  contactPhone: string;
  region: GurRegion;
  gurType: GurType;
  sapCollectionShift: SapCollectionShift;
  treesTappedCount: number;
  rawSapVolumeLiters: number;
  sapBrixDegrees: number;
  strikeBoilingTempCelsius: number;
  panType: BoilingPanType;
  producedGurWeightKg: number;
  sapToGurRatio: number;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GurPurityLabTest {
  id: string;
  testReportNumber: string;
  tappingBatchId?: string;
  gachhiCoopName: string;
  originRegion: GurRegion;
  gurType: GurType;
  hydrosulfitePpm: number;
  hydrosulfiteStatus: HydrosulfiteTestResult;
  sugarAdulterationStatus: SugarSyrupAdulterationStatus;
  sucrosePct: number;
  reducingSugarPct: number;
  totalSolubleSolidsBrix: number;
  leadPbPpm: number;
  isArtificialColoringDetected: boolean;
  strikeBoilingTempCelsius: number;
  sensoryScore: number;
  purityGrade: GurPurityGrade;
  isBstiApproved: boolean;
  isGiCompliant: boolean;
  authenticitySealNumber?: string;
  laboratoryName: string;
  inspectorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArtisanalGurLot {
  id: string;
  lotCode: string;
  title: string;
  gurType: GurType;
  originRegion: GurRegion;
  gachhiCoopName: string;
  packagingType: GurPackagingType;
  totalWeightKg: number;
  availableWeightKg: number;
  pricePerKgBdt: number;
  totalValueBdt: number;
  minimumOrderKg: number;
  aromaRating: number;
  purityGrade: GurPurityGrade;
  isGiTagged: boolean;
  isHydrosulfiteFreeCertified: boolean;
  labTestReportNumber?: string;
  digitalAuthenticitySeal?: string;
  status: GurLotStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CalculateGurExtractionDto {
  gurType: GurType;
  rawSapVolumeLiters: number;
  sapBrixDegrees?: number;
  sapCollectionShift: SapCollectionShift;
}

export interface GurExtractionCalculationResult {
  gurType: GurType;
  rawSapVolumeLiters: number;
  sapBrixDegrees: number;
  sapCollectionShift: SapCollectionShift;
  expectedGurWeightKg: number;
  sapToGurRatio: number;
  recommendedStrikeTempCelsius: number;
  aromaPreservationScore: number;
  sweetnessBrixProjected: number;
  byproductChitaMolassesKg: number;
  advisoryMessage: string;
}

export interface EvaluateGurPurityDto {
  gurType: GurType;
  sucrosePct: number;
  reducingSugarPct: number;
  hydrosulfitePpm: number;
  hydrosulfiteStatus: HydrosulfiteTestResult;
  sugarAdulterationStatus: SugarSyrupAdulterationStatus;
  isArtificialColoringDetected: boolean;
  strikeBoilingTempCelsius: number;
}

export interface GurPurityEvaluationResult {
  gurType: GurType;
  isHydrosulfiteContaminated: boolean;
  isSugarAdulterated: boolean;
  isColoringDetected: boolean;
  isOverheated: boolean;
  purityGrade: GurPurityGrade;
  bstiComplianceApproved: boolean;
  qualityScore: number;
  verdict: string;
  safetyNotes: string;
}

export interface CreateDatePalmTappingBatchDto {
  gachhiCoopName: string;
  contactPhone: string;
  region: GurRegion;
  gurType: GurType;
  sapCollectionShift: SapCollectionShift;
  treesTappedCount: number;
  rawSapVolumeLiters: number;
  sapBrixDegrees: number;
  strikeBoilingTempCelsius: number;
  panType: BoilingPanType;
  notes?: string;
}

export interface UpdateBatchBoilingDto {
  strikeBoilingTempCelsius: number;
  producedGurWeightKg: number;
  status?: string;
  notes?: string;
}

export interface CreateGurPurityLabTestDto {
  tappingBatchId?: string;
  gachhiCoopName: string;
  originRegion: GurRegion;
  gurType: GurType;
  hydrosulfitePpm: number;
  hydrosulfiteStatus: HydrosulfiteTestResult;
  sugarAdulterationStatus: SugarSyrupAdulterationStatus;
  sucrosePct: number;
  reducingSugarPct: number;
  totalSolubleSolidsBrix: number;
  leadPbPpm: number;
  isArtificialColoringDetected: boolean;
  strikeBoilingTempCelsius: number;
  sensoryScore: number;
  laboratoryName: string;
  inspectorName: string;
}

export interface CreateArtisanalGurLotDto {
  title: string;
  gurType: GurType;
  originRegion: GurRegion;
  gachhiCoopName: string;
  packagingType: GurPackagingType;
  totalWeightKg: number;
  pricePerKgBdt: number;
  minimumOrderKg: number;
  aromaRating: number;
  isGiTagged?: boolean;
  isHydrosulfiteFreeCertified?: boolean;
  labTestReportNumber?: string;
  digitalAuthenticitySeal?: string;
}

export interface PurchaseGurLotDto {
  orderQuantityKg: number;
  buyerName: string;
  buyerPhone: string;
  deliveryAddress: string;
}

export const artisanalGurApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Calculators
    calculateGurExtraction: builder.mutation<
      GurExtractionCalculationResult,
      CalculateGurExtractionDto
    >({
      query: (body) => ({
        url: '/artisanal-gur/calculator/extraction',
        method: 'POST',
        body,
      }),
    }),

    evaluateGurPurity: builder.mutation<
      GurPurityEvaluationResult,
      EvaluateGurPurityDto
    >({
      query: (body) => ({
        url: '/artisanal-gur/calculator/purity',
        method: 'POST',
        body,
      }),
    }),

    // Date Palm Tapping Batches
    getTappingBatches: builder.query<
      DatePalmTappingBatch[],
      { gurType?: GurType; region?: GurRegion; shift?: SapCollectionShift } | void
    >({
      query: (params) => ({
        url: '/artisanal-gur/tapping-batches',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'DatePalmTappingBatch' as const, id })),
              { type: 'DatePalmTappingBatch', id: 'LIST' },
            ]
          : [{ type: 'DatePalmTappingBatch', id: 'LIST' }],
    }),

    getTappingBatchById: builder.query<DatePalmTappingBatch, string>({
      query: (id) => `/artisanal-gur/tapping-batches/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'DatePalmTappingBatch', id }],
    }),

    createTappingBatch: builder.mutation<
      DatePalmTappingBatch,
      CreateDatePalmTappingBatchDto
    >({
      query: (body) => ({
        url: '/artisanal-gur/tapping-batches',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'DatePalmTappingBatch', id: 'LIST' }],
    }),

    updateBatchBoiling: builder.mutation<
      DatePalmTappingBatch,
      { id: string; body: UpdateBatchBoilingDto }
    >({
      query: ({ id, body }) => ({
        url: `/artisanal-gur/tapping-batches/${id}/boiling`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'DatePalmTappingBatch', id },
        { type: 'DatePalmTappingBatch', id: 'LIST' },
      ],
    }),

    // Lab Tests
    getGurLabTests: builder.query<
      GurPurityLabTest[],
      { gurType?: GurType; purityGrade?: GurPurityGrade } | void
    >({
      query: (params) => ({
        url: '/artisanal-gur/lab-tests',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'GurPurityLabTest' as const, id })),
              { type: 'GurPurityLabTest', id: 'LIST' },
            ]
          : [{ type: 'GurPurityLabTest', id: 'LIST' }],
    }),

    getGurLabTestById: builder.query<GurPurityLabTest, string>({
      query: (id) => `/artisanal-gur/lab-tests/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'GurPurityLabTest', id }],
    }),

    createGurLabTest: builder.mutation<
      GurPurityLabTest,
      CreateGurPurityLabTestDto
    >({
      query: (body) => ({
        url: '/artisanal-gur/lab-tests',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'GurPurityLabTest', id: 'LIST' }],
    }),

    // Artisanal Forward Lots
    getArtisanalLots: builder.query<
      ArtisanalGurLot[],
      { gurType?: GurType; region?: GurRegion; status?: GurLotStatus } | void
    >({
      query: (params) => ({
        url: '/artisanal-gur/artisanal-lots',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'ArtisanalGurLot' as const, id })),
              { type: 'ArtisanalGurLot', id: 'LIST' },
            ]
          : [{ type: 'ArtisanalGurLot', id: 'LIST' }],
    }),

    getArtisanalLotById: builder.query<ArtisanalGurLot, string>({
      query: (id) => `/artisanal-gur/artisanal-lots/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'ArtisanalGurLot', id }],
    }),

    createArtisanalLot: builder.mutation<
      ArtisanalGurLot,
      CreateArtisanalGurLotDto
    >({
      query: (body) => ({
        url: '/artisanal-gur/artisanal-lots',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'ArtisanalGurLot', id: 'LIST' }],
    }),

    purchaseGurLot: builder.mutation<
      ArtisanalGurLot,
      { id: string; body: PurchaseGurLotDto }
    >({
      query: ({ id, body }) => ({
        url: `/artisanal-gur/artisanal-lots/${id}/purchase`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'ArtisanalGurLot', id },
        { type: 'ArtisanalGurLot', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useCalculateGurExtractionMutation,
  useEvaluateGurPurityMutation,
  useGetTappingBatchesQuery,
  useGetTappingBatchByIdQuery,
  useCreateTappingBatchMutation,
  useUpdateBatchBoilingMutation,
  useGetGurLabTestsQuery,
  useGetGurLabTestByIdQuery,
  useCreateGurLabTestMutation,
  useGetArtisanalLotsQuery,
  useGetArtisanalLotByIdQuery,
  useCreateArtisanalLotMutation,
  usePurchaseGurLotMutation,
} = artisanalGurApi;
