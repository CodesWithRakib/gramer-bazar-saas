import { api } from '../../store/api';
import {
  AppNotification,
  PaginatedNotifications,
  QueryNotificationsParams,
} from '../../types/notifications';

export const notificationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserNotifications: builder.query<PaginatedNotifications, QueryNotificationsParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.set('page', String(params.page));
        if (params?.limit) queryParams.set('limit', String(params.limit));
        if (params?.unreadOnly !== undefined) {
          queryParams.set('unreadOnly', String(params.unreadOnly));
        }
        const qs = queryParams.toString();
        return `/notifications${qs ? `?${qs}` : ''}`;
      },
      transformResponse: (rawResponse: unknown): PaginatedNotifications => {
        let items: AppNotification[] = [];
        let total = 0;
        let page = 1;
        let limit = 20;
        let totalPages = 1;

        if (Array.isArray(rawResponse)) {
          items = rawResponse as AppNotification[];
          total = items.length;
          totalPages = Math.max(1, Math.ceil(total / limit));
        } else if (rawResponse && typeof rawResponse === 'object') {
          const res = rawResponse as Record<string, unknown>;
          if (Array.isArray(res.data)) {
            items = res.data as AppNotification[];
            const meta = res.meta as Record<string, unknown> | undefined;
            if (meta) {
              total = Number(meta.total ?? items.length);
              page = Number(meta.page ?? 1);
              limit = Number(meta.limit ?? 20);
              totalPages = Number(meta.totalPages ?? Math.max(1, Math.ceil(total / limit)));
            } else {
              total = items.length;
              totalPages = Math.max(1, Math.ceil(total / limit));
            }
          } else if (Array.isArray(res.items)) {
            items = res.items as AppNotification[];
            total = Number(res.total ?? items.length);
            page = Number(res.page ?? 1);
            limit = Number(res.limit ?? 20);
            totalPages = Number(res.totalPages ?? Math.max(1, Math.ceil(total / limit)));
          }
        }

        return {
          items,
          total,
          page,
          limit,
          totalPages: Math.max(1, totalPages),
          unreadCount: 0,
        };
      },
      providesTags: (result) =>
        result && Array.isArray(result.items)
          ? [
              ...result.items.map(({ id }) => ({ type: 'Notification' as const, id })),
              { type: 'Notification' as const, id: 'LIST' },
            ]
          : [{ type: 'Notification' as const, id: 'LIST' }],
    }),

    getUnreadCount: builder.query<{ count: number }, void>({
      query: () => '/notifications/unread-count',
      providesTags: [{ type: 'Notification', id: 'COUNT' }],
    }),

    markAsRead: builder.mutation<AppNotification, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Notification', id },
        { type: 'Notification', id: 'COUNT' },
      ],
    }),

    markAllAsRead: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: [
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'COUNT' },
      ],
    }),
  }),
});

export const {
  useGetUserNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationsApi;
