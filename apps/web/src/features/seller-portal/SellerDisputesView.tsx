'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useGetSellerDisputesQuery, DisputeStatus } from '@/features/disputes/disputesApi';
import Link from 'next/link';
import { Search, X, AlertCircle, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
        !query ||
        orderId.toLowerCase().includes(query) ||
        reason.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'ALL' || dispute.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [disputes, search, statusFilter]);

  const paginatedDisputes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDisputes.slice(start, start + pageSize);
  }, [filteredDisputes, currentPage, pageSize]);

  const getStatusBadge = (status: DisputeStatus | string) => {
    switch (status) {
      case 'OPEN':
        return (
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
            {isBn ? 'উন্মুক্ত' : 'Open'}
          </Badge>
        );
      case 'UNDER_REVIEW':
        return (
          <Badge variant="secondary" className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
            {isBn ? 'পর্যালোচনাধীন' : 'Under Review'}
          </Badge>
        );
      case 'RESOLVED_REFUNDED':
        return (
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            {isBn ? 'রিফান্ড সম্পন্ন' : 'Resolved (Refunded)'}
          </Badge>
        );
      case 'RESOLVED_REJECTED':
      default:
        return (
          <Badge variant="secondary" className="bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
            {isBn ? 'বাতিল' : 'Rejected'}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isBn ? 'গ্রাহক বিরোধসমূহ' : 'Customer Disputes'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isBn
              ? 'গ্রাহকদের উত্থাপিত বিরোধ ও অভিযোগ পর্যালোচনা ও সমাধান করুন।'
              : 'Review and resolve customer dispute claims regarding orders.'}
          </p>
        </div>
      </div>

      {/* Main Card */}
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
                  setCurrentPage(1);
                }}
                placeholder={isBn ? 'অর্ডার আইডি বা কারণ দিয়ে খুঁজুন...' : 'Search by order ID or reason...'}
                className="h-11 w-full rounded-full border border-gray-200 bg-white px-11 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none dark:border-border dark:bg-background"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-gray-100 dark:hover:bg-muted"
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
                <SelectTrigger className="!h-11 w-full rounded-full border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-0 dark:border-border dark:bg-background dark:text-foreground">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{isBn ? 'সকল স্ট্যাটাস' : 'All Status'}</SelectItem>
                  <SelectItem value="OPEN">{isBn ? 'উন্মুক্ত' : 'Open'}</SelectItem>
                  <SelectItem value="UNDER_REVIEW">{isBn ? 'পর্যালোচনাধীন' : 'Under Review'}</SelectItem>
                  <SelectItem value="RESOLVED_REFUNDED">{isBn ? 'রিফান্ড সম্পন্ন' : 'Resolved'}</SelectItem>
                  <SelectItem value="RESOLVED_REJECTED">{isBn ? 'বাতিল' : 'Rejected'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Inner Table Container */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xs dark:border-border dark:bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 uppercase text-xs font-semibold text-gray-900 tracking-wider dark:border-border dark:bg-muted/40 dark:text-foreground">
                <tr>
                  <th className="py-3.5 px-4">{isBn ? 'অর্ডার আইডি' : 'Order ID'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'কারণ' : 'Reason'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'তারিখ' : 'Created Date'}</th>
                  <th className="py-3.5 px-4 text-right">{isBn ? 'পদক্ষেপ' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-border">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="animate-pulse">
                      <td className="py-4 px-4"><div className="h-4 w-28 rounded bg-muted"></div></td>
                      <td className="py-4 px-4"><div className="h-4 w-36 rounded bg-muted"></div></td>
                      <td className="py-4 px-4"><div className="h-6 w-20 rounded-full bg-muted"></div></td>
                      <td className="py-4 px-4"><div className="h-4 w-24 rounded bg-muted"></div></td>
                      <td className="py-4 px-4 text-right"><div className="ml-auto h-8 w-20 rounded bg-muted"></div></td>
                    </tr>
                  ))
                ) : isError ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-destructive">
                      <p className="text-sm font-medium">
                        {isBn ? 'বিরোধ লোড করতে ব্যর্থ হয়েছে।' : 'Failed to load disputes.'}
                      </p>
                      <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3">
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
                            ? (isBn ? 'আপনার ফিল্টারের সাথে কোনো বিরোধ মেলেনি' : 'No disputes match your search criteria.')
                            : (isBn ? 'বর্তমানে কোনো সক্রিয় বিরোধ নেই' : 'You have no active disputes.')}
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
                    <tr key={dispute.id} className="hover:bg-gray-50/70 transition-colors dark:hover:bg-muted/30">
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-foreground">
                        {dispute.orderId.slice(0, 8)}...
                      </td>
                      <td className="py-3.5 px-4 font-medium text-foreground">
                        {dispute.reason.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(dispute.status)}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                        {new Date(dispute.createdAt).toLocaleDateString(isBn ? 'bn-BD' : 'en-US')}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button asChild variant="outline" size="sm" className="rounded-full gap-1 text-xs">
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
