import { api } from '@/store/api';
import { User } from '../users/usersApi';

export interface Message {
  id: string;
  content: string;
  senderId: string;
  sender?: User;
  conversationId: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export const chatApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query<Conversation[], void>({
      query: () => '/chat/conversations',
      providesTags: ['Conversation'],
    }),
    createConversation: builder.mutation<Conversation, { participantId: string }>({
      query: (body) => ({
        url: '/chat/conversations',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Conversation'],
    }),
    getMessages: builder.query<Message[], string>({
      query: (conversationId) => `/chat/conversations/${conversationId}/messages`,
      providesTags: (_result, _error, id) => [{ type: 'Message', id }],
    }),
    markAsRead: builder.mutation<{ success: boolean }, string>({
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
