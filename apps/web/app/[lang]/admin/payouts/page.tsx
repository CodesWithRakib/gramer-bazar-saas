'use client';

import { getApiErrorMessage } from '@/lib/apiError';

import { useState } from 'react';
import { useGetAllPayoutsQuery, useReviewPayoutMutation } from '@/features/payouts/payoutsApi';
import { Card, CardContent, } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AdminPayoutsPage({ params }: { params: { lang: string } }) {
  const isBn = params.lang === 'bn';
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  
  // Convert 'ALL' back to undefined for the API query
  const queryStatus = statusFilter === 'ALL' ? undefined : statusFilter;
  const { data: payouts, isLoading } = useGetAllPayoutsQuery(queryStatus);
  const [reviewPayout, { isLoading: isReviewing }] = useReviewPayoutMutation();

  const [reviewDialog, setReviewDialog] = useState<{
    isOpen: boolean;
    payoutId: string | null;
    status: 'APPROVED' | 'REJECTED';
  }>({
    isOpen: false,
    payoutId: null,
    status: 'APPROVED',
  });
  const [adminNote, setAdminNote] = useState('');

  const handleReviewClick = (id: string, status: 'APPROVED' | 'REJECTED') => {
    setReviewDialog({ isOpen: true, payoutId: id, status });
    setAdminNote('');
  };

  const submitReview = async () => {
    if (!reviewDialog.payoutId) return;

    try {
      await reviewPayout({
        id: reviewDialog.payoutId,
        data: {
          status: reviewDialog.status,
          adminNote: adminNote || undefined,
        },
      }).unwrap();

      toast.success(
        isBn
          ? `পেআউট ${reviewDialog.status === 'APPROVED' ? 'অনুমোদিত' : 'বাতিল'} হয়েছে`
          : `Payout ${reviewDialog.status.toLowerCase()} successfully`
      );
      setReviewDialog({ isOpen: false, payoutId: null, status: 'APPROVED' });
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Failed to review payout');
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isBn ? 'পেআউট অনুরোধসমূহ' : 'Payout Requests'}
          </h1>
          <p className="text-muted-foreground">
            {isBn ? 'সেলারদের পেআউট অনুরোধ পর্যালোচনা করুন' : 'Review and manage seller payout requests'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Label>{isBn ? 'ফিল্টার:' : 'Filter:'}</Label>
          <Select
            value={statusFilter}
            onValueChange={(v: string) =>
              setStatusFilter(v as typeof statusFilter)
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{isBn ? 'সব' : 'All'}</SelectItem>
              <SelectItem value="PENDING">{isBn ? 'পেন্ডিং' : 'Pending'}</SelectItem>
              <SelectItem value="APPROVED">{isBn ? 'অনুমোদিত' : 'Approved'}</SelectItem>
              <SelectItem value="REJECTED">{isBn ? 'বাতিল' : 'Rejected'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              {isBn ? 'লোড হচ্ছে...' : 'Loading...'}
            </div>
          ) : payouts && payouts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isBn ? 'সেলার' : 'Seller'}</TableHead>
                    <TableHead>{isBn ? 'পরিমাণ' : 'Amount'}</TableHead>
                    <TableHead>{isBn ? 'মাধ্যম' : 'Method'}</TableHead>
                    <TableHead>{isBn ? 'বিস্তারিত' : 'Details'}</TableHead>
                    <TableHead>{isBn ? 'তারিখ' : 'Date'}</TableHead>
                    <TableHead>{isBn ? 'অবস্থা' : 'Status'}</TableHead>
                    <TableHead className="text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>
                        <div className="font-medium">{payout.seller?.firstName} {payout.seller?.lastName}</div>
                        <div className="text-xs text-muted-foreground">{payout.seller?.email}</div>
                      </TableCell>
                      <TableCell className="font-bold text-emerald-600">
                        ৳ {payout.amount}
                      </TableCell>
                      <TableCell>{payout.method}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={payout.accountDetails}>
                        {payout.accountDetails}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(payout.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payout.status)}
                        {payout.adminNote && (
                          <p className="text-xs text-muted-foreground mt-1 truncate max-w-[150px]" title={payout.adminNote}>
                            {payout.adminNote}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {payout.status === 'PENDING' ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                              onClick={() => handleReviewClick(payout.id, 'APPROVED')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              {isBn ? 'অনুমোদন' : 'Approve'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-rose-600 border-rose-200 hover:bg-rose-50"
                              onClick={() => handleReviewClick(payout.id, 'REJECTED')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              {isBn ? 'বাতিল' : 'Reject'}
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {isBn ? 'প্রক্রিয়া সম্পন্ন' : 'Processed'}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center border-t">
              <p className="text-muted-foreground">
                {isBn ? 'কোন পেআউট অনুরোধ পাওয়া যায়নি' : 'No payout requests found'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={reviewDialog.isOpen} onOpenChange={(open) => !open && setReviewDialog(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewDialog.status === 'APPROVED' 
                ? (isBn ? 'পেআউট অনুমোদন করুন' : 'Approve Payout') 
                : (isBn ? 'পেআউট বাতিল করুন' : 'Reject Payout')}
            </DialogTitle>
            <DialogDescription>
              {reviewDialog.status === 'APPROVED'
                ? (isBn ? 'আপনি কি নিশ্চিত যে আপনি এই পেআউটটি অনুমোদন করতে চান? এটি সেলারে ব্যালেন্স থেকে কাটা হবে।' : 'Are you sure you want to approve this payout? This will deduct the amount from the seller\'s pending clearance.')
                : (isBn ? 'আপনি কি নিশ্চিত যে আপনি এই পেআউটটি বাতিল করতে চান? টাকা সেলারের ব্যালেন্সে ফেরত যাবে।' : 'Are you sure you want to reject this payout? The amount will be refunded to the seller\'s balance.')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note">{isBn ? 'অ্যাডমিন নোট (ঐচ্ছিক)' : 'Admin Note (Optional)'}</Label>
              <Input
                id="note"
                placeholder={isBn ? 'যেমন: ট্রানজেকশন আইডি বা কারণ...' : 'e.g. Transaction ID or Reason...'}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog(prev => ({ ...prev, isOpen: false }))}>
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button 
              variant={reviewDialog.status === 'APPROVED' ? 'default' : 'destructive'} 
              onClick={submitReview}
              disabled={isReviewing}
            >
              {isReviewing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {reviewDialog.status === 'APPROVED' 
                ? (isBn ? 'অনুমোদন করুন' : 'Confirm Approval') 
                : (isBn ? 'বাতিল করুন' : 'Confirm Rejection')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
