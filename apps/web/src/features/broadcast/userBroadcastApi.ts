import { api } from '@/store/api';

export interface UserBroadcastMessage {
  id: string;
  broadcastId: string;
  title: string;
  templateName?: string | null;
  message: string;
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'QUEUED' | 'PENDING';
  isRead: boolean;
  sentAt?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
  createdAt: string;
}

export interface UserBroadcastInboxResponse {
  data: UserBroadcastMessage[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    unreadCount: number;
  };
}

export interface QueryUserBroadcastsParams {
  page?: number;
  limit?: number;
  search?: string;
  unreadOnly?: boolean;
}

export const userBroadcastApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMyBroadcastMessages: builder.query<
      UserBroadcastInboxResponse,
      QueryUserBroadcastsParams | void
    >({
      query: (params) => ({
        url: '/broadcasts/my-inbox',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'UserBroadcast' as const, id })),
              { type: 'UserBroadcast', id: 'LIST' },
            ]
          : [{ type: 'UserBroadcast', id: 'LIST' }],
    }),

    getMyBroadcastUnreadCount: builder.query<{ unreadCount: number }, void>({
      query: () => '/broadcasts/my-inbox/unread-count',
      providesTags: [{ type: 'UserBroadcast', id: 'UNREAD_COUNT' }],
    }),

    getBroadcastMessage: builder.query<UserBroadcastMessage, string>({
      query: (id) => `/broadcasts/my-inbox/${id}`,
      providesTags: (result, error, id) => [{ type: 'UserBroadcast', id }],
    }),

    markBroadcastMessageRead: builder.mutation<UserBroadcastMessage, string>({
      query: (id) => ({
        url: `/broadcasts/my-inbox/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'UserBroadcast', id },
        { type: 'UserBroadcast', id: 'LIST' },
        { type: 'UserBroadcast', id: 'UNREAD_COUNT' },
      ],
    }),

    markAllBroadcastMessagesRead: builder.mutation<{ success: boolean; updatedCount: number }, void>({
      query: () => ({
        url: '/broadcasts/my-inbox/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: [
        { type: 'UserBroadcast', id: 'LIST' },
        { type: 'UserBroadcast', id: 'UNREAD_COUNT' },
      ],
    }),
  }),
});

export const {
  useGetMyBroadcastMessagesQuery,
  useGetMyBroadcastUnreadCountQuery,
  useGetBroadcastMessageQuery,
  useMarkBroadcastMessageReadMutation,
  useMarkAllBroadcastMessagesReadMutation,
} = userBroadcastApi;
