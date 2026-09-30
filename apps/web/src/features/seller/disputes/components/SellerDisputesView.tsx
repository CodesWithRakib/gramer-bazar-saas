'use client';

import React, { useState, useMemo } from 'react';
import { useGetSellerDisputesQuery, DisputeStatus } from '@/features/disputes/disputesApi';
import Link from 'next/link';
import { Search, X, AlertCircle, Eye } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/PageHeader';
import {
  getDisputeReasonLabel,
  getDisputeStatusMeta,
} from '@/features/disputes/dispute-display';
import { formatDate } from '@/lib/format';
import AdminPagination from '@/components/AdminPagination';

export interface SellerDisputesViewProps {
  lang?: string;
}

export function SellerDisputesView({ lang = 'en' }: SellerDisputesViewProps) {
  const isBn = lang === 'bn';

  const { data: disputes = [], isLoading, isError, refetch } = useGetSellerDisputesQuery();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredDisputes = useMemo(() => {
    return disputes.filter((dispute) => {
      const orderId = dispute.orderId || '';
      const reason = dispute.reason?.replace(/_/g, ' ') || '';
      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query || orderId.toLowerCase().includes(query) || reason.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'ALL' || dispute.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [disputes, search, statusFilter]);

  const paginatedDisputes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDisputes.slice(start, start + pageSize);
  }, [filteredDisputes, currentPage, pageSize]);

  const getStatusBadge = (status: DisputeStatus | string) => {
    const meta = getDisputeStatusMeta(status);
    return (
      <Badge
        variant="secondary"
        className={
          meta.tone === 'success'
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
            : meta.tone === 'info'
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
              : meta.tone === 'warning'
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
        }
      >
        {isBn ? meta.bn : meta.en}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', href: `/${lang}/seller` },
          { label: isBn ? 'অভিযোগ' : 'Disputes' },
        ]}
        title={isBn ? 'গ্রাহক বিরোধসমূহ' : 'Customer disputes'}
        description={
          isBn
            ? 'গ্রাহকদের উত্থাপিত বিরোধ ও অভিযোগ পর্যালোচনা ও সমাধান করুন।'
            : 'Review and resolve customer dispute claims regarding orders.'
        }
      />

      {/* Main Card */}
      <div className="border-border bg-card rounded-xl border p-4 sm:p-6">
        {/* Top Toolbar */}
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full flex-1 flex-col gap-4 sm:w-auto sm:flex-row sm:items-center">
            {/* Search Pill */}
            <div className="relative w-full max-w-md min-w-[200px] flex-1 sm:w-auto">
              <Search className="start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={
                  isBn ? 'অর্ডার আইডি বা কারণ দিয়ে খুঁজুন...' : 'Search by order ID or reason...'
                }
                className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary h-11 w-full rounded-full border ps-11 pe-11 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  aria-label={isBn ? 'মুছুন' : 'Clear'}
                  onClick={() => setSearch('')}
                  className="text-muted-foreground hover:text-foreground absolute end-3 top-1/2 -translate-y-1/2 rounded-full p-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-44 md:w-48">
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-11 w-full rounded-full">
                  <SelectValue placeholder={isBn ? 'সকল স্ট্যাটাস' : 'All status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{isBn ? 'সকল স্ট্যাটাস' : 'All Status'}</SelectItem>
                  <SelectItem value="OPEN">{isBn ? 'উন্মুক্ত' : 'Open'}</SelectItem>
                  <SelectItem value="UNDER_REVIEW">
                    {isBn ? 'পর্যালোচনাধীন' : 'Under Review'}
                  </SelectItem>
                  <SelectItem value="RESOLVED_REFUNDED">
                    {isBn ? 'রিফান্ড সম্পন্ন' : 'Resolved'}
                  </SelectItem>
                  <SelectItem value="RESOLVED_REJECTED">{isBn ? 'বাতিল' : 'Rejected'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-lg border md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="bg-muted/40 text-muted-foreground border-b text-xs font-semibold tracking-wider uppercase">
                <tr>
                  <th className="py-3.5 px-4">{isBn ? 'অর্ডার আইডি' : 'Order ID'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'কারণ' : 'Reason'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'তারিখ' : 'Created Date'}</th>
                  <th className="py-3.5 px-4 text-end">{isBn ? 'পদক্ষেপ' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="animate-pulse">
                      <td className="py-4 px-4">
                        <div className="h-4 w-28 rounded bg-muted"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-36 rounded bg-muted"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-6 w-20 rounded-full bg-muted"></div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 w-24 rounded bg-muted"></div>
                      </td>
                      <td className="py-4 px-4 text-end">
                        <div className="ms-auto h-8 w-20 rounded bg-muted"></div>
                      </td>
                    </tr>
                  ))
                ) : isError ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-destructive">
                      <p className="text-sm font-medium">
                        {isBn ? 'বিরোধ লোড করতে ব্যর্থ হয়েছে।' : 'Failed to load disputes.'}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        className="mt-3"
                      >
                        {isBn ? 'আবার চেষ্টা করুন' : 'Retry'}
                      </Button>
                    </td>
                  </tr>
                ) : paginatedDisputes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted/60">
                          <AlertCircle className="h-6 w-6 text-muted-foreground/60" />
                        </div>
                        <h3 className="mb-1 text-base font-semibold text-foreground">
                          {isBn ? 'কোনো বিরোধ পাওয়া যায়নি' : 'No disputes found'}
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          {search || statusFilter !== 'ALL'
                            ? isBn
                              ? 'আপনার ফিল্টারের সাথে কোনো বিরোধ মেলেনি'
                              : 'No disputes match your search criteria.'
                            : isBn
                              ? 'বর্তমানে কোনো সক্রিয় বিরোধ নেই'
                              : 'You have no active disputes.'}
                        </p>
                        {(search || statusFilter !== 'ALL') && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearch('');
                              setStatusFilter('ALL');
                            }}
                            className="mt-4 text-sm font-medium text-primary hover:underline"
                          >
                            {isBn ? 'ফিল্টার পরিষ্কার করুন' : 'Clear filters'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedDisputes.map((dispute) => (
                    <tr
                      key={dispute.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-foreground">
                        {dispute.orderId.slice(0, 8)}...
                      </td>
                      <td className="py-3.5 px-4 font-medium text-foreground">
                        {getDisputeReasonLabel(dispute.reason, isBn)}
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(dispute.status)}</td>
                      <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                        {formatDate(dispute.createdAt, lang)}
                      </td>
                      <td className="py-3.5 px-4 text-end">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="rounded-full gap-1 text-xs"
                        >
                          <Link href={`/${lang}/seller/disputes/${dispute.id}`}>
                            <Eye className="h-3.5 w-3.5" />
                            <span>{isBn ? 'বিস্তারিত' : 'View'}</span>
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination inside card */}
        <AdminPagination
          totalItems={filteredDisputes.length}
          itemsPerPage={pageSize}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onLimitChange={(newLimit) => {
            setPageSize(newLimit);
            setCurrentPage(1);
          }}
          lang={lang}
          itemLabel={{
            singular: isBn ? 'বিরোধ' : 'dispute',
            plural: isBn ? 'বিরোধ' : 'disputes',
          }}
        />
      </div>
    </div>
  );
}
