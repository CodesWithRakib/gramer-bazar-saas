import { api } from '../../store/api';

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface SellerApplication {
  id: string;
  userId: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    phone: string;
    email?: string;
  };
  shopNameEn: string;
  shopNameBn: string;
  shopSlug: string;
  phone: string;
  email?: string | null;
  description?: string | null;
  address?: string | null;
  tradeLicenseNumber?: string | null;
  nidNumber?: string | null;
  status: ApplicationStatus;
  adminNotes?: string | null;
  reviewerId?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RiderApplication {
  id: string;
  userId: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    phone: string;
    email?: string;
  };
  fullName: string;
  phone: string;
  email?: string | null;
  nidNumber: string;
  vehicleType: string;
  vehiclePlateNumber?: string | null;
  drivingLicenseNumber?: string | null;
  preferredZone?: string | null;
  emergencyContact?: string | null;
  status: ApplicationStatus;
  adminNotes?: string | null;
  reviewerId?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSellerApplicationRequest {
  shopNameEn: string;
  shopNameBn: string;
  shopSlug: string;
  phone: string;
  email?: string;
  description?: string;
  address?: string;
  tradeLicenseNumber?: string;
  nidNumber?: string;
}

export interface CreateRiderApplicationRequest {
  fullName: string;
  phone: string;
  email?: string;
  nidNumber: string;
  vehicleType: string;
  vehiclePlateNumber?: string;
  drivingLicenseNumber?: string;
  preferredZone?: string;
  emergencyContact?: string;
}

export interface PaginatedApplications<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const applicationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Seller applications
    submitSellerApplication: builder.mutation<SellerApplication, CreateSellerApplicationRequest>({
      query: (body) => ({
        url: '/applications/seller',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SellerApplication'],
    }),
    getMySellerApplication: builder.query<SellerApplication | null, void>({
      query: () => '/applications/seller/me',
      providesTags: ['SellerApplication'],
    }),
    getAdminSellerApplications: builder.query<
      PaginatedApplications<SellerApplication>,
      { status?: ApplicationStatus; page?: number; limit?: number }
    >({
      query: (params) => ({
        url: '/applications/admin/sellers',
        params,
      }),
      providesTags: ['SellerApplication'],
    }),
    getAdminSellerApplicationById: builder.query<SellerApplication, string>({
      query: (id) => `/applications/admin/sellers/${id}`,
      providesTags: ['SellerApplication'],
    }),
    approveSellerApplication: builder.mutation<SellerApplication, { id: string; adminNotes?: string }>({
      query: ({ id, adminNotes }) => ({
        url: `/applications/admin/sellers/${id}/approve`,
        method: 'PATCH',
        body: { adminNotes },
      }),
      invalidatesTags: ['SellerApplication', 'User', 'Shop'],
    }),
    rejectSellerApplication: builder.mutation<SellerApplication, { id: string; adminNotes?: string }>({
      query: ({ id, adminNotes }) => ({
        url: `/applications/admin/sellers/${id}/reject`,
        method: 'PATCH',
        body: { adminNotes },
      }),
      invalidatesTags: ['SellerApplication'],
    }),

    // Rider applications
    submitRiderApplication: builder.mutation<RiderApplication, CreateRiderApplicationRequest>({
      query: (body) => ({
        url: '/applications/rider',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['RiderApplication'],
    }),
    getMyRiderApplication: builder.query<RiderApplication | null, void>({
      query: () => '/applications/rider/me',
      providesTags: ['RiderApplication'],
    }),
    getAdminRiderApplications: builder.query<
      PaginatedApplications<RiderApplication>,
      { status?: ApplicationStatus; page?: number; limit?: number }
    >({
      query: (params) => ({
        url: '/applications/admin/riders',
        params,
      }),
      providesTags: ['RiderApplication'],
    }),
    getAdminRiderApplicationById: builder.query<RiderApplication, string>({
      query: (id) => `/applications/admin/riders/${id}`,
      providesTags: ['RiderApplication'],
    }),
    approveRiderApplication: builder.mutation<RiderApplication, { id: string; adminNotes?: string }>({
      query: ({ id, adminNotes }) => ({
        url: `/applications/admin/riders/${id}/approve`,
        method: 'PATCH',
        body: { adminNotes },
      }),
      invalidatesTags: ['RiderApplication', 'User'],
    }),
    rejectRiderApplication: builder.mutation<RiderApplication, { id: string; adminNotes?: string }>({
      query: ({ id, adminNotes }) => ({
        url: `/applications/admin/riders/${id}/reject`,
        method: 'PATCH',
        body: { adminNotes },
      }),
      invalidatesTags: ['RiderApplication'],
    }),
  }),
});

export const {
  useSubmitSellerApplicationMutation,
  useGetMySellerApplicationQuery,
  useGetAdminSellerApplicationsQuery,
  useGetAdminSellerApplicationByIdQuery,
  useApproveSellerApplicationMutation,
  useRejectSellerApplicationMutation,
  useSubmitRiderApplicationMutation,
  useGetMyRiderApplicationQuery,
  useGetAdminRiderApplicationsQuery,
  useGetAdminRiderApplicationByIdQuery,
  useApproveRiderApplicationMutation,
  useRejectRiderApplicationMutation,
} = applicationsApi;
