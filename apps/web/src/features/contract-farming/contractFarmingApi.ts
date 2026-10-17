import { api } from '@/store/api';

export type ContractCropType =
  | 'POTATO_PROCESSING'
  | 'CHINIGURA_AROMATIC_RICE'
  | 'TOMATO_PROCESSING'
  | 'MAIZE_POULTRY_FEED'
  | 'CHILI_SPICE_PROCESSING'
  | 'MUSTARD_OIL_SEED'
  | 'ORGANIC_VEGETABLES'
  | 'GINGER_TURMERIC'
  | 'OTHER';

export type CampaignStatus =
  | 'DRAFT'
  | 'ENROLLING'
  | 'IN_PROGRESS'
  | 'HARVEST_INTAKE'
  | 'COMPLETED'
  | 'CLOSED';

export type AgreementStatus =
  | 'APPLIED'
  | 'APPROVED'
  | 'ACTIVE_PLANTED'
  | 'MILESTONES_VERIFIED'
  | 'DELIVERING'
  | 'SETTLED'
  | 'DISPUTED'
  | 'CANCELLED';

export type MilestoneStage =
  | 'SEEDING_GERMINATION'
  | 'FLOWERING_VEGETATIVE'
  | 'PRE_HARVEST_MATURITY';

export type DeliveryGrade = 'GRADE_A' | 'GRADE_B' | 'GRADE_C' | 'REJECTED';

export interface ContractFarmingCampaign {
  id: string;
  campaignCode: string;
  buyerId: string;
  buyerCompanyName: string;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  cropType: ContractCropType;
  targetSeason: string;
  targetDistrict: string;
  targetUpazila?: string | null;
  targetTotalAcres: number;
  currentEnrolledAcres: number;
  guaranteedFloorPricePerKg: number;
  advanceInputCashPct: number;
  estimatedYieldPerBighaKg: number;
  qualityStandardSpecs: string;
  intakeDropWarehouseName: string;
  status: CampaignStatus;
  agreements?: ContractFarmingAgreement[];
  createdAt: string;
  updatedAt: string;
}

export interface ContractMilestoneInspection {
  id: string;
  agreementId: string;
  inspectorId: string;
  inspector?: { id: string; name: string };
  milestoneStage: MilestoneStage;
  isPassed: boolean;
  germinationRatePct?: number | null;
  cropHealthScore: number;
  pestInfestationLevel: string;
  growthObservations: string;
  inspectionPhotos?: string[];
  recommendations?: string | null;
  createdAt: string;
}

export interface ContractHarvestDelivery {
  id: string;
  deliveryVoucherNo: string;
  agreementId: string;
  grossWeightKg: number;
  tareWeightKg: number;
  netWeightKg: number;
  acceptedGrade: DeliveryGrade;
  qualityMoisturePct?: number | null;
  finalPricePerKg: number;
  payableBatchAmount: number;
  weighbridgeSlipPhoto?: string | null;
  weighbridgeOperatorName: string;
  isDisbursed: boolean;
  createdAt: string;
}

export interface ContractFarmingAgreement {
  id: string;
  agreementNumber: string;
  campaignId: string;
  campaign?: ContractFarmingCampaign;
  farmerId: string;
  farmer?: { id: string; name: string; phone?: string; email?: string };
  farmerName: string;
  farmerPhone: string;
  farmerNid?: string | null;
  plotAddress: string;
  plotDistrict: string;
  plotUpazila: string;
  plotUnion?: string | null;
  plotVillage?: string | null;
  plotDagNo?: string | null;
  landAreaBighas: number;
  committedEstProductionKg: number;
  floorPricePerKg: number;
  totalEstAgreementValue: number;
  advanceWorkingCapitalDisbursed: number;
  deliveredTotalKg: number;
  finalSettledValue: number;
  balancePayable: number;
  farmerPayoutMfsOrBank: string;
  status: AgreementStatus;
  inspections?: ContractMilestoneInspection[];
  deliveries?: ContractHarvestDelivery[];
  createdAt: string;
  updatedAt: string;
}

export interface ContractPlatformStats {
  totalCampaigns: number;
  totalAgreements: number;
  totalEnrolledAcres: number;
  totalAdvanceDisbursed: number;
  totalDeliveredKg: number;
  totalSettledValue: number;
}

export interface CreateCampaignDto {
  buyerCompanyName: string;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  cropType: ContractCropType;
  targetSeason: string;
  targetDistrict: string;
  targetUpazila?: string;
  targetTotalAcres: number;
  guaranteedFloorPricePerKg: number;
  advanceInputCashPct?: number;
  estimatedYieldPerBighaKg: number;
  qualityStandardSpecs: string;
  intakeDropWarehouseName: string;
}

export interface UpdateCampaignDto {
  buyerCompanyName?: string;
  titleEn?: string;
  titleBn?: string;
  descriptionEn?: string;
  descriptionBn?: string;
  cropType?: ContractCropType;
  targetSeason?: string;
  targetDistrict?: string;
  targetUpazila?: string;
  targetTotalAcres?: number;
  guaranteedFloorPricePerKg?: number;
  advanceInputCashPct?: number;
  estimatedYieldPerBighaKg?: number;
  qualityStandardSpecs?: string;
  intakeDropWarehouseName?: string;
  status?: CampaignStatus;
}

export interface ApplyAgreementDto {
  campaignId: string;
  farmerName: string;
  farmerPhone: string;
  farmerNid?: string;
  plotAddress: string;
  plotDistrict: string;
  plotUpazila: string;
  plotUnion?: string;
  plotVillage?: string;
  plotDagNo?: string;
  landAreaBighas: number;
  farmerPayoutMfsOrBank: string;
}

export interface UpdateAgreementStatusDto {
  status: AgreementStatus;
  advanceWorkingCapitalDisbursed?: number;
}

export interface SubmitMilestoneInspectionDto {
  milestoneStage: MilestoneStage;
  isPassed: boolean;
  germinationRatePct?: number;
  cropHealthScore: number;
  pestInfestationLevel?: string;
  growthObservations: string;
  inspectionPhotos?: string[];
  recommendations?: string;
}

export interface RecordHarvestDeliveryDto {
  deliveryVoucherNo?: string;
  grossWeightKg: number;
  tareWeightKg: number;
  acceptedGrade: DeliveryGrade;
  qualityMoisturePct?: number;
  weighbridgeSlipPhoto?: string;
  weighbridgeOperatorName: string;
}

export interface QueryCampaignDto {
  cropType?: ContractCropType;
  targetDistrict?: string;
  status?: CampaignStatus;
  page?: number;
  limit?: number;
}

export const contractFarmingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getContractCampaigns: builder.query<
      { items: ContractFarmingCampaign[]; total: number; page: number; limit: number },
      QueryCampaignDto | void
    >({
      query: (params) => ({
        url: '/contract-farming/campaigns',
        params: params || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'ContractCampaign' as const, id })),
              { type: 'ContractCampaign', id: 'LIST' },
            ]
          : [{ type: 'ContractCampaign', id: 'LIST' }],
    }),

    getContractCampaignById: builder.query<ContractFarmingCampaign, string>({
      query: (id) => `/contract-farming/campaigns/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'ContractCampaign', id }],
    }),

    getContractPlatformStats: builder.query<ContractPlatformStats, void>({
      query: () => '/contract-farming/stats',
      providesTags: [{ type: 'ContractCampaign', id: 'STATS' }],
    }),

    createContractCampaign: builder.mutation<ContractFarmingCampaign, CreateCampaignDto>({
      query: (body) => ({
        url: '/contract-farming/campaigns',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'ContractCampaign', id: 'LIST' }, { type: 'ContractCampaign', id: 'STATS' }],
    }),

    updateContractCampaign: builder.mutation<
      ContractFarmingCampaign,
      { id: string; body: UpdateCampaignDto }
    >({
      query: ({ id, body }) => ({
        url: `/contract-farming/campaigns/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'ContractCampaign', id },
        { type: 'ContractCampaign', id: 'LIST' },
      ],
    }),

    applyContractAgreement: builder.mutation<ContractFarmingAgreement, ApplyAgreementDto>({
      query: (body) => ({
        url: '/contract-farming/agreements/apply',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'ContractAgreement', id: 'LIST' },
        { type: 'ContractCampaign', id: 'LIST' },
        { type: 'ContractCampaign', id: 'STATS' },
      ],
    }),

    getFarmerContractAgreements: builder.query<ContractFarmingAgreement[], void>({
      query: () => '/contract-farming/agreements/farmer',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'ContractAgreement' as const, id })),
              { type: 'ContractAgreement', id: 'FARMER_LIST' },
            ]
          : [{ type: 'ContractAgreement', id: 'FARMER_LIST' }],
    }),

    getBuyerContractAgreements: builder.query<ContractFarmingAgreement[], void>({
      query: () => '/contract-farming/agreements/buyer',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'ContractAgreement' as const, id })),
              { type: 'ContractAgreement', id: 'BUYER_LIST' },
            ]
          : [{ type: 'ContractAgreement', id: 'BUYER_LIST' }],
    }),

    getAllContractAgreements: builder.query<ContractFarmingAgreement[], void>({
      query: () => '/contract-farming/agreements/all',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'ContractAgreement' as const, id })),
              { type: 'ContractAgreement', id: 'ADMIN_LIST' },
            ]
          : [{ type: 'ContractAgreement', id: 'ADMIN_LIST' }],
    }),

    getContractAgreementById: builder.query<ContractFarmingAgreement, string>({
      query: (id) => `/contract-farming/agreements/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'ContractAgreement', id }],
    }),

    updateContractAgreementStatus: builder.mutation<
      ContractFarmingAgreement,
      { id: string; body: UpdateAgreementStatusDto }
    >({
      query: ({ id, body }) => ({
        url: `/contract-farming/agreements/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'ContractAgreement', id },
        { type: 'ContractAgreement', id: 'FARMER_LIST' },
        { type: 'ContractAgreement', id: 'BUYER_LIST' },
        { type: 'ContractAgreement', id: 'ADMIN_LIST' },
        { type: 'ContractCampaign', id: 'STATS' },
      ],
    }),

    submitContractMilestoneInspection: builder.mutation<
      ContractMilestoneInspection,
      { agreementId: string; body: SubmitMilestoneInspectionDto }
    >({
      query: ({ agreementId, body }) => ({
        url: `/contract-farming/agreements/${agreementId}/inspections`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_res, _err, { agreementId }) => [
        { type: 'ContractAgreement', agreementId },
        { type: 'ContractAgreement', id: 'FARMER_LIST' },
        { type: 'ContractAgreement', id: 'BUYER_LIST' },
        { type: 'ContractAgreement', id: 'ADMIN_LIST' },
      ],
    }),

    recordContractHarvestDelivery: builder.mutation<
      ContractHarvestDelivery,
      { agreementId: string; body: RecordHarvestDeliveryDto }
    >({
      query: ({ agreementId, body }) => ({
        url: `/contract-farming/agreements/${agreementId}/deliveries`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_res, _err, { agreementId }) => [
        { type: 'ContractAgreement', id: agreementId },
        { type: 'ContractAgreement', id: 'FARMER_LIST' },
        { type: 'ContractAgreement', id: 'BUYER_LIST' },
        { type: 'ContractAgreement', id: 'ADMIN_LIST' },
        { type: 'ContractCampaign', id: 'STATS' },
      ],
    }),

    settleContractAgreement: builder.mutation<
      ContractFarmingAgreement,
      { id: string; settlementNotes?: string }
    >({
      query: ({ id, settlementNotes }) => ({
        url: `/contract-farming/agreements/${id}/settle`,
        method: 'POST',
        body: { settlementNotes },
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'ContractAgreement', id },
        { type: 'ContractAgreement', id: 'FARMER_LIST' },
        { type: 'ContractAgreement', id: 'BUYER_LIST' },
        { type: 'ContractAgreement', id: 'ADMIN_LIST' },
        { type: 'ContractCampaign', id: 'STATS' },
      ],
    }),
  }),
});

export const {
  useGetContractCampaignsQuery,
  useGetContractCampaignByIdQuery,
  useGetContractPlatformStatsQuery,
  useCreateContractCampaignMutation,
  useUpdateContractCampaignMutation,
  useApplyContractAgreementMutation,
  useGetFarmerContractAgreementsQuery,
  useGetBuyerContractAgreementsQuery,
  useGetAllContractAgreementsQuery,
  useGetContractAgreementByIdQuery,
  useUpdateContractAgreementStatusMutation,
  useSubmitContractMilestoneInspectionMutation,
  useRecordContractHarvestDeliveryMutation,
  useSettleContractAgreementMutation,
} = contractFarmingApi;
