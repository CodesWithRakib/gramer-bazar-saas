import { api } from '../../store/api';
import type { AuthResponse } from '../auth/authApi';
import type {
  ImpersonationContext,
  ImpersonationReason,
  UserProfile,
} from '../../store/slices/authSlice';

export type { ImpersonationReason, ImpersonationContext };

export interface StartImpersonationRequest {
  userId: string;
  reason: ImpersonationReason;
  reasonNote?: string;
}

export interface StartImpersonationResponse {
  accessToken: string;
  user: UserProfile;
  impersonation: ImpersonationContext;
}

export type ImpersonationStatus = 'ACTIVE' | 'ENDED' | 'EXPIRED';

/** One recorded impersonation session, as shown in the user history panel. */
export interface ImpersonationHistoryItem {
  sessionId: string;
  actorUserId: string;
  actorName: string | null;
  targetRole: string;
  reason: ImpersonationReason;
  reasonNote: string | null;
  status: ImpersonationStatus;
  startedAt: string;
  endedAt: string | null;
  expiresAt: string;
}

export const impersonationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Start a temporary impersonation session. Only the backend can authorize
     * this — a non Super Admin receives 403 regardless of the UI.
     */
    startImpersonation: builder.mutation<StartImpersonationResponse, StartImpersonationRequest>({
      query: (body) => ({
        url: '/admin/impersonation/start',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User', 'Impersonation'],
    }),
    /** Exit impersonation and restore the original Super Admin session. */
    exitImpersonation: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: '/admin/impersonation/exit',
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Impersonation'],
    }),
    /** Inspect the current Super Admin's active impersonation session. */
    getImpersonationSession: builder.query<ImpersonationContext | null, void>({
      query: () => '/admin/impersonation/session',
      providesTags: ['Impersonation'],
    }),
    /** Recent impersonation sessions targeting a user (Super Admin only). */
    getTargetImpersonationHistory: builder.query<ImpersonationHistoryItem[], string>({
      query: (userId) => `/admin/impersonation/target/${userId}`,
      providesTags: ['Impersonation'],
    }),
  }),
});

export const {
  useStartImpersonationMutation,
  useExitImpersonationMutation,
  useGetImpersonationSessionQuery,
  useLazyGetImpersonationSessionQuery,
  useGetTargetImpersonationHistoryQuery,
} = impersonationApi;
