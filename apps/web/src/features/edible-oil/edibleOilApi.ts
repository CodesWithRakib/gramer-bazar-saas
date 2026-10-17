import { api } from '@/store/api';

export type OilSeedType =
  | 'MUSTARD_MAGHI_DESHI'
  | 'MUSTARD_BARI_14'
  | 'MUSTARD_TORI_7'
  | 'SESAME_BLACK'
  | 'SESAME_WHITE'
  | 'SUNFLOWER_SEED'
  | 'PEANUT_GROUNDNUT';

export type OilExtractionMethod =
  | 'WOOD_GHANI_COLD_PRESS'
  | 'HYDRAULIC_COLD_PRESS'
  | 'STEEL_EXPELLER_MECHANICAL';

export type GhaniWoodType =
  | 'TAMARIND_WOOD'
  | 'NEEM_WOOD'
  | 'MAHOGANY_WOOD'
  | 'BABOOL_WOOD';

export type PressingBatchStatus =
  | 'CRUSHING_IN_PROGRESS'
  | 'DECANTING_SETTLING'
  | 'TESTING_AND_BOTTLING'
  | 'COMPLETED_DISPATCHED'
  | 'REJECTED_OVERHEATED';

export type ArgemoneTestResult =
  | 'NEGATIVE_PASS_SAFE'
  | 'POSITIVE_CONTAMINATED_SEIZED';

export type AdulterationScreeningStatus =
  | 'PURE_UNADULTERATED'
  | 'ADULTERATED_PALM_DILUTION'
  | 'ADULTERATED_MINERAL_OIL'
  | 'ADULTERATED_TOXIC_ARGEMONE';

export type OilPurityGrade =
  | 'GRADE_AAA_EXTRA_VIRGIN_COLD_PRESSED'
  | 'GRADE_A_STANDARD_VIRGIN'
  | 'COMMERCIAL_REFINED'
  | 'REJECTED_ADULTERATED';

export type OilPackagingType =
  | 'AMBER_GLASS_BOTTLE_500ML'
  | 'AMBER_GLASS_BOTTLE_1L'
  | 'FOOD_GRADE_CAN_5L'
  | 'BULK_STEEL_DRUM_200L';

export type OilLotStatus =
  | 'AVAILABLE_FOR_SALE'
  | 'RESERVED_CONTRACT'
  | 'SOLD_OUT';

export type OilRegion =
  | 'TANGAIL_DELDUAR'
  | 'MANIKGANJ_SINGAIR'
  | 'SIRAJGANJ_ULLAPARA'
  | 'JASHORE_JHIKARGACHA'
  | 'CHUADANGA_DAMURHUDA'
  | 'NATORE_SINGRA';

export interface GhaniPressingBatch {
  id: string;
  batchNumber: string;
  millName: string;
  contactPhone: string;
  region: OilRegion;
  seedType: OilSeedType;
  seedVariety: string;
  inputSeedWeightKg: number;
  extractedOilLiters: number;
  oilcakeWeightKg: number;
  extractionYieldPct: number;
  extractionMethod: OilExtractionMethod;
  ghaniWoodType: GhaniWoodType;
  maxExtractionTempCelsius: number;
  operatingRpm: number;
  crushingHours: number;
  status: PressingBatchStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OilPurityLabTest {
  id: string;
  testReportNumber: string;
  batchId?: string;
  seedType: OilSeedType;
  sampleName: string;
  testingLabName: string;
  freeFattyAcidPct: number;
  peroxideValueMeq: number;
  allylIsothiocyanatePct: number;
  argemoneOilStatus: ArgemoneTestResult;
  adulterationStatus: AdulterationScreeningStatus;
  refractiveIndex: number;
  purityGrade: OilPurityGrade;
  isBstiApproved: boolean;
  authenticitySealNumber?: string;
  leadChemistName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArtisanalOilLot {
  id: string;
  lotCode: string;
  batchId?: string;
  labTestId?: string;
  lotTitle: string;
  millProducerName: string;
  originRegion: OilRegion;
  seedType: OilSeedType;
  packagingType: OilPackagingType;
  totalVolumeLiters: number;
  availableVolumeLiters: number;
  pricePerLiterBdt: number;
  totalValueBdt: number;
  minimumOrderLiters: number;
  pungencyRating: number;
  purityGrade: OilPurityGrade;
  isBstiCertified: boolean;
  isColdPressedCertified: boolean;
  status: OilLotStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CalculateOilExtractionDto {
  seedType: OilSeedType;
  seedWeightKg: number;
  extractionMethod: OilExtractionMethod;
  seedMoisturePct?: number;
}

export interface OilExtractionCalculationResult {
  seedType: OilSeedType;
  seedWeightKg: number;
  extractionMethod: OilExtractionMethod;
  yieldPct: number;
  expectedOilKg: number;
  expectedOilLiters: number;
  oilcakeWeightKg: number;
  oilcakeMarketValueBdt: number;
  isColdPressSafe: boolean;
  maxRecommendedTempCelsius: number;
  pungencyPreservationPct: number;
  processingAdvice: string;
}

export interface EvaluateOilPurityDto {
  seedType: OilSeedType;
  freeFattyAcidPct: number;
  peroxideValueMeq: number;
  allylIsothiocyanatePct: number;
  argemoneOilStatus: ArgemoneTestResult;
  adulterationStatus: AdulterationScreeningStatus;
  maxExtractionTempCelsius: number;
}

export interface OilPurityEvaluationResult {
  seedType: OilSeedType;
  isAdulterated: boolean;
  isArgemoneContaminated: boolean;
  isAcidValueExceeded: boolean;
  isPeroxideExceeded: boolean;
  isOverheated: boolean;
  purityGrade: OilPurityGrade;
  bstiComplianceApproved: boolean;
  qualityScore: number;
  verdict: string;
  safetyNotes: string;
}

export interface CreateGhaniPressingBatchDto {
  millName: string;
  contactPhone: string;
  region: OilRegion;
  seedType: OilSeedType;
  seedVariety: string;
  inputSeedWeightKg: number;
  extractionMethod: OilExtractionMethod;
  ghaniWoodType: GhaniWoodType;
  maxExtractionTempCelsius: number;
  operatingRpm: number;
  crushingHours: number;
  notes?: string;
}

export interface UpdateBatchExtractionDto {
  maxExtractionTempCelsius: number;
  extractedOilLiters: number;
  oilcakeWeightKg: number;
  status?: PressingBatchStatus;
  notes?: string;
}

export interface CreateOilPurityLabTestDto {
  batchId?: string;
  seedType: OilSeedType;
  sampleName: string;
  testingLabName: string;
  freeFattyAcidPct: number;
  peroxideValueMeq: number;
  allylIsothiocyanatePct: number;
  argemoneOilStatus: ArgemoneTestResult;
  adulterationStatus: AdulterationScreeningStatus;
  refractiveIndex: number;
  leadChemistName: string;
}

export interface CreateArtisanalOilLotDto {
  batchId?: string;
  labTestId?: string;
  lotTitle: string;
  millProducerName: string;
  originRegion: OilRegion;
  seedType: OilSeedType;
  packagingType: OilPackagingType;
  totalVolumeLiters: number;
  pricePerLiterBdt: number;
  minimumOrderLiters: number;
  pungencyRating: number;
  isBstiCertified?: boolean;
  isColdPressedCertified?: boolean;
}

export interface PurchaseOilLotDto {
  buyerName: string;
  buyerPhone: string;
  orderQuantityLiters: number;
}

export const edibleOilApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Calculators
    calculateOilExtraction: builder.mutation<
      OilExtractionCalculationResult,
      CalculateOilExtractionDto
    >({
      query: (body) => ({
        url: '/edible-oil/calculator/extraction',
        method: 'POST',
        body,
      }),
    }),

    evaluateOilPurity: builder.mutation<
      OilPurityEvaluationResult,
      EvaluateOilPurityDto
    >({
      query: (body) => ({
        url: '/edible-oil/calculator/purity',
        method: 'POST',
        body,
      }),
    }),

    // Ghani Pressing Batches
    getGhaniBatches: builder.query<
      GhaniPressingBatch[],
      { seedType?: OilSeedType; region?: OilRegion; status?: PressingBatchStatus } | void
    >({
      query: (params) => ({
        url: '/edible-oil/pressing-batches',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'GhaniPressingBatch' as const, id })),
              { type: 'GhaniPressingBatch', id: 'LIST' },
            ]
          : [{ type: 'GhaniPressingBatch', id: 'LIST' }],
    }),

    getGhaniBatchById: builder.query<GhaniPressingBatch, string>({
      query: (id) => `/edible-oil/pressing-batches/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'GhaniPressingBatch', id }],
    }),

    createGhaniBatch: builder.mutation<
      GhaniPressingBatch,
      CreateGhaniPressingBatchDto
    >({
      query: (body) => ({
        url: '/edible-oil/pressing-batches',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'GhaniPressingBatch', id: 'LIST' }],
    }),

    updateBatchExtraction: builder.mutation<
      GhaniPressingBatch,
      { id: string; body: UpdateBatchExtractionDto }
    >({
      query: ({ id, body }) => ({
        url: `/edible-oil/pressing-batches/${id}/extraction`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'GhaniPressingBatch', id },
        { type: 'GhaniPressingBatch', id: 'LIST' },
      ],
    }),

    // Oil Purity Lab Tests
    getOilLabTests: builder.query<
      OilPurityLabTest[],
      { seedType?: OilSeedType; purityGrade?: OilPurityGrade } | void
    >({
      query: (params) => ({
        url: '/edible-oil/lab-tests',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'OilPurityLabTest' as const, id })),
              { type: 'OilPurityLabTest', id: 'LIST' },
            ]
          : [{ type: 'OilPurityLabTest', id: 'LIST' }],
    }),

    getOilLabTestById: builder.query<OilPurityLabTest, string>({
      query: (id) => `/edible-oil/lab-tests/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'OilPurityLabTest', id }],
    }),

    createOilLabTest: builder.mutation<
      OilPurityLabTest,
      CreateOilPurityLabTestDto
    >({
      query: (body) => ({
        url: '/edible-oil/lab-tests',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'OilPurityLabTest', id: 'LIST' }],
    }),

    // Artisanal Oil Forward Lots
    getArtisanalOilLots: builder.query<
      ArtisanalOilLot[],
      { seedType?: OilSeedType; region?: OilRegion; status?: OilLotStatus } | void
    >({
      query: (params) => ({
        url: '/edible-oil/artisanal-lots',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'ArtisanalOilLot' as const, id })),
              { type: 'ArtisanalOilLot', id: 'LIST' },
            ]
          : [{ type: 'ArtisanalOilLot', id: 'LIST' }],
    }),

    getArtisanalOilLotById: builder.query<ArtisanalOilLot, string>({
      query: (id) => `/edible-oil/artisanal-lots/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'ArtisanalOilLot', id }],
    }),

    createArtisanalOilLot: builder.mutation<
      ArtisanalOilLot,
      CreateArtisanalOilLotDto
    >({
      query: (body) => ({
        url: '/edible-oil/artisanal-lots',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'ArtisanalOilLot', id: 'LIST' }],
    }),

    purchaseOilLot: builder.mutation<
      ArtisanalOilLot,
      { id: string; body: PurchaseOilLotDto }
    >({
      query: ({ id, body }) => ({
        url: `/edible-oil/artisanal-lots/${id}/purchase`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'ArtisanalOilLot', id },
        { type: 'ArtisanalOilLot', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useCalculateOilExtractionMutation,
  useEvaluateOilPurityMutation,
  useGetGhaniBatchesQuery,
  useGetGhaniBatchByIdQuery,
  useCreateGhaniBatchMutation,
  useUpdateBatchExtractionMutation,
  useGetOilLabTestsQuery,
  useGetOilLabTestByIdQuery,
  useCreateOilLabTestMutation,
  useGetArtisanalOilLotsQuery,
  useGetArtisanalOilLotByIdQuery,
  useCreateArtisanalOilLotMutation,
  usePurchaseOilLotMutation,
} = edibleOilApi;
