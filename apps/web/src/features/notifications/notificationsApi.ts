import { api } from "../../store/api";

export const notificationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserNotifications: builder.query<Notification[], void>({
      query: () => "/notifications",
      providesTags: ["Notification"],
    }),
    getUnreadCount: builder.query<{ count: number }, void>({
      query: () => "/notifications/unread-count",
      providesTags: ["Notification"],
    }),
    markAsRead: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),
    markAllAsRead: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetUserNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationsApi;
