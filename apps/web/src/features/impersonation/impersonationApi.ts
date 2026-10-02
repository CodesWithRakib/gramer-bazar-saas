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

/** A sensitive action that enforcement blocked while impersonating. */
export interface BlockedImpersonationAction {
  method: string;
  path: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/** One recorded impersonation session, as shown in history / audit views. */
export interface ImpersonationHistoryItem {
  sessionId: string;
  actorUserId: string;
  actorName: string | null;
  targetUserId: string;
  targetName: string | null;
  targetRole: string;
  reason: ImpersonationReason;
  reasonNote: string | null;
  status: ImpersonationStatus;
  startedAt: string;
  endedAt: string | null;
  expiresAt: string;
  blockedActions: BlockedImpersonationAction[];
  blockedActionCount: number;
}

export interface TargetImpersonationHistoryArgs {
  userId: string;
  page?: number;
  limit?: number;
}

export interface ImpersonationSessionsArgs {
  page?: number;
  limit?: number;
  status?: ImpersonationStatus | 'ALL';
  reason?: ImpersonationReason | 'ALL';
  targetRole?: string | 'ALL';
  targetUserId?: string;
  search?: string;
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
    /** Paginated impersonation sessions targeting a user (Super Admin only). */
    getTargetImpersonationHistory: builder.query<
      PaginatedResponse<ImpersonationHistoryItem>,
      TargetImpersonationHistoryArgs
    >({
      query: ({ userId, page, limit }) => ({
        url: `/admin/impersonation/target/${userId}`,
        params: { page, limit },
      }),
      providesTags: ['Impersonation'],
    }),
    /** Platform-wide impersonation session listing (Super Admin only). */
    getImpersonationSessions: builder.query<
      PaginatedResponse<ImpersonationHistoryItem>,
      ImpersonationSessionsArgs
    >({
      query: (params) => ({
        url: '/admin/impersonation/sessions',
        params,
      }),
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
  useGetImpersonationSessionsQuery,
} = impersonationApi;
