import { api } from '../../store/api';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType?: string;
  senderRole?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface ConversationParticipant {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string;
  avatar?: string | null;
  role?: string;
  roles?: { id: string; name: string }[];
}

export interface Conversation {
  id: string;
  referenceId?: string | null;
  referenceType?: string | null;
  participants: ConversationParticipant[];
  messages?: ChatMessage[];
  lastMessage?: ChatMessage | null;
  unreadCount?: number;
  createdAt?: string;
  updatedAt: string;
}

export interface CreateConversationPayload {
  participantId: string;
  referenceId?: string | null;
  referenceType?: string | null;
}

export interface UnreadCountResponse {
  unreadCount: number;
  unreadConversationsCount: number;
}

export interface GetMessagesParams {
  conversationId: string;
  limit?: number;
  before?: string;
}

export const chatApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUnreadCount: builder.query<UnreadCountResponse, void>({
      query: () => '/chat/unread-count',
      providesTags: ['Conversation'],
    }),
    getConversations: builder.query<Conversation[], void>({
      query: () => '/chat/conversations',
      providesTags: ['Conversation'],
    }),
    createConversation: builder.mutation<Conversation, CreateConversationPayload>({
      query: (body) => ({
        url: '/chat/conversations',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Conversation'],
    }),
    getMessages: builder.query<ChatMessage[], string | GetMessagesParams>({
      query: (arg) => {
        if (typeof arg === 'string') {
          return `/chat/conversations/${arg}/messages`;
        }
        const params = new URLSearchParams();
        if (arg.limit) params.set('limit', String(arg.limit));
        if (arg.before) params.set('before', arg.before);
        const qs = params.toString();
        return `/chat/conversations/${arg.conversationId}/messages${qs ? `?${qs}` : ''}`;
      },
      providesTags: (result, error, arg) => {
        const id = typeof arg === 'string' ? arg : arg.conversationId;
        return [{ type: 'Message', id }];
      },
    }),
    sendMessageRest: builder.mutation<ChatMessage, { conversationId: string; content: string; messageType?: string }>({
      query: ({ conversationId, content, messageType }) => ({
        url: `/chat/conversations/${conversationId}/messages`,
        method: 'POST',
        body: { content, messageType },
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: 'Message', id: conversationId },
        'Conversation',
      ],
    }),
    markMessagesAsRead: builder.mutation<{ success: boolean }, string>({
      query: (conversationId) => ({
        url: `/chat/conversations/${conversationId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Conversation', 'Message'],
    }),
  }),
});

export const {
  useGetUnreadCountQuery,
  useGetConversationsQuery,
  useCreateConversationMutation,
  useGetMessagesQuery,
  useSendMessageRestMutation,
  useMarkMessagesAsReadMutation,
} = chatApi;

