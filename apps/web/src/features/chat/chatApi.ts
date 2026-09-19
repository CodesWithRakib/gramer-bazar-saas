import { api } from '@/store/api';

export const chatApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query<any, void>({
      query: () => '/chat/conversations',
      providesTags: ['Conversation'],
    }),
    createConversation: builder.mutation<any, { participantId: string }>({
      query: (body) => ({
        url: '/chat/conversations',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Conversation'],
    }),
    getMessages: builder.query<any, string>({
      query: (conversationId) => `/chat/conversations/${conversationId}/messages`,
      providesTags: (_result, _error, id) => [{ type: 'Message', id }],
    }),
    markAsRead: builder.mutation<any, string>({
      query: (conversationId) => ({
        url: `/chat/conversations/${conversationId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Conversation'],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useCreateConversationMutation,
  useGetMessagesQuery,
  useMarkAsReadMutation,
} = chatApi;
