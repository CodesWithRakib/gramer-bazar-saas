import { api } from '../../store/api';
import {
  Announcement,
  AnnouncementTemplate,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  CreateAnnouncementTemplateRequest,
  UpdateAnnouncementTemplateRequest,
} from './types';

export const announcementsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAnnouncements: builder.query<Announcement[], void>({
      query: () => '/announcements',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Announcement' as const, id })),
              { type: 'Announcement', id: 'LIST' },
            ]
          : [{ type: 'Announcement', id: 'LIST' }],
    }),
    getAnnouncement: builder.query<Announcement, string>({
      query: (id) => `/announcements/${id}`,
      providesTags: (result, error, id) => [{ type: 'Announcement', id }],
    }),
    createAnnouncement: builder.mutation<Announcement, CreateAnnouncementRequest>({
      query: (body) => ({
        url: '/announcements',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Announcement', id: 'LIST' }],
    }),
    updateAnnouncement: builder.mutation<Announcement, { id: string; data: UpdateAnnouncementRequest }>({
      query: ({ id, data }) => ({
        url: `/announcements/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Announcement', id },
        { type: 'Announcement', id: 'LIST' },
      ],
    }),
    sendAnnouncement: builder.mutation<Announcement, string>({
      query: (id) => ({
        url: `/announcements/${id}/send`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Announcement', id },
        { type: 'Announcement', id: 'LIST' },
      ],
    }),
    cancelAnnouncement: builder.mutation<Announcement, string>({
      query: (id) => ({
        url: `/announcements/${id}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Announcement', id },
        { type: 'Announcement', id: 'LIST' },
      ],
    }),
    deleteAnnouncement: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/announcements/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Announcement', id: 'LIST' }],
    }),

    // Templates
    getAnnouncementTemplates: builder.query<AnnouncementTemplate[], void>({
      query: () => '/announcements/templates',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'AnnouncementTemplate' as const, id })),
              { type: 'AnnouncementTemplate', id: 'LIST' },
            ]
          : [{ type: 'AnnouncementTemplate', id: 'LIST' }],
    }),
    createAnnouncementTemplate: builder.mutation<AnnouncementTemplate, CreateAnnouncementTemplateRequest>({
      query: (body) => ({
        url: '/announcements/templates',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'AnnouncementTemplate', id: 'LIST' }],
    }),
    updateAnnouncementTemplate: builder.mutation<AnnouncementTemplate, { id: string; data: UpdateAnnouncementTemplateRequest }>({
      query: ({ id, data }) => ({
        url: `/announcements/templates/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'AnnouncementTemplate', id },
        { type: 'AnnouncementTemplate', id: 'LIST' },
      ],
    }),
    deleteAnnouncementTemplate: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/announcements/templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'AnnouncementTemplate', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetAnnouncementsQuery,
  useGetAnnouncementQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useSendAnnouncementMutation,
  useCancelAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useGetAnnouncementTemplatesQuery,
  useCreateAnnouncementTemplateMutation,
  useUpdateAnnouncementTemplateMutation,
  useDeleteAnnouncementTemplateMutation,
} = announcementsApi;
