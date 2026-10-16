'use client';

import React, { useState, use } from 'react';
import {
  useGetAdminSellerApplicationsQuery,
  useApproveSellerApplicationMutation,
  useRejectSellerApplicationMutation,
  useGetPartnerInquiriesQuery,
  useUpdatePartnerInquiryStatusMutation,
  SellerApplication,
  PartnerInquiry,
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  CheckCircle2,
  XCircle,
  Eye,
  Store,
  Clock,
  Handshake,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
} from 'lucide-react';
import { customToast as toast } from '@/components/ui/custom-toast';
import { BackButton } from '@/components/common/BackButton';
import { formatDate } from '@/lib/format';

export interface AdminSellerApplicationsViewProps {
  lang?: string;
  namespace?: 'admin' | 'super-admin';
}

export function AdminSellerApplicationsView({
  lang = 'en',
  namespace = 'admin',
}: AdminSellerApplicationsViewProps) {
  const isBn = lang === 'bn';
  const basePath = namespace === 'super-admin' ? 'super-admin' : 'admin';

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

  const [mainTab, setMainTab] = useState<'sellers' | 'inquiries'>('sellers');

  // Partner Inquiries Query & Mutation
  const {
    data: partnerInquiries = [],
    isLoading: isInquiriesLoading,
    refetch: refetchInquiries,
  } = useGetPartnerInquiriesQuery();
  const [updateInquiryStatus, { isLoading: isUpdatingInquiry }] =
    useUpdatePartnerInquiryStatusMutation();

  const [selectedInquiry, setSelectedInquiry] = useState<PartnerInquiry | null>(null);
  const [inquiryStatus, setInquiryStatus] = useState<
    'PENDING' | 'CONTACTED' | 'ACCEPTED' | 'REJECTED'
  >('CONTACTED');
  const [inquiryNotes, setInquiryNotes] = useState('');

  const handleUpdateInquiry = async () => {
    if (!selectedInquiry) return;
    try {
      await updateInquiryStatus({
        id: selectedInquiry.id,
        status: inquiryStatus,
        adminNotes: inquiryNotes.trim() || undefined,
      }).unwrap();
      toast.success(
        isBn ? 'ইনকোয়ারি স্ট্যাটাস আপডেট করা হয়েছে' : 'Inquiry status updated successfully'
      );
      setSelectedInquiry(null);
      refetchInquiries();
    } catch {
      toast.error(isBn ? 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে' : 'Failed to update inquiry status');
    }
  };

  const handleReviewSubmit = async () => {
    if (!selectedApp || !reviewAction) return;

    try {
      if (reviewAction === 'approve') {
        await approveApp({ id: selectedApp.id, adminNotes }).unwrap();
        toast.success(
          isBn ? 'সেলার আবেদন অনুমোদিত হয়েছে' : 'Seller application approved successfully'
        );
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
            <div className="text-sm font-medium">
              {u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : 'N/A'}
            </div>
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
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-300 gap-1 font-semibold"
          >
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
              <Eye className="w-3.5 h-3.5 me-1" />
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
      <div>
        <BackButton
          href={`/${lang}/${basePath}/users-management`}
          label="Back to Users & Partners"
          labelBn="ব্যবহারকারী হাবে ফিরে যান"
          lang={lang}
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {isBn ? 'পার্টনার ও সেলার আবেদনসমূহ' : 'Merchant & B2B Partner Applications'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isBn
                ? 'দোকানদার এবং প্রাতিষ্ঠানিক বি২বি সমবায় পার্টনারদের আবেদন পর্যালোচনা ও অনুমোদন করুন।'
                : 'Review, verify, and approve shop vendor applications and institutional enterprise inquiries.'}
            </p>
          </div>
        </div>
      </div>

      <Tabs
        value={mainTab}
        onValueChange={(val) => setMainTab(val as 'sellers' | 'inquiries')}
        className="space-y-6"
      >
        <TabsList className="bg-muted/60 p-1">
          <TabsTrigger value="sellers" className="gap-2">
            <Store className="w-4 h-4" />
            <span>{isBn ? 'সেলার আবেদনসমূহ' : 'Seller Applications'}</span>
            {data?.meta?.total !== undefined && (
              <Badge variant="secondary" className="ms-1 px-1.5 py-0 text-[10px]">
                {data.meta.total}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="inquiries" className="gap-2">
            <Handshake className="w-4 h-4" />
            <span>{isBn ? 'বি২বি ও সমবায় ইনকোয়ারি' : 'B2B & Partner Leads'}</span>
            {partnerInquiries.length > 0 && (
              <Badge variant="secondary" className="ms-1 px-1.5 py-0 text-[10px]">
                {partnerInquiries.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sellers" className="m-0 space-y-4">
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
        </TabsContent>

        <TabsContent value="inquiries" className="m-0 space-y-4">
          <Card className="border border-border/80 rounded-2xl overflow-hidden shadow-xs">
            <CardContent className="p-0">
              {isInquiriesLoading ? (
                <div className="p-8 text-center text-muted-foreground animate-pulse">
                  {isBn ? 'ইনকোয়ারি লোড হচ্ছে...' : 'Loading partner inquiries...'}
                </div>
              ) : partnerInquiries.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Handshake className="w-12 h-12 mx-auto opacity-30 mb-3" />
                  <p className="font-semibold text-foreground">
                    {isBn ? 'কোনো পার্টনারশিপ ইনকোয়ারি নেই' : 'No partner inquiries received yet'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isBn
                      ? 'পাবলিক পার্টনারশিপ ফর্ম থেকে জমা হওয়া অনুরোধ এখানে প্রদর্শিত হবে।'
                      : 'Submissions from the public partner inquiries page will appear here.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm text-start">
                    <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground text-start font-semibold">
                      <tr>
                        <th className="py-3 px-4 text-start">{isBn ? 'প্রতিষ্ঠান / সমবায়' : 'Organization'}</th>
                        <th className="py-3 px-4 text-start">{isBn ? 'যোগাযোগকারী' : 'Contact Person'}</th>
                        <th className="py-3 px-4 text-start">{isBn ? 'ধরন' : 'Partner Type'}</th>
                        <th className="py-3 px-4 text-center">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                        <th className="py-3 px-4 text-start">{isBn ? 'তারিখ' : 'Date'}</th>
                        <th className="py-3 px-4 text-end">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {partnerInquiries.map((inq) => (
                        <tr key={inq.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-foreground">{inq.organizationName}</div>
                            {inq.location && (
                              <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-primary shrink-0" />
                                <span>{inq.location}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-foreground">
                              {inq.contactPerson || 'N/A'}{' '}
                              {inq.designation && (
                                <span className="text-muted-foreground font-normal">
                                  ({inq.designation})
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-0.5">
                                <Phone className="w-3 h-3 text-muted-foreground" />
                                {inq.phone}
                              </span>
                              {inq.email && (
                                <span className="flex items-center gap-0.5">
                                  <Mail className="w-3 h-3 text-muted-foreground" />
                                  {inq.email}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="text-[11px] font-medium">
                              {inq.partnerType.replace(/_/g, ' ')}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {inq.status === 'ACCEPTED' ? (
                              <Badge className="bg-emerald-600 hover:bg-emerald-500 text-[11px]">
                                {isBn ? 'অনুমোদিত' : 'Accepted'}
                              </Badge>
                            ) : inq.status === 'CONTACTED' ? (
                              <Badge className="bg-blue-600 hover:bg-blue-500 text-[11px]">
                                {isBn ? 'যোগাযোগ সম্পন্ন' : 'Contacted'}
                              </Badge>
                            ) : inq.status === 'REJECTED' ? (
                              <Badge variant="destructive" className="text-[11px]">
                                {isBn ? 'বাতিল' : 'Rejected'}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[11px]">
                                {isBn ? 'অপেক্ষমাণ' : 'Pending'}
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground text-[11px]">
                            {formatDate(inq.createdAt, lang)}
                          </td>
                          <td className="py-3 px-4 text-end">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1.5 text-xs"
                              onClick={() => {
                                setSelectedInquiry(inq);
                                setInquiryStatus(inq.status);
                                setInquiryNotes(inq.adminNotes || '');
                              }}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{isBn ? 'বিবরণ ও রিভিউ' : 'Review'}</span>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
      <Dialog open={!!reviewAction} onOpenChange={(open) => !open && setReviewAction(null)}>
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
                className={
                  reviewAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
                }
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

      {/* Partner Inquiry Review Dialog */}
      <Dialog
        open={!!selectedInquiry}
        onOpenChange={(open) => !open && setSelectedInquiry(null)}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Handshake className="w-5 h-5 text-primary" />
              {selectedInquiry?.organizationName}
            </DialogTitle>
            <DialogDescription>
              {isBn
                ? 'প্রাতিষ্ঠানিক বা সমবায় পার্টনারশিপ ইনকোয়ারি বিবরণ ও অবস্থা আপডেট'
                : 'Enterprise partnership lead review, contact log, and status update'}
            </DialogDescription>
          </DialogHeader>

          {selectedInquiry && (
            <div className="space-y-4 py-2 text-sm">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/40 border">
                <div>
                  <span className="text-muted-foreground text-xs block font-medium">
                    {isBn ? 'যোগাযোগকারী ব্যক্তি' : 'Contact Person'}
                  </span>
                  <span className="font-semibold">
                    {selectedInquiry.contactPerson || 'N/A'}{' '}
                    {selectedInquiry.designation && (
                      <span className="text-xs text-muted-foreground font-normal">
                        ({selectedInquiry.designation})
                      </span>
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs block font-medium">
                    {isBn ? 'মোবাইল ও ইমেইল' : 'Phone & Email'}
                  </span>
                  <span className="font-semibold block font-mono">{selectedInquiry.phone}</span>
                  {selectedInquiry.email && (
                    <span className="text-xs text-muted-foreground block">{selectedInquiry.email}</span>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground text-xs block font-medium">
                    {isBn ? 'পার্টনারশিপের ধরন' : 'Partner Type'}
                  </span>
                  <Badge variant="outline" className="mt-1">
                    {selectedInquiry.partnerType.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs block font-medium">
                    {isBn ? 'এলাকা / অবস্থান' : 'Location'}
                  </span>
                  <span className="font-semibold">{selectedInquiry.location || 'N/A'}</span>
                </div>
              </div>

              {selectedInquiry.requirements && (
                <div className="p-4 rounded-2xl bg-muted/20 border space-y-1">
                  <span className="text-muted-foreground text-xs block font-semibold">
                    {isBn ? 'প্রয়োজনীয়তা ও চাহিদা বিবরণ' : 'Stated Procurement Requirements'}
                  </span>
                  <p className="text-xs sm:text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                    {selectedInquiry.requirements}
                  </p>
                </div>
              )}

              <div className="space-y-3 pt-2 border-t">
                <div className="space-y-1.5">
                  <Label>{isBn ? 'ইনকোয়ারি স্ট্যাটাস' : 'Review Status'}</Label>
                  <Select
                    value={inquiryStatus}
                    onValueChange={(val: any) => setInquiryStatus(val)}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">{isBn ? 'অপেক্ষমাণ' : 'Pending Review'}</SelectItem>
                      <SelectItem value="CONTACTED">{isBn ? 'যোগাযোগ সম্পন্ন' : 'Contacted Rep'}</SelectItem>
                      <SelectItem value="ACCEPTED">{isBn ? 'পার্টনারশিপ গৃহীত' : 'Accepted / Onboarding'}</SelectItem>
                      <SelectItem value="REJECTED">{isBn ? 'বাতিল' : 'Rejected'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>{isBn ? 'অ্যাডমিন মন্তব্য / যোগাযোগের বিবরণ' : 'Internal Admin Notes'}</Label>
                  <Textarea
                    placeholder={
                      isBn
                        ? 'যোগাযোগের সারসংক্ষেপ বা পরবর্তী পদক্ষেপ লিখুন...'
                        : 'Record notes from phone call, proposals sent, or next steps...'
                    }
                    value={inquiryNotes}
                    onChange={(e) => setInquiryNotes(e.target.value)}
                    className="rounded-xl min-h-[90px]"
                  />
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button variant="outline" onClick={() => setSelectedInquiry(null)}>
                  {isBn ? 'বন্ধ করুন' : 'Close'}
                </Button>
                <Button
                  onClick={handleUpdateInquiry}
                  disabled={isUpdatingInquiry}
                  className="bg-primary"
                >
                  {isUpdatingInquiry
                    ? isBn
                      ? 'সংরক্ষণ হচ্ছে...'
                      : 'Saving...'
                    : isBn
                      ? 'স্ট্যাটাস আপডেট করুন'
                      : 'Update Status'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
