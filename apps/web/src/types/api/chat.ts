import type { Schema } from './common.js';

export type Conversation = Schema<'ConversationResponseDto'>;
export type ChatMessage = Schema<'ChatMessageResponseDto'>;
export type ConversationParticipant = Schema<'ConversationParticipantDto'>;
export type ChatUnreadCounts = Schema<'ChatUnreadCountsResponseDto'>;

export type CreateConversationRequest = Schema<'CreateConversationDto'>;
export type SendChatMessageRequest = Schema<'SendChatMessageDto'>;
