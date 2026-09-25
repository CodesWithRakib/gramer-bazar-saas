'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowUpDown,
  ExternalLink,
  Eye,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Settings,
  X,
} from 'lucide-react';
import {
  useGetAdminPaymentsQuery,
  PaymentRecord,
} from '@/features/payments/paymentsApi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AdminPagination from '@/components/AdminPagination';

export interface AdminPaymentsViewProps {
  lang?: string;
  namespace?: 'admin' | 'super-admin';
}

export function AdminPaymentsView({ lang = 'en' }: AdminPaymentsViewProps) {
  const isBn = lang === 'bn';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);

  const { data, isLoading, isFetching, refetch } = useGetAdminPaymentsQuery({
    page,
    limit: 15,
    search: search ? search.trim() : undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    provider: providerFilter !== 'ALL' ? providerFilter : undefined,
  });

  const payments = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isBn ? 'পরিশোধিত' : 'PAID'}
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20">
            <XCircle className="w-3.5 h-3.5" />
            {isBn ? 'ব্যর্থ' : 'FAILED'}
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
            <Clock className="w-3.5 h-3.5" />
            {isBn ? 'বাতিল' : 'CANCELLED'}
          </span>
        );
      case 'PROCESSING':
      case 'INITIATED':
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-primary" />
            {isBn ? 'পেমেন্ট ট্রানজ্যাকশনসমূহ' : 'Payment Transactions'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isBn
              ? 'SSLCOMMERZ গেটওয়ে ও সকল অনলাইন পেমেন্টের বিবরণী পর্যবেক্ষণ করুন'
              : 'Audit and monitor SSLCOMMERZ gateway and payment transactions'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href={`/${lang}/admin/settings`}>
              <Settings className="w-4 h-4" />
              {isBn ? 'গেটওয়ে ও টানেল সেটিংস' : 'Gateway & Tunnel'}
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            {isBn ? 'রিফ্রেশ' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 dark:border-border dark:bg-card">
        {/* Top Toolbar */}
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full flex-1 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
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
                placeholder={
                  isBn
                    ? 'ট্রানজ্যাকশন আইডি, অর্ডার আইডি বা নাম...'
                    : 'Search by Transaction ID, Order ID, Phone or Name...'
                }
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

            {/* Status Filter */}
            <div className="w-full sm:w-40">
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="!h-11 w-full rounded-full border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-0 dark:border-border dark:bg-background dark:text-foreground">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{isBn ? 'সকল স্ট্যাটাস' : 'All Status'}</SelectItem>
                  <SelectItem value="PAID">PAID</SelectItem>
                  <SelectItem value="INITIATED">INITIATED</SelectItem>
                  <SelectItem value="FAILED">FAILED</SelectItem>
                  <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Provider Filter */}
            <div className="w-full sm:w-40">
              <Select
                value={providerFilter}
                onValueChange={(val) => {
                  setProviderFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="!h-11 w-full rounded-full border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-0 dark:border-border dark:bg-background dark:text-foreground">
                  <SelectValue placeholder="Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{isBn ? 'সকল প্রোভাইডার' : 'All Providers'}</SelectItem>
                  <SelectItem value="SSLCOMMERZ">SSLCOMMERZ</SelectItem>
                  <SelectItem value="COD">COD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-full h-11 px-5 gap-2 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            {isBn ? 'রিফ্রেশ' : 'Refresh'}
          </Button>
        </div>

        {/* Transactions Table Inner Container */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xs dark:border-border dark:bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 uppercase text-xs font-semibold text-gray-900 tracking-wider dark:border-border dark:bg-muted/40 dark:text-foreground">
                <tr>
                  <th className="py-3.5 px-4">{isBn ? 'ট্রানজ্যাকশন আইডি' : 'Transaction ID'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'অর্ডার' : 'Order ID'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'গ্রাহক' : 'Customer'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'পরিমাণ' : 'Amount'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'মেথড / কার্ড' : 'Method'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="py-3.5 px-4">{isBn ? 'তারিখ' : 'Date'}</th>
                  <th className="py-3.5 px-4 text-right">{isBn ? 'পদক্ষেপ' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-border">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="animate-pulse">
                      <td className="py-4 px-4"><div className="h-4 w-28 rounded bg-muted"></div></td>
                      <td className="py-4 px-4"><div className="h-4 w-24 rounded bg-muted"></div></td>
                      <td className="py-4 px-4"><div className="h-4 w-32 rounded bg-muted"></div></td>
                      <td className="py-4 px-4"><div className="h-4 w-20 rounded bg-muted"></div></td>
                      <td className="py-4 px-4"><div className="h-4 w-20 rounded bg-muted"></div></td>
                      <td className="py-4 px-4"><div className="h-6 w-20 rounded-full bg-muted"></div></td>
                      <td className="py-4 px-4"><div className="h-4 w-24 rounded bg-muted"></div></td>
                      <td className="py-4 px-4 text-right"><div className="ml-auto h-8 w-16 rounded bg-muted"></div></td>
                    </tr>
                  ))
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted/60">
                          <CreditCard className="h-6 w-6 text-muted-foreground/60" />
                        </div>
                        <h3 className="mb-1 text-base font-semibold text-foreground">
                          {isBn ? 'কোনো লেনদেন পাওয়া যায়নি' : 'No payment records found'}
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          {search || statusFilter !== 'ALL' || providerFilter !== 'ALL'
                            ? (isBn ? 'আপনার অনুসন্ধানের ফিল্টারের সাথে কোনো লেনদেন মেলেনি' : 'No records match your search or filter.')
                            : (isBn ? 'বর্তমানে কোনো লেনদেনের রেকর্ড নেই' : 'No payments found.')}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/70 transition-colors dark:hover:bg-muted/30">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-xs font-semibold">
                          <span title={p.transactionId}>{p.transactionId}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(p.transactionId)}
                            className="text-muted-foreground hover:text-foreground transition-colors p-1"
                            title="Copy"
                          >
                            {copiedId === p.transactionId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase font-mono">
                          {p.provider}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <Link
                          href={`/${lang}/admin/orders?search=${p.orderId}`}
                          className="font-mono text-xs text-primary hover:underline inline-flex items-center gap-1"
                        >
                          {p.orderId.slice(0, 8)}...
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>

                      <td className="py-3.5 px-4">
                        {p.user ? (
                          <div>
                            <p className="font-medium text-foreground">
                              {p.user.firstName} {p.user.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">{p.user.phone}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs font-mono">
                            {p.userId.slice(0, 8)}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-foreground">
                        ৳{Number(p.amount).toFixed(2)}
                        <span className="text-[10px] text-muted-foreground ml-1">{p.currency}</span>
                      </td>

                      <td className="py-3.5 px-4 text-xs font-mono">
                        {p.cardType || p.cardBrand || 'Online / SSL'}
                      </td>

                      <td className="py-3.5 px-4">{getStatusBadge(p.status)}</td>

                      <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPayment(p)}
                          className="h-8 gap-1.5 rounded-full"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">{isBn ? 'বিস্তারিত' : 'Details'}</span>
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
          totalItems={meta.total}
          itemsPerPage={15}
          currentPage={page}
          onPageChange={setPage}
          lang={lang}
          itemLabel={{
            singular: isBn ? 'লেনদেন' : 'payment',
            plural: isBn ? 'লেনদেন' : 'payments',
          }}
        />
      </div>

      {/* Details Dialog */}
      <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              {isBn ? 'পেমেন্ট ট্রানজ্যাকশন বিবরণী' : 'Payment Transaction Details'}
            </DialogTitle>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4 pt-2 text-sm">
              <div className="flex items-center justify-between p-3.5 bg-muted/40 rounded-xl border border-border/50">
                <div>
                  <span className="text-xs text-muted-foreground uppercase">{isBn ? 'স্ট্যাটাস' : 'Status'}</span>
                  <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground uppercase">{isBn ? 'মোট অর্থ' : 'Total Amount'}</span>
                  <p className="text-xl font-black text-primary">
                    ৳{Number(selectedPayment.amount).toFixed(2)} {selectedPayment.currency}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-muted/20 rounded-xl border border-border/40 space-y-1">
                  <span className="text-muted-foreground">{isBn ? 'ট্রানজ্যাকশন আইডি' : 'Transaction ID'}</span>
                  <p className="font-mono font-semibold break-all">{selectedPayment.transactionId}</p>
                </div>
                <div className="p-3 bg-muted/20 rounded-xl border border-border/40 space-y-1">
                  <span className="text-muted-foreground">{isBn ? 'অর্ডার আইডি' : 'Order ID'}</span>
                  <p className="font-mono font-semibold break-all">{selectedPayment.orderId}</p>
                </div>
                <div className="p-3 bg-muted/20 rounded-xl border border-border/40 space-y-1">
                  <span className="text-muted-foreground">{isBn ? 'ভ্যালিডেশন আইডি' : 'Validation ID (val_id)'}</span>
                  <p className="font-mono">{selectedPayment.validationId || 'N/A'}</p>
                </div>
                <div className="p-3 bg-muted/20 rounded-xl border border-border/40 space-y-1">
                  <span className="text-muted-foreground">{isBn ? 'ব্যাংক রেফারেন্স' : 'Bank Tran ID'}</span>
                  <p className="font-mono">{selectedPayment.bankTransactionId || 'N/A'}</p>
                </div>
                <div className="p-3 bg-muted/20 rounded-xl border border-border/40 space-y-1">
                  <span className="text-muted-foreground">{isBn ? 'কার্ড টাইপ / মেথড' : 'Card Type / Method'}</span>
                  <p className="font-mono">{selectedPayment.cardType || 'N/A'}</p>
                </div>
                <div className="p-3 bg-muted/20 rounded-xl border border-border/40 space-y-1">
                  <span className="text-muted-foreground">{isBn ? 'কার্ড ইস্যুয়ার' : 'Card Issuer'}</span>
                  <p className="font-mono">{selectedPayment.cardIssuer || selectedPayment.cardBrand || 'N/A'}</p>
                </div>
                <div className="p-3 bg-muted/20 rounded-xl border border-border/40 space-y-1">
                  <span className="text-muted-foreground">{isBn ? 'ঝুঁকি স্তর' : 'Risk Level'}</span>
                  <p className="font-mono font-semibold text-emerald-600">
                    {selectedPayment.riskTitle || (selectedPayment.riskLevel === '0' ? 'Safe (0)' : selectedPayment.riskLevel || 'N/A')}
                  </p>
                </div>
                <div className="p-3 bg-muted/20 rounded-xl border border-border/40 space-y-1">
                  <span className="text-muted-foreground">{isBn ? 'গেটওয়ে স্ট্যাটাস' : 'Gateway Status'}</span>
                  <p className="font-mono">{selectedPayment.gatewayStatus || 'N/A'}</p>
                </div>
              </div>

              <div className="p-3 bg-muted/20 rounded-xl border border-border/40 text-xs space-y-1">
                <span className="text-muted-foreground">{isBn ? 'তারিখ ও সময়' : 'Timestamps'}</span>
                <p>Created: {new Date(selectedPayment.createdAt).toLocaleString()}</p>
                {selectedPayment.paidAt && (
                  <p className="text-emerald-600">Paid: {new Date(selectedPayment.paidAt).toLocaleString()}</p>
                )}
                {selectedPayment.failedAt && (
                  <p className="text-destructive">Failed: {new Date(selectedPayment.failedAt).toLocaleString()}</p>
                )}
              </div>

              {selectedPayment.order && (
                <div className="pt-2 flex justify-end">
                  <Button asChild size="sm" className="gap-2">
                    <Link href={`/${lang}/admin/orders?search=${selectedPayment.orderId}`}>
                      <ExternalLink className="w-4 h-4" />
                      {isBn ? 'সম্পূর্ণ অর্ডার দেখুন' : 'View Full Order'}
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
