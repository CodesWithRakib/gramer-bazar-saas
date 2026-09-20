'use client';

import { useState } from 'react';
import { useGetMyWalletQuery } from '@/features/wallets/walletsApi';
import { useGetMyPayoutsQuery, useRequestPayoutMutation } from '@/features/payouts/payoutsApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function PayoutRequestPage({ params }: { params: { lang: string } }) {
  const isBn = params.lang === 'bn';
  const { data: wallet } = useGetMyWalletQuery();
  const { data: payouts, isLoading: isPayoutsLoading } = useGetMyPayoutsQuery();
  const [requestPayout, { isLoading: isRequesting }] = useRequestPayoutMutation();

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [accountDetails, setAccountDetails] = useState('');

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
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to request payout');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary" className="bg-amber-500 hover:bg-amber-600 text-white">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/${params.lang}/seller/wallet`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isBn ? 'পেআউট অনুরোধ' : 'Request Payout'}
          </h1>
          <p className="text-muted-foreground">
            {isBn ? 'আপনার ব্যাংক বা মোবাইল ব্যাংকিং এ টাকা উত্তোলন করুন' : 'Withdraw funds to your bank or mobile banking account'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
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
                />
              </div>

              <div className="space-y-2">
                <Label>{isBn ? 'উত্তোলনের মাধ্যম' : 'Payout Method'}</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger>
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
                />
              </div>

              <Button type="submit" className="w-full" disabled={isRequesting}>
                {isRequesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isBn ? 'অনুরোধ পাঠান' : 'Submit Request'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{isBn ? 'পেআউট ইতিহাস' : 'Payout History'}</CardTitle>
          </CardHeader>
          <CardContent>
            {isPayoutsLoading ? (
              <div className="py-8 text-center text-muted-foreground">
                {isBn ? 'লোড হচ্ছে...' : 'Loading...'}
              </div>
            ) : payouts && payouts.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isBn ? 'তারিখ' : 'Date'}</TableHead>
                      <TableHead>{isBn ? 'পরিমাণ' : 'Amount'}</TableHead>
                      <TableHead>{isBn ? 'মাধ্যম' : 'Method'}</TableHead>
                      <TableHead>{isBn ? 'বিস্তারিত' : 'Details'}</TableHead>
                      <TableHead>{isBn ? 'অবস্থা' : 'Status'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(payout.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="font-medium text-emerald-600">
                          ৳ {payout.amount}
                        </TableCell>
                        <TableCell>{payout.method}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={payout.accountDetails}>
                          {payout.accountDetails}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(payout.status)}
                          {payout.adminNote && (
                            <p className="text-xs text-muted-foreground mt-1 truncate max-w-[150px]" title={payout.adminNote}>
                              {payout.adminNote}
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-12 text-center border rounded-lg bg-muted/20">
                <p className="text-muted-foreground">
                  {isBn ? 'কোন পেআউট ইতিহাস নেই' : 'No payout history found'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
