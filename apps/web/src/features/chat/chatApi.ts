import { api } from '../../store/api';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface ConversationParticipant {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface Conversation {
  id: string;
  participants: ConversationParticipant[];
  messages: ChatMessage[];
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
    getMessages: builder.query<ChatMessage[], string>({
      query: (conversationId) => `/chat/conversations/${conversationId}/messages`,
      providesTags: (result, error, id) => [{ type: 'Message', id }],
    }),
    markAsRead: builder.mutation<{ success: boolean }, string>({
      query: (conversationId) => ({
        url: `/chat/conversations/${conversationId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Message', id }, 'Conversation'],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useCreateConversationMutation,
  useGetMessagesQuery,
  useMarkAsReadMutation,
} = chatApi;
