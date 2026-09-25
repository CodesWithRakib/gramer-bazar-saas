'use client';

import React, { useState, use } from 'react';
import {
  useGetAdminSellerApplicationsQuery,
  useApproveSellerApplicationMutation,
  useRejectSellerApplicationMutation,
  SellerApplication,
  ApplicationStatus,
} from '@/features/applications/applicationsApi';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Eye, Store, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSellerApplicationsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const isBn = lang === 'bn';

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'ALL'>('ALL');

  const [selectedApp, setSelectedApp] = useState<SellerApplication | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const { data, isLoading, isError, refetch } = useGetAdminSellerApplicationsQuery({
    page,
    limit,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  });

  const [approveApp, { isLoading: isApproving }] = useApproveSellerApplicationMutation();
  const [rejectApp, { isLoading: isRejecting }] = useRejectSellerApplicationMutation();

  const handleReviewSubmit = async () => {
    if (!selectedApp || !reviewAction) return;

    try {
      if (reviewAction === 'approve') {
        await approveApp({ id: selectedApp.id, adminNotes }).unwrap();
        toast.success(isBn ? 'সেলার আবেদন অনুমোদিত হয়েছে' : 'Seller application approved successfully');
      } else {
        await rejectApp({ id: selectedApp.id, adminNotes }).unwrap();
        toast.success(isBn ? 'সেলার আবেদন বাতিল করা হয়েছে' : 'Seller application rejected');
      }
      setReviewAction(null);
      setSelectedApp(null);
      setAdminNotes('');
      refetch();
    } catch {
      toast.error(isBn ? 'অপারেশন ব্যর্থ হয়েছে' : 'Failed to process application');
    }
  };

  const columns: ColumnDef<SellerApplication>[] = [
    {
      accessorKey: 'shopNameEn',
      header: isBn ? 'দোকানের নাম' : 'Shop Name',
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-foreground">{row.original.shopNameEn}</div>
          <div className="text-xs text-muted-foreground">{row.original.shopNameBn}</div>
        </div>
      ),
    },
    {
      accessorKey: 'user',
      header: isBn ? 'আবেদনকারী' : 'Applicant',
      cell: ({ row }) => {
        const u = row.original.user;
        return (
          <div>
            <div className="text-sm font-medium">{u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : 'N/A'}</div>
            <div className="text-xs text-muted-foreground">{row.original.phone}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'tradeLicenseNumber',
      header: isBn ? 'ট্রেড লাইসেন্স' : 'Trade License',
      cell: ({ row }) => row.original.tradeLicenseNumber || '—',
    },
    {
      accessorKey: 'status',
      header: isBn ? 'স্ট্যাটাস' : 'Status',
      cell: ({ row }) => {
        const s = row.original.status;
        if (s === 'APPROVED') {
          return (
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1 font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              {isBn ? 'অনুমোদিত' : 'Approved'}
            </Badge>
          );
        }
        if (s === 'REJECTED') {
          return (
            <Badge variant="destructive" className="gap-1 font-semibold">
              <XCircle className="w-3 h-3" />
              {isBn ? 'বাতিল' : 'Rejected'}
            </Badge>
          );
        }
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 gap-1 font-semibold">
            <Clock className="w-3 h-3" />
            {isBn ? 'অপেক্ষমাণ' : 'Pending'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: isBn ? 'আবেদনের তারিখ' : 'Submitted',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: 'actions',
      header: isBn ? 'অ্যাকশন' : 'Actions',
      cell: ({ row }) => {
        const app = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg"
              onClick={() => setSelectedApp(app)}
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              {isBn ? 'বিস্তারিত' : 'View'}
            </Button>
            {app.status === 'PENDING' && (
              <>
                <Button
                  size="sm"
                  className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                  onClick={() => {
                    setSelectedApp(app);
                    setReviewAction('approve');
                    setAdminNotes('');
                  }}
                >
                  {isBn ? 'অনুমোদন' : 'Approve'}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 rounded-lg"
                  onClick={() => {
                    setSelectedApp(app);
                    setReviewAction('reject');
                    setAdminNotes('');
                  }}
                >
                  {isBn ? 'বাতিল' : 'Reject'}
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {isBn ? 'সেলার আবেদনসমূহ' : 'Seller Partner Applications'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isBn
              ? 'দোকানদার পার্টনারদের আবেদন যাচাই করে অনুমোদন বা বাতিল করুন।'
              : 'Review and approve merchant applications to grant seller portal access.'}
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        pageCount={data?.meta?.totalPages ?? -1}
        totalCount={data?.meta?.total}
        itemLabel={{
          singular: isBn ? 'আবেদন' : 'application',
          plural: isBn ? 'আবেদন' : 'applications',
        }}
        isBn={isBn}
        pagination={{ pageIndex: page - 1, pageSize: limit }}
        onPaginationChange={(updater) => {
          if (typeof updater === 'function') {
            const newState = updater({ pageIndex: page - 1, pageSize: limit });
            setPage(newState.pageIndex + 1);
            setLimit(newState.pageSize);
          } else {
            setPage(updater.pageIndex + 1);
            setLimit(updater.pageSize);
          }
        }}
        filterSlot={
          <div className="w-full sm:w-48">
            <Select
              value={statusFilter}
              onValueChange={(val: ApplicationStatus | 'ALL') => {
                setStatusFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="!h-11 w-full rounded-full border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-0 focus:ring-offset-0 dark:border-border dark:bg-card dark:text-foreground">
                <SelectValue placeholder={isBn ? 'সকল আবেদন' : 'All Applications'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{isBn ? 'সকল আবেদন' : 'All Applications'}</SelectItem>
                <SelectItem value="PENDING">{isBn ? 'অপেক্ষমাণ' : 'Pending'}</SelectItem>
                <SelectItem value="APPROVED">{isBn ? 'অনুমোদিত' : 'Approved'}</SelectItem>
                <SelectItem value="REJECTED">{isBn ? 'বাতিল' : 'Rejected'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
      />

      {/* Details Dialog */}
      <Dialog
        open={!!selectedApp && !reviewAction}
        onOpenChange={(open) => !open && setSelectedApp(null)}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Store className="w-5 h-5 text-primary" />
              {selectedApp?.shopNameEn} ({selectedApp?.shopNameBn})
            </DialogTitle>
            <DialogDescription>
              {isBn ? 'সেলার আবেদনের বিস্তারিত বিবরণ' : 'Detailed merchant application information'}
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-4 py-2 text-sm">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/40 border">
                <div>
                  <span className="text-muted-foreground text-xs block font-medium">
                    {isBn ? 'আবেদনকারী' : 'Applicant'}
                  </span>
                  <span className="font-semibold">
                    {selectedApp.user?.firstName} {selectedApp.user?.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs block font-medium">
                    {isBn ? 'মোবাইল নম্বর' : 'Phone'}
                  </span>
                  <span className="font-semibold">{selectedApp.phone}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs block font-medium">
                    {isBn ? 'ইমেইল' : 'Email'}
                  </span>
                  <span>{selectedApp.email || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs block font-medium">
                    {isBn ? 'শপ স্ল্যাগ' : 'Shop Slug'}
                  </span>
                  <span className="font-mono text-xs">{selectedApp.shopSlug}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs block font-medium">
                    {isBn ? 'ট্রেড লাইসেন্স' : 'Trade License'}
                  </span>
                  <span className="font-mono">{selectedApp.tradeLicenseNumber || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs block font-medium">
                    {isBn ? 'এনআইডি নম্বর' : 'National ID'}
                  </span>
                  <span className="font-mono">{selectedApp.nidNumber || '—'}</span>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground text-xs block font-medium mb-1">
                  {isBn ? 'দোকানের ঠিকানা' : 'Shop Address'}
                </span>
                <p className="p-3 rounded-xl bg-muted/20 border text-foreground">
                  {selectedApp.address || (isBn ? 'দেওয়া হয়নি' : 'Not provided')}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground text-xs block font-medium mb-1">
                  {isBn ? 'দোকানের বিবরণ' : 'Description'}
                </span>
                <p className="p-3 rounded-xl bg-muted/20 border text-foreground">
                  {selectedApp.description || (isBn ? 'দেওয়া হয়নি' : 'Not provided')}
                </p>
              </div>

              {selectedApp.adminNotes && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200">
                  <span className="text-xs font-semibold block mb-0.5">
                    {isBn ? 'অ্যাডমিন নোট / কারণ:' : 'Admin Review Notes:'}
                  </span>
                  <p>{selectedApp.adminNotes}</p>
                </div>
              )}

              {selectedApp.status === 'PENDING' && (
                <div className="pt-4 flex gap-3 justify-end border-t">
                  <Button
                    variant="outline"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => setReviewAction('reject')}
                  >
                    {isBn ? 'আবেদন বাতিল করুন' : 'Reject Application'}
                  </Button>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => setReviewAction('approve')}
                  >
                    {isBn ? 'আবেদন অনুমোদন করুন' : 'Approve Application'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Action Confirmation Dialog */}
      <Dialog
        open={!!reviewAction}
        onOpenChange={(open) => !open && setReviewAction(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve'
                ? isBn
                  ? 'সেলার আবেদন অনুমোদন'
                  : 'Approve Seller Application'
                : isBn
                ? 'সেলার আবেদন বাতিল'
                : 'Reject Seller Application'}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve'
                ? isBn
                  ? 'অনুমোদন করলে ব্যবহারকারী সেলার ভূমিকা পাবেন এবং তার শপ অ্যাক্টিভ হবে।'
                  : 'Approving will grant the SELLER role to the user and provision their store.'
                : isBn
                ? 'বাতিল করার কারণ উল্লেখ করুন যাতে আবেদনকারী সংশোধন করতে পারেন।'
                : 'Please state the reason for rejecting this application.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="adminNotes">
                {reviewAction === 'approve'
                  ? isBn
                    ? 'মন্তব্য (ঐচ্ছিক)'
                    : 'Notes (Optional)'
                  : isBn
                  ? 'বাতিলের কারণ'
                  : 'Rejection Reason'}
              </Label>
              <Textarea
                id="adminNotes"
                placeholder={
                  reviewAction === 'approve'
                    ? 'Verified shop credentials.'
                    : 'Invalid trade license document.'
                }
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="rounded-xl min-h-[100px]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setReviewAction(null)}
                disabled={isApproving || isRejecting}
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button
                variant={reviewAction === 'approve' ? 'default' : 'destructive'}
                onClick={handleReviewSubmit}
                disabled={isApproving || isRejecting}
                className={reviewAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
              >
                {isApproving || isRejecting
                  ? isBn
                    ? 'প্রক্রিয়াকরণ হচ্ছে...'
                    : 'Processing...'
                  : reviewAction === 'approve'
                  ? isBn
                    ? 'অনুমোদন নিশ্চিত করুন'
                    : 'Confirm Approval'
                  : isBn
                  ? 'বাতিল নিশ্চিত করুন'
                  : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
