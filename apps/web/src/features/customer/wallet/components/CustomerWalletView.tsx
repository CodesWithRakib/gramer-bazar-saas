'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Search,
  Sparkles,
  ShoppingBag,
  History,
  RotateCcw,
} from 'lucide-react';

import { useGetMyWalletQuery, useGetMyTransactionsQuery } from '@/features/wallets/walletsApi';
import type { WalletTransaction } from '@/features/wallets/walletsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { AdminPagination } from '@/components/ui/AdminPagination';
import { formatCurrency, formatDateTime } from '@/lib/format';

export interface CustomerWalletViewProps {
  lang?: string;
}

export function CustomerWalletView({ lang = 'en' }: CustomerWalletViewProps) {
  const isBn = lang === 'bn';

  const {
    data: wallet,
    isLoading: isWalletLoading,
    isError: isWalletError,
    refetch: refetchWallet,
  } = useGetMyWalletQuery();

  const {
    data: transactions = [],
    isLoading: isTxLoading,
    isError: isTxError,
    refetch: refetchTx,
  } = useGetMyTransactionsQuery();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredTransactions = useMemo(() => {
    const term = search.trim().toLowerCase();
    return transactions.filter((tx: WalletTransaction) => {
      const matchesSearch =
        !term ||
        tx.description.toLowerCase().includes(term) ||
        String(tx.amount).includes(term) ||
        (tx.referenceId && tx.referenceId.toLowerCase().includes(term));
      const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [transactions, search, typeFilter]);

  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  if (isWalletLoading) {
    return (
      <LoadingState
        message={isBn ? 'আপনার ডিজিটাল ওয়ালেট লোড হচ্ছে...' : 'Loading your digital wallet...'}
      />
    );
  }

  if (isWalletError) {
    return (
      <ErrorState
        isBn={isBn}
        title={isBn ? 'ওয়ালেট লোড করা যায়নি' : 'Could not load digital wallet'}
        message={
          isBn
            ? 'ওয়ালেটের তথ্য লোড করার সময় একটি সমস্যা হয়েছে। দয়া করে পুনরায় চেষ্টা করুন।'
            : 'There was a problem loading your digital wallet details. Please try again.'
        }
        onRetry={() => {
          void refetchWallet();
          void refetchTx();
        }}
      />
    );
  }

  const balance = Number(wallet?.balance || 0);
  const pendingClearance = Number(wallet?.pendingClearance || 0);
  const totalEarned = Number(wallet?.totalEarned || 0);

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        breadcrumbs={[
          { label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', href: `/${lang}/customer` },
          { label: isBn ? 'আমার ওয়ালেট' : 'My Wallet' },
        ]}
        title={isBn ? 'গ্রাহক ডিজিটাল ওয়ালেট' : 'Customer Digital Wallet'}
        description={
          isBn
            ? 'আপনার রিফান্ড ব্যালেন্স, লয়্যালটি ক্যাশব্যাক এবং ট্রানজ্যাকশন হিস্ট্রি পরিচালনা করুন।'
            : 'Manage your refund credits, loyalty cashback, and transaction ledger.'
        }
        secondaryActions={
          <Button asChild className="gap-2 rounded-xl">
            <Link href={`/${lang}/products`}>
              <ShoppingBag className="h-4 w-4" />
              {isBn ? 'কেনাকাটা চালিয়ে যান' : 'Shop with Balance'}
            </Link>
          </Button>
        }
      />

      {/* Feature Information Banner */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2 text-primary shrink-0 mt-0.5">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              {isBn ? 'তাত্ক্ষণিক রিফান্ড এবং ক্যাশব্যাক সুবিধা' : 'Instant Refund & Cashback Protection'}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isBn
                ? 'অর্ডার বাতিল বা সমন্বয়ের টাকা সরাসরি আপনার ওয়ালেটে জমা হয়, যা পরবর্তীতে ১-ক্লিকে চেকআউটে ব্যবহারযোগ্য।'
                : 'Cancellations and adjustments credit directly to your digital wallet for instant 1-click checkouts.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-primary">
          <ShieldCheck className="h-4 w-4" />
          <span>{isBn ? 'নিরাপদ লেনদেন' : '100% Protected'}</span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-2xl border-border shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {isBn ? 'ব্যবহারযোগ্য ব্যালেন্স' : 'Available Balance'}
            </CardTitle>
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-600">
              <Wallet className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {formatCurrency(balance, lang)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isBn ? 'যেকোনো ক্রয়ে সরাসরি ব্যবহারযোগ্য' : 'Ready for direct order payment'}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {isBn ? 'মোট প্রাপ্ত রিফান্ড ও ক্যাশব্যাক' : 'Total Credits & Rewards'}
            </CardTitle>
            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-600">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {formatCurrency(totalEarned, lang)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isBn ? 'সর্বমোট প্রাপ্ত ক্যাশব্যাক ও রিফান্ড' : 'Lifetime credited to your account'}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border shadow-none sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {isBn ? 'প্রক্রিয়াকরণাধীন অর্থ' : 'Pending Verification'}
            </CardTitle>
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600">
              <RotateCcw className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {formatCurrency(pendingClearance, lang)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isBn ? 'যাচাই শেষে মূল ব্যালেন্সে যোগ হবে' : 'In escrow clearance check'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History Section */}
      <Card className="rounded-2xl border-border shadow-none">
        <CardHeader className="border-b border-border p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-semibold">
                {isBn ? 'লেনদেন বিবরণী' : 'Transaction Ledger'}
              </CardTitle>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={isBn ? 'বিবরণ বা রেফারেন্স খুঁজুন...' : 'Search ledger...'}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 h-9 text-xs rounded-xl"
                />
              </div>

              <Select
                value={typeFilter}
                onValueChange={(val: 'ALL' | 'CREDIT' | 'DEBIT') => {
                  setTypeFilter(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[130px] h-9 text-xs rounded-xl">
                  <SelectValue placeholder={isBn ? 'ধরন' : 'Type'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{isBn ? 'সকল লেনদেন' : 'All Types'}</SelectItem>
                  <SelectItem value="CREDIT">{isBn ? 'জমা (Credit)' : 'Credits (+)'}</SelectItem>
                  <SelectItem value="DEBIT">{isBn ? 'খরচ (Debit)' : 'Debits (-)'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {paginatedTransactions.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={<Wallet className="h-10 w-10 text-muted-foreground" />}
                title={isBn ? 'কোনো লেনদেন পাওয়া যায়নি' : 'No transactions recorded'}
                description={
                  search || typeFilter !== 'ALL'
                    ? isBn
                      ? 'আপনার অনুসন্ধানের ফিল্টারের সাথে কোনো তথ্য মিলছে না।'
                      : 'No ledger entries matched your search filter criteria.'
                    : isBn
                    ? 'আপনার ওয়ালেটে এখনো কোনো লেনদেন হয়নি।'
                    : 'You do not have any wallet ledger transactions yet.'
                }
              />
            </div>
          ) : (
            <>
              {/* Desktop & Tablet Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-xs font-semibold">{isBn ? 'তারিখ ও সময়' : 'Date & Time'}</TableHead>
                      <TableHead className="text-xs font-semibold">{isBn ? 'ধরন' : 'Type'}</TableHead>
                      <TableHead className="text-xs font-semibold">{isBn ? 'বিবরণ' : 'Description'}</TableHead>
                      <TableHead className="text-xs font-semibold">{isBn ? 'রেফারেন্স' : 'Reference'}</TableHead>
                      <TableHead className="text-right text-xs font-semibold">{isBn ? 'পরিমাণ' : 'Amount'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTransactions.map((tx) => {
                      const isCredit = tx.type === 'CREDIT';
                      return (
                        <TableRow key={tx.id} className="border-border">
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDateTime(tx.createdAt, lang)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[11px] font-medium gap-1 ${
                                isCredit
                                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600'
                                  : 'border-rose-500/30 bg-rose-500/10 text-rose-600'
                              }`}
                            >
                              {isCredit ? (
                                <ArrowDownLeft className="h-3 w-3" />
                              ) : (
                                <ArrowUpRight className="h-3 w-3" />
                              )}
                              {isCredit
                                ? isBn
                                  ? 'জমা (+)'
                                  : 'Credit'
                                : isBn
                                ? 'খরচ (-)'
                                : 'Debit'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs font-medium text-foreground max-w-[280px] truncate">
                            {tx.description}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground font-mono">
                            {tx.referenceId ? (
                              <span className="rounded bg-muted px-1.5 py-0.5">
                                {tx.referenceId}
                              </span>
                            ) : (
                              '—'
                            )}
                          </TableCell>
                          <TableCell
                            className={`text-right text-xs font-bold whitespace-nowrap ${
                              isCredit ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {isCredit ? '+' : '-'} {formatCurrency(tx.amount, lang)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-border flex justify-end">
                  <AdminPagination
                    totalItems={filteredTransactions.length}
                    itemsPerPage={pageSize}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    lang={lang}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
