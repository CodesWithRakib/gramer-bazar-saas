import { api } from '@/store/api';
import { PaginationMeta } from '../catalog/catalogApi';
import { WarehouseHub } from '../warehouses/warehousesApi';

export enum CropType {
  POTATO = 'POTATO',
  RICE = 'RICE',
  TOMATO = 'TOMATO',
  ONION = 'ONION',
  CHILI = 'CHILI',
  JUTE = 'JUTE',
  LENTILS = 'LENTILS',
  MUSTARD = 'MUSTARD',
  MANGO = 'MANGO',
  CORN = 'CORN',
}

export enum ProduceGrade {
  GRADE_A = 'GRADE_A',
  GRADE_B = 'GRADE_B',
  GRADE_C = 'GRADE_C',
  REJECTED = 'REJECTED',
}

export enum PesticideUsage {
  ZERO_PESTICIDE_ORGANIC = 'ZERO_PESTICIDE_ORGANIC',
  INTEGRATED_PEST_MANAGEMENT = 'INTEGRATED_PEST_MANAGEMENT',
  CONVENTIONAL_SAFE = 'CONVENTIONAL_SAFE',
  THRESHOLD_EXCEEDED = 'THRESHOLD_EXCEEDED',
}

export enum BatchStatus {
  HARVESTED = 'HARVESTED',
  GRADED = 'GRADED',
  IN_COLD_STORAGE = 'IN_COLD_STORAGE',
  IN_TRANSIT = 'IN_TRANSIT',
  DISTRIBUTED = 'DISTRIBUTED',
}

export enum CheckpointStage {
  HARVEST = 'HARVEST',
  AI_QUALITY_INSPECTION = 'AI_QUALITY_INSPECTION',
  COLD_STORAGE_DEPOSIT = 'COLD_STORAGE_DEPOSIT',
  PACKAGING_QR_STAMP = 'PACKAGING_QR_STAMP',
  DISPATCH_IN_TRANSIT = 'DISPATCH_IN_TRANSIT',
  DELIVERED_TO_BUYER = 'DELIVERED_TO_BUYER',
}

export interface VisualAssessmentData {
  uniformityScore: number;
  surfaceDefectScore: number;
  colorScore: number;
  moistureScore: number;
  recommendationEn: string;
  recommendationBn: string;
  pricePremiumPercent: number;
}

export interface CheckpointLog {
  stage: CheckpointStage;
  timestamp: string;
  location: string;
  handlerName: string;
  temperatureC?: number;
  humidity?: number;
  notes?: string;
}

export interface ProduceBatch {
  id: string;
  batchNumber: string;
  sellerId: string;
  cropType: CropType;
  variety: string;
  harvestDate: string;
  farmLocation: string;
  division: string;
  district: string;
  upazila: string;
  harvestYieldKg: number;
  availableKg: number;
  qualityGrade: ProduceGrade;
  qualityScore: number;
  defectPercentage: number;
  visualAssessment: VisualAssessmentData;
  organicCertified: boolean;
  pesticideProfile: PesticideUsage;
  storageHubId?: string | null;
  storageHub?: WarehouseHub | null;
  status: BatchStatus;
  qrCodePayload: string;
  checkpoints: CheckpointLog[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicBatchPassport {
  batchNumber: string;
  cropType: CropType;
  variety: string;
  harvestDate: string;
  farmLocation: string;
  region: string;
  producer: {
    name: string;
    contactPhone: string;
  };
  quality: {
    grade: ProduceGrade;
    score: number;
    defectPercentage: number;
    organicCertified: boolean;
    pesticideProfile: PesticideUsage;
    assessmentDetails: VisualAssessmentData;
  };
  storage?: {
    hubName: string;
    address: string;
    district: string;
  } | null;
  yieldKg: number;
  availableKg: number;
  status: BatchStatus;
  qrVerificationUrl: string;
  timeline: CheckpointLog[];
  verifiedAt: string;
}

export interface CreateProduceBatchDto {
  cropType: CropType;
  variety: string;
  harvestDate: string;
  farmLocation: string;
  division: string;
  district: string;
  upazila: string;
  harvestYieldKg: number;
  organicCertified?: boolean;
  pesticideProfile?: PesticideUsage;
  storageHubId?: string;
  uniformityScore?: number;
  surfaceDefectScore?: number;
  colorScore?: number;
  moistureScore?: number;
}

export interface AddCheckpointLogDto {
  stage: CheckpointStage;
  location: string;
  handlerName: string;
  temperatureC?: number;
  humidity?: number;
  notes?: string;
}

export interface ReassessQualityDto {
  uniformityScore?: number;
  surfaceDefectScore?: number;
  colorScore?: number;
  moistureScore?: number;
}

export const traceabilityApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMyProduceBatches: builder.query<
      { data: ProduceBatch[]; meta: PaginationMeta },
      { page?: number; limit?: number; cropType?: CropType } | void
    >({
      query: (params) => ({
        url: '/traceability/batches/my-batches',
        params: params || undefined,
      }),
      providesTags: ['ProduceBatch'],
    }),

    getProduceBatchById: builder.query<ProduceBatch, string>({
      query: (id) => `/traceability/batches/${id}`,
      providesTags: (result, error, id) => [{ type: 'ProduceBatch', id }],
    }),

    getPublicBatchPassport: builder.query<PublicBatchPassport, string>({
      query: (batchNumber) => `/traceability/public/${batchNumber}`,
    }),

    createProduceBatch: builder.mutation<ProduceBatch, CreateProduceBatchDto>({
      query: (body) => ({
        url: '/traceability/batches',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ProduceBatch'],
    }),

    addCheckpointEvent: builder.mutation<
      ProduceBatch,
      { id: string } & AddCheckpointLogDto
    >({
      query: ({ id, ...body }) => ({
        url: `/traceability/batches/${id}/events`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'ProduceBatch', id }, 'ProduceBatch'],
    }),

    reassessProduceQuality: builder.mutation<
      ProduceBatch,
      { id: string } & ReassessQualityDto
    >({
      query: ({ id, ...body }) => ({
        url: `/traceability/batches/${id}/reassess`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'ProduceBatch', id }, 'ProduceBatch'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMyProduceBatchesQuery,
  useGetProduceBatchByIdQuery,
  useGetPublicBatchPassportQuery,
  useCreateProduceBatchMutation,
  useAddCheckpointEventMutation,
  useReassessProduceQualityMutation,
} = traceabilityApi;
