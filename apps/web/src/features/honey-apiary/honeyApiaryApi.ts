import { api } from '@/store/api';

export type HoneyFloralSource =
  | 'SUNDARBANS_KHALISHA_WILD'
  | 'SUNDARBANS_GORAN_GEWA'
  | 'MUSTARD_BLOSSOM_CREAM'
  | 'LITCHI_ORCHARD_BLOSSOM'
  | 'BLACK_CUMIN_KALOJEERA'
  | 'CORIANDER_BLOSSOM';

export type HoneyHarvestType =
  | 'WILD_FOREST_MOUWAL_HARVEST'
  | 'MIGRATORY_BOX_APIARY'
  | 'HOMESTEAD_TRADITIONAL_APIARY';

export type PurityLabGrade =
  | 'GRADE_A_RAW_UNPROCESSED'
  | 'GRADE_B_DOMESTIC_STANDARD'
  | 'SUBSTANDARD_HIGH_MOISTURE'
  | 'ADULTERATED_HFCS_OR_C4_POSITIVE';

export type BeeSpecies =
  | 'APIS_DORSATA'
  | 'APIS_CERANA'
  | 'APIS_MELLIFERA'
  | 'APIS_FLOREA';

export type SuperfoodProductType =
  | 'RAW_FILTERED_HONEY'
  | 'COMB_HONEY_IN_FRAME'
  | 'FRESH_FROZEN_ROYAL_JELLY'
  | 'BEE_PROPOLIS_RESIN'
  | 'RAW_BEE_POLLEN_GRANULES'
  | 'BEE_VENOM_EXTRACT';

export type ApiaryBoxHealthStatus =
  | 'HEALTHY_BROOD_ACTIVE'
  | 'HONEY_SUPER_FULL_READY_TO_EXTRACT'
  | 'VARROA_MITE_INFESTATION_ALERT'
  | 'MIGRATION_TRANSIT';

export interface HoneyHarvestLot {
  id: string;
  lotNumber: string;
  beekeeperId: string;
  beekeeperName: string;
  beekeeperPhone: string;
  district: string;
  harvestType: HoneyHarvestType;
  floralSource: HoneyFloralSource;
  beeSpecies: BeeSpecies;
  harvestDate: string;
  grossVolumeKg: number;
  moisturePercentage: number;
  c4SugarIsotopeRatioPermil: number;
  hmfFreshnessMgPerKg: number;
  purityGrade: PurityLabGrade;
  labCertificateNo: string | null;
  forestDeptPermitNo: string | null;
  wholesalePricePerKgBdt: number;
  stockQuantityKg: number;
  isForestCertifiedWild: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiaryColonyBox {
  id: string;
  boxCode: string;
  beekeeperId: string;
  beekeeperName: string;
  beeSpecies: BeeSpecies;
  currentDistrict: string;
  currentUpazila: string;
  gpsLatitude: number;
  gpsLongitude: number;
  activeFloralCrop: string;
  framesCount: number;
  queenAgeMonths: number;
  healthStatus: ApiaryBoxHealthStatus;
  estimatedHoneyYieldKg: number;
  lastInspectedAt: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoyalJellySuperfoodBatch {
  id: string;
  batchNumber: string;
  productType: SuperfoodProductType;
  producerName: string;
  harvestLocation: string;
  weightGrams: number;
  tenHdaPercentage: number;
  storageTemperatureCelsius: number;
  coldChainStatus: string;
  priceBdt: number;
  availableStockCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface HoneyOverviewStats {
  activeHarvestLotsCount: number;
  totalHarvestedVolumeKg: number;
  totalForestWildHoneyKg: number;
  averageMoisturePercentage: number;
  activeApiaryBoxesCount: number;
  averageTenHdaPercentage: number;
  totalSuperfoodStockCount: number;
}

export interface CalculateHoneyPurityRequest {
  moisturePercentage: number;
  c4SugarIsotopeRatioPermil: number;
  hmfFreshnessMgPerKg: number;
  floralSource?: HoneyFloralSource;
}

export interface CalculateHoneyPurityResponse {
  moisturePercentage: number;
  c4SugarIsotopeRatioPermil: number;
  hmfFreshnessMgPerKg: number;
  purityGrade: PurityLabGrade;
  bstiCompliance: boolean;
  adulterationWarning: string | null;
  isC4Adulterated: boolean;
  isFermentationRisk: boolean;
  recommendedRetailPriceBdt: number;
  purityScoreOutOf100: number;
  auditExplanation: string;
}

export interface CalculateApiaryMigrationYieldRequest {
  beeBoxesCount: number;
  floralSource: HoneyFloralSource;
  daysInBloom: number;
}

export interface CalculateApiaryMigrationYieldResponse {
  beeBoxesCount: number;
  floralSource: HoneyFloralSource;
  daysInBloom: number;
  estimatedYieldKg: number;
  wholesaleRatePerKgBdt: number;
  estimatedGrossRevenueBdt: number;
  estimatedRelocationCostBdt: number;
  netProfitBdt: number;
  hostFarmerCropBoostPercent: number;
  pollinationEcosystemValueNote: string;
}

export interface CreateHoneyHarvestLotRequest {
  beekeeperName: string;
  beekeeperPhone: string;
  district: string;
  harvestType: HoneyHarvestType;
  floralSource: HoneyFloralSource;
  beeSpecies: BeeSpecies;
  harvestDate: string;
  grossVolumeKg: number;
  moisturePercentage: number;
  c4SugarIsotopeRatioPermil: number;
  hmfFreshnessMgPerKg: number;
  labCertificateNo?: string;
  forestDeptPermitNo?: string;
  wholesalePricePerKgBdt: number;
  isForestCertifiedWild?: boolean;
}

export interface RegisterApiaryBoxRequest {
  boxCode: string;
  beekeeperName: string;
  beeSpecies: BeeSpecies;
  currentDistrict: string;
  currentUpazila: string;
  gpsLatitude: number;
  gpsLongitude: number;
  activeFloralCrop: string;
  framesCount?: number;
  queenAgeMonths?: number;
  healthStatus?: ApiaryBoxHealthStatus;
  estimatedHoneyYieldKg?: number;
  notes?: string;
}

export interface UpdateApiaryBoxHealthRequest {
  healthStatus: ApiaryBoxHealthStatus;
  currentDistrict?: string;
  currentUpazila?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  activeFloralCrop?: string;
  estimatedHoneyYieldKg?: number;
  notes?: string;
}

export interface CreateRoyalJellyBatchRequest {
  productType: SuperfoodProductType;
  producerName: string;
  harvestLocation: string;
  weightGrams: number;
  tenHdaPercentage: number;
  storageTemperatureCelsius?: number;
  priceBdt: number;
  availableStockCount: number;
}

export const honeyApiaryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getHoneyOverviewStats: builder.query<{ success: boolean; data: HoneyOverviewStats }, void>({
      query: () => '/honey-apiary/stats/overview',
      providesTags: ['HoneyLot', 'BeeBox', 'SuperfoodBatch'],
    }),

    calculateHoneyPurity: builder.mutation<
      { success: boolean; data: CalculateHoneyPurityResponse },
      CalculateHoneyPurityRequest
    >({
      query: (body) => ({
        url: '/honey-apiary/calculate/purity',
        method: 'POST',
        body,
      }),
    }),

    calculateApiaryMigrationYield: builder.mutation<
      { success: boolean; data: CalculateApiaryMigrationYieldResponse },
      CalculateApiaryMigrationYieldRequest
    >({
      query: (body) => ({
        url: '/honey-apiary/calculate/migration-yield',
        method: 'POST',
        body,
      }),
    }),

    getHoneyLots: builder.query<{ success: boolean; data: HoneyHarvestLot[] }, void>({
      query: () => '/honey-apiary/lots',
      providesTags: ['HoneyLot'],
    }),

    getHoneyLotById: builder.query<{ success: boolean; data: HoneyHarvestLot }, string>({
      query: (id) => `/honey-apiary/lots/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'HoneyLot', id }],
    }),

    createHoneyHarvestLot: builder.mutation<
      { success: boolean; data: HoneyHarvestLot },
      CreateHoneyHarvestLotRequest
    >({
      query: (body) => ({
        url: '/honey-apiary/lots',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['HoneyLot'],
    }),

    getApiaryBoxes: builder.query<{ success: boolean; data: ApiaryColonyBox[] }, void>({
      query: () => '/honey-apiary/boxes',
      providesTags: ['BeeBox'],
    }),

    getApiaryBoxById: builder.query<{ success: boolean; data: ApiaryColonyBox }, string>({
      query: (id) => `/honey-apiary/boxes/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'BeeBox', id }],
    }),

    registerApiaryBox: builder.mutation<
      { success: boolean; data: ApiaryColonyBox },
      RegisterApiaryBoxRequest
    >({
      query: (body) => ({
        url: '/honey-apiary/boxes',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['BeeBox'],
    }),

    updateApiaryBoxHealth: builder.mutation<
      { success: boolean; data: ApiaryColonyBox },
      { id: string; data: UpdateApiaryBoxHealthRequest }
    >({
      query: ({ id, data }) => ({
        url: `/honey-apiary/boxes/${id}/health`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['BeeBox'],
    }),

    getSuperfoodBatches: builder.query<
      { success: boolean; data: RoyalJellySuperfoodBatch[] },
      void
    >({
      query: () => '/honey-apiary/superfoods',
      providesTags: ['SuperfoodBatch'],
    }),

    createSuperfoodBatch: builder.mutation<
      { success: boolean; data: RoyalJellySuperfoodBatch },
      CreateRoyalJellyBatchRequest
    >({
      query: (body) => ({
        url: '/honey-apiary/superfoods',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SuperfoodBatch'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetHoneyOverviewStatsQuery,
  useCalculateHoneyPurityMutation,
  useCalculateApiaryMigrationYieldMutation,
  useGetHoneyLotsQuery,
  useGetHoneyLotByIdQuery,
  useCreateHoneyHarvestLotMutation,
  useGetApiaryBoxesQuery,
  useGetApiaryBoxByIdQuery,
  useRegisterApiaryBoxMutation,
  useUpdateApiaryBoxHealthMutation,
  useGetSuperfoodBatchesQuery,
  useCreateSuperfoodBatchMutation,
} = honeyApiaryApi;
