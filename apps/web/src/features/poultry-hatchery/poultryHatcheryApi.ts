import { api } from '@/store/api';

export type PoultryBreedType =
  | 'SONALI_CLASSIC'
  | 'BROILER_COBB_500'
  | 'LAYER_HY_LINE_BROWN'
  | 'HAOR_BELGIAN_DUCK'
  | 'DESHI_NATIVE_CHICKEN';

export type HatcheryFlockStage =
  | 'DAY_OLD_CHICK_DOC'
  | 'BROODER_NURSERY_PULLET'
  | 'GROWER_FLOCK'
  | 'FINISHER_READY_FOR_MARKET'
  | 'COMMERCIAL_LAYER_EGG_PRODUCING';

export type VaccinationStatus =
  | 'MAREKS_DAY_1_CERTIFIED'
  | 'RANIKHET_NEWCASTLE_RDV_COMPLETED'
  | 'GUMBORO_IBD_BOOSTER_DONE'
  | 'FOWL_CHOLERA_POX_COMPLETE'
  | 'UNVACCINATED_PENDING';

export type BrooderShedAlarmStatus =
  | 'OPTIMAL_BROODING_ENVIRONMENT'
  | 'AMMONIA_TOXIC_SPIKE_ALERT'
  | 'TEMPERATURE_COLD_CHILLING_ALERT'
  | 'HIGH_HEAT_STRESS_ALERT'
  | 'HUMIDITY_OUT_OF_RANGE';

export type EggQualityGrade =
  | 'GRADE_AA_JUMBO_OVER_65G'
  | 'GRADE_A_LARGE_58_64G'
  | 'GRADE_B_MEDIUM_50_57G'
  | 'GRADE_C_PULLET_UNDER_50G';

export interface PoultryHatcheryBatch {
  id: string;
  batchCode: string;
  hatcheryName: string;
  breederPhone: string;
  district: string;
  breedType: PoultryBreedType;
  flockStage: HatcheryFlockStage;
  hatchDate: string;
  chickCount: number;
  averageWeightGrams: number;
  vaccinationStatus: VaccinationStatus;
  dlsSurgeonCertificationNo: string | null;
  unitPriceBdt: number;
  mortalityCount: number;
  isBiosecureCertified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BrooderShedTelemetry {
  id: string;
  shedCode: string;
  farmName: string;
  district: string;
  flockBatchCode: string | null;
  temperatureCelsius: number;
  relativeHumidityPercent: number;
  ammoniaPpm: number;
  exhaustFanState: string;
  brooderHeaterState: string;
  alarmStatus: BrooderShedAlarmStatus;
  alarmMessage: string | null;
  lastRecordedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface TableEggGradingLot {
  id: string;
  lotNumber: string;
  farmName: string;
  district: string;
  collectionDate: string;
  totalEggsCount: number;
  averageEggWeightGrams: number;
  eggGrade: EggQualityGrade;
  uvSanitizationVerified: boolean;
  crackedEggPercentage: number;
  pricePerHundredBdt: number;
  availableCasesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PoultryOverviewStats {
  totalActiveFlockCount: number;
  totalDocProducedCount: number;
  totalEggCasesAvailable: number;
  totalEggsCount: number;
  activeBrooderShedsCount: number;
  averageBroilerFcr: number;
  averageSonaliFcr: number;
}

export interface CalculateFlockFcrRequest {
  breedType: PoultryBreedType;
  initialChickCount: number;
  currentLiveCount: number;
  cumulativeFeedConsumedKg: number;
  averageWeightGrams: number;
}

export interface CalculateFlockFcrResponse {
  breedType: PoultryBreedType;
  initialChickCount: number;
  currentLiveCount: number;
  mortalityCount: number;
  mortalityPercentage: number;
  isMortalityAlarm: boolean;
  mortalityAlertMessage: string | null;
  totalBiomassKg: number;
  calculatedFcr: number;
  fcrRating: 'EXCELLENT' | 'STANDARD' | 'POOR_FEED_WASTE';
  cumulativeFeedConsumedKg: number;
  estimatedFeedCostBdt: number;
  feedCostPerKgMeatBdt: number;
  fcrBenchmarkExplanation: string;
}

export interface EvaluateEggGradingRequest {
  averageEggWeightGrams: number;
  totalEggsCount?: number;
}

export interface EvaluateEggGradingResponse {
  averageEggWeightGrams: number;
  eggGrade: EggQualityGrade;
  pricePerHundredBdt: number;
  unitPricePerEggBdt: number;
  totalEggsCount: number;
  commercialCasesCount: number;
  totalValuationBdt: number;
  uvSanitizationStandard: string;
}

export interface CreatePoultryBatchRequest {
  hatcheryName: string;
  breederPhone: string;
  district: string;
  breedType: PoultryBreedType;
  flockStage: HatcheryFlockStage;
  hatchDate: string;
  chickCount: number;
  averageWeightGrams: number;
  vaccinationStatus: VaccinationStatus;
  dlsSurgeonCertificationNo?: string;
  unitPriceBdt: number;
  isBiosecureCertified?: boolean;
}

export interface RecordBrooderTelemetryRequest {
  shedCode: string;
  flockBatchCode?: string;
  temperatureCelsius: number;
  relativeHumidityPercent: number;
  ammoniaPpm: number;
  exhaustFanState?: string;
  brooderHeaterState?: string;
}

export interface CreateTableEggLotRequest {
  farmName: string;
  district: string;
  collectionDate: string;
  totalEggsCount: number;
  averageEggWeightGrams: number;
  pricePerHundredBdt: number;
  availableCasesCount: number;
  crackedEggPercentage?: number;
}

export const poultryHatcheryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPoultryOverviewStats: builder.query<{ success: boolean; data: PoultryOverviewStats }, void>({
      query: () => '/poultry-hatchery/stats/overview',
      providesTags: ['PoultryBatch', 'BrooderTelemetry', 'EggLot'],
    }),

    calculateFlockFcr: builder.mutation<
      { success: boolean; data: CalculateFlockFcrResponse },
      CalculateFlockFcrRequest
    >({
      query: (body) => ({
        url: '/poultry-hatchery/calculate/fcr',
        method: 'POST',
        body,
      }),
    }),

    evaluateEggGrading: builder.mutation<
      { success: boolean; data: EvaluateEggGradingResponse },
      EvaluateEggGradingRequest
    >({
      query: (body) => ({
        url: '/poultry-hatchery/evaluate/egg-grading',
        method: 'POST',
        body,
      }),
    }),

    getPoultryBatches: builder.query<{ success: boolean; data: PoultryHatcheryBatch[] }, void>({
      query: () => '/poultry-hatchery/batches',
      providesTags: ['PoultryBatch'],
    }),

    getPoultryBatchById: builder.query<{ success: boolean; data: PoultryHatcheryBatch }, string>({
      query: (id) => `/poultry-hatchery/batches/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'PoultryBatch', id }],
    }),

    createPoultryBatch: builder.mutation<
      { success: boolean; data: PoultryHatcheryBatch },
      CreatePoultryBatchRequest
    >({
      query: (body) => ({
        url: '/poultry-hatchery/batches',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PoultryBatch'],
    }),

    getBrooderTelemetrySheds: builder.query<{ success: boolean; data: BrooderShedTelemetry[] }, void>({
      query: () => '/poultry-hatchery/telemetry/sheds',
      providesTags: ['BrooderTelemetry'],
    }),

    recordBrooderTelemetry: builder.mutation<
      { success: boolean; data: BrooderShedTelemetry },
      RecordBrooderTelemetryRequest
    >({
      query: (body) => ({
        url: '/poultry-hatchery/telemetry/record',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['BrooderTelemetry'],
    }),

    getTableEggLots: builder.query<{ success: boolean; data: TableEggGradingLot[] }, void>({
      query: () => '/poultry-hatchery/eggs/lots',
      providesTags: ['EggLot'],
    }),

    createTableEggLot: builder.mutation<
      { success: boolean; data: TableEggGradingLot },
      CreateTableEggLotRequest
    >({
      query: (body) => ({
        url: '/poultry-hatchery/eggs/lots',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['EggLot'],
    }),
  }),
});

export const {
  useGetPoultryOverviewStatsQuery,
  useCalculateFlockFcrMutation,
  useEvaluateEggGradingMutation,
  useGetPoultryBatchesQuery,
  useGetPoultryBatchByIdQuery,
  useCreatePoultryBatchMutation,
  useGetBrooderTelemetryShedsQuery,
  useRecordBrooderTelemetryMutation,
  useGetTableEggLotsQuery,
  useCreateTableEggLotMutation,
} = poultryHatcheryApi;
