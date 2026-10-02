import { api } from '@/store/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BroadcastProviderName = 'MOCK' | 'WHATSAPP';
export type BroadcastTemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
export type BroadcastTemplateStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type BroadcastTemplateProviderStatus = 'LOCAL_ONLY' | 'PENDING' | 'APPROVED' | 'REJECTED';
export type BroadcastStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';
export type BroadcastRecipientStatus =
  | 'PENDING'
  | 'QUEUED'
  | 'SENDING'
  | 'SENT'
  | 'DELIVERED'
  | 'READ'
  | 'FAILED';
export type BroadcastAudienceType =
  | 'ALL_CUSTOMERS'
  | 'SELECTED_CUSTOMERS'
  | 'ACTIVE_CUSTOMERS'
  | 'INACTIVE_CUSTOMERS'
  | 'ORDERED_BEFORE'
  | 'NO_RECENT_ORDER'
  | 'AREA_BASED';

export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface BroadcastTemplateVariable {
  key: string;
  label?: string | null;
  example?: string | null;
  required?: boolean;
}

export interface BroadcastTemplate {
  id: string;
  name: string;
  description: string | null;
  language: string;
  category: BroadcastTemplateCategory;
  body: string;
  variables: BroadcastTemplateVariable[];
  provider: BroadcastProviderName;
  providerTemplateId: string | null;
  providerStatus: BroadcastTemplateProviderStatus;
  status: BroadcastTemplateStatus;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BroadcastAudienceConfig {
  customerIds?: string[];
  districtId?: string;
  areaId?: string;
  inactiveDays?: number;
  isOptInRequired?: boolean;
  variables?: Record<string, string>;
}

export interface BroadcastCampaign {
  id: string;
  title: string;
  templateId: string | null;
  templateName: string | null;
  provider: BroadcastProviderName;
  audienceType: BroadcastAudienceType;
  audienceConfig: BroadcastAudienceConfig | null;
  status: BroadcastStatus;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  failureReason: string | null;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  createdBy: string | null;
  createdByName: string | null;
  simulated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BroadcastStats {
  totalRecipients: number;
  pending: number;
  queued: number;
  sending: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  simulated: boolean;
}

export interface BroadcastRecipient {
  id: string;
  broadcastId: string;
  customerId: string | null;
  customerName: string | null;
  phone: string;
  personalizedMessage: string | null;
  status: BroadcastRecipientStatus;
  providerMessageId: string | null;
  attemptCount: number;
  sentAt: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  failedAt: string | null;
  failedReason: string | null;
  createdAt: string;
}

export interface CustomerSummary {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  lastLoginAt: string | null;
  marketingOptIn: boolean;
}

export interface AudiencePreview {
  audienceType: BroadcastAudienceType;
  recipientCount: number;
  excludedOptOutCount: number;
  sample: CustomerSummary[];
  segments: { totalCustomers: number; optedInCustomers: number; optedOutCustomers: number };
}

export interface AudienceSegments {
  segments: { totalCustomers: number; optedInCustomers: number; optedOutCustomers: number };
  byAudienceType: Record<string, number>;
}

export interface TestSendResult {
  broadcastId: string;
  phone: string;
  renderedBody: string;
  status: string;
  providerMessageId: string;
  simulated: boolean;
  failureReason: string | null;
}

export interface CreateTemplateInput {
  name: string;
  description?: string;
  language?: string;
  category?: BroadcastTemplateCategory;
  body: string;
  variables?: BroadcastTemplateVariable[];
  status?: BroadcastTemplateStatus;
}

export interface CreateCampaignInput {
  title: string;
  templateId: string;
  audienceType: BroadcastAudienceType;
  audienceConfig?: BroadcastAudienceConfig;
  scheduledAt?: string;
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export const broadcastApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBroadcastTemplates: builder.query<
      Paginated<BroadcastTemplate>,
      { page?: number; limit?: number; status?: BroadcastTemplateStatus; category?: BroadcastTemplateCategory; search?: string }
    >({
      query: (params) => ({ url: '/super-admin/broadcast/templates', params }),
      providesTags: ['BroadcastTemplate'],
    }),
    getBroadcastTemplate: builder.query<BroadcastTemplate, string>({
      query: (id) => `/super-admin/broadcast/templates/${id}`,
      providesTags: ['BroadcastTemplate'],
    }),
    createBroadcastTemplate: builder.mutation<BroadcastTemplate, CreateTemplateInput>({
      query: (body) => ({ url: '/super-admin/broadcast/templates', method: 'POST', body }),
      invalidatesTags: ['BroadcastTemplate'],
    }),
    updateBroadcastTemplate: builder.mutation<
      BroadcastTemplate,
      { id: string } & Partial<CreateTemplateInput>
    >({
      query: ({ id, ...body }) => ({
        url: `/super-admin/broadcast/templates/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['BroadcastTemplate'],
    }),
    updateBroadcastTemplateStatus: builder.mutation<
      BroadcastTemplate,
      { id: string; status: BroadcastTemplateStatus }
    >({
      query: ({ id, status }) => ({
        url: `/super-admin/broadcast/templates/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['BroadcastTemplate'],
    }),
    deleteBroadcastTemplate: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/super-admin/broadcast/templates/${id}`, method: 'DELETE' }),
      invalidatesTags: ['BroadcastTemplate'],
    }),

    getAudienceSegments: builder.query<AudienceSegments, void>({
      query: () => '/super-admin/broadcast/audience/segments',
      providesTags: ['Broadcast'],
    }),
    searchCustomers: builder.query<CustomerSummary[], { search?: string; limit?: number }>({
      query: (params) => ({ url: '/super-admin/broadcast/audience/customers', params }),
      providesTags: ['Broadcast'],
    }),
    previewAudience: builder.mutation<
      AudiencePreview,
      { audienceType: BroadcastAudienceType; audienceConfig?: BroadcastAudienceConfig }
    >({
      query: (body) => ({ url: '/super-admin/broadcast/audience/preview', method: 'POST', body }),
    }),

    getBroadcastCampaigns: builder.query<
      Paginated<BroadcastCampaign>,
      {
        page?: number;
        limit?: number;
        status?: BroadcastStatus;
        audienceType?: BroadcastAudienceType;
        search?: string;
        from?: string;
        to?: string;
        sortBy?: string;
        sortOrder?: 'ASC' | 'DESC';
      }
    >({
      query: (params) => ({ url: '/super-admin/broadcast/campaigns', params }),
      providesTags: ['Broadcast'],
    }),
    getBroadcastCampaign: builder.query<BroadcastCampaign, string>({
      query: (id) => `/super-admin/broadcast/campaigns/${id}`,
      providesTags: ['Broadcast'],
    }),
    createBroadcastCampaign: builder.mutation<BroadcastCampaign, CreateCampaignInput>({
      query: (body) => ({ url: '/super-admin/broadcast/campaigns', method: 'POST', body }),
      invalidatesTags: ['Broadcast'],
    }),
    updateBroadcastCampaign: builder.mutation<
      BroadcastCampaign,
      { id: string } & Partial<CreateCampaignInput>
    >({
      query: ({ id, ...body }) => ({
        url: `/super-admin/broadcast/campaigns/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Broadcast'],
    }),
    testSendCampaign: builder.mutation<
      TestSendResult,
      { id: string; phone: string; variables?: Record<string, string> }
    >({
      query: ({ id, ...body }) => ({
        url: `/super-admin/broadcast/campaigns/${id}/test`,
        method: 'POST',
        body,
      }),
    }),
    sendBroadcastCampaign: builder.mutation<BroadcastCampaign, string>({
      query: (id) => ({ url: `/super-admin/broadcast/campaigns/${id}/send`, method: 'POST' }),
      invalidatesTags: ['Broadcast'],
    }),
    cancelBroadcastCampaign: builder.mutation<BroadcastCampaign, string>({
      query: (id) => ({ url: `/super-admin/broadcast/campaigns/${id}/cancel`, method: 'POST' }),
      invalidatesTags: ['Broadcast'],
    }),
    getBroadcastStats: builder.query<BroadcastStats, string>({
      query: (id) => `/super-admin/broadcast/campaigns/${id}/stats`,
      providesTags: ['Broadcast'],
    }),
    getBroadcastRecipients: builder.query<
      Paginated<BroadcastRecipient>,
      { id: string; page?: number; limit?: number; status?: BroadcastRecipientStatus; search?: string }
    >({
      query: ({ id, ...params }) => ({
        url: `/super-admin/broadcast/campaigns/${id}/recipients`,
        params,
      }),
      providesTags: ['Broadcast'],
    }),
  }),
});

export const {
  useGetBroadcastTemplatesQuery,
  useGetBroadcastTemplateQuery,
  useCreateBroadcastTemplateMutation,
  useUpdateBroadcastTemplateMutation,
  useUpdateBroadcastTemplateStatusMutation,
  useDeleteBroadcastTemplateMutation,
  useGetAudienceSegmentsQuery,
  useSearchCustomersQuery,
  usePreviewAudienceMutation,
  useGetBroadcastCampaignsQuery,
  useGetBroadcastCampaignQuery,
  useCreateBroadcastCampaignMutation,
  useUpdateBroadcastCampaignMutation,
  useTestSendCampaignMutation,
  useSendBroadcastCampaignMutation,
  useCancelBroadcastCampaignMutation,
  useGetBroadcastStatsQuery,
  useGetBroadcastRecipientsQuery,
} = broadcastApi;
