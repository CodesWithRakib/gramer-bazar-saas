'use client';

import React, { useState } from 'react';
import { useGetAllPayoutsQuery, useReviewPayoutMutation, PayoutRequest } from '@/features/payouts/payoutsApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function AdminPayoutsPage() {
  const { data: payouts, isLoading } = useGetAllPayoutsQuery();
  const [reviewPayout] = useReviewPayoutMutation();

  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'APPROVED' | 'REJECTED' | null>(null);

  const openReviewModal = (payout: PayoutRequest, action: 'APPROVED' | 'REJECTED') => {
    setSelectedPayout(payout);
    setActionType(action);
    setAdminNote('');
    setIsModalOpen(true);
  };

  const submitReview = async () => {
    if (!selectedPayout || !actionType) return;
    
    try {
      await reviewPayout({
        id: selectedPayout.id,
        data: {
          status: actionType,
          adminNote: adminNote || undefined,
        }
      }).unwrap();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to review payout', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Payout Requests</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendor Withdrawals</CardTitle>
          <CardDescription>Review and process vendor payout requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Seller ID</TableHead>
                <TableHead>Method & Details</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading payout requests...
                  </TableCell>
                </TableRow>
              ) : !payouts || payouts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No payout requests found.
                  </TableCell>
                </TableRow>
              ) : (
                payouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(payout.createdAt), 'PP p')}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-xs">{payout.sellerId.substring(0, 8)}...</span>
                      {/* Would display seller name if included in relations */}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <Badge variant="outline" className="w-fit mb-1">{payout.method}</Badge>
                        <span className="text-xs text-muted-foreground max-w-[200px] truncate" title={payout.accountDetails}>
                          {payout.accountDetails}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      ৳{Number(payout.amount).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant={payout.status === 'APPROVED' ? 'default' : payout.status === 'REJECTED' ? 'destructive' : 'secondary'}
                      >
                        {payout.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {payout.status === 'PENDING' ? (
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-green-500 text-green-600 hover:bg-green-50"
                            onClick={() => openReviewModal(payout, 'APPROVED')}
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-red-500 text-red-600 hover:bg-red-50"
                            onClick={() => openReviewModal(payout, 'REJECTED')}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'APPROVED' ? 'Approve Payout' : 'Reject Payout'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted p-4 rounded-md text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-bold">৳{Number(selectedPayout?.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method:</span>
                <span className="font-medium">{selectedPayout?.method}</span>
              </div>
              <div className="pt-2 border-t mt-2">
                <span className="text-muted-foreground block mb-1">Account Details:</span>
                <span className="font-mono whitespace-pre-wrap">{selectedPayout?.accountDetails}</span>
              </div>
            </div>

            {actionType === 'APPROVED' && (
              <p className="text-sm text-muted-foreground">
                By approving this payout, you confirm that the funds have been successfully transferred to the vendor's account via the method above. This will permanently deduct the funds from their wallet balance.
              </p>
            )}

            {actionType === 'REJECTED' && (
              <p className="text-sm text-red-500">
                Rejecting this payout will return the funds to the vendor's available wallet balance.
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="adminNote">Admin Note (Optional)</Label>
              <Textarea 
                id="adminNote" 
                placeholder={actionType === 'REJECTED' ? "Reason for rejection..." : "Transaction ID / Reference..."}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button 
              variant={actionType === 'APPROVED' ? 'default' : 'destructive'} 
              onClick={submitReview}
            >
              Confirm {actionType === 'APPROVED' ? 'Approval' : 'Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
