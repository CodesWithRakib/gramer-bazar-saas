import { api } from "../../store/api";
import { PaginationMeta } from "../catalog/catalogApi";

export interface AuditLogEntry {
  id: string;
  actorId: string | null;
  actorName: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: string | null;
  createdAt: string;
}

export interface AuditLogResponse {
  data: AuditLogEntry[];
  meta: PaginationMeta;
}

export interface AuditLogQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const auditLogsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<AuditLogResponse, AuditLogQueryParams | void>({
      query: (params) => ({
        url: "/admin/audit-logs",
        params: params ?? {},
      }),
      providesTags: ["AuditLog"],
    }),
  }),
});

export const { useGetAuditLogsQuery } = auditLogsApi;
