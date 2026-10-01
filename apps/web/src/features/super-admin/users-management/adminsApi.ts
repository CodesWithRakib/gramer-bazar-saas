import { api } from '../../../store/api';

export type AdminRole = 'ADMIN' | 'SUPER_ADMIN';

export interface AdminAccount {
  id: string;
  phone: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
  roles: string[];
  directPermissions: string[];
  effectivePermissions: string[];
  isSuperAdmin: boolean;
}

export interface PaginatedAdmins {
  data: AdminAccount[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PermissionItem {
  name: string;
  description: string | null;
  group: string;
  sensitive: boolean;
}

export interface PermissionCatalog {
  permissions: PermissionItem[];
  groups: string[];
}

export interface RoleWithPermissions {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  isSystem: boolean;
}

export interface CreateAdminRequest {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  password: string;
  role: AdminRole;
  permissions?: string[];
}

export interface UpdateAdminRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  status?: string;
}

export const adminsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdmins: builder.query<
      PaginatedAdmins,
      { page?: number; limit?: number; search?: string; role?: AdminRole }
    >({
      query: (params) => ({ url: '/admin/admins', params }),
      providesTags: ['Admin'],
    }),
    getMyAdminProfile: builder.query<AdminAccount, void>({
      query: () => ({ url: '/admin/admins/me' }),
      providesTags: ['Admin'],
    }),
    getPermissionCatalog: builder.query<PermissionCatalog, void>({
      query: () => ({ url: '/admin/admins/permissions' }),
      providesTags: ['Role'],
    }),
    getRoles: builder.query<RoleWithPermissions[], void>({
      query: () => ({ url: '/admin/admins/roles' }),
      providesTags: ['Role'],
    }),
    createAdmin: builder.mutation<AdminAccount, CreateAdminRequest>({
      query: (body) => ({ url: '/admin/admins', method: 'POST', body }),
      invalidatesTags: ['Admin'],
    }),
    updateAdmin: builder.mutation<AdminAccount, { id: string; body: UpdateAdminRequest }>({
      query: ({ id, body }) => ({ url: `/admin/admins/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Admin'],
    }),
    setAdminPermissions: builder.mutation<AdminAccount, { id: string; permissions: string[] }>({
      query: ({ id, permissions }) => ({
        url: `/admin/admins/${id}/permissions`,
        method: 'PATCH',
        body: { permissions },
      }),
      invalidatesTags: ['Admin'],
    }),
    resetAdminPassword: builder.mutation<{ message: string }, { id: string; newPassword: string }>({
      query: ({ id, newPassword }) => ({
        url: `/admin/admins/${id}/password`,
        method: 'PATCH',
        body: { newPassword },
      }),
    }),
    deactivateAdmin: builder.mutation<{ message: string }, { id: string }>({
      query: ({ id }) => ({ url: `/admin/admins/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Admin'],
    }),
    updateRolePermissions: builder.mutation<
      { id: string; name: string; permissions: string[] },
      { role: string; permissions: string[] }
    >({
      query: ({ role, permissions }) => ({
        url: `/admin/admins/roles/${role}/permissions`,
        method: 'PATCH',
        body: { permissions },
      }),
      invalidatesTags: ['Role', 'Admin'],
    }),
  }),
});

export const {
  useGetAdminsQuery,
  useGetMyAdminProfileQuery,
  useGetPermissionCatalogQuery,
  useGetRolesQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useSetAdminPermissionsMutation,
  useResetAdminPasswordMutation,
  useDeactivateAdminMutation,
  useUpdateRolePermissionsMutation,
} = adminsApi;
