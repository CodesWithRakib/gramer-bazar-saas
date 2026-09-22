'use client';

import { useGetMyWalletQuery, useGetMyTransactionsQuery } from '@/features/wallets/walletsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Wallet, ArrowUpRight,  Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function SellerWalletPage({ params }: { params: { lang: string } }) {
  const { data: wallet, isLoading: isWalletLoading } = useGetMyWalletQuery();
  const { data: transactions, isLoading: isTxLoading } = useGetMyTransactionsQuery();
  const isBn = params.lang === 'bn';

  if (isWalletLoading) {
    return <div className="p-8 text-center">{isBn ? 'লোড হচ্ছে...' : 'Loading...'}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{isBn ? 'আমার ওয়ালেট' : 'My Wallet'}</h1>
          <p className="text-muted-foreground">
            {isBn ? 'আপনার আয় এবং লেনদেন পরিচালনা করুন' : 'Manage your earnings and transactions'}
          </p>
        </div>
        <Button asChild className="gap-2">
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

      <Card>
        <CardHeader>
          <CardTitle>{isBn ? 'সাম্প্রতিক লেনদেন' : 'Recent Transactions'}</CardTitle>
        </CardHeader>
        <CardContent>
          {isTxLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              {isBn ? 'লোড হচ্ছে...' : 'Loading...'}
            </div>
          ) : transactions && transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isBn ? 'তারিখ' : 'Date'}</TableHead>
                  <TableHead>{isBn ? 'বিবরণ' : 'Description'}</TableHead>
                  <TableHead>{isBn ? 'ধরন' : 'Type'}</TableHead>
                  <TableHead className="text-right">{isBn ? 'পরিমাণ' : 'Amount'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(tx.createdAt), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell>
                      <Badge variant={tx.type === 'CREDIT' ? 'default' : 'secondary'} className={tx.type === 'CREDIT' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600 text-white'}>
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-medium ${tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.type === 'CREDIT' ? '+' : '-'} ৳ {tx.amount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              {isBn ? 'কোন লেনদেন পাওয়া যায়নি' : 'No transactions found'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
