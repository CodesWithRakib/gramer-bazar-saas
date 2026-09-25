'use client';

import { getApiErrorMessage } from '@/lib/apiError';

import React, { useState, useMemo } from 'react';
import { useGetAllPayoutsQuery, useReviewPayoutMutation } from '@/features/payouts/payoutsApi';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle, Search, X, Check, Eye } from 'lucide-react';
import AdminPagination from '@/components/AdminPagination';

export default function AdminPayoutsPage({ params }: { params: { lang: string } }) {
  const isBn = params.lang === 'bn';
  const lang = isBn ? 'bn' : 'en';

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Convert 'ALL' back to undefined for the API query
  const queryStatus = statusFilter === 'ALL' ? undefined : statusFilter;
  const { data: payouts = [], isLoading, refetch } = useGetAllPayoutsQuery(queryStatus);
  const [reviewPayout, { isLoading: isReviewing }] = useReviewPayoutMutation();

  const [reviewDialog, setReviewDialog] = useState<{
    isOpen: boolean;
    payoutId: string | null;
    status: 'APPROVED' | 'REJECTED';
  }>({
    isOpen: false,
    payoutId: null,
    status: 'APPROVED',
  });
  const [adminNote, setAdminNote] = useState('');

  const filteredPayouts = useMemo(() => {
    return payouts.filter((payout) => {
      const sellerName = `${payout.seller?.firstName || ''} ${payout.seller?.lastName || ''}`;
      const sellerEmail = payout.seller?.email || '';
      const method = payout.method || '';
      const details = payout.accountDetails || '';
      const query = search.trim().toLowerCase();

      return (
        !query ||
        sellerName.toLowerCase().includes(query) ||
        sellerEmail.toLowerCase().includes(query) ||
        method.toLowerCase().includes(query) ||
        details.toLowerCase().includes(query)
      );
    });
  }, [payouts, search]);

  const paginatedPayouts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPayouts.slice(start, start + pageSize);
  }, [filteredPayouts, currentPage, pageSize]);

  const handleReviewClick = (id: string, status: 'APPROVED' | 'REJECTED') => {
    setReviewDialog({ isOpen: true, payoutId: id, status });
    setAdminNote('');
  };

  const submitReview = async () => {
    if (!reviewDialog.payoutId) return;

    try {
      await reviewPayout({
        id: reviewDialog.payoutId,
        data: {
          status: reviewDialog.status,
          adminNote: adminNote || undefined,
        },
      }).unwrap();

      toast.success(
        isBn
          ? `পেআউট ${reviewDialog.status === 'APPROVED' ? 'অনুমোদিত' : 'বাতিল'} হয়েছে`
          : `Payout ${reviewDialog.status.toLowerCase()} successfully`
      );
      setReviewDialog({ isOpen: false, payoutId: null, status: 'APPROVED' });
      refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Failed to review payout');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary" className="bg-amber-500 hover:bg-amber-600 text-white">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isBn ? 'পেআউট অনুরোধসমূহ' : 'Payout Requests'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isBn ? 'সেলারদের পেআউট অনুরোধ পর্যালোচনা করুন এবং উত্তোলন প্রক্রিয়া সম্পন্ন করুন।' : 'Review and process seller withdrawal requests.'}
          </p>
        </div>
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
                  setCurrentPage(1);
                }}
                placeholder={isBn ? 'সেলার, ইমেইল বা মাধ্যম খুঁজুন...' : 'Search by seller name, email, or method...'}
                className="h-11 w-full rounded-full border border-gray-200 bg-white px-11 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none dark:border-border dark:bg-background"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setCurrentPage(1);
                  }}
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
                onValueChange={(v: string) => {
                  setStatusFilter(v as typeof statusFilter);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="!h-11 w-full rounded-full border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-0 dark:border-border dark:bg-background dark:text-foreground">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{isBn ? 'সব' : 'All'}</SelectItem>
                  <SelectItem value="PENDING">{isBn ? 'পেন্ডিং' : 'Pending'}</SelectItem>
                  <SelectItem value="APPROVED">{isBn ? 'অনুমোদিত' : 'Approved'}</SelectItem>
                  <SelectItem value="REJECTED">{isBn ? 'বাতিল' : 'Rejected'}</SelectItem>
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
                  <TableHead className="py-3.5 px-4">{isBn ? 'সেলার' : 'Seller'}</TableHead>
                  <TableHead className="py-3.5 px-4">{isBn ? 'পরিমাণ' : 'Amount'}</TableHead>
                  <TableHead className="py-3.5 px-4">{isBn ? 'মাধ্যম' : 'Method'}</TableHead>
                  <TableHead className="py-3.5 px-4">{isBn ? 'বিস্তারিত' : 'Details'}</TableHead>
                  <TableHead className="py-3.5 px-4">{isBn ? 'তারিখ' : 'Date'}</TableHead>
                  <TableHead className="py-3.5 px-4">{isBn ? 'অবস্থা' : 'Status'}</TableHead>
                  <TableHead className="py-3.5 px-4 text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200 dark:divide-border text-sm">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`} className="animate-pulse">
                      <TableCell className="py-4 px-4"><div className="h-4 w-32 rounded bg-muted"></div></TableCell>
                      <TableCell className="py-4 px-4"><div className="h-4 w-20 rounded bg-muted"></div></TableCell>
                      <TableCell className="py-4 px-4"><div className="h-4 w-20 rounded bg-muted"></div></TableCell>
                      <TableCell className="py-4 px-4"><div className="h-4 w-36 rounded bg-muted"></div></TableCell>
                      <TableCell className="py-4 px-4"><div className="h-4 w-24 rounded bg-muted"></div></TableCell>
                      <TableCell className="py-4 px-4"><div className="h-6 w-16 rounded-full bg-muted"></div></TableCell>
                      <TableCell className="py-4 px-4 text-right"><div className="ml-auto h-8 w-24 rounded bg-muted"></div></TableCell>
                    </TableRow>
                  ))
                ) : paginatedPayouts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted/60">
                          <Search className="h-6 w-6 text-muted-foreground/60" />
                        </div>
                        <h3 className="mb-1 text-base font-semibold text-foreground">
                          {isBn ? 'কোনো পেআউট অনুরোধ নেই' : 'No payout requests found'}
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          {search || statusFilter !== 'ALL'
                            ? (isBn ? 'আপনার অনুসন্ধানের ফিল্টারের সাথে কোনো অনুরোধ মেলেনি' : 'No requests match your search criteria.')
                            : (isBn ? 'বর্তমানে কোনো পেআউট অনুরোধ নেই' : 'There are currently no payout requests.')}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPayouts.map((payout) => (
                    <TableRow key={payout.id} className="hover:bg-gray-50/70 transition-colors dark:hover:bg-muted/30">
                      <TableCell className="py-3.5 px-4">
                        <div className="font-semibold text-foreground">
                          {payout.seller?.firstName} {payout.seller?.lastName}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">{payout.seller?.email}</div>
                      </TableCell>
                      <TableCell className="py-3.5 px-4 font-bold text-emerald-600">
                        ৳ {payout.amount}
                      </TableCell>
                      <TableCell className="py-3.5 px-4 font-medium">{payout.method}</TableCell>
                      <TableCell className="py-3.5 px-4 max-w-[200px] truncate text-muted-foreground" title={payout.accountDetails}>
                        {payout.accountDetails}
                      </TableCell>
                      <TableCell className="py-3.5 px-4 whitespace-nowrap text-muted-foreground text-xs font-mono">
                        {format(new Date(payout.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="py-3.5 px-4">
                        {getStatusBadge(payout.status)}
                        {payout.adminNote && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[150px]" title={payout.adminNote}>
                            {payout.adminNote}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="py-3.5 px-4 text-right">
                        {payout.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 rounded-full border-emerald-500/40 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 text-xs px-2.5"
                              onClick={() => handleReviewClick(payout.id, 'APPROVED')}
                            >
                              <CheckCircle className="mr-1 h-3.5 w-3.5" />
                              {isBn ? 'অনুমোদন' : 'Approve'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 rounded-full border-destructive/40 text-destructive hover:bg-destructive/10 text-xs px-2.5"
                              onClick={() => handleReviewClick(payout.id, 'REJECTED')}
                            >
                              <XCircle className="mr-1 h-3.5 w-3.5" />
                              {isBn ? 'বাতিল' : 'Reject'}
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
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
          totalItems={filteredPayouts.length}
          itemsPerPage={pageSize}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onLimitChange={(newLimit) => {
            setPageSize(newLimit);
            setCurrentPage(1);
          }}
          lang={lang}
          itemLabel={{
            singular: isBn ? 'অনুরোধ' : 'request',
            plural: isBn ? 'অনুরোধ' : 'requests',
          }}
        />
      </div>

      <Dialog open={reviewDialog.isOpen} onOpenChange={(open) => !open && setReviewDialog(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {reviewDialog.status === 'APPROVED' 
                ? (isBn ? 'পেআউট অনুমোদন করুন' : 'Approve Payout') 
                : (isBn ? 'পেআউট বাতিল করুন' : 'Reject Payout')}
            </DialogTitle>
            <DialogDescription>
              {isBn 
                ? 'আপনি কি নিশ্চিত যে আপনি এই পেআউট অনুরোধটি পর্যালোচনা করতে চান?' 
                : 'Are you sure you want to change the status of this payout request?'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="adminNote">
                {isBn ? 'প্রশাসনিক নোট (ঐচ্ছিক)' : 'Admin Note (Optional)'}
              </Label>
              <Input
                id="adminNote"
                placeholder={isBn ? 'যেমন: ট্রানজ্যাকশন আইডি বা কারণ...' : 'e.g., Transaction ID or reason for rejection'}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="rounded-lg"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialog(prev => ({ ...prev, isOpen: false }))}
              disabled={isReviewing}
              className="rounded-full"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button
              onClick={submitReview}
              disabled={isReviewing}
              variant={reviewDialog.status === 'APPROVED' ? 'default' : 'destructive'}
              className="rounded-full"
            >
              {isReviewing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isBn ? 'নিশ্চিত করুন' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
