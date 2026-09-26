import type { Schema } from './common.js';

export type Review = Schema<'ReviewResponseDto'>;
export type ReviewUserSummary = Schema<'ReviewUserSummaryDto'>;

export type CreateReviewRequest = Schema<'CreateReviewDto'>;
export type ModerateReviewRequest = Schema<'ModerateReviewDto'>;
