import { api } from '@/store/api';

export type FruitType = 'MANGO' | 'LITCHI';

export type OrchardRegion =
  | 'CHAPAINAWABGANJ_SHIBGANJ'
  | 'RAJSHAHI_BAGHA_CHARGHAT'
  | 'DINAJPUR_BIROL_SADAR'
  | 'MEHERPUR_MUJIBNAGAR'
  | 'CHUADANGA_DAMURHUDA'
  | 'RANGPUR_MITHAPUKUR'
  | 'PABNA_ISHWARDI';

export type FruitCultivar =
  | 'KHIRSAPAT_HIMSAGAR'
  | 'LANGRA'
  | 'AMRAPALI'
  | 'FAZLI'
  | 'HARIBHANGA'
  | 'GOURMATI'
  | 'ASHWINA'
  | 'DINAJPUR_BEDANA_LITCHI'
  | 'CHINA_3_LITCHI'
  | 'BOMBAY_LITCHI'
  | 'MADRAJI_LITCHI';

export type FruitBaggingStatus =
  | 'BAG_PROTECTED'
  | 'PARTIALLY_BAGGED'
  | 'CONVENTIONAL_UNBAGGED';

export type OrchardAuctionStatus =
  | 'AUCTION_OPEN'
  | 'BID_ACCEPTED'
  | 'PRE_HARVEST_MONITORING'
  | 'HARVEST_IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type HwtTreatmentStatus =
  | 'PENDING_TREATMENT'
  | 'IMMERSION_ACTIVE'
  | 'COOLING_AND_DRYING'
  | 'QUARANTINE_CERTIFIED_EXPORT'
  | 'QUARANTINE_REJECTED';

export type ChemicalMrlStatus =
  | 'TEST_PASSED_MRL_SAFE'
  | 'PENDING_LAB_ANALYSIS'
  | 'RESIDUE_EXCEEDED_FAIL';

export type ColdChainTransitStatus =
  | 'OPTIMAL_CHILLED'
  | 'TEMPERATURE_SPIKE_ALERT'
  | 'WARMING_RISK';

export type PackagingType =
  | 'CORRUGATED_5KG_VENTILATED'
  | 'PLASTIC_CRATE_20KG'
  | 'MODIFIED_ATMOSPHERE_POUCH';

export type DispatchGradingQuality =
  | 'EXPORT_GRADE_SUPERIOR'
  | 'DOMESTIC_GRADE_A'
  | 'COMMERCIAL_GRADE_B';

export interface OrchardAuctionBidRecord {
  id: string;
  bidderName: string;
  bidderPhone: string;
  bidAmountBdt: number;
  placedAt: string;
}

export interface OrchardTreeAuctionLot {
  id: string;
  lotNumber: string;
  orchardName: string;
  growerName: string;
  growerPhone: string;
  region: OrchardRegion;
  mouzaPlotNumber?: string;
  fruitType: FruitType;
  cultivar: FruitCultivar;
  isGiCertified: boolean;
  giRegistrationNumber?: string;
  totalTrees: number;
  estimatedYieldKg: number;
  treeAgeYears: number;
  floweringFruitSetPct: number;
  fruitBaggingStatus: FruitBaggingStatus;
  baggedFruitsCount: number;
  baseReservePriceBdt: number;
  currentHighestBidBdt: number;
  highestBidderBrokerName?: string;
  highestBidderBrokerPhone?: string;
  advanceEscrowPct: number;
  advanceEscrowPaidBdt: number;
  status: OrchardAuctionStatus;
  auctionClosingDate: string;
  expectedHarvestStartDate: string;
  bids: OrchardAuctionBidRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface PhytosanitaryHwtBatch {
  id: string;
  batchNumber: string;
  orchardLotId?: string;
  orchardName: string;
  fruitType: FruitType;
  cultivar: FruitCultivar;
  totalFreshWeightKg: number;
  cratesCount: number;
  hwtFacilityLocation: string;
  waterTempCelsius: number;
  immersionDurationMinutes: number;
  fruitCoreTempCelsius: number;
  hydrocoolingTempCelsius: number;
  chemicalMrlStatus: ChemicalMrlStatus;
  pesticideMrlPpm: number;
  quarantinePassIssued: boolean;
  phytosanitaryCertificateNumber?: string;
  inspectorName: string;
  inspectorDesignation: string;
  status: HwtTreatmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrchardHarvestDispatch {
  id: string;
  dispatchCode: string;
  orchardLotId?: string;
  hwtBatchId?: string;
  fruitType: FruitType;
  cultivar: FruitCultivar;
  dispatchWeightKg: number;
  cratesCount: number;
  packagingType: PackagingType;
  brixSugarDegree: number;
  gradingQuality: DispatchGradingQuality;
  reeferVanPlateNumber: string;
  reeferSetpointCelsius: number;
  currentTransitTempCelsius: number;
  currentTransitHumidityPct: number;
  coldChainStatus: ColdChainTransitStatus;
  originHub: string;
  destinationMarket: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalculateOrchardValuationDto {
  fruitType: FruitType;
  cultivar: FruitCultivar;
  treeCount: number;
  averageYieldKgPerTree: number;
  floweringFruitSetPct: number;
  fruitBaggingStatus: FruitBaggingStatus;
  isGiCertified?: boolean;
}

export interface OrchardValuationResult {
  fruitType: FruitType;
  cultivar: FruitCultivar;
  treeCount: number;
  basePricePerKg: number;
  effectivePricePerKg: number;
  fruitSetFactor: number;
  baggingProtectionBonusPct: number;
  giPremiumBonusPct: number;
  effectiveYieldKg: number;
  recommendedReservePriceBdt: number;
  escrowPaymentSchedule: {
    tranche1SigningBdt: number;
    tranche2BaggingBdt: number;
    tranche3HarvestBdt: number;
    tranche1Pct: number;
    tranche2Pct: number;
    tranche3Pct: number;
  };
  exportReadinessNote: string;
}

export interface EvaluateHwtQuarantineDto {
  fruitType: FruitType;
  waterTempCelsius: number;
  immersionDurationMinutes: number;
  fruitCoreTempCelsius: number;
  chemicalMrlPpm: number;
  transitTempCelsius: number;
  transitHumidityPct: number;
}

export interface HwtEvaluationResult {
  hwtVerdict: string;
  hwtNotes: string;
  mrlVerdict: string;
  chemicalMrlPpm: number;
  mrlThresholdPpm: number;
  isMrlSafe: boolean;
  coldChainStatus: ColdChainTransitStatus;
  coldChainNotes: string;
  exportApproved: boolean;
  recommendation: string;
}

export interface CreateOrchardAuctionLotDto {
  orchardName: string;
  growerName: string;
  growerPhone: string;
  region: OrchardRegion;
  mouzaPlotNumber?: string;
  fruitType: FruitType;
  cultivar: FruitCultivar;
  isGiCertified?: boolean;
  giRegistrationNumber?: string;
  totalTrees: number;
  estimatedYieldKg: number;
  treeAgeYears: number;
  floweringFruitSetPct: number;
  fruitBaggingStatus: FruitBaggingStatus;
  baggedFruitsCount?: number;
  baseReservePriceBdt: number;
  advanceEscrowPct?: number;
  auctionClosingDate?: string;
  expectedHarvestStartDate?: string;
}

export interface PlaceOrchardBidDto {
  bidderName: string;
  bidderPhone: string;
  bidAmountBdt: number;
}

export interface CreatePhytosanitaryHwtBatchDto {
  orchardLotId?: string;
  orchardName: string;
  fruitType: FruitType;
  cultivar: FruitCultivar;
  totalFreshWeightKg: number;
  cratesCount: number;
  hwtFacilityLocation: string;
  waterTempCelsius: number;
  immersionDurationMinutes: number;
  fruitCoreTempCelsius: number;
  hydrocoolingTempCelsius: number;
  chemicalMrlStatus: ChemicalMrlStatus;
  pesticideMrlPpm: number;
  inspectorName: string;
  inspectorDesignation: string;
}

export interface CreateOrchardHarvestDispatchDto {
  orchardLotId?: string;
  hwtBatchId?: string;
  fruitType: FruitType;
  cultivar: FruitCultivar;
  dispatchWeightKg: number;
  cratesCount: number;
  packagingType: PackagingType;
  brixSugarDegree: number;
  gradingQuality: DispatchGradingQuality;
  reeferVanPlateNumber: string;
  reeferSetpointCelsius: number;
  currentTransitTempCelsius: number;
  currentTransitHumidityPct: number;
  originHub: string;
  destinationMarket: string;
}

export interface UpdateDispatchColdChainDto {
  currentTransitTempCelsius: number;
  currentTransitHumidityPct: number;
  coldChainStatus?: ColdChainTransitStatus;
  status?: string;
}

export const orchardAuctionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Calculators
    calculateOrchardValuation: builder.mutation<
      OrchardValuationResult,
      CalculateOrchardValuationDto
    >({
      query: (body) => ({
        url: '/orchard-auction/calculator/valuation',
        method: 'POST',
        body,
      }),
    }),

    evaluateHwtQuarantine: builder.mutation<
      HwtEvaluationResult,
      EvaluateHwtQuarantineDto
    >({
      query: (body) => ({
        url: '/orchard-auction/calculator/hwt-quarantine',
        method: 'POST',
        body,
      }),
    }),

    // Auction Lots
    getOrchardAuctionLots: builder.query<
      OrchardTreeAuctionLot[],
      { region?: OrchardRegion; fruitType?: FruitType; status?: OrchardAuctionStatus } | void
    >({
      query: (params) => ({
        url: '/orchard-auction/lots',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'OrchardAuctionLot' as const, id })),
              { type: 'OrchardAuctionLot', id: 'LIST' },
            ]
          : [{ type: 'OrchardAuctionLot', id: 'LIST' }],
    }),

    getOrchardAuctionLotById: builder.query<OrchardTreeAuctionLot, string>({
      query: (id) => `/orchard-auction/lots/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'OrchardAuctionLot', id }],
    }),

    createOrchardAuctionLot: builder.mutation<
      OrchardTreeAuctionLot,
      CreateOrchardAuctionLotDto
    >({
      query: (body) => ({
        url: '/orchard-auction/lots',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'OrchardAuctionLot', id: 'LIST' }],
    }),

    placeOrchardBid: builder.mutation<
      OrchardTreeAuctionLot,
      { id: string; body: PlaceOrchardBidDto }
    >({
      query: ({ id, body }) => ({
        url: `/orchard-auction/lots/${id}/bids`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'OrchardAuctionLot', id },
        { type: 'OrchardAuctionLot', id: 'LIST' },
      ],
    }),

    // HWT Batches
    getPhytosanitaryHwtBatches: builder.query<
      PhytosanitaryHwtBatch[],
      { fruitType?: FruitType; status?: HwtTreatmentStatus } | void
    >({
      query: (params) => ({
        url: '/orchard-auction/hwt-batches',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: 'PhytosanitaryHwtBatch' as const,
                id,
              })),
              { type: 'PhytosanitaryHwtBatch', id: 'LIST' },
            ]
          : [{ type: 'PhytosanitaryHwtBatch', id: 'LIST' }],
    }),

    getPhytosanitaryHwtBatchById: builder.query<PhytosanitaryHwtBatch, string>({
      query: (id) => `/orchard-auction/hwt-batches/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'PhytosanitaryHwtBatch', id }],
    }),

    createPhytosanitaryHwtBatch: builder.mutation<
      PhytosanitaryHwtBatch,
      CreatePhytosanitaryHwtBatchDto
    >({
      query: (body) => ({
        url: '/orchard-auction/hwt-batches',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'PhytosanitaryHwtBatch', id: 'LIST' }],
    }),

    // Cold Chain Dispatches
    getOrchardDispatches: builder.query<
      OrchardHarvestDispatch[],
      { status?: string } | void
    >({
      query: (params) => ({
        url: '/orchard-auction/dispatches',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: 'OrchardHarvestDispatch' as const,
                id,
              })),
              { type: 'OrchardHarvestDispatch', id: 'LIST' },
            ]
          : [{ type: 'OrchardHarvestDispatch', id: 'LIST' }],
    }),

    getOrchardDispatchById: builder.query<OrchardHarvestDispatch, string>({
      query: (id) => `/orchard-auction/dispatches/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'OrchardHarvestDispatch', id }],
    }),

    createOrchardDispatch: builder.mutation<
      OrchardHarvestDispatch,
      CreateOrchardHarvestDispatchDto
    >({
      query: (body) => ({
        url: '/orchard-auction/dispatches',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'OrchardHarvestDispatch', id: 'LIST' }],
    }),

    updateDispatchColdChain: builder.mutation<
      OrchardHarvestDispatch,
      { id: string; body: UpdateDispatchColdChainDto }
    >({
      query: ({ id, body }) => ({
        url: `/orchard-auction/dispatches/${id}/cold-chain`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'OrchardHarvestDispatch', id },
        { type: 'OrchardHarvestDispatch', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useCalculateOrchardValuationMutation,
  useEvaluateHwtQuarantineMutation,
  useGetOrchardAuctionLotsQuery,
  useGetOrchardAuctionLotByIdQuery,
  useCreateOrchardAuctionLotMutation,
  usePlaceOrchardBidMutation,
  useGetPhytosanitaryHwtBatchesQuery,
  useGetPhytosanitaryHwtBatchByIdQuery,
  useCreatePhytosanitaryHwtBatchMutation,
  useGetOrchardDispatchesQuery,
  useGetOrchardDispatchByIdQuery,
  useCreateOrchardDispatchMutation,
  useUpdateDispatchColdChainMutation,
} = orchardAuctionApi;
