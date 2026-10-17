import { api } from '@/store/api';

export type HerbalSpecies =
  | 'KALOMEGH'
  | 'ASHWAGANDHA'
  | 'TULSI_KRISHNA_RAMA'
  | 'SHATAVARI'
  | 'ALOE_VERA'
  | 'VASAKA'
  | 'AMLA'
  | 'HARITAKI'
  | 'BAHERA'
  | 'NEEM'
  | 'GULANCHA';

export type PlantPartUsed =
  | 'WHOLE_HERB'
  | 'LEAF_DRIED'
  | 'ROOT_RHIZOME'
  | 'BARK_STEM'
  | 'FRUIT_SEED'
  | 'FLOWER'
  | 'GEL_EXTRACT';

export type ProcessingState =
  | 'RAW_FRESH_HARVEST'
  | 'SHADE_DRIED_WHOLE'
  | 'SOLAR_DEHYDRATED_CHOPPED'
  | 'FINE_PULVERIZED_POWDER'
  | 'STANDARDIZED_EXTRACT';

export type GACPStandardGrade =
  | 'PHARMA_GRADE_A'
  | 'COMMERCIAL_GRADE_B'
  | 'RAW_UNSORTED_C';

export type LabCertificateStatus =
  | 'TESTED_COMPLIANT_DGDA'
  | 'TESTING_PENDING'
  | 'REJECTED_EXCESS_MOISTURE_OR_MOLD';

export type SourcingContractStatus =
  | 'CONTRACT_ACTIVE'
  | 'INSPECTION_PENDING'
  | 'FULFILLED_ACCEPTED'
  | 'REJECTED_NON_COMPLIANT'
  | 'CANCELLED';

export interface HerbalMoistureAudit {
  id: string;
  batchId: string;
  inspectorId: string;
  inspectorName: string;
  testedMoisturePercentage: number;
  isAflatoxinDetected: boolean;
  leadHeavyMetalPpm: number;
  foreignMatterPercentage: number;
  evaluatedGrade: GACPStandardGrade;
  complianceVerdictBn: string;
  inspectorNotes: string | null;
  createdAt: string;
}

export interface HerbalBatch {
  id: string;
  growerId: string;
  cooperativeName: string;
  growerPhone: string;
  growerDistrict: string;
  growerUpazila: string;
  batchNumber: string;
  species: HerbalSpecies;
  scientificName: string;
  plantPart: PlantPartUsed;
  processingState: ProcessingState;
  harvestedDate: string;
  totalWeightKg: number;
  moistureContentPercentage: number;
  activePhytochemicalPercentage: number | null;
  phytochemicalMarkerName: string | null;
  labReportNumber: string | null;
  testingLaboratory: string | null;
  gacpGrade: GACPStandardGrade;
  certStatus: LabCertificateStatus;
  pricePerKgBdt: number;
  minOrderKg: number;
  isOrganicCertified: boolean;
  storageWarehouseConditions: string | null;
  isAvailable: boolean;
  description: string | null;
  audits?: HerbalMoistureAudit[];
  createdAt: string;
  updatedAt: string;
}

export interface PharmaSourcingContract {
  id: string;
  contractNumber: string;
  pharmaCompanyId: string;
  buyerCompanyName: string;
  buyerContactPerson: string;
  buyerPhone: string;
  sellerCooperativeId: string;
  cooperativeName: string;
  species: HerbalSpecies;
  plantPart: PlantPartUsed;
  processingState: ProcessingState;
  targetWeightKg: number;
  agreedPricePerKgBdt: number;
  maxAllowedMoisturePercentage: number;
  deliveryDeadline: string;
  destinationWarehouseDistrict: string;
  escrowAdvanceAmountBdt: number;
  finalSettlementAmountBdt: number;
  contractStatus: SourcingContractStatus;
  specialPharmacopoeiaSpecifications: string | null;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HerbalSupplyOverviewStats {
  totalBatchesAvailable: number;
  totalActiveWeightKg: number;
  averageMoisturePercentage: number;
  pharmaGradePercentage: number;
  activePharmaContracts: number;
  totalHerbalTradeVolumeBdt: number;
}

export interface BiomassCalculationResult {
  freshHarvestKg: number;
  expectedDryYieldKg: number;
  waterLossPercentage: number;
  conversionRatioText: string;
  freshFarmgatePriceEstimateBdt: number;
  driedPharmaPriceEstimateBdt: number;
  netFarmerAdvantageBdt: number;
  advantagePercentage: number;
  recommendationBn: string;
}

export const herbalSupplyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getHerbalOverviewStats: builder.query<{ success: boolean; data: HerbalSupplyOverviewStats }, void>({
      query: () => '/herbal-supply/stats/overview',
      providesTags: ['HerbalBatch', 'PharmaContract'],
    }),

    getHerbalBatches: builder.query<
      { success: boolean; data: HerbalBatch[] },
      { species?: HerbalSpecies; district?: string; gacpGrade?: GACPStandardGrade; pharmaGradeOnly?: boolean } | void
    >({
      query: (params) => ({
        url: '/herbal-supply/batches',
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'HerbalBatch' as const, id })),
              { type: 'HerbalBatch', id: 'LIST' },
            ]
          : [{ type: 'HerbalBatch', id: 'LIST' }],
    }),

    getHerbalBatchById: builder.query<{ success: boolean; data: HerbalBatch }, string>({
      query: (id) => `/herbal-supply/batches/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'HerbalBatch', id }],
    }),

    getBiomassCalculation: builder.query<
      { success: boolean; data: BiomassCalculationResult },
      { species: HerbalSpecies; plantPart: PlantPartUsed; freshHarvestKg: number }
    >({
      query: (params) => ({
        url: '/herbal-supply/biomass-calc',
        params,
      }),
    }),

    createHerbalBatch: builder.mutation<{ success: boolean; data: HerbalBatch }, Partial<HerbalBatch>>({
      query: (body) => ({
        url: '/herbal-supply/batches',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'HerbalBatch', id: 'LIST' }, { type: 'HerbalBatch', id: 'GROWER_LIST' }],
    }),

    getGrowerBatches: builder.query<{ success: boolean; data: HerbalBatch[] }, void>({
      query: () => '/herbal-supply/grower/my-batches',
      providesTags: [{ type: 'HerbalBatch', id: 'GROWER_LIST' }],
    }),

    updateHerbalBatch: builder.mutation<
      { success: boolean; data: HerbalBatch },
      { id: string } & Partial<HerbalBatch>
    >({
      query: ({ id, ...body }) => ({
        url: `/herbal-supply/batches/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'HerbalBatch', id },
        { type: 'HerbalBatch', id: 'LIST' },
        { type: 'HerbalBatch', id: 'GROWER_LIST' },
      ],
    }),

    recordMoistureAudit: builder.mutation<{ success: boolean; data: HerbalMoistureAudit }, Partial<HerbalMoistureAudit>>({
      query: (body) => ({
        url: '/herbal-supply/audits',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_res, _err, { batchId }) => [
        { type: 'HerbalBatch', id: batchId },
        { type: 'HerbalBatch', id: 'LIST' },
        { type: 'HerbalBatch', id: 'GROWER_LIST' },
      ],
    }),

    createPharmaContract: builder.mutation<{ success: boolean; data: PharmaSourcingContract }, Partial<PharmaSourcingContract>>({
      query: (body) => ({
        url: '/herbal-supply/contracts',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'PharmaContract', id: 'MY_LIST' }, { type: 'PharmaContract', id: 'ADMIN_LIST' }],
    }),

    getMyPharmaContracts: builder.query<{ success: boolean; data: PharmaSourcingContract[] }, void>({
      query: () => '/herbal-supply/contracts/my',
      providesTags: [{ type: 'PharmaContract', id: 'MY_LIST' }],
    }),

    getAllAdminContracts: builder.query<{ success: boolean; data: PharmaSourcingContract[] }, void>({
      query: () => '/herbal-supply/admin/contracts',
      providesTags: [{ type: 'PharmaContract', id: 'ADMIN_LIST' }],
    }),

    updateContractStatus: builder.mutation<
      { success: boolean; data: PharmaSourcingContract },
      { id: string; status: SourcingContractStatus }
    >({
      query: ({ id, status }) => ({
        url: `/herbal-supply/admin/contracts/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: [{ type: 'PharmaContract', id: 'MY_LIST' }, { type: 'PharmaContract', id: 'ADMIN_LIST' }],
    }),
  }),
});

export const {
  useGetHerbalOverviewStatsQuery,
  useGetHerbalBatchesQuery,
  useGetHerbalBatchByIdQuery,
  useGetBiomassCalculationQuery,
  useCreateHerbalBatchMutation,
  useGetGrowerBatchesQuery,
  useUpdateHerbalBatchMutation,
  useRecordMoistureAuditMutation,
  useCreatePharmaContractMutation,
  useGetMyPharmaContractsQuery,
  useGetAllAdminContractsQuery,
  useUpdateContractStatusMutation,
} = herbalSupplyApi;
