'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetMyWalletQuery } from '@/features/wallets/walletsApi';
import { useRequestPayoutMutation } from '@/features/payouts/payoutsApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Wallet, ArrowLeft, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

export default function RequestPayoutPage() {
  const router = useRouter();
  const { data: wallet, isLoading } = useGetMyWalletQuery();
  const [requestPayout, { isLoading: isSubmitting }] = useRequestPayoutMutation();

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');

  const availableBalance = Number(wallet?.balance || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const payoutAmount = parseFloat(amount);
    
    if (!payoutAmount || isNaN(payoutAmount)) {
      setError('Please enter a valid amount.');
      return;
    }

    if (payoutAmount < 500) {
      setError('Minimum payout amount is ৳500.');
      return;
    }

    if (payoutAmount > availableBalance) {
      setError('Requested amount exceeds available balance.');
      return;
    }

    if (!method) {
      setError('Please select a withdrawal method.');
      return;
    }

    if (!details) {
      setError('Please provide your account details.');
      return;
    }

    try {
      await requestPayout({
        amount: payoutAmount,
        method,
        accountDetails: details,
      }).unwrap();
      
      router.push('./'); // Redirect back to wallet dashboard
    } catch (err: any) {
      setError(err.data?.message || 'Failed to submit payout request.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="./">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Request Payout</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Withdraw Funds</CardTitle>
          <CardDescription>Transfer your earnings to your bank or mobile banking account.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg flex items-center justify-between border">
              <span className="text-sm font-medium">Available Balance</span>
              <span className="text-xl font-bold text-primary">৳{availableBalance.toLocaleString()}</span>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="amount">Withdrawal Amount (৳)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={availableBalance}
                disabled={isLoading || isSubmitting}
                required
              />
              <p className="text-xs text-muted-foreground">Minimum withdrawal is ৳500.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">Withdrawal Method</Label>
              <Select onValueChange={setMethod} value={method} disabled={isLoading || isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BKASH">bKash</SelectItem>
                  <SelectItem value="NAGAD">Nagad</SelectItem>
                  <SelectItem value="ROCKET">Rocket</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Account Details</Label>
              <Textarea
                id="details"
                placeholder={
                  method === 'BANK_TRANSFER' 
                    ? "Bank Name: \nAccount Name: \nAccount Number: \nBranch: " 
                    : "Enter your mobile number (e.g. 01700000000)"
                }
                rows={4}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                disabled={isLoading || isSubmitting}
                required
              />
              <p className="text-xs text-muted-foreground">Double check your account details before submitting.</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t pt-6">
            <Link href="./">
              <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
            </Link>
            <Button type="submit" disabled={isLoading || isSubmitting || availableBalance < 500}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
