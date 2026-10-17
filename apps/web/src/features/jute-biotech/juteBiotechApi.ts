import { api } from '@/store/api';

export type JuteVariety = 'TOSSA_JUTE' | 'WHITE_JUTE' | 'MESTA_KENAF';

export type JuteFiberGrade =
  | 'BJC_SPECIAL_TOP'
  | 'BJD_GRADE_2'
  | 'BJD_GRADE_3'
  | 'BJD_GRADE_4'
  | 'BJD_GRADE_5'
  | 'BJD_GRADE_6_HABBIJABBI'
  | 'BWC_SPECIAL_TOP'
  | 'BWD_GRADE_2'
  | 'BWD_GRADE_3'
  | 'BWD_GRADE_4'
  | 'BWD_GRADE_5'
  | 'BWD_GRADE_6';

export type RettingMethod =
  | 'RIBBON_RETTING_ENZYMATIC'
  | 'CONVENTIONAL_WHOLE_PLANT_STEEP'
  | 'TANK_MICROBIAL_RETTING';

export type RettingStatus =
  | 'STEEPING_INITIATED'
  | 'ACTIVE_MICROBIAL_RETTING'
  | 'FIBER_SEPARATION_READY'
  | 'HARVESTED_WASHED'
  | 'OVER_RETTED_RISK';

export type BaleType =
  | 'KUTCHA_BALE_FARM'
  | 'PUCCA_EXPORT_BALE'
  | 'LOOSE_MORAH_LOT';

export type PackagingActCategory =
  | 'PADDY_AND_RICE_50KG'
  | 'WHEAT_AND_FLOUR_50KG'
  | 'SUGAR_50KG'
  | 'FERTILIZER_50KG'
  | 'FEED_AND_MAIZE_75KG'
  | 'POTATO_AND_VEGETABLE_SACK'
  | 'GEO_JUTE_SOIL_EROSION_MESH'
  | 'CBC_CARPET_BACKING_CLOTH';

export type BalingEscrowStatus =
  | 'WEIGHBRIDGE_DRAFT'
  | 'QUALITY_VERIFIED'
  | 'HELD_IN_ESCROW'
  | 'SETTLED_TO_FARMER'
  | 'DISPUTED_MOISTURE';

export interface JuteRettingBatch {
  id: string;
  batchCode: string;
  farmerName: string;
  farmerPhone: string;
  district: string;
  upazila: string;
  waterSourceType: string;
  variety: JuteVariety;
  rettingMethod: RettingMethod;
  microbialInoculantUsed: boolean;
  inoculantStrainCode: string;
  steepingDate: string;
  expectedHarvestDate: string;
  daysElapsed: number;
  waterTempCelsius: number;
  waterPh: number;
  dissolvedOxygenMgL: number;
  status: RettingStatus;
  targetFiberYieldMaunds: number;
  bjriFieldOfficer: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JuteFiberLot {
  id: string;
  lotNumber: string;
  farmerName: string;
  balingCenterName: string;
  district: string;
  variety: JuteVariety;
  grade: JuteFiberGrade;
  baleType: BaleType;
  baleCount: number;
  grossWeightKg: number;
  tareWeightKg: number;
  netRawWeightKg: number;
  moisturePercentage: number;
  moistureAdjustmentKg: number;
  billableDryWeightKg: number;
  billableMaunds: number;
  pricePerMaund: number;
  totalPayoutBdt: number;
  tensileStrengthGPerTex: number;
  lustreScore: string;
  rootCutPercentage: number;
  defectPercentage: number;
  escrowStatus: BalingEscrowStatus;
  directorateLicenseNumber: string;
  bjriGradeCertNumber: string;
  isOrganicCertified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JuteB2bContract {
  id: string;
  contractCode: string;
  buyerMillName: string;
  buyerRegNumber: string;
  sellerCooperativeName: string;
  mandatoryPackagingCategory: PackagingActCategory;
  productDescription: string;
  quantityMetricTonsOrBales: number;
  unitPriceBdt: number;
  totalContractValueBdt: number;
  deliveryDeadline: string;
  destinationDepot: string;
  compliancePackagingAct2010: boolean;
  escrowDepositPercentage: number;
  escrowStatus: string;
  inspectionPassed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JuteOverviewStats {
  totalBatches: number;
  activeRettingBatches: number;
  readyBatches: number;
  totalBales: number;
  totalMaunds: number;
  totalFarmerPayoutBdt: number;
  totalContractTonnage: number;
  totalContractValueBdt: number;
  standardSafeMoistureTarget: number;
  mandatoryPackagingActCompliantRate: number;
}

export interface MoistureDeductionResult {
  grossWeightKg: number;
  tareWeightKg: number;
  netRawWeightKg: number;
  testedMoisturePercentage: number;
  safeStandardMoisturePercentage: number;
  moistureAdjustmentKg: number;
  billableDryWeightKg: number;
  billableMaunds: number;
  basePricePerMaund: number;
  drynessBonusPercentage: number;
  moisturePenaltyPercentage: number;
  totalPayoutBdt: number;
  status: string;
  recommendation: string;
  variety: JuteVariety;
  grade: JuteFiberGrade;
}

export interface RettingPondEvaluationResult {
  waterTempCelsius: number;
  waterPh: number;
  dissolvedOxygenMgL: number;
  daysSteeping: number;
  expectedTotalDays: number;
  readinessScore: number;
  status: RettingStatus;
  fiberColorPrediction: string;
  tensileStrengthForecast: string;
  alerts: string[];
}

export interface CalculateMoistureDeductionRequest {
  grossWeightKg: number;
  tareWeightKg: number;
  moisturePercentage: number;
  basePricePerMaund: number;
  variety?: JuteVariety;
  grade?: JuteFiberGrade;
}

export interface EvaluateRettingPondRequest {
  waterTempCelsius: number;
  waterPh: number;
  dissolvedOxygenMgL: number;
  daysSteeping: number;
  rettingMethod: RettingMethod;
}

export interface CreateRettingBatchRequest {
  batchCode: string;
  farmerName: string;
  farmerPhone: string;
  district: string;
  upazila: string;
  waterSourceType?: string;
  variety: JuteVariety;
  rettingMethod: RettingMethod;
  microbialInoculantUsed?: boolean;
  inoculantStrainCode?: string;
  steepingDate: string;
  expectedHarvestDate: string;
  daysElapsed: number;
  waterTempCelsius: number;
  waterPh: number;
  dissolvedOxygenMgL: number;
  status?: RettingStatus;
  targetFiberYieldMaunds: number;
  bjriFieldOfficer?: string;
  notes?: string;
}

export interface UpdateRettingTelemetryRequest {
  waterTempCelsius?: number;
  waterPh?: number;
  dissolvedOxygenMgL?: number;
  daysElapsed?: number;
  status?: RettingStatus;
}

export interface CreateFiberLotRequest {
  lotNumber: string;
  farmerName: string;
  balingCenterName: string;
  district: string;
  variety: JuteVariety;
  grade: JuteFiberGrade;
  baleType: BaleType;
  baleCount: number;
  grossWeightKg: number;
  tareWeightKg: number;
  moisturePercentage: number;
  pricePerMaund: number;
  tensileStrengthGPerTex?: number;
  lustreScore?: string;
  rootCutPercentage?: number;
  defectPercentage?: number;
  escrowStatus?: BalingEscrowStatus;
  directorateLicenseNumber?: string;
  bjriGradeCertNumber?: string;
  isOrganicCertified?: boolean;
}

export interface CreateB2bContractRequest {
  contractCode: string;
  buyerMillName: string;
  buyerRegNumber?: string;
  sellerCooperativeName: string;
  mandatoryPackagingCategory: PackagingActCategory;
  productDescription: string;
  quantityMetricTonsOrBales: number;
  unitPriceBdt: number;
  deliveryDeadline: string;
  destinationDepot?: string;
  compliancePackagingAct2010?: boolean;
  escrowDepositPercentage?: number;
}

export const juteBiotechApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getJuteOverviewStats: builder.query<{ success: boolean; data: JuteOverviewStats }, void>({
      query: () => '/jute-biotech/stats/overview',
      providesTags: ['JuteRetting', 'JuteFiberLot', 'JuteB2bContract'],
    }),
    calculateMoistureDeduction: builder.mutation<
      { success: boolean; data: MoistureDeductionResult },
      CalculateMoistureDeductionRequest
    >({
      query: (dto) => ({
        url: '/jute-biotech/calculate/moisture-weight',
        method: 'POST',
        body: dto,
      }),
    }),
    evaluateRettingPond: builder.mutation<
      { success: boolean; data: RettingPondEvaluationResult },
      EvaluateRettingPondRequest
    >({
      query: (dto) => ({
        url: '/jute-biotech/evaluate/retting-pond',
        method: 'POST',
        body: dto,
      }),
    }),
    getAllRettingBatches: builder.query<{ success: boolean; data: JuteRettingBatch[] }, void>({
      query: () => '/jute-biotech/retting/batches',
      providesTags: ['JuteRetting'],
    }),
    getRettingBatchById: builder.query<{ success: boolean; data: JuteRettingBatch }, string>({
      query: (id) => `/jute-biotech/retting/batches/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'JuteRetting', id }],
    }),
    createRettingBatch: builder.mutation<
      { success: boolean; data: JuteRettingBatch },
      CreateRettingBatchRequest
    >({
      query: (dto) => ({
        url: '/jute-biotech/retting/batches',
        method: 'POST',
        body: dto,
      }),
      invalidatesTags: ['JuteRetting'],
    }),
    updateRettingTelemetry: builder.mutation<
      { success: boolean; data: JuteRettingBatch },
      { id: string; dto: UpdateRettingTelemetryRequest }
    >({
      query: ({ id, dto }) => ({
        url: `/jute-biotech/retting/batches/${id}/telemetry`,
        method: 'PATCH',
        body: dto,
      }),
      invalidatesTags: ['JuteRetting'],
    }),
    getAllFiberLots: builder.query<{ success: boolean; data: JuteFiberLot[] }, void>({
      query: () => '/jute-biotech/fiber/lots',
      providesTags: ['JuteFiberLot'],
    }),
    createFiberLot: builder.mutation<
      { success: boolean; data: JuteFiberLot },
      CreateFiberLotRequest
    >({
      query: (dto) => ({
        url: '/jute-biotech/fiber/lots',
        method: 'POST',
        body: dto,
      }),
      invalidatesTags: ['JuteFiberLot'],
    }),
    getAllB2bContracts: builder.query<{ success: boolean; data: JuteB2bContract[] }, void>({
      query: () => '/jute-biotech/contracts/b2b',
      providesTags: ['JuteB2bContract'],
    }),
    createB2bContract: builder.mutation<
      { success: boolean; data: JuteB2bContract },
      CreateB2bContractRequest
    >({
      query: (dto) => ({
        url: '/jute-biotech/contracts/b2b',
        method: 'POST',
        body: dto,
      }),
      invalidatesTags: ['JuteB2bContract'],
    }),
  }),
});

export const {
  useGetJuteOverviewStatsQuery,
  useCalculateMoistureDeductionMutation,
  useEvaluateRettingPondMutation,
  useGetAllRettingBatchesQuery,
  useGetRettingBatchByIdQuery,
  useCreateRettingBatchMutation,
  useUpdateRettingTelemetryMutation,
  useGetAllFiberLotsQuery,
  useCreateFiberLotMutation,
  useGetAllB2bContractsQuery,
  useCreateB2bContractMutation,
} = juteBiotechApi;
