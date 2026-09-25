'use client';

import { getApiErrorMessage } from '@/lib/apiError';

import React, { useState, useMemo } from 'react';
import { useGetMyWalletQuery } from '@/features/wallets/walletsApi';
import { useGetMyPayoutsQuery, useRequestPayoutMutation } from '@/features/payouts/payoutsApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Search, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { format } from 'date-fns';
import AdminPagination from '@/components/AdminPagination';

export interface SellerPayoutViewProps {
  lang?: string;
}

export function SellerPayoutView({ lang = 'en' }: SellerPayoutViewProps) {
  const isBn = lang === 'bn';
  const { data: wallet } = useGetMyWalletQuery();
  const { data: payouts = [], isLoading: isPayoutsLoading } = useGetMyPayoutsQuery();
  const [requestPayout, { isLoading: isRequesting }] = useRequestPayoutMutation();

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [accountDetails, setAccountDetails] = useState('');

  // Table filtering and pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredPayouts = useMemo(() => {
    return payouts.filter((payout) => {
      const matchesSearch =
        !search.trim() ||
        payout.accountDetails?.toLowerCase().includes(search.toLowerCase()) ||
        payout.method?.toLowerCase().includes(search.toLowerCase()) ||
        payout.amount.toString().includes(search.trim());

      const matchesStatus = statusFilter === 'ALL' || payout.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [payouts, search, statusFilter]);

  const paginatedPayouts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPayouts.slice(start, start + pageSize);
  }, [filteredPayouts, currentPage, pageSize]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !method || !accountDetails) {
      toast.error(isBn ? 'সব তথ্য প্রদান করুন' : 'Please fill all fields');
      return;
    }

    const numAmount = Number(amount);
    if (numAmount < 500) {
      toast.error(isBn ? 'সর্বনিম্ন ৫০০ টাকা উত্তোলন করা যাবে' : 'Minimum payout is 500');
      return;
    }

    if (wallet && numAmount > wallet.balance) {
      toast.error(isBn ? 'আপনার পর্যাপ্ত ব্যালেন্স নেই' : 'Insufficient balance');
      return;
    }

    try {
      await requestPayout({
        amount: numAmount,
        method,
        accountDetails,
      }).unwrap();
      
      toast.success(isBn ? 'পেআউট অনুরোধ সফল হয়েছে' : 'Payout requested successfully');
      setAmount('');
      setMethod('');
      setAccountDetails('');
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Failed to request payout');
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href={`/${lang}/seller/wallet`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isBn ? 'পেআউট অনুরোধ' : 'Request Payout'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isBn ? 'আপনার ব্যাংক বা মোবাইল ব্যাংকিং এ টাকা উত্তোলন করুন' : 'Withdraw funds to your bank or mobile banking account'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 rounded-xl border border-gray-100 shadow-sm dark:border-border">
          <CardHeader>
            <CardTitle>{isBn ? 'নতুন অনুরোধ' : 'New Request'}</CardTitle>
            <CardDescription>
              {isBn 
                ? `বর্তমান ব্যালেন্স: ৳ ${wallet?.balance || 0}`
                : `Available Balance: ৳ ${wallet?.balance || 0}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">{isBn ? 'পরিমাণ (৳)' : 'Amount (৳)'}</Label>
                <Input
                  id="amount"
                  type="number"
                  min="500"
                  max={wallet?.balance || 0}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Min 500"
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label>{isBn ? 'উত্তোলনের মাধ্যম' : 'Payout Method'}</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder={isBn ? 'মাধ্যম নির্বাচন করুন' : 'Select method'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="BKASH">bKash</SelectItem>
                    <SelectItem value="NAGAD">Nagad</SelectItem>
                    <SelectItem value="ROCKET">Rocket</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">
                  {isBn ? 'অ্যাকাউন্ট বিস্তারিত' : 'Account Details'}
                </Label>
                <Input
                  id="details"
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  placeholder={method === 'BANK_TRANSFER' ? 'A/C Number, Bank Name, Branch' : 'Phone Number'}
                  className="rounded-lg"
                />
              </div>

              <Button type="submit" className="w-full rounded-full" disabled={isRequesting}>
                {isRequesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isBn ? 'অনুরোধ পাঠান' : 'Submit Request'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Main Payout History Card */}
        <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 dark:border-border dark:bg-card">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-foreground">
              {isBn ? 'পেআউট ইতিহাস' : 'Payout History'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isBn ? 'আপনার পূর্ববর্তী সকল উত্তোলনের ইতিহাস' : 'Track status of your previous withdrawal requests.'}
            </p>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={isBn ? 'হিসাব বা মাধ্যম খুঁজুন...' : 'Search details or method...'}
                className="h-10 w-full rounded-full border border-gray-200 bg-white px-10 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none dark:border-border dark:bg-background"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-gray-100 dark:hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <div className="w-full sm:w-40">
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="!h-10 w-full rounded-full border-gray-200 bg-white px-3.5 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:ring-0 dark:border-border dark:bg-background dark:text-foreground">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{isBn ? 'সকল স্ট্যাটাস' : 'All Status'}</SelectItem>
                  <SelectItem value="PENDING">{isBn ? 'পেন্ডিং' : 'Pending'}</SelectItem>
                  <SelectItem value="APPROVED">{isBn ? 'অনুমোদিত' : 'Approved'}</SelectItem>
                  <SelectItem value="REJECTED">{isBn ? 'বাতিল' : 'Rejected'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Inner Table Container */}
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xs dark:border-border dark:bg-card">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-200 bg-gray-50 uppercase text-[11px] font-semibold text-gray-900 tracking-wider dark:border-border dark:bg-muted/40 dark:text-foreground">
                  <TableRow>
                    <TableHead className="py-3 px-3.5">{isBn ? 'তারিখ' : 'Date'}</TableHead>
                    <TableHead className="py-3 px-3.5">{isBn ? 'পরিমাণ' : 'Amount'}</TableHead>
                    <TableHead className="py-3 px-3.5">{isBn ? 'মাধ্যম' : 'Method'}</TableHead>
                    <TableHead className="py-3 px-3.5">{isBn ? 'বিস্তারিত' : 'Details'}</TableHead>
                    <TableHead className="py-3 px-3.5">{isBn ? 'অবস্থা' : 'Status'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200 dark:divide-border text-xs">
                  {isPayoutsLoading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                      <TableRow key={`skeleton-${index}`} className="animate-pulse">
                        <TableCell className="py-3.5 px-3.5"><div className="h-4 w-20 rounded bg-muted"></div></TableCell>
                        <TableCell className="py-3.5 px-3.5"><div className="h-4 w-16 rounded bg-muted"></div></TableCell>
                        <TableCell className="py-3.5 px-3.5"><div className="h-4 w-16 rounded bg-muted"></div></TableCell>
                        <TableCell className="py-3.5 px-3.5"><div className="h-4 w-28 rounded bg-muted"></div></TableCell>
                        <TableCell className="py-3.5 px-3.5"><div className="h-5 w-16 rounded-full bg-muted"></div></TableCell>
                      </TableRow>
                    ))
                  ) : paginatedPayouts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center">
                          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/60">
                            <Search className="h-5 w-5 text-muted-foreground/60" />
                          </div>
                          <p className="text-sm font-medium text-foreground">
                            {isBn ? 'কোনো পেআউট ইতিহাস নেই' : 'No payout history found'}
                          </p>
                          {(search || statusFilter !== 'ALL') && (
                            <button
                              type="button"
                              onClick={() => {
                                setSearch('');
                                setStatusFilter('ALL');
                              }}
                              className="mt-2 text-xs font-medium text-primary hover:underline"
                            >
                              {isBn ? 'ফিল্টার পরিষ্কার করুন' : 'Clear filters'}
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedPayouts.map((payout) => (
                      <TableRow key={payout.id} className="hover:bg-gray-50/70 transition-colors dark:hover:bg-muted/30">
                        <TableCell className="whitespace-nowrap py-3 px-3.5 font-mono text-[11px]">
                          {format(new Date(payout.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="font-semibold text-emerald-600 py-3 px-3.5">
                          ৳ {payout.amount}
                        </TableCell>
                        <TableCell className="py-3 px-3.5 font-medium">{payout.method}</TableCell>
                        <TableCell className="max-w-[180px] truncate py-3 px-3.5 text-muted-foreground" title={payout.accountDetails}>
                          {payout.accountDetails}
                        </TableCell>
                        <TableCell className="py-3 px-3.5">
                          {getStatusBadge(payout.status)}
                          {payout.adminNote && (
                            <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[130px]" title={payout.adminNote}>
                              {payout.adminNote}
                            </p>
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
              singular: isBn ? 'পেআউট' : 'payout',
              plural: isBn ? 'পেআউট' : 'payouts',
            }}
          />
        </div>
      </div>
    </div>
  );
}
