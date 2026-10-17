import { api } from '@/store/api';

export type MushroomVariety =
  | 'OYSTER_WHITE_PO2'
  | 'OYSTER_GREY_HK51'
  | 'MILKY_WHITE_SUMMER'
  | 'BUTTON_AGARICUS_WINTER'
  | 'GANODERMA_REISHI_MEDICINAL'
  | 'SHIITAKE_LENTINULA';

export type SpawnGenerationStage =
  | 'MOTHER_TISSUE_CULTURE_SLANT'
  | 'PRIMARY_GRAIN_SPAWN'
  | 'COMMERCIAL_SAWDUST_CYLINDER'
  | 'FRUITING_INCUBATION_RUN'
  | 'PINHEAD_HARVEST_CYCLE';

export type MushroomProductForm =
  | 'FRESH_HARVEST_CRATES'
  | 'DEHYDRATED_DRIED_SLICES'
  | 'MEDICINAL_EXTRACT_POWDER'
  | 'MUSHROOM_PICKLE_PROCESSED';

export type SubstrateSterilizationStatus =
  | 'AUTOCLAVE_PRESSURE_STERILIZED'
  | 'PASTEURIZED_HOT_WATER'
  | 'CONTAMINATED_DISCARDED';

export type FruitingChamberAlarmStatus =
  | 'OPTIMAL_GROWTH_CLIMATE'
  | 'HIGH_CO2_SUFFOCATION_ALERT'
  | 'LOW_HUMIDITY_DRYOUT_ALERT'
  | 'TEMPERATURE_HEAT_STRESS_ALERT';

export interface MushroomSpawnBatch {
  id: string;
  batchNumber: string;
  labName: string;
  growerPhone: string;
  district: string;
  variety: MushroomVariety;
  generationStage: SpawnGenerationStage;
  inoculationDate: string;
  packetsCount: number;
  sterilizationMethod: SubstrateSterilizationStatus;
  autoclaveTempCelsius: number;
  autoclavePressurePsi: number;
  nmdiLabCertificationNo: string | null;
  pricePerPacketBdt: number;
  isContaminationFreeCertified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FruitingChamberTelemetry {
  id: string;
  chamberCode: string;
  farmName: string;
  district: string;
  activeBatchNumber: string | null;
  temperatureCelsius: number;
  relativeHumidityPercent: number;
  co2Ppm: number;
  foggerMistState: string;
  freshAirDamperState: string;
  alarmStatus: FruitingChamberAlarmStatus;
  alarmMessage: string | null;
  lastRecordedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DehydratedMushroomLot {
  id: string;
  lotCode: string;
  processorName: string;
  district: string;
  variety: MushroomVariety;
  productForm: MushroomProductForm;
  processingDate: string;
  freshWeightKg: number;
  dryWeightKg: number;
  moisturePercentage: number;
  polysaccharideBetaGlucanPercent: number | null;
  isHermeticNitrogenSealed: boolean;
  pricePerKgBdt: number;
  availableStockKg: number;
  createdAt: string;
  updatedAt: string;
}

export interface MushroomOverviewStats {
  totalActiveSpawnPacketsCount: number;
  totalDehydratedStockKg: number;
  totalFreshHarvestCapacityKg: number;
  activeFruitingChambersCount: number;
  averageChamberHumidityPercent: number;
  averageDehydrationYieldPercent: number;
}

export interface CalculateDehydrationYieldRequest {
  freshWeightKg: number;
  variety: MushroomVariety;
  targetMoisturePercentage?: number;
}

export interface CalculateDehydrationYieldResponse {
  variety: MushroomVariety;
  freshWeightKg: number;
  freshToDryRatio: string;
  estimatedDryWeightKg: number;
  moistureLossKg: number;
  yieldPercentage: number;
  targetMoisturePercentage: number;
  estimatedWholesaleRatePerKgBdt: number;
  estimatedGrossValuationBdt: number;
  shelfLifeComparison: string;
  storageRecommendation: string;
}

export interface EvaluateChamberClimateRequest {
  temperatureCelsius: number;
  relativeHumidityPercent: number;
  co2Ppm: number;
}

export interface EvaluateChamberClimateResponse {
  temperatureCelsius: number;
  relativeHumidityPercent: number;
  co2Ppm: number;
  alarmStatus: FruitingChamberAlarmStatus;
  alarmMessage: string | null;
  recommendedDamperState: string;
  recommendedFoggerState: string;
  climateEvaluationNote: string | null;
}

export interface CreateSpawnBatchRequest {
  labName: string;
  growerPhone: string;
  district: string;
  variety: MushroomVariety;
  generationStage: SpawnGenerationStage;
  inoculationDate: string;
  packetsCount: number;
  sterilizationMethod: SubstrateSterilizationStatus;
  autoclaveTempCelsius: number;
  autoclavePressurePsi: number;
  nmdiLabCertificationNo?: string;
  pricePerPacketBdt: number;
  isContaminationFreeCertified?: boolean;
}

export interface RecordChamberTelemetryRequest {
  chamberCode: string;
  activeBatchNumber?: string;
  temperatureCelsius: number;
  relativeHumidityPercent: number;
  co2Ppm: number;
  foggerMistState?: string;
  freshAirDamperState?: string;
}

export interface CreateDehydratedLotRequest {
  processorName: string;
  district: string;
  variety: MushroomVariety;
  productForm: MushroomProductForm;
  processingDate: string;
  freshWeightKg: number;
  dryWeightKg: number;
  moisturePercentage: number;
  polysaccharideBetaGlucanPercent?: number;
  isHermeticNitrogenSealed?: boolean;
  pricePerKgBdt: number;
  availableStockKg: number;
}

export const mushroomFarmingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMushroomOverviewStats: builder.query<{ success: boolean; data: MushroomOverviewStats }, void>({
      query: () => '/mushroom-farming/stats/overview',
      providesTags: ['MushroomSpawn', 'FruitingChamber', 'DehydratedLot'],
    }),

    calculateDehydrationYield: builder.mutation<
      { success: boolean; data: CalculateDehydrationYieldResponse },
      CalculateDehydrationYieldRequest
    >({
      query: (body) => ({
        url: '/mushroom-farming/calculate/dehydration',
        method: 'POST',
        body,
      }),
    }),

    evaluateChamberClimate: builder.mutation<
      { success: boolean; data: EvaluateChamberClimateResponse },
      EvaluateChamberClimateRequest
    >({
      query: (body) => ({
        url: '/mushroom-farming/evaluate/chamber-climate',
        method: 'POST',
        body,
      }),
    }),

    getMushroomSpawnBatches: builder.query<{ success: boolean; data: MushroomSpawnBatch[] }, void>({
      query: () => '/mushroom-farming/spawn/batches',
      providesTags: ['MushroomSpawn'],
    }),

    getMushroomSpawnBatchById: builder.query<{ success: boolean; data: MushroomSpawnBatch }, string>({
      query: (id) => `/mushroom-farming/spawn/batches/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'MushroomSpawn', id }],
    }),

    createMushroomSpawnBatch: builder.mutation<
      { success: boolean; data: MushroomSpawnBatch },
      CreateSpawnBatchRequest
    >({
      query: (body) => ({
        url: '/mushroom-farming/spawn/batches',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MushroomSpawn'],
    }),

    getFruitingChambers: builder.query<{ success: boolean; data: FruitingChamberTelemetry[] }, void>({
      query: () => '/mushroom-farming/chambers',
      providesTags: ['FruitingChamber'],
    }),

    recordChamberTelemetry: builder.mutation<
      { success: boolean; data: FruitingChamberTelemetry },
      RecordChamberTelemetryRequest
    >({
      query: (body) => ({
        url: '/mushroom-farming/chambers/record',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FruitingChamber'],
    }),

    getDehydratedMushroomLots: builder.query<{ success: boolean; data: DehydratedMushroomLot[] }, void>({
      query: () => '/mushroom-farming/lots/dehydrated',
      providesTags: ['DehydratedLot'],
    }),

    createDehydratedMushroomLot: builder.mutation<
      { success: boolean; data: DehydratedMushroomLot },
      CreateDehydratedLotRequest
    >({
      query: (body) => ({
        url: '/mushroom-farming/lots/dehydrated',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['DehydratedLot'],
    }),
  }),
});

export const {
  useGetMushroomOverviewStatsQuery,
  useCalculateDehydrationYieldMutation,
  useEvaluateChamberClimateMutation,
  useGetMushroomSpawnBatchesQuery,
  useGetMushroomSpawnBatchByIdQuery,
  useCreateMushroomSpawnBatchMutation,
  useGetFruitingChambersQuery,
  useRecordChamberTelemetryMutation,
  useGetDehydratedMushroomLotsQuery,
  useCreateDehydratedMushroomLotMutation,
} = mushroomFarmingApi;
