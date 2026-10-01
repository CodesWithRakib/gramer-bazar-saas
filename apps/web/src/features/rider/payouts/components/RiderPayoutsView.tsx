'use client';

import React, { useState } from 'react';
import { customToast as toast } from '@/components/ui/custom-toast';
import { Banknote, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import {
  useGetRiderEarningsQuery,
  useGetRiderPayoutsQuery,
  useRequestRiderPayoutMutation,
  PayoutMethod,
  PayoutStatus,
} from '@/features/riders/ridersApi';

export interface RiderPayoutsViewProps {
  lang?: string;
}

const currency = (value: number) => `\u09F3${Number(value || 0).toFixed(2)}`;
const MIN_PAYOUT = 100;

const statusStyles: Record<PayoutStatus, string> = {
  PENDING: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  APPROVED: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  REJECTED: 'bg-destructive/10 text-destructive',
};

export function RiderPayoutsView({ lang = 'en' }: RiderPayoutsViewProps) {
  const isBn = lang === 'bn';

  const {
    data: earnings,
    isLoading: isLoadingEarnings,
    isError: isEarningsError,
    refetch: refetchEarnings,
  } = useGetRiderEarningsQuery({ page: 1, limit: 1 });
  const {
    data: payouts,
    isLoading: isLoadingPayouts,
    isError: isPayoutsError,
    refetch: refetchPayouts,
  } = useGetRiderPayoutsQuery();

  const [requestPayout, { isLoading: isSubmitting }] = useRequestRiderPayoutMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PayoutMethod>('BKASH');
  const [accountDetails, setAccountDetails] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const summary = earnings?.summary;
  const available = summary?.availableBalance ?? 0;

  const handleSubmit = async () => {
    const parsed = Number(amount);
    if (!parsed || parsed <= 0) {
      setFormError(isBn ? 'সঠিক পরিমাণ লিখুন' : 'Enter a valid amount');
      return;
    }
    if (parsed < MIN_PAYOUT) {
      setFormError(
        isBn
          ? `সর্বনিম্ন পে-আউট ${currency(MIN_PAYOUT)}`
          : `Minimum payout is ${currency(MIN_PAYOUT)}`
      );
      return;
    }
    if (parsed > available) {
      setFormError(
        isBn
          ? `আপনার উত্তোলনযোগ্য ব্যালেন্স ${currency(available)}`
          : `You can withdraw up to ${currency(available)}`
      );
      return;
    }
    if (!accountDetails.trim()) {
      setFormError(isBn ? 'অ্যাকাউন্টের বিবরণ লিখুন' : 'Enter your account details');
      return;
    }

    setFormError(null);
    try {
      await requestPayout({
        amount: parsed,
        method,
        accountDetails: accountDetails.trim(),
      }).unwrap();
      toast.success(isBn ? 'পে-আউট অনুরোধ পাঠানো হয়েছে' : 'Payout request submitted');
      setDialogOpen(false);
      setAmount('');
      setAccountDetails('');
    } catch {
      toast.error(
        isBn ? 'অনুরোধ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।' : 'Request failed. Please try again.'
      );
    }
  };

  const isLoading = isLoadingEarnings || isLoadingPayouts;

  if (isLoading) {
    return (
      <div className="space-y-5 pt-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    );
  }

  if (isEarningsError || isPayoutsError) {
    return (
      <div className="space-y-5 pt-2">
        <PageHeader title={isBn ? 'পে-আউট' : 'Payouts'} />
        <ErrorState
          isBn={isBn}
          onRetry={() => {
            refetchEarnings();
            refetchPayouts();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-2">
      <PageHeader
        title={isBn ? 'পে-আউট' : 'Payouts'}
        description={
          isBn
            ? 'আপনার আয় থেকে টাকা উত্তোলনের অনুরোধ করুন এবং ইতিহাস দেখুন।'
            : 'Withdraw your delivery earnings and track your payout requests.'
        }
      />

      <Card className="rounded-2xl border-primary/40 shadow-none">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              {isBn ? 'উত্তোলনযোগ্য ব্যালেন্স' : 'Available Balance'}
            </span>
          </div>
          <p className="text-3xl font-bold tracking-tight text-foreground">{currency(available)}</p>
          <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">{isBn ? 'পেন্ডিং' : 'Pending'}</p>
              <p className="font-semibold text-foreground">
                {currency(summary?.pendingPayout ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{isBn ? 'পরিশোধিত' : 'Paid Out'}</p>
              <p className="font-semibold text-foreground">{currency(summary?.paidOut ?? 0)}</p>
            </div>
          </div>
          <Button
            className="h-12 w-full"
            disabled={available < MIN_PAYOUT}
            onClick={() => setDialogOpen(true)}
          >
            {isBn ? 'পে-আউট অনুরোধ করুন' : 'Request Payout'}
          </Button>
          {available < MIN_PAYOUT && (
            <p className="text-center text-xs text-muted-foreground">
              {isBn
                ? `অনুরোধ করতে ন্যূনতম ${currency(MIN_PAYOUT)} প্রয়োজন।`
                : `You need at least ${currency(MIN_PAYOUT)} to request a payout.`}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Banknote className="h-4 w-4 text-primary" />
            {isBn ? 'পে-আউট ইতিহাস' : 'Payout History'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!payouts || payouts.length === 0 ? (
            <EmptyState
              className="min-h-[200px] rounded-none border-0 bg-transparent"
              icon={<Banknote className="h-7 w-7 text-primary" />}
              title={isBn ? 'কোনো পে-আউট নেই' : 'No payouts yet'}
              description={
                isBn
                  ? 'উত্তোলনের অনুরোধ করলে এখানে ইতিহাস দেখা যাবে।'
                  : 'Your payout requests will appear here once you make one.'
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {payouts.map((payout) => (
                <li key={payout.id} className="space-y-1.5 px-4 py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-foreground">{currency(payout.amount)}</span>
                    <Badge className={`text-[10px] uppercase ${statusStyles[payout.status]}`}>
                      {payout.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span className="truncate">{payout.accountDetails}</span>
                    <span className="shrink-0">
                      {new Date(payout.createdAt).toLocaleDateString(isBn ? 'bn-BD' : 'en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  {payout.adminNote && (
                    <p className="text-xs text-muted-foreground">{payout.adminNote}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isBn ? 'পে-আউট অনুরোধ' : 'Request Payout'}</DialogTitle>
            <DialogDescription>
              {isBn
                ? `উত্তোলনযোগ্য ব্যালেন্স ${currency(available)}`
                : `Available balance ${currency(available)}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payout-amount">{isBn ? 'পরিমাণ' : 'Amount'}</Label>
              <Input
                id="payout-amount"
                type="number"
                inputMode="decimal"
                min={MIN_PAYOUT}
                max={available}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>{isBn ? 'মাধ্যম' : 'Method'}</Label>
              <Select value={method} onValueChange={(value) => setMethod(value as PayoutMethod)}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BKASH">bKash</SelectItem>
                  <SelectItem value="NAGAD">Nagad</SelectItem>
                  <SelectItem value="ROCKET">Rocket</SelectItem>
                  <SelectItem value="BANK_TRANSFER">
                    {isBn ? 'ব্যাংক ট্রান্সফার' : 'Bank Transfer'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payout-account">
                {isBn ? 'অ্যাকাউন্টের বিবরণ' : 'Account Details'}
              </Label>
              <Input
                id="payout-account"
                value={accountDetails}
                onChange={(event) => setAccountDetails(event.target.value)}
                placeholder={
                  method === 'BANK_TRANSFER' ? 'Bank, A/C number' : 'bKash Personal: 017...'
                }
                className="h-11"
              />
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting
                ? isBn
                  ? 'পাঠানো হচ্ছে...'
                  : 'Submitting...'
                : isBn
                  ? 'জমা দিন'
                  : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
