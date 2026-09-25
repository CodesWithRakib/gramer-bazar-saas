import { api } from '@/store/api';

export interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  supportPhone?: string;
  allowSellerRegistration: boolean;
}

export type UpdateSettingsRequest = Partial<PlatformSettings>;

export const settingsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<PlatformSettings, void>({
      query: () => '/admin/settings',
      providesTags: ['Settings'],
    }),
    updateSettings: builder.mutation<PlatformSettings, UpdateSettingsRequest>({
      query: (body) => ({
        url: '/admin/settings',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Settings'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi;
