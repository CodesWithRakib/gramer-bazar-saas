import { api } from '../../store/api';
import { UserProfile } from '../../store/slices/authSlice';

export interface SendOtpRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export interface LoginRequest {
  emailOrPhone: string;
  password: string;
}

export interface RegisterRequest {
  phone: string;
  email?: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    sendOtp: builder.mutation<{ success: boolean; message?: string }, SendOtpRequest>({
      query: (body) => ({
        url: '/auth/send-otp',
        method: 'POST',
        body,
      }),
    }),
    verifyOtp: builder.mutation<AuthResponse, VerifyOtpRequest>({
      query: (body) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body,
      }),
    }),
    loginWithPassword: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),
    registerStaff: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
    }),
    getProfile: builder.query<UserProfile, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation<{ message: string; user: UserProfile }, Partial<UserProfile>>({
      query: (body) => ({
        url: '/auth/me',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    updatePassword: builder.mutation<
      { message: string },
      { currentPassword?: string; newPassword: string }
    >({
      query: (body) => ({
        url: '/auth/me/password',
        method: 'PATCH',
        body,
      }),
    }),
    uploadAvatar: builder.mutation<{ message: string; avatarUrl: string }, FormData>({
      query: (body) => ({
        url: '/auth/me/avatar',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    deleteAccount: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/me',
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useLoginWithPasswordMutation,
  useRegisterStaffMutation,
  useGetProfileQuery,
  useLazyGetProfileQuery,
  useUpdateProfileMutation,
  useUpdatePasswordMutation,
  useUploadAvatarMutation,
  useDeleteAccountMutation,
} = authApi;
