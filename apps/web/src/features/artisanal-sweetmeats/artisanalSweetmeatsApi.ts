import { api } from '@/store/api';

export type SweetmeatType =
  | 'BOGURA_SPECIAL_CURD_DOI'
  | 'NATORE_AUTHENTIC_KACHAGOLLA'
  | 'PORABARI_CHAMCHAM'
  | 'COMILLA_RASMALAI_MATRI_BHANDAR'
  | 'NETROKONA_BALISH_MISTI'
  | 'PURE_COW_MILK_CHHANA'
  | 'TRADITIONAL_GAWA_GHEE';

export type SweetmeatRegion =
  | 'BOGURA_SADAR'
  | 'NATORE_SADAR'
  | 'TANGAIL_PORABARI'
  | 'COMILLA_MANOHARPUR'
  | 'NETROKONA_SADAR'
  | 'PABNA_SANTHIA'
  | 'SIRAJGANJ_BELKUCHI';

export type MilkSourceType =
  | 'INDIGENOUS_COW_DESHI'
  | 'CROSSBRED_DAIRY_COW'
  | 'RIVERINE_BUFFALO_MILK';

export type ChhanaCoagulantType =
  | 'NATURAL_WHEY_CULTURE'
  | 'FOOD_GRADE_CITRIC_ACID'
  | 'YOGURT_WHEY_FERMENT';

export type StarchAdulterationTest =
  | 'NEGATIVE_ZERO_TOLERANCE_PASS'
  | 'POSITIVE_STARCH_DETECTED_SEIZED';

export type SweetmeatPurityGrade =
  | 'GRADE_AAA_GI_CERTIFIED_HERITAGE'
  | 'GRADE_A_PURE_ARTISANAL'
  | 'COMMERCIAL_STANDARD'
  | 'REJECTED_ADULTERATED';

export type SweetmeatPackagingType =
  | 'POROUS_CLAY_SRA_500G'
  | 'POROUS_CLAY_SRA_1KG'
  | 'HERMETIC_SWEET_BOX_1KG'
  | 'FOOD_GRADE_TIN_CAN_2KG'
  | 'GLASS_JAR_GAWA_GHEE_500G'
  | 'INSULATED_COLD_BOX_5KG';

export type SweetmeatLotStatus =
  | 'AVAILABLE_FOR_SALE'
  | 'RESERVED_CONTRACT'
  | 'SOLD_OUT';

export interface ChhanaProductionBatch {
  id: string;
  batchNumber: string;
  moiraGuildName: string;
  contactPhone: string;
  region: SweetmeatRegion;
  sweetmeatType: SweetmeatType;
  milkSource: MilkSourceType;
  inputMilkVolumeLiters: number;
  milkFatPct: number;
  milkSnfPct: number;
  coagulantType: ChhanaCoagulantType;
  coagulationTempCelsius: number;
  producedChhanaKg: number;
  chhanaMoisturePct: number;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SweetmeatPurityLabTest {
  id: string;
  testReportNumber: string;
  batchId?: string;
  sweetmeatType: SweetmeatType;
  sampleName: string;
  testingLabName: string;
  milkFatDryMatterPct: number;
  moisturePct: number;
  starchAdulterationStatus: StarchAdulterationTest;
  isDetergentOrUreaDetected: boolean;
  isHydrogenatedFatVanaspatiDetected: boolean;
  isArtificialColoringDetected: boolean;
  totalAcidityLacticPct: number;
  sensoryTasteScore: number;
  purityGrade: SweetmeatPurityGrade;
  isBstiApproved: boolean;
  isGiCompliant: boolean;
  authenticitySealNumber?: string;
  leadChemistName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArtisanalSweetmeatLot {
  id: string;
  lotCode: string;
  batchId?: string;
  labTestId?: string;
  lotTitle: string;
  moiraProducerName: string;
  originRegion: SweetmeatRegion;
  sweetmeatType: SweetmeatType;
  packagingType: SweetmeatPackagingType;
  totalWeightKg: number;
  availableWeightKg: number;
  pricePerKgBdt: number;
  totalValueBdt: number;
  minimumOrderKg: number;
  textureSoftnessRating: number;
  purityGrade: SweetmeatPurityGrade;
  isGiTagged: boolean;
  isRefrigeratedColdChain: boolean;
  status: SweetmeatLotStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CalculateSweetmeatYieldDto {
  sweetmeatType: SweetmeatType;
  inputMilkVolumeLiters: number;
  milkFatPct?: number;
  milkSource: MilkSourceType;
}

export interface SweetmeatYieldCalculationResult {
  sweetmeatType: SweetmeatType;
  inputMilkVolumeLiters: number;
  milkSource: MilkSourceType;
  milkFatPct: number;
  expectedOutputKg: number;
  milkToProductRatio: number;
  recommendedCoagulationTempCelsius: number;
  optimalMoisturePct: number;
  fatRetentionScore: number;
  byproductWheyLiters: number;
  processingAdvice: string;
}

export interface EvaluateSweetmeatPurityDto {
  sweetmeatType: SweetmeatType;
  milkFatDryMatterPct: number;
  moisturePct: number;
  starchAdulterationStatus: StarchAdulterationTest;
  isDetergentOrUreaDetected: boolean;
  isHydrogenatedFatVanaspatiDetected: boolean;
  isArtificialColoringDetected: boolean;
  coagulationTempCelsius: number;
}

export interface SweetmeatPurityEvaluationResult {
  sweetmeatType: SweetmeatType;
  isStarchAdulterated: boolean;
  isSyntheticMilkChemicalsDetected: boolean;
  isVanaspatiDetected: boolean;
  isColoringDetected: boolean;
  isThermalDefect: boolean;
  purityGrade: SweetmeatPurityGrade;
  bstiComplianceApproved: boolean;
  qualityScore: number;
  verdict: string;
  safetyNotes: string;
}

export interface CreateChhanaProductionBatchDto {
  moiraGuildName: string;
  contactPhone: string;
  region: SweetmeatRegion;
  sweetmeatType: SweetmeatType;
  milkSource: MilkSourceType;
  inputMilkVolumeLiters: number;
  milkFatPct: number;
  milkSnfPct: number;
  coagulantType: ChhanaCoagulantType;
  coagulationTempCelsius: number;
  notes?: string;
}

export interface UpdateBatchCookingDto {
  producedChhanaKg: number;
  chhanaMoisturePct: number;
  status?: string;
  notes?: string;
}

export interface CreateSweetmeatPurityLabTestDto {
  batchId?: string;
  sweetmeatType: SweetmeatType;
  sampleName: string;
  testingLabName: string;
  milkFatDryMatterPct: number;
  moisturePct: number;
  starchAdulterationStatus: StarchAdulterationTest;
  isDetergentOrUreaDetected: boolean;
  isHydrogenatedFatVanaspatiDetected: boolean;
  isArtificialColoringDetected: boolean;
  totalAcidityLacticPct: number;
  sensoryTasteScore: number;
  leadChemistName: string;
}

export interface CreateArtisanalSweetmeatLotDto {
  batchId?: string;
  labTestId?: string;
  lotTitle: string;
  moiraProducerName: string;
  originRegion: SweetmeatRegion;
  sweetmeatType: SweetmeatType;
  packagingType: SweetmeatPackagingType;
  totalWeightKg: number;
  pricePerKgBdt: number;
  minimumOrderKg: number;
  textureSoftnessRating: number;
  isGiTagged?: boolean;
  isRefrigeratedColdChain?: boolean;
}

export interface PurchaseSweetmeatLotDto {
  buyerName: string;
  buyerPhone: string;
  orderQuantityKg: number;
  deliveryAddress?: string;
}

export const artisanalSweetmeatsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Calculators
    calculateSweetmeatYield: builder.mutation<
      SweetmeatYieldCalculationResult,
      CalculateSweetmeatYieldDto
    >({
      query: (body) => ({
        url: '/artisanal-sweetmeats/calculator/yield',
        method: 'POST',
        body,
      }),
    }),

    evaluateSweetmeatPurity: builder.mutation<
      SweetmeatPurityEvaluationResult,
      EvaluateSweetmeatPurityDto
    >({
      query: (body) => ({
        url: '/artisanal-sweetmeats/calculator/purity',
        method: 'POST',
        body,
      }),
    }),

    // Chhana Production Batches
    getProductionBatches: builder.query<
      ChhanaProductionBatch[],
      { sweetmeatType?: SweetmeatType; region?: SweetmeatRegion } | void
    >({
      query: (params) => ({
        url: '/artisanal-sweetmeats/production-batches',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'ChhanaProductionBatch' as const, id })),
              { type: 'ChhanaProductionBatch', id: 'LIST' },
            ]
          : [{ type: 'ChhanaProductionBatch', id: 'LIST' }],
    }),

    getProductionBatchById: builder.query<ChhanaProductionBatch, string>({
      query: (id) => `/artisanal-sweetmeats/production-batches/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'ChhanaProductionBatch', id }],
    }),

    createProductionBatch: builder.mutation<
      ChhanaProductionBatch,
      CreateChhanaProductionBatchDto
    >({
      query: (body) => ({
        url: '/artisanal-sweetmeats/production-batches',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'ChhanaProductionBatch', id: 'LIST' }],
    }),

    updateBatchCooking: builder.mutation<
      ChhanaProductionBatch,
      { id: string; body: UpdateBatchCookingDto }
    >({
      query: ({ id, body }) => ({
        url: `/artisanal-sweetmeats/production-batches/${id}/cooking`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'ChhanaProductionBatch', id },
        { type: 'ChhanaProductionBatch', id: 'LIST' },
      ],
    }),

    // Lab Tests
    getSweetmeatLabTests: builder.query<
      SweetmeatPurityLabTest[],
      { sweetmeatType?: SweetmeatType; purityGrade?: SweetmeatPurityGrade } | void
    >({
      query: (params) => ({
        url: '/artisanal-sweetmeats/lab-tests',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'SweetmeatPurityLabTest' as const, id })),
              { type: 'SweetmeatPurityLabTest', id: 'LIST' },
            ]
          : [{ type: 'SweetmeatPurityLabTest', id: 'LIST' }],
    }),

    getSweetmeatLabTestById: builder.query<SweetmeatPurityLabTest, string>({
      query: (id) => `/artisanal-sweetmeats/lab-tests/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'SweetmeatPurityLabTest', id }],
    }),

    createSweetmeatLabTest: builder.mutation<
      SweetmeatPurityLabTest,
      CreateSweetmeatPurityLabTestDto
    >({
      query: (body) => ({
        url: '/artisanal-sweetmeats/lab-tests',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'SweetmeatPurityLabTest', id: 'LIST' }],
    }),

    // Forward Lots
    getArtisanalLots: builder.query<
      ArtisanalSweetmeatLot[],
      { sweetmeatType?: SweetmeatType; region?: SweetmeatRegion; status?: SweetmeatLotStatus } | void
    >({
      query: (params) => ({
        url: '/artisanal-sweetmeats/artisanal-lots',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'ArtisanalSweetmeatLot' as const, id })),
              { type: 'ArtisanalSweetmeatLot', id: 'LIST' },
            ]
          : [{ type: 'ArtisanalSweetmeatLot', id: 'LIST' }],
    }),

    getArtisanalLotById: builder.query<ArtisanalSweetmeatLot, string>({
      query: (id) => `/artisanal-sweetmeats/artisanal-lots/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'ArtisanalSweetmeatLot', id }],
    }),

    createArtisanalLot: builder.mutation<
      ArtisanalSweetmeatLot,
      CreateArtisanalSweetmeatLotDto
    >({
      query: (body) => ({
        url: '/artisanal-sweetmeats/artisanal-lots',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'ArtisanalSweetmeatLot', id: 'LIST' }],
    }),

    purchaseSweetmeatLot: builder.mutation<
      ArtisanalSweetmeatLot,
      { id: string; body: PurchaseSweetmeatLotDto }
    >({
      query: ({ id, body }) => ({
        url: `/artisanal-sweetmeats/artisanal-lots/${id}/purchase`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'ArtisanalSweetmeatLot', id },
        { type: 'ArtisanalSweetmeatLot', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useCalculateSweetmeatYieldMutation,
  useEvaluateSweetmeatPurityMutation,
  useGetProductionBatchesQuery,
  useGetProductionBatchByIdQuery,
  useCreateProductionBatchMutation,
  useUpdateBatchCookingMutation,
  useGetSweetmeatLabTestsQuery,
  useGetSweetmeatLabTestByIdQuery,
  useCreateSweetmeatLabTestMutation,
  useGetArtisanalLotsQuery,
  useGetArtisanalLotByIdQuery,
  useCreateArtisanalLotMutation,
  usePurchaseSweetmeatLotMutation,
} = artisanalSweetmeatsApi;
