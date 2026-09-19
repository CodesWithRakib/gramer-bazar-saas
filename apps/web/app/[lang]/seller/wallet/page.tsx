'use client';

import React from 'react';
import { useGetMyWalletQuery, useGetMyTransactionsQuery } from '@/features/wallets/walletsApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import Link from 'next/link';

export default function SellerWalletDashboard() {
  const { data: wallet, isLoading: isLoadingWallet } = useGetMyWalletQuery();
  const { data: transactions, isLoading: isLoadingTx } = useGetMyTransactionsQuery();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">My Wallet</h1>
        <Link href="./wallet/payout">
          <Button size="lg" className="font-semibold shadow-md">
            Request Payout
          </Button>
        </Link>
      </div>

      {isLoadingWallet ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-muted/50 rounded-t-lg" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">৳{Number(wallet?.balance || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Ready to withdraw</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Clearance</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{Number(wallet?.pendingClearance || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Requested, awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
              <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{Number(wallet?.totalEarned || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">All-time earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{Number(wallet?.totalWithdrawn || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Successfully paid out</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Ledger History</CardTitle>
          <CardDescription>Recent transactions affecting your wallet balance.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingTx ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Loading ledger...
                  </TableCell>
                </TableRow>
              ) : !transactions || transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No transactions yet. Complete some orders to see your earnings!
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(tx.createdAt), 'PP p')}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{tx.description}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {tx.referenceId || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {tx.type === 'CREDIT' ? (
                        <span className="text-emerald-600 font-semibold flex items-center justify-end gap-1">
                          + ৳{Number(tx.amount).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-red-600 font-semibold flex items-center justify-end gap-1">
                          - ৳{Number(tx.amount).toLocaleString()}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
