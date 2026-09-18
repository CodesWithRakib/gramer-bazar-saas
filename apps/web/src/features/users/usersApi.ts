import { api } from '../../store/api';
export enum Role {
  CUSTOMER = 'CUSTOMER',
  SELLER = 'SELLER',
  RIDER = 'RIDER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roles: { name: Role }[];
  status: string;
  createdAt: string;
}

export interface PaginatedUsers {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<PaginatedUsers, { page?: number; limit?: number; search?: string; role?: string }>({
      query: (params) => ({
        url: '/users',
        params,
      }),
      providesTags: ['User'],
    }),
  }),
});

export const { useGetUsersQuery } = usersApi;
