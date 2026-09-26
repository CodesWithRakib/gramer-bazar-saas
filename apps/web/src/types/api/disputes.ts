import type { Schema } from './common.js';

export type Dispute = Schema<'DisputeResponseDto'>;
export type DisputeMessage = Schema<'DisputeMessageResponseDto'>;

export type CreateDisputeRequest = Schema<'CreateDisputeDto'>;
export type AddDisputeMessageRequest = Schema<'AddDisputeMessageDto'>;
export type ResolveDisputeRequest = Schema<'ResolveDisputeDto'>;
