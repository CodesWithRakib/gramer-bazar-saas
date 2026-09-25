'use client';

import React, { use, useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetAuditLogsQuery } from '@/features/audit-logs/auditLogsApi';
import { ScrollText, Search, X } from 'lucide-react';
import AdminPagination from '@/components/AdminPagination';

export default function AdminAuditLogsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const isBn = lang === 'bn';

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const { data, isLoading, isError, refetch } = useGetAuditLogsQuery({
    page,
    limit,
    search: search.trim() || undefined,
  });

  const rawLogs = data?.data ?? [];
  const meta = data?.meta;

  const logs = useMemo(() => {
    if (actionFilter === 'ALL') return rawLogs;
    return rawLogs.filter((log) => log.action.toUpperCase().includes(actionFilter.toUpperCase()));
  }, [rawLogs, actionFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isBn ? 'অডিট লগস' : 'Audit Logs'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isBn
            ? 'সিস্টেমের সকল পরিবর্তন ও প্রশাসনিক পদক্ষেপ ট্র্যাক করুন।'
            : 'Track all administrative events, user modifications, and security actions.'}
        </p>
      </div>

      {/* Main Table Card */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 dark:border-border dark:bg-card">
        {/* Top Toolbar */}
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full flex-1 flex-col gap-4 sm:w-auto sm:flex-row sm:items-center">
            {/* Search Pill */}
            <div className="relative w-full max-w-md min-w-[200px] flex-1 sm:w-auto">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={isBn ? 'ইউজার, অ্যাকশন বা বিস্তারিত খুঁজুন...' : 'Search logs by user, action, or details...'}
                className="h-11 w-full rounded-full border border-gray-200 bg-white px-11 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none dark:border-border dark:bg-background"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-gray-100 dark:hover:bg-muted"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Action Filter */}
            <div className="w-full sm:w-44 md:w-48">
              <Select
                value={actionFilter}
                onValueChange={(val) => {
                  setActionFilter(val);
                }}
              >
                <SelectTrigger className="!h-11 w-full rounded-full border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-0 dark:border-border dark:bg-background dark:text-foreground">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{isBn ? 'সকল অ্যাকশন' : 'All Actions'}</SelectItem>
                  <SelectItem value="CREATE">{isBn ? 'তৈরি (Create)' : 'Create'}</SelectItem>
                  <SelectItem value="UPDATE">{isBn ? 'আপডেট (Update)' : 'Update'}</SelectItem>
                  <SelectItem value="DELETE">{isBn ? 'মুছে ফেলা (Delete)' : 'Delete'}</SelectItem>
                  <SelectItem value="LOGIN">{isBn ? 'লগইন (Login)' : 'Login'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Inner Table Container */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xs dark:border-border dark:bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-200 bg-gray-50 uppercase text-xs font-semibold text-gray-900 tracking-wider dark:border-border dark:bg-muted/40 dark:text-foreground">
                <TableRow>
                  <TableHead className="py-3.5 px-4">{isBn ? 'তারিখ ও সময়' : 'Date & Time'}</TableHead>
                  <TableHead className="py-3.5 px-4">{isBn ? 'অ্যাকশন' : 'Action'}</TableHead>
                  <TableHead className="py-3.5 px-4">{isBn ? 'ইউজার' : 'Performed By'}</TableHead>
                  <TableHead className="py-3.5 px-4">{isBn ? 'টার্গেট' : 'Target'}</TableHead>
                  <TableHead className="py-3.5 px-4">{isBn ? 'বিস্তারিত' : 'Details'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200 dark:divide-border text-sm">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`} className="animate-pulse">
                      <TableCell className="py-4 px-4"><div className="h-4 w-32 rounded bg-muted"></div></TableCell>
                      <TableCell className="py-4 px-4"><div className="h-6 w-20 rounded-full bg-muted"></div></TableCell>
                      <TableCell className="py-4 px-4"><div className="h-4 w-28 rounded bg-muted"></div></TableCell>
                      <TableCell className="py-4 px-4"><div className="h-4 w-24 rounded bg-muted"></div></TableCell>
                      <TableCell className="py-4 px-4"><div className="h-4 w-48 rounded bg-muted"></div></TableCell>
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-destructive">
                      <p className="text-sm font-medium">
                        {isBn ? 'লগ লোড করা যায়নি। পরে আবার চেষ্টা করুন।' : 'Failed to load audit logs. Please try again.'}
                      </p>
                      <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3">
                        {isBn ? 'আবার চেষ্টা করুন' : 'Retry'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted/60">
                          <ScrollText className="h-6 w-6 text-muted-foreground/60" />
                        </div>
                        <h3 className="mb-1 text-base font-semibold text-foreground">
                          {isBn ? 'কোনো অডিট লগ নেই' : 'No audit logs found'}
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          {search || actionFilter !== 'ALL'
                            ? (isBn ? 'আপনার অনুসন্ধানের ফিল্টারের সাথে কোনো লগ মেলেনি' : 'No logs match your search or filter.')
                            : (isBn ? 'বর্তমানে কোনো সিস্টেম অডিট লগ নেই' : 'No system audit logs recorded.')}
                        </p>
                        {(search || actionFilter !== 'ALL') && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearch('');
                              setActionFilter('ALL');
                              setPage(1);
                            }}
                            className="mt-4 text-sm font-medium text-primary hover:underline"
                          >
                            {isBn ? 'ফিল্টার পরিষ্কার করুন' : 'Clear filters'}
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-gray-50/70 transition-colors dark:hover:bg-muted/30">
                      <TableCell className="whitespace-nowrap py-3.5 px-4 font-mono text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                      </TableCell>
                      <TableCell className="py-3.5 px-4">
                        <span className="inline-flex items-center rounded-full bg-secondary/80 px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground font-mono">
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5 px-4 font-medium text-foreground">
                        {log.actorName || (isBn ? 'সিস্টেম' : 'System')}
                      </TableCell>
                      <TableCell className="py-3.5 px-4 font-mono text-xs text-muted-foreground">
                        {log.targetType || '—'}
                      </TableCell>
                      <TableCell className="py-3.5 px-4 text-muted-foreground max-w-md truncate">
                        {log.details || '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination inside card */}
        <AdminPagination
          totalItems={meta?.total ?? logs.length}
          itemsPerPage={limit}
          currentPage={page}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          lang={isBn ? 'bn' : 'en'}
          itemLabel={{
            singular: isBn ? 'লগ' : 'log',
            plural: isBn ? 'লগ' : 'logs',
          }}
        />
      </div>
    </div>
  );
}
