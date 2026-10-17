import { api } from '@/store/api';

export type TeaGardenRegion =
  | 'SYLHET_SURMA_VALLEY'
  | 'SREEMANGAL_MOULVIBAZAR'
  | 'HABIGANJ_LASKARPORE_VALLEY'
  | 'CHITTAGONG_HALDA_VALLEY'
  | 'PANCHAGARH_TERAI_FLATLAND'
  | 'THAKURGAON_TERAI_FLATLAND'
  | 'BANDARBAN_HILL_TRACTS';

export type TeaProcessingType =
  | 'CTC_BLACK_TEA'
  | 'ARTISANAL_ORTHODOX_BLACK'
  | 'GREEN_TEA_STEAMED_PANFIRED'
  | 'SILVER_NEEDLE_WHITE_TEA'
  | 'OOLONG_SEMI_FERMENTED';

export type TeaLeafGrade =
  | 'BOP'
  | 'OF'
  | 'PD'
  | 'RD'
  | 'CD'
  | 'FTGFOP1'
  | 'TGFOP'
  | 'FBOP'
  | 'SPECIALTY_SILVER_TIPS'
  | 'ORGANIC_SENCHA_GREEN'
  | 'FIRST_FLUSH_SPRING';

export type PluckingStandard =
  | 'SUPERFINE_TWO_LEAVES_AND_BUD'
  | 'STANDARD_FINE_PLUCK'
  | 'COARSE_OVERGROWN_PLUCK';

export type AuctionCenter =
  | 'CHITTAGONG_TEA_AUCTION'
  | 'SREEMANGAL_TEA_AUCTION'
  | 'PANCHAGARH_AUCTION_DESK';

export type AuctionLotStatus =
  | 'CATALOGUED_FOR_AUCTION'
  | 'ACTIVE_BIDDING'
  | 'KNOCKED_DOWN_SOLD'
  | 'WITHDRAWN_OUTSOLD'
  | 'EXPORT_DISPATCHED';

export interface TeaGreenLeafIntake {
  id: string;
  intakeTicketNumber: string;
  smallholderFarmerName: string;
  farmerPhone: string;
  farmerRegNumber: string;
  gardenNameOrCluster: string;
  region: TeaGardenRegion;
  pluckingDate: string;
  grossWeightKg: number;
  tareBagWeightKg: number;
  netRawWeightKg: number;
  finePluckingPercentage: number;
  pluckingStandard: PluckingStandard;
  surfaceWaterMoistureDeductionKg: number;
  coarseLeafDeductionKg: number;
  netBillableLeafWeightKg: number;
  ratePerKgBdt: number;
  totalPayoutBdt: number;
  btbInspectorName: string;
  payoutStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeaFactoryBatch {
  id: string;
  batchNumber: string;
  factoryName: string;
  region: TeaGardenRegion;
  processingType: TeaProcessingType;
  greenLeafIntakeKg: number;
  witheringTroughHours: number;
  witheringMoistureLossPercentage: number;
  rollingFrictionTempCelsius: number;
  fermentationTimeMinutes: number;
  dryerDischargeMoisturePercentage: number;
  finishedTeaYieldKg: number;
  primaryGrade: TeaLeafGrade;
  certificationMark: string;
  isOrganicCertified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeaAuctionLot {
  id: string;
  lotNumber: string;
  gardenMark: string;
  auctionCenter: AuctionCenter;
  saleNumber: number;
  processingType: TeaProcessingType;
  grade: TeaLeafGrade;
  packageCountBagsOrChests: number;
  netWeightKg: number;
  reservePricePerKgBdt: number;
  currentHighBidBdt: number;
  winningBrokerName: string;
  tasterScoreBrightness: number;
  tasterScoreBriskness: number;
  tasterScoreLiquorBody: number;
  tasterFlavorNotes: string;
  auctionStatus: AuctionLotStatus;
  isOrganicCertified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeaOverviewStats {
  totalIntakeTickets: number;
  totalGreenLeafKg: number;
  totalSmallholderPayoutBdt: number;
  totalProcessedTeaKg: number;
  totalAuctionKg: number;
  totalAuctionValuationBdt: number;
  activeLotsCount: number;
  btbBenchmarkSmallholderPrice: number;
  averageCupScore: number;
}

export interface GreenLeafIntakeResult {
  grossWeightKg: number;
  tareBagWeightKg: number;
  netRawWeightKg: number;
  finePluckingPercentage: number;
  pluckingStandard: PluckingStandard;
  surfaceWaterMoistureDeductionKg: number;
  coarseLeafDeductionKg: number;
  netBillableLeafWeightKg: number;
  ratePerKgBdt: number;
  finePluckingBonusPercentage: number;
  totalPayoutBdt: number;
  recommendation: string;
}

export interface LiquorQualityResult {
  brightnessScore: number;
  brisknessScore: number;
  liquorBodyScore: number;
  colorScore: number;
  overallCupQualityScore: number;
  valuationMultiplier: number;
  exportSuitability: string;
  tasterNotes: string;
  processingType: TeaProcessingType;
  grade: TeaLeafGrade;
}

export interface CalculateGreenLeafIntakeRequest {
  grossWeightKg: number;
  tareBagWeightKg: number;
  finePluckingPercentage: number;
  surfaceWaterDeductionKg: number;
  ratePerKgBdt: number;
}

export interface EvaluateLiquorQualityRequest {
  brightnessScore: number;
  brisknessScore: number;
  liquorBodyScore: number;
  colorScore: number;
  processingType: TeaProcessingType;
  grade: TeaLeafGrade;
}

export interface CreateGreenLeafIntakeRequest {
  intakeTicketNumber: string;
  smallholderFarmerName: string;
  farmerPhone: string;
  farmerRegNumber?: string;
  gardenNameOrCluster: string;
  region: TeaGardenRegion;
  pluckingDate: string;
  grossWeightKg: number;
  tareBagWeightKg: number;
  finePluckingPercentage: number;
  surfaceWaterMoistureDeductionKg: number;
  ratePerKgBdt: number;
  btbInspectorName?: string;
}

export interface CreateFactoryBatchRequest {
  batchNumber: string;
  factoryName: string;
  region: TeaGardenRegion;
  processingType: TeaProcessingType;
  greenLeafIntakeKg: number;
  witheringTroughHours: number;
  witheringMoistureLossPercentage: number;
  rollingFrictionTempCelsius: number;
  fermentationTimeMinutes: number;
  dryerDischargeMoisturePercentage: number;
  finishedTeaYieldKg: number;
  primaryGrade: TeaLeafGrade;
  certificationMark?: string;
  isOrganicCertified?: boolean;
}

export interface CreateAuctionLotRequest {
  lotNumber: string;
  gardenMark: string;
  auctionCenter: AuctionCenter;
  saleNumber: number;
  processingType: TeaProcessingType;
  grade: TeaLeafGrade;
  packageCountBagsOrChests: number;
  netWeightKg: number;
  reservePricePerKgBdt: number;
  tasterScoreBrightness?: number;
  tasterScoreBriskness?: number;
  tasterScoreLiquorBody?: number;
  tasterFlavorNotes?: string;
  isOrganicCertified?: boolean;
}

export interface PlaceAuctionBidRequest {
  brokerName: string;
  bidPerKgBdt: number;
}

export const teaEstateApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTeaOverviewStats: builder.query<{ success: boolean; data: TeaOverviewStats }, void>({
      query: () => '/tea-estate/stats/overview',
      providesTags: ['TeaGreenLeafIntake', 'TeaFactoryBatch', 'TeaAuctionLot'],
    }),
    calculateGreenLeafIntake: builder.mutation<
      { success: boolean; data: GreenLeafIntakeResult },
      CalculateGreenLeafIntakeRequest
    >({
      query: (dto) => ({
        url: '/tea-estate/calculate/green-leaf-intake',
        method: 'POST',
        body: dto,
      }),
    }),
    evaluateLiquorQuality: builder.mutation<
      { success: boolean; data: LiquorQualityResult },
      EvaluateLiquorQualityRequest
    >({
      query: (dto) => ({
        url: '/tea-estate/evaluate/liquor-quality',
        method: 'POST',
        body: dto,
      }),
    }),
    getAllGreenLeafIntakes: builder.query<{ success: boolean; data: TeaGreenLeafIntake[] }, void>({
      query: () => '/tea-estate/green-leaf/intakes',
      providesTags: ['TeaGreenLeafIntake'],
    }),
    createGreenLeafIntake: builder.mutation<
      { success: boolean; data: TeaGreenLeafIntake },
      CreateGreenLeafIntakeRequest
    >({
      query: (dto) => ({
        url: '/tea-estate/green-leaf/intakes',
        method: 'POST',
        body: dto,
      }),
      invalidatesTags: ['TeaGreenLeafIntake'],
    }),
    getAllFactoryBatches: builder.query<{ success: boolean; data: TeaFactoryBatch[] }, void>({
      query: () => '/tea-estate/factory/batches',
      providesTags: ['TeaFactoryBatch'],
    }),
    createFactoryBatch: builder.mutation<
      { success: boolean; data: TeaFactoryBatch },
      CreateFactoryBatchRequest
    >({
      query: (dto) => ({
        url: '/tea-estate/factory/batches',
        method: 'POST',
        body: dto,
      }),
      invalidatesTags: ['TeaFactoryBatch'],
    }),
    getAllAuctionLots: builder.query<{ success: boolean; data: TeaAuctionLot[] }, void>({
      query: () => '/tea-estate/auction/lots',
      providesTags: ['TeaAuctionLot'],
    }),
    createAuctionLot: builder.mutation<
      { success: boolean; data: TeaAuctionLot },
      CreateAuctionLotRequest
    >({
      query: (dto) => ({
        url: '/tea-estate/auction/lots',
        method: 'POST',
        body: dto,
      }),
      invalidatesTags: ['TeaAuctionLot'],
    }),
    placeAuctionBid: builder.mutation<
      { success: boolean; data: TeaAuctionLot },
      { id: string; dto: PlaceAuctionBidRequest }
    >({
      query: ({ id, dto }) => ({
        url: `/tea-estate/auction/lots/${id}/bid`,
        method: 'POST',
        body: dto,
      }),
      invalidatesTags: ['TeaAuctionLot'],
    }),
  }),
});

export const {
  useGetTeaOverviewStatsQuery,
  useCalculateGreenLeafIntakeMutation,
  useEvaluateLiquorQualityMutation,
  useGetAllGreenLeafIntakesQuery,
  useCreateGreenLeafIntakeMutation,
  useGetAllFactoryBatchesQuery,
  useCreateFactoryBatchMutation,
  useGetAllAuctionLotsQuery,
  useCreateAuctionLotMutation,
  usePlaceAuctionBidMutation,
} = teaEstateApi;
