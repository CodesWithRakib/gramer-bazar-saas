'use client';

import React, { useMemo, useState } from 'react';
import { Loader2, Search, Wallet, X } from 'lucide-react';
import { toast } from 'sonner';

import { getApiErrorMessage } from '@/lib/apiError';
import { useGetMyWalletQuery } from '@/features/wallets/walletsApi';
import { useGetMyPayoutsQuery, useRequestPayoutMutation } from '@/features/payouts/payoutsApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import AdminPagination from '@/components/AdminPagination';
import { formatCurrency, formatDate } from '@/lib/format';

/** Mirrors the server-side rule in CreatePayoutDto (@Min(500)). */
const MIN_PAYOUT = 500;

const METHOD_OPTIONS = [
  { value: 'BKASH', en: 'bKash', bn: 'বিকাশ' },
  { value: 'NAGAD', en: 'Nagad', bn: 'নগদ' },
  { value: 'ROCKET', en: 'Rocket', bn: 'রকেট' },
  { value: 'BANK_TRANSFER', en: 'Bank transfer', bn: 'ব্যাংক ট্রান্সফার' },
] as const;

export interface SellerPayoutViewProps {
  lang?: string;
}

export function SellerPayoutView({ lang = 'en' }: SellerPayoutViewProps) {
  const isBn = lang === 'bn';
  const { data: wallet, isLoading: isWalletLoading } = useGetMyWalletQuery();
  const {
    data: payouts = [],
    isLoading: isPayoutsLoading,
    isError: isPayoutsError,
    refetch,
  } = useGetMyPayoutsQuery();
  const [requestPayout, { isLoading: isRequesting }] = useRequestPayoutMutation();

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [accountDetails, setAccountDetails] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>(
    'ALL',
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const balance = Number(wallet?.balance ?? 0);

  const filteredPayouts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return payouts.filter((payout) => {
      const matchesSearch =
        !term ||
        payout.accountDetails?.toLowerCase().includes(term) ||
        payout.method?.toLowerCase().includes(term) ||
        String(payout.amount).includes(term);
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
      toast.error(isBn ? 'সব তথ্য প্রদান করুন' : 'Please fill in all fields');
      return;
    }

    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount < MIN_PAYOUT) {
      toast.error(
        isBn
          ? `সর্বনিম্ন ${MIN_PAYOUT} টাকা উত্তোলন করা যাবে`
          : `Minimum payout amount is ${MIN_PAYOUT}`,
      );
      return;
    }

    if (numAmount > balance) {
      toast.error(isBn ? 'আপনার পর্যাপ্ত ব্যালেন্স নেই' : 'Insufficient balance');
      return;
    }

    try {
      await requestPayout({
        amount: numAmount,
        method,
        accountDetails,
      }).unwrap();

      toast.success(isBn ? 'পেআউট অনুরোধ পাঠানো হয়েছে' : 'Payout requested successfully');
      setAmount('');
      setMethod('');
      setAccountDetails('');
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, isBn ? 'পেআউট অনুরোধ ব্যর্থ হয়েছে' : 'Failed to request payout'),
      );
    }
  };

  const statusBadge = (status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    switch (status) {
      case 'APPROVED':
        return (
          <StatusBadge
            tone="success"
            label={isBn ? 'অনুমোদিত' : 'Approved'}
          />
        );
      case 'REJECTED':
        return <StatusBadge tone="danger" label={isBn ? 'বাতিল' : 'Rejected'} />;
      default:
        return <StatusBadge tone="warning" label={isBn ? 'অপেক্ষমাণ' : 'Pending'} />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', href: `/${lang}/seller` },
          { label: isBn ? 'ওয়ালেট' : 'Wallet', href: `/${lang}/seller/wallet` },
          { label: isBn ? 'পেআউট' : 'Payout' },
        ]}
        title={isBn ? 'পেআউট অনুরোধ' : 'Request payout'}
        description={
          isBn
            ? 'আপনার ব্যাংক বা মোবাইল ব্যাংকিং এ টাকা উত্তোলন করুন'
            : 'Withdraw funds to your bank or mobile banking account'
        }
        badge={
          <span className="text-muted-foreground text-sm font-medium">
            {isBn ? 'ব্যালেন্স:' : 'Balance:'}{' '}
            <span className="text-foreground font-semibold">{formatCurrency(balance)}</span>
          </span>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Request form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="text-primary h-4 w-4" />
              {isBn ? 'নতুন অনুরোধ' : 'New request'}
            </CardTitle>
            <CardDescription>
              {isBn
                ? `প্রকৃত ব্যালেন্স: ${formatCurrency(balance)}${
                    wallet?.pendingClearance ? ` · পেন্ডিং: ${formatCurrency(wallet.pendingClearance)}` : ''
                  }`
                : `Available ${formatCurrency(balance)}${
                    wallet?.pendingClearance
                      ? ` · ${formatCurrency(wallet.pendingClearance)} pending`
                      : ''
                  }`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">{isBn ? 'পরিমাণ (৳)' : 'Amount (৳)'}</Label>
                <Input
                  id="amount"
                  type="number"
                  inputMode="numeric"
                  min={MIN_PAYOUT}
                  max={balance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Min ${MIN_PAYOUT}`}
                />
                {isWalletLoading && (
                  <p className="text-muted-foreground text-xs">
                    {isBn ? 'ব্যালেন্স লোড হচ্ছে...' : 'Loading balance...'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>{isBn ? 'উত্তোলনের মাধ্যম' : 'Payout method'}</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={isBn ? 'মাধ্যম নির্বাচন করুন' : 'Select method'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {METHOD_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {isBn ? option.bn : option.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">{isBn ? 'অ্যাকাউন্ট বিস্তারিত' : 'Account details'}</Label>
                <Input
                  id="details"
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  placeholder={
                    method === 'BANK_TRANSFER'
                      ? isBn
                        ? 'হিসাব নম্বর, ব্যাংক, শাখা'
                        : 'A/C number, bank, branch'
                      : isBn
                        ? 'মোবাইল নম্বর'
                        : 'Phone number'
                  }
                />
              </div>

              <Button type="submit" className="w-full" disabled={isRequesting}>
                {isRequesting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                {isBn ? 'অনুরোধ পাঠান' : 'Submit request'}
              </Button>

              <p className="text-muted-foreground text-xs">
                {isBn
                  ? `সর্বনিম্ন উত্তোলন ${MIN_PAYOUT} টাকা। অনুমোদনের পর ব্যালেন্সে যুক্ত হবে।`
                  : `Minimum payout is ${MIN_PAYOUT}. Funds settle after admin approval.`}
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Payout history */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{isBn ? 'পেআউট ইতিহাস' : 'Payout history'}</CardTitle>
            <CardDescription>
              {isBn
                ? 'আপনার পূর্ববর্তী সকল উত্তোলনের অবস্থা'
                : 'Status of your previous withdrawal requests'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:max-w-xs">
                <Search className="start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder={isBn ? 'হিসাব বা মাধ্যম খুঁজুন...' : 'Search details or method...'}
                  className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary h-10 w-full rounded-lg border ps-9 pe-9 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    aria-label={isBn ? 'মুছুন' : 'Clear'}
                    className="text-muted-foreground hover:text-foreground absolute end-2 top-1/2 -translate-y-1/2 rounded p-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="w-full sm:w-40">
                <Select
                  value={statusFilter}
                  onValueChange={(val) => {
                    setStatusFilter(val as typeof statusFilter);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder={isBn ? 'সকল স্ট্যাটাস' : 'All status'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">{isBn ? 'সকল স্ট্যাটাস' : 'All status'}</SelectItem>
                    <SelectItem value="PENDING">{isBn ? 'অপেক্ষমাণ' : 'Pending'}</SelectItem>
                    <SelectItem value="APPROVED">{isBn ? 'অনুমোদিত' : 'Approved'}</SelectItem>
                    <SelectItem value="REJECTED">{isBn ? 'বাতিল' : 'Rejected'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isBn ? 'তারিখ' : 'Date'}</TableHead>
                    <TableHead>{isBn ? 'পরিমাণ' : 'Amount'}</TableHead>
                    <TableHead>{isBn ? 'মাধ্যম' : 'Method'}</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      {isBn ? 'বিস্তারিত' : 'Details'}
                    </TableHead>
                    <TableHead>{isBn ? 'অবস্থা' : 'Status'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPayoutsLoading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                      <TableRow key={`skeleton-${index}`}>
                        <TableCell colSpan={5}>
                          <div className="bg-muted h-4 w-full animate-pulse rounded" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : isPayoutsError ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center">
                        <p className="text-muted-foreground mb-3 text-sm">
                          {isBn ? 'পেআউট ইতিহাস আনা যায়নি।' : 'Could not load payout history.'}
                        </p>
                        <Button variant="outline" size="sm" onClick={() => void refetch()}>
                          {isBn ? 'আবার চেষ্টা করুন' : 'Retry'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : paginatedPayouts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center">
                        <div className="flex flex-col items-center">
                          <div className="bg-muted/60 mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                            <Wallet className="text-muted-foreground/60 h-5 w-5" />
                          </div>
                          <p className="text-foreground text-sm font-medium">
                            {isBn ? 'কোনো পেআউট ইতিহাস নেই' : 'No payout history yet'}
                          </p>
                          <p className="text-muted-foreground mt-1 max-w-xs text-xs">
                            {search || statusFilter !== 'ALL'
                              ? isBn
                                ? 'আপনার ফিল্টারের সাথে কিছু মেলেনি'
                                : 'Nothing matches your filters.'
                              : isBn
                                ? 'ব্যালেন্স জমা হলে এখান থেকে টাকা তুলতে পারবেন।'
                                : 'Once your balance grows you can withdraw from here.'}
                          </p>
                          {(search || statusFilter !== 'ALL') && (
                            <button
                              type="button"
                              onClick={() => {
                                setSearch('');
                                setStatusFilter('ALL');
                              }}
                              className="text-primary mt-3 text-xs font-medium"
                            >
                              {isBn ? 'ফিল্টার পরিষ্কার করুন' : 'Clear filters'}
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedPayouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                          {formatDate(payout.createdAt, lang)}
                        </TableCell>
                        <TableCell className="font-semibold text-emerald-600">
                          {formatCurrency(payout.amount)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {
                            METHOD_OPTIONS.find((option) => option.value === payout.method)?.[
                              isBn ? 'bn' : 'en'
                            ]
                          }
                        </TableCell>
                        <TableCell
                          className="text-muted-foreground hidden max-w-[180px] truncate text-xs sm:table-cell"
                          title={payout.accountDetails}
                        >
                          {payout.accountDetails}
                        </TableCell>
                        <TableCell>
                          {statusBadge(payout.status)}
                          {payout.adminNote && (
                            <p
                              className="text-muted-foreground mt-1 max-w-[140px] truncate text-[10px]"
                              title={payout.adminNote}
                            >
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
