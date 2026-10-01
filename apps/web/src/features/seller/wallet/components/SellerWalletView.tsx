'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, Clock, Search, Wallet, X } from 'lucide-react';

import { useGetMyTransactionsQuery, useGetMyWalletQuery } from '@/features/wallets/walletsApi';
import type { WalletTransaction } from '@/features/wallets/walletsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import AdminPagination from '@/components/AdminPagination';
import { formatCurrency, formatDateTime } from '@/lib/format';

export interface SellerWalletViewProps {
  lang?: string;
}

export function SellerWalletView({ lang = 'en' }: SellerWalletViewProps) {
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
        !term || tx.description.toLowerCase().includes(term) || String(tx.amount).includes(term);
      const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [transactions, search, typeFilter]);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  if (isWalletLoading) {
    return <LoadingState message={isBn ? 'ওয়ালেট লোড হচ্ছে...' : 'Loading wallet...'} />;
  }

  if (isWalletError) {
    return (
      <ErrorState
        title={isBn ? 'ওয়ালেট লোড করা যায়নি' : 'Could not load wallet'}
        message={
          isBn
            ? 'আপনার ওয়ালেট তথ্য আনতে সমস্যা হয়েছে। আবার চেষ্টা করুন।'
            : 'There was a problem loading your wallet. Please try again.'
        }
        onRetry={() => {
          void refetchWallet();
          void refetchTx();
        }}
        isBn={isBn}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', href: `/${lang}/seller` },
          { label: isBn ? 'ওয়ালেট' : 'Wallet' },
        ]}
        title={isBn ? 'আমার ওয়ালেট' : 'My wallet'}
        description={
          isBn ? 'আপনার আয় এবং লেনদেন পরিচালনা করুন' : 'Manage your earnings and transactions'
        }
        primaryAction={
          <Button asChild className="gap-2">
            <Link href={`/${lang}/seller/wallet/payout`}>
              <Wallet className="h-4 w-4" />
              {isBn ? 'পেআউট অনুরোধ করুন' : 'Request payout'}
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-xs font-medium">
              {isBn ? 'বর্তমান ব্যালেন্স' : 'Available balance'}
            </CardTitle>
            <Wallet className="text-primary h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-primary text-xl font-bold sm:text-2xl">
              {formatCurrency(wallet?.balance)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-xs font-medium">
              {isBn ? 'পেন্ডিং ক্লিয়ারেন্স' : 'Pending clearance'}
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-amber-600 sm:text-2xl">
              {formatCurrency(wallet?.pendingClearance)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-xs font-medium">
              {isBn ? 'মোট আয়' : 'Total earned'}
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-emerald-600 sm:text-2xl">
              {formatCurrency(wallet?.totalEarned)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-xs font-medium">
              {isBn ? 'মোট উত্তোলন' : 'Total withdrawn'}
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-600 sm:text-2xl">
              {formatCurrency(wallet?.totalWithdrawn)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-sm">
              <Search className="start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={
                  isBn ? 'বিবরণ বা পরিমাণ দিয়ে খুঁজুন...' : 'Search by description or amount...'
                }
                className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary h-10 w-full rounded-lg border ps-10 pe-10 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label={isBn ? 'মুছুন' : 'Clear'}
                  className="text-muted-foreground hover:text-foreground absolute end-3 top-1/2 -translate-y-1/2 rounded p-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="w-full sm:w-44">
              <Select
                value={typeFilter}
                onValueChange={(val) => {
                  setTypeFilter(val as 'ALL' | 'CREDIT' | 'DEBIT');
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder={isBn ? 'সকল ধরন' : 'All types'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{isBn ? 'সকল ধরন' : 'All types'}</SelectItem>
                  <SelectItem value="CREDIT">
                    {isBn ? 'ক্রেডিট (আয়)' : 'Credit (income)'}
                  </SelectItem>
                  <SelectItem value="DEBIT">
                    {isBn ? 'ডেবিট (ব্যয়)' : 'Debit (expense)'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isBn ? 'তারিখ' : 'Date'}</TableHead>
                  <TableHead>{isBn ? 'বিবরণ' : 'Description'}</TableHead>
                  <TableHead>{isBn ? 'ধরন' : 'Type'}</TableHead>
                  <TableHead className="text-end">{isBn ? 'পরিমাণ' : 'Amount'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isTxLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell colSpan={4}>
                        <div className="bg-muted h-4 w-full animate-pulse rounded" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : isTxError ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center">
                      <p className="text-muted-foreground mb-3 text-sm">
                        {isBn ? 'লেনদেন তথ্য আনা যায়নি।' : 'Could not load transactions.'}
                      </p>
                      <Button variant="outline" size="sm" onClick={() => void refetchTx()}>
                        {isBn ? 'আবার চেষ্টা করুন' : 'Retry'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : paginatedTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="bg-muted/60 mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                          <Search className="text-muted-foreground/60 h-6 w-6" />
                        </div>
                        <h3 className="text-foreground mb-1 text-base font-semibold">
                          {isBn ? 'কোন লেনদেন পাওয়া যায়নি' : 'No transactions found'}
                        </h3>
                        <p className="text-muted-foreground max-w-sm text-sm">
                          {search || typeFilter !== 'ALL'
                            ? isBn
                              ? 'আপনার ফিল্টারের সাথে কোনো লেনদেন মেলেনি'
                              : 'No transactions match your filters.'
                            : isBn
                              ? 'বর্তমানে কোনো লেনদেনের রেকর্ড নেই। পণ্য বিক্রি হলে এখানে আয় দেখা যাবে।'
                              : 'No transactions yet. Earnings appear here once your sales are settled.'}
                        </p>
                        {(search || typeFilter !== 'ALL') && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearch('');
                              setTypeFilter('ALL');
                            }}
                            className="text-primary hover:text-primary/80 mt-4 text-sm font-medium"
                          >
                            {isBn ? 'ফিল্টার পরিষ্কার করুন' : 'Clear filters'}
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                        {formatDateTime(tx.createdAt, lang)}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {tx.description}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            tx.type === 'CREDIT'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                          }
                        >
                          {tx.type === 'CREDIT'
                            ? isBn
                              ? 'আয়'
                              : 'Credit'
                            : isBn
                              ? 'ব্যয়'
                              : 'Debit'}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`text-end font-semibold tabular-nums ${
                          tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {tx.type === 'CREDIT' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <AdminPagination
            totalItems={filteredTransactions.length}
            itemsPerPage={pageSize}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onLimitChange={(newLimit) => {
              setPageSize(newLimit);
              setCurrentPage(1);
            }}
            lang={lang}
            itemLabel={{
              singular: isBn ? 'লেনদেন' : 'transaction',
              plural: isBn ? 'লেনদেন' : 'transactions',
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
