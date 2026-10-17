import { api } from '@/store/api';

export type SpiceType =
  | 'CHILLI'
  | 'TURMERIC'
  | 'GINGER'
  | 'GARLIC'
  | 'CORIANDER'
  | 'BLACK_CUMIN'
  | 'ONION_SEED';

export type SpiceRegion =
  | 'BOGURA_SARIAKANDI_CHAR'
  | 'NATORE_GURUDASPUR'
  | 'PABNA_SANTHIA'
  | 'FARIDPUR_SADAR'
  | 'BANDARBAN_HILL_TRACTS'
  | 'RAJBARI_PANGSHA'
  | 'LALMONIRHAT_HATIBANDHA';

export type DryingMethod =
  | 'SOLAR_PARABOLIC_TUNNEL'
  | 'MECHANICAL_BIOMASS_DRYER'
  | 'HYGIENIC_RAISED_BED_SUN';

export type DryingBatchStatus =
  | 'DRYING_IN_PROGRESS'
  | 'CURING_AND_CONDITIONING'
  | 'DEHYDRATION_COMPLETED'
  | 'REJECTED_MOLD';

export type AflatoxinRiskLevel =
  | 'SAFE_ZERO_RISK'
  | 'MODERATE_CONDENSATION_WATCH'
  | 'CRITICAL_MOLD_HAZARD';

export type AdulterationTestStatus =
  | 'NEGATIVE_NOT_DETECTED'
  | 'POSITIVE_ADULTERATED';

export type SpicePurityGrade =
  | 'PURE_GRADE_AAA_EXPORT'
  | 'STANDARD_GRADE_A_DOMESTIC'
  | 'SUBSTANDARD_INDUSTRIAL'
  | 'ADULTERATED_REJECTED';

export type SpiceFormFactor =
  | 'WHOLE_DRIED_POD_RHIZOME'
  | 'FINE_GROUND_POWDER'
  | 'CRACKED_COARSE_FLAKES'
  | 'CERTIFIED_SEED';

export type SpicePackagingType =
  | 'HERMETIC_GRAINPRO_BAG_50KG'
  | 'NITROGEN_FLUSHED_FOIL_POUCH_1KG'
  | 'JUTE_GUNNY_SACK_60KG';

export type SpiceLotStatus =
  | 'AVAILABLE_FOR_SALE'
  | 'RESERVED_CONTRACT'
  | 'DISPATCHED_SOLD';

export interface SpiceDryingBatch {
  id: string;
  batchNumber: string;
  growerCoopName: string;
  contactPhone: string;
  region: SpiceRegion;
  spiceType: SpiceType;
  varietyName: string;
  initialFreshWeightKg: number;
  currentDryWeightKg: number;
  dryingMethod: DryingMethod;
  chamberTempCelsius: number;
  chamberHumidityPct: number;
  currentMoisturePct: number;
  dryingDaysElapsed: number;
  aflatoxinRiskLevel: AflatoxinRiskLevel;
  status: DryingBatchStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SpicePurityLabTest {
  id: string;
  testReportNumber: string;
  batchId?: string;
  spiceType: SpiceType;
  sampleName: string;
  testingLabName: string;
  sudanDyeStatus: AdulterationTestStatus;
  leadChromateStatus: AdulterationTestStatus;
  metanilYellowStatus: AdulterationTestStatus;
  moisturePct: number;
  aflatoxinB1Ppb: number;
  curcuminPct?: number;
  scovilleHeatUnits?: number;
  essentialOilPct?: number;
  purityGrade: SpicePurityGrade;
  certificateIssued: boolean;
  authenticitySealNumber?: string;
  leadChemistName: string;
  createdAt: string;
  updatedAt: string;
}

export interface SpiceForwardLot {
  id: string;
  lotCode: string;
  dryingBatchId?: string;
  labTestId?: string;
  lotTitle: string;
  producerName: string;
  originRegion: SpiceRegion;
  spiceType: SpiceType;
  formFactor: SpiceFormFactor;
  totalQuantityKg: number;
  availableQuantityKg: number;
  packagingType: SpicePackagingType;
  pricePerKgBdt: number;
  totalValueBdt: number;
  minimumOrderKg: number;
  isBstiCertified: boolean;
  isBarisrcVerified: boolean;
  purityGrade: SpicePurityGrade;
  status: SpiceLotStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CalculateSpiceDehydrationDto {
  spiceType: SpiceType;
  freshWeightKg: number;
  initialMoisturePct: number;
  targetMoisturePct: number;
  dryingMethod: DryingMethod;
}

export interface SpiceDehydrationResult {
  spiceType: SpiceType;
  freshWeightKg: number;
  initialMoisturePct: number;
  targetMoisturePct: number;
  dryingMethod: DryingMethod;
  dryMatterKg: number;
  finishedDryWeightKg: number;
  evaporatedWaterKg: number;
  yieldRatio: number;
  yieldPct: number;
  dryingDaysEstimate: number;
  spoilageRiskPct: number;
  cleanlinessBonusPct: number;
  qualityAdvisory: string;
}

export interface EvaluateSpicePurityDto {
  spiceType: SpiceType;
  sudanDyeStatus: AdulterationTestStatus;
  leadChromateStatus: AdulterationTestStatus;
  metanilYellowStatus: AdulterationTestStatus;
  moisturePct: number;
  aflatoxinB1Ppb: number;
  curcuminPct?: number;
  scovilleHeatUnits?: number;
  essentialOilPct?: number;
}

export interface SpicePurityEvaluationResult {
  spiceType: SpiceType;
  isAdulterated: boolean;
  isAflatoxinExceeded: boolean;
  isMoistureExceeded: boolean;
  purityGrade: SpicePurityGrade;
  verdict: string;
  safetyNotes: string;
  potencyScore: number;
  bstiComplianceApproved: boolean;
}

export interface CreateSpiceDryingBatchDto {
  growerCoopName: string;
  contactPhone: string;
  region: SpiceRegion;
  spiceType: SpiceType;
  varietyName: string;
  initialFreshWeightKg: number;
  dryingMethod: DryingMethod;
  chamberTempCelsius: number;
  chamberHumidityPct: number;
  currentMoisturePct: number;
}

export interface UpdateBatchTelemetryDto {
  chamberTempCelsius: number;
  chamberHumidityPct: number;
  currentMoisturePct: number;
  dryingDaysElapsed: number;
  aflatoxinRiskLevel?: AflatoxinRiskLevel;
  status?: DryingBatchStatus;
}

export interface CreateSpicePurityLabTestDto {
  batchId?: string;
  spiceType: SpiceType;
  sampleName: string;
  testingLabName: string;
  sudanDyeStatus: AdulterationTestStatus;
  leadChromateStatus: AdulterationTestStatus;
  metanilYellowStatus: AdulterationTestStatus;
  moisturePct: number;
  aflatoxinB1Ppb: number;
  curcuminPct?: number;
  scovilleHeatUnits?: number;
  essentialOilPct?: number;
  leadChemistName: string;
}

export interface CreateSpiceForwardLotDto {
  dryingBatchId?: string;
  labTestId?: string;
  lotTitle: string;
  producerName: string;
  originRegion: SpiceRegion;
  spiceType: SpiceType;
  formFactor: SpiceFormFactor;
  totalQuantityKg: number;
  packagingType: SpicePackagingType;
  pricePerKgBdt: number;
  minimumOrderKg: number;
  isBstiCertified?: boolean;
  isBarisrcVerified?: boolean;
}

export interface PurchaseSpiceLotDto {
  buyerName: string;
  buyerPhone: string;
  orderQuantityKg: number;
}

export const spiceMarketApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Calculators
    calculateSpiceDehydration: builder.mutation<
      SpiceDehydrationResult,
      CalculateSpiceDehydrationDto
    >({
      query: (body) => ({
        url: '/spice-market/calculator/dehydration',
        method: 'POST',
        body,
      }),
    }),

    evaluateSpicePurity: builder.mutation<
      SpicePurityEvaluationResult,
      EvaluateSpicePurityDto
    >({
      query: (body) => ({
        url: '/spice-market/calculator/purity',
        method: 'POST',
        body,
      }),
    }),

    // Drying Batches
    getSpiceDryingBatches: builder.query<
      SpiceDryingBatch[],
      { spiceType?: SpiceType; region?: SpiceRegion; status?: DryingBatchStatus } | void
    >({
      query: (params) => ({
        url: '/spice-market/drying-batches',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'SpiceDryingBatch' as const, id })),
              { type: 'SpiceDryingBatch', id: 'LIST' },
            ]
          : [{ type: 'SpiceDryingBatch', id: 'LIST' }],
    }),

    getSpiceDryingBatchById: builder.query<SpiceDryingBatch, string>({
      query: (id) => `/spice-market/drying-batches/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'SpiceDryingBatch', id }],
    }),

    createSpiceDryingBatch: builder.mutation<
      SpiceDryingBatch,
      CreateSpiceDryingBatchDto
    >({
      query: (body) => ({
        url: '/spice-market/drying-batches',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'SpiceDryingBatch', id: 'LIST' }],
    }),

    updateBatchTelemetry: builder.mutation<
      SpiceDryingBatch,
      { id: string; body: UpdateBatchTelemetryDto }
    >({
      query: ({ id, body }) => ({
        url: `/spice-market/drying-batches/${id}/telemetry`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'SpiceDryingBatch', id },
        { type: 'SpiceDryingBatch', id: 'LIST' },
      ],
    }),

    // Lab Tests
    getSpiceLabTests: builder.query<
      SpicePurityLabTest[],
      { spiceType?: SpiceType; purityGrade?: SpicePurityGrade } | void
    >({
      query: (params) => ({
        url: '/spice-market/lab-tests',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'SpicePurityLabTest' as const, id })),
              { type: 'SpicePurityLabTest', id: 'LIST' },
            ]
          : [{ type: 'SpicePurityLabTest', id: 'LIST' }],
    }),

    getSpiceLabTestById: builder.query<SpicePurityLabTest, string>({
      query: (id) => `/spice-market/lab-tests/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'SpicePurityLabTest', id }],
    }),

    createSpiceLabTest: builder.mutation<
      SpicePurityLabTest,
      CreateSpicePurityLabTestDto
    >({
      query: (body) => ({
        url: '/spice-market/lab-tests',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'SpicePurityLabTest', id: 'LIST' }],
    }),

    // Forward Pure Lots
    getSpiceForwardLots: builder.query<
      SpiceForwardLot[],
      { spiceType?: SpiceType; region?: SpiceRegion; status?: SpiceLotStatus } | void
    >({
      query: (params) => ({
        url: '/spice-market/forward-lots',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'SpiceForwardLot' as const, id })),
              { type: 'SpiceForwardLot', id: 'LIST' },
            ]
          : [{ type: 'SpiceForwardLot', id: 'LIST' }],
    }),

    getSpiceForwardLotById: builder.query<SpiceForwardLot, string>({
      query: (id) => `/spice-market/forward-lots/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'SpiceForwardLot', id }],
    }),

    createSpiceForwardLot: builder.mutation<
      SpiceForwardLot,
      CreateSpiceForwardLotDto
    >({
      query: (body) => ({
        url: '/spice-market/forward-lots',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'SpiceForwardLot', id: 'LIST' }],
    }),

    purchaseSpiceLot: builder.mutation<
      SpiceForwardLot,
      { id: string; body: PurchaseSpiceLotDto }
    >({
      query: ({ id, body }) => ({
        url: `/spice-market/forward-lots/${id}/purchase`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'SpiceForwardLot', id },
        { type: 'SpiceForwardLot', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useCalculateSpiceDehydrationMutation,
  useEvaluateSpicePurityMutation,
  useGetSpiceDryingBatchesQuery,
  useGetSpiceDryingBatchByIdQuery,
  useCreateSpiceDryingBatchMutation,
  useUpdateBatchTelemetryMutation,
  useGetSpiceLabTestsQuery,
  useGetSpiceLabTestByIdQuery,
  useCreateSpiceLabTestMutation,
  useGetSpiceForwardLotsQuery,
  useGetSpiceForwardLotByIdQuery,
  useCreateSpiceForwardLotMutation,
  usePurchaseSpiceLotMutation,
} = spiceMarketApi;
