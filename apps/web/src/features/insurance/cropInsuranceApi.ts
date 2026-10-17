import { api } from '@/store/api';

export type CropType =
  | 'BORO_PADDY'
  | 'AMAN_PADDY'
  | 'POTATO'
  | 'ONION'
  | 'JUTE'
  | 'MUSTARD'
  | 'WATERMELON'
  | 'MAIZE'
  | 'VEGETABLES';

export type AgriSeason = 'KHARIF_1' | 'KHARIF_2' | 'RABI';

export type ParametricTriggerType =
  | 'FLASH_FLOOD'
  | 'EXCESS_RAINFALL'
  | 'CYCLONE_WIND'
  | 'PROLONGED_DROUGHT'
  | 'UNSEASONAL_HAILSTORM'
  | 'HEATWAVE';

export type PolicyStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'CLOSED';
export type EnrollmentStatus =
  | 'ACTIVE'
  | 'CLAIM_IN_REVIEW'
  | 'CLAIM_APPROVED'
  | 'CLAIM_PAID'
  | 'EXPIRED'
  | 'CANCELLED';

export type ClaimDisasterSeverity =
  | 'PARTIAL_LOW'
  | 'PARTIAL_MEDIUM'
  | 'SEVERE_HIGH'
  | 'TOTAL_LOSS';

export type ClaimPayoutMethod = 'BKASH' | 'NAGAD' | 'BANK_TRANSFER' | 'WALLET';

export interface CropInsurancePolicy {
  id: string;
  policyCode: string;
  titleEn: string;
  titleBn: string;
  descriptionEn?: string;
  descriptionBn?: string;
  cropType: CropType;
  season: AgriSeason;
  targetDistrict: string;
  targetUpazila?: string;
  sumInsuredPerBigha: number;
  premiumPerBigha: number;
  governmentSubsidyPct: number;
  farmerPayablePerBigha: number;
  triggerType: ParametricTriggerType;
  triggerThresholdValue: number;
  triggerThresholdUnit: string;
  coverageStartDate: string;
  coverageEndDate: string;
  status: PolicyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FarmerInsuranceEnrollment {
  id: string;
  enrollmentNumber: string;
  policyId: string;
  policy?: CropInsurancePolicy;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerNid?: string;
  plotAddress: string;
  plotDistrict: string;
  plotUpazila: string;
  plotUnion?: string;
  plotVillage?: string;
  plotDagNo?: string;
  plotGpsLat?: number;
  plotGpsLng?: number;
  landAreaBighas: number;
  totalSumInsured: number;
  grossPremium: number;
  subsidyAmount: number;
  netPremiumPaid: number;
  payoutMfsNumber: string;
  status: EnrollmentStatus;
  claims?: ParametricClaimDisbursement[];
  createdAt: string;
  updatedAt: string;
}

export interface ParametricClaimDisbursement {
  id: string;
  claimNumber: string;
  enrollmentId: string;
  enrollment?: FarmerInsuranceEnrollment;
  triggerBreachValue: number;
  triggerBreachDate: string;
  disasterSeverity: ClaimDisasterSeverity;
  damagePct: number;
  payoutAmount: number;
  payoutMethod: ClaimPayoutMethod;
  payoutTransactionRef?: string;
  isAutomatedTrigger: boolean;
  farmerDamageNotes?: string;
  damagePhotos?: string[];
  adminApprovalNotes?: string;
  disbursedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeatherTriggerTelemetry {
  id: string;
  district: string;
  upazila: string;
  stationName: string;
  triggerType: ParametricTriggerType;
  measuredValue: number;
  unit: string;
  isBreach: boolean;
  recordedAt: string;
}

export interface EnrollCropInsuranceDto {
  policyId: string;
  farmerName: string;
  farmerPhone: string;
  farmerNid?: string;
  plotAddress: string;
  plotDistrict: string;
  plotUpazila: string;
  plotUnion?: string;
  plotVillage?: string;
  plotDagNo?: string;
  plotGpsLat?: number;
  plotGpsLng?: number;
  landAreaBighas: number;
  payoutMfsNumber: string;
}

export interface FileInsuranceClaimDto {
  triggerBreachValue: number;
  triggerBreachDate?: string;
  disasterSeverity: ClaimDisasterSeverity;
  farmerDamageNotes?: string;
  damagePhotos?: string[];
  payoutMethod?: ClaimPayoutMethod;
}

export interface CreateCropInsurancePolicyDto {
  policyCode: string;
  titleEn: string;
  titleBn: string;
  descriptionEn?: string;
  descriptionBn?: string;
  cropType: CropType;
  season: AgriSeason;
  targetDistrict: string;
  targetUpazila?: string;
  sumInsuredPerBigha: number;
  premiumPerBigha: number;
  governmentSubsidyPct?: number;
  triggerType: ParametricTriggerType;
  triggerThresholdValue: number;
  triggerThresholdUnit: string;
  coverageStartDate: string;
  coverageEndDate: string;
}

export interface SimulateTelemetryTriggerDto {
  district: string;
  upazila: string;
  stationName: string;
  triggerType: ParametricTriggerType;
  measuredValue: number;
  unit: string;
}

export interface ApproveDisbursementDto {
  damagePct: number;
  payoutMethod: ClaimPayoutMethod;
  payoutTransactionRef: string;
  adminApprovalNotes?: string;
}

export const cropInsuranceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCropInsurancePolicies: builder.query<
      { items: CropInsurancePolicy[]; total: number; page: number; limit: number },
      { cropType?: CropType; season?: AgriSeason; district?: string; status?: PolicyStatus; page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: '/crop-insurance/policies',
        method: 'GET',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'CropInsurancePolicy' as const, id })),
              { type: 'CropInsurancePolicy', id: 'LIST' },
            ]
          : [{ type: 'CropInsurancePolicy', id: 'LIST' }],
    }),

    getCropInsurancePolicyById: builder.query<CropInsurancePolicy, string>({
      query: (id) => `/crop-insurance/policies/${id}`,
      providesTags: (result, error, id) => [{ type: 'CropInsurancePolicy', id }],
    }),

    getRecentTelemetry: builder.query<WeatherTriggerTelemetry[], void>({
      query: () => '/crop-insurance/telemetry/recent',
    }),

    enrollCropInsurance: builder.mutation<FarmerInsuranceEnrollment, EnrollCropInsuranceDto>({
      query: (body) => ({
        url: '/crop-insurance/enroll',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'FarmerEnrollment', id: 'MY_LIST' },
        { type: 'FarmerEnrollment', id: 'ADMIN_LIST' },
      ],
    }),

    getMyCropInsuranceEnrollments: builder.query<FarmerInsuranceEnrollment[], void>({
      query: () => '/crop-insurance/my-enrollments',
      providesTags: [{ type: 'FarmerEnrollment', id: 'MY_LIST' }],
    }),

    getCropInsuranceEnrollmentById: builder.query<FarmerInsuranceEnrollment, string>({
      query: (id) => `/crop-insurance/enrollments/${id}`,
      providesTags: (result, error, id) => [{ type: 'FarmerEnrollment', id }],
    }),

    fileDisasterClaim: builder.mutation<
      ParametricClaimDisbursement,
      { id: string; data: FileInsuranceClaimDto }
    >({
      query: ({ id, data }) => ({
        url: `/crop-insurance/enrollments/${id}/claims`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'FarmerEnrollment', id },
        { type: 'FarmerEnrollment', id: 'MY_LIST' },
        { type: 'InsuranceClaim', id: 'ADMIN_CLAIMS' },
      ],
    }),

    // Admin & Underwriting Operations
    createCropInsurancePolicy: builder.mutation<CropInsurancePolicy, CreateCropInsurancePolicyDto>({
      query: (body) => ({
        url: '/crop-insurance/policies',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'CropInsurancePolicy', id: 'LIST' }],
    }),

    updateCropInsurancePolicy: builder.mutation<
      CropInsurancePolicy,
      { id: string; data: Partial<CreateCropInsurancePolicyDto> & { status?: PolicyStatus } }
    >({
      query: ({ id, data }) => ({
        url: `/crop-insurance/policies/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'CropInsurancePolicy', id },
        { type: 'CropInsurancePolicy', id: 'LIST' },
      ],
    }),

    getAdminCropInsuranceEnrollments: builder.query<FarmerInsuranceEnrollment[], { district?: string } | void>({
      query: (params) => ({
        url: '/crop-insurance/admin/enrollments',
        method: 'GET',
        params: params || {},
      }),
      providesTags: [{ type: 'FarmerEnrollment', id: 'ADMIN_LIST' }],
    }),

    getAdminCropInsuranceClaims: builder.query<ParametricClaimDisbursement[], void>({
      query: () => '/crop-insurance/admin/claims',
      providesTags: [{ type: 'InsuranceClaim', id: 'ADMIN_CLAIMS' }],
    }),

    approveDisasterDisbursement: builder.mutation<
      ParametricClaimDisbursement,
      { id: string; data: ApproveDisbursementDto }
    >({
      query: ({ id, data }) => ({
        url: `/crop-insurance/admin/claims/${id}/disburse`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        { type: 'InsuranceClaim', id: 'ADMIN_CLAIMS' },
        { type: 'FarmerEnrollment', id: 'MY_LIST' },
        { type: 'FarmerEnrollment', id: 'ADMIN_LIST' },
      ],
    }),

    simulateWeatherTrigger: builder.mutation<
      {
        telemetry: WeatherTriggerTelemetry;
        isBreachTriggered: boolean;
        affectedPoliciesCount: number;
        disbursementsGenerated: number;
        totalCompensationAmount: number;
      },
      SimulateTelemetryTriggerDto
    >({
      query: (body) => ({
        url: '/crop-insurance/admin/simulate-trigger',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'InsuranceClaim', id: 'ADMIN_CLAIMS' },
        { type: 'FarmerEnrollment', id: 'MY_LIST' },
        { type: 'FarmerEnrollment', id: 'ADMIN_LIST' },
      ],
    }),
  }),
});

export const {
  useGetCropInsurancePoliciesQuery,
  useGetCropInsurancePolicyByIdQuery,
  useGetRecentTelemetryQuery,
  useEnrollCropInsuranceMutation,
  useGetMyCropInsuranceEnrollmentsQuery,
  useGetCropInsuranceEnrollmentByIdQuery,
  useFileDisasterClaimMutation,
  useCreateCropInsurancePolicyMutation,
  useUpdateCropInsurancePolicyMutation,
  useGetAdminCropInsuranceEnrollmentsQuery,
  useGetAdminCropInsuranceClaimsQuery,
  useApproveDisasterDisbursementMutation,
  useSimulateWeatherTriggerMutation,
} = cropInsuranceApi;
