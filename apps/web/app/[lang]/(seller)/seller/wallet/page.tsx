'use client';

import React, { useState, useMemo } from 'react';
import { useGetMyWalletQuery, useGetMyTransactionsQuery } from '@/features/wallets/walletsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, ArrowUpRight, Clock, CheckCircle2, Search, X } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import AdminPagination from '@/components/AdminPagination';

export default function SellerWalletPage({ params }: { params: { lang: string } }) {
  const { data: wallet, isLoading: isWalletLoading } = useGetMyWalletQuery();
  const { data: transactions = [], isLoading: isTxLoading } = useGetMyTransactionsQuery();
  const isBn = params.lang === 'bn';
  const lang = isBn ? 'bn' : 'en';

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        !search.trim() ||
        tx.description.toLowerCase().includes(search.toLowerCase()) ||
        tx.amount.toString().includes(search.trim());

      const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [transactions, search, typeFilter]);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  if (isWalletLoading) {
    return <div className="p-8 text-center text-muted-foreground">{isBn ? 'লোড হচ্ছে...' : 'Loading...'}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{isBn ? 'আমার ওয়ালেট' : 'My Wallet'}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isBn ? 'আপনার আয় এবং লেনদেন পরিচালনা করুন' : 'Manage your earnings and transactions'}
          </p>
        </div>
        <Button asChild className="gap-2 rounded-full px-5">
          <Link href={`/${params.lang}/seller/wallet/payout`}>
            <Wallet className="h-4 w-4" />
            {isBn ? 'পেআউট অনুরোধ করুন' : 'Request Payout'}
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isBn ? 'বর্তমান ব্যালেন্স' : 'Available Balance'}
            </CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">৳ {wallet?.balance || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isBn ? 'পেন্ডিং ক্লিয়ারেন্স' : 'Pending Clearance'}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">৳ {wallet?.pendingClearance || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isBn ? 'মোট আয়' : 'Total Earned'}
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">৳ {wallet?.totalEarned || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isBn ? 'মোট উত্তোলন' : 'Total Withdrawn'}
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">৳ {wallet?.totalWithdrawn || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 dark:border-border dark:bg-card">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full flex-1 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
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
                placeholder={isBn ? 'বিবরণ বা পরিমাণ দিয়ে লেনদেন খুঁজুন...' : 'Search transactions by description...'}
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

            {/* Type Filter */}
            <div className="w-full sm:w-44">
              <Select
                value={typeFilter}
                onValueChange={(val) => {
                  setTypeFilter(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="!h-11 w-full rounded-full border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-0 dark:border-border dark:bg-background dark:text-foreground">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{isBn ? 'সকল ধরন' : 'All Types'}</SelectItem>
                  <SelectItem value="CREDIT">{isBn ? 'ক্রেডিট (আয়)' : 'Credit (Income)'}</SelectItem>
                  <SelectItem value="DEBIT">{isBn ? 'ডেবিট (ব্যয়)' : 'Debit (Expense)'}</SelectItem>
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
                  <TableHead className="py-3.5 px-4">{isBn ? 'তারিখ' : 'Date'}</TableHead>
                  <TableHead className="py-3.5 px-4">{isBn ? 'বিবরণ' : 'Description'}</TableHead>
                  <TableHead className="py-3.5 px-4">{isBn ? 'ধরন' : 'Type'}</TableHead>
                  <TableHead className="py-3.5 px-4 text-right">{isBn ? 'পরিমাণ' : 'Amount'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200 dark:divide-border">
                {isTxLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`} className="animate-pulse">
                      <TableCell className="py-4 px-4"><div className="h-4 w-32 rounded bg-muted"></div></TableCell>
                      <TableCell className="py-4 px-4"><div className="h-4 w-48 rounded bg-muted"></div></TableCell>
                      <TableCell className="py-4 px-4"><div className="h-6 w-16 rounded-full bg-muted"></div></TableCell>
                      <TableCell className="py-4 px-4 text-right"><div className="ml-auto h-4 w-20 rounded bg-muted"></div></TableCell>
                    </TableRow>
                  ))
                ) : paginatedTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted/60">
                          <Search className="h-6 w-6 text-muted-foreground/60" />
                        </div>
                        <h3 className="mb-1 text-base font-semibold text-foreground">
                          {isBn ? 'কোন লেনদেন পাওয়া যায়নি' : 'No transactions found'}
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          {search || typeFilter !== 'ALL'
                            ? (isBn ? 'আপনার ফিল্টারের সাথে কোনো লেনদেন মেলেনি' : 'No transactions match your search criteria.')
                            : (isBn ? 'বর্তমানে কোনো লেনদেনের রেকর্ড নেই' : 'No transaction records available.')}
                        </p>
                        {(search || typeFilter !== 'ALL') && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearch('');
                              setTypeFilter('ALL');
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
                  paginatedTransactions.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-gray-50/70 transition-colors dark:hover:bg-muted/30">
                      <TableCell className="whitespace-nowrap py-3.5 px-4 font-mono text-xs">
                        {format(new Date(tx.createdAt), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="py-3.5 px-4 font-medium text-foreground">{tx.description}</TableCell>
                      <TableCell className="py-3.5 px-4">
                        <Badge
                          variant="secondary"
                          className={
                            tx.type === 'CREDIT'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                          }
                        >
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right py-3.5 px-4 font-semibold tabular-nums ${
                          tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {tx.type === 'CREDIT' ? '+' : '-'} ৳ {tx.amount}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination inside Main Card */}
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
      </div>
    </div>
  );
}
