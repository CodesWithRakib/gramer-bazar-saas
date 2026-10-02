'use client';

import React, { useState } from 'react';
import { useGetAnnouncementsQuery, useSendAnnouncementMutation } from '../announcementsApi';
import { Announcement, AnnouncementStatus } from '../types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Megaphone, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast/toast-store';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { useParams } from 'next/navigation';
import { BackButton } from '@/components/common/BackButton';

export function AnnouncementsHistoryView() {
  const params = useParams();
  const isBn = params.lang === 'bn';

  const { data: announcements, isLoading, isError, refetch } = useGetAnnouncementsQuery();
  const [sendAnnouncement] = useSendAnnouncementMutation();
  const [search, setSearch] = useState('');

  const getStatusBadge = (status: AnnouncementStatus) => {
    switch (status) {
      case AnnouncementStatus.SENT:
        return <Badge className="bg-green-100 text-green-800">{isBn ? 'প্রেরিত' : 'Sent'}</Badge>;
      case AnnouncementStatus.DRAFT:
        return <Badge variant="secondary">{isBn ? 'খসড়া' : 'Draft'}</Badge>;
      case AnnouncementStatus.SCHEDULED:
        return <Badge className="bg-blue-100 text-blue-800">{isBn ? 'নির্ধারিত' : 'Scheduled'}</Badge>;
      case AnnouncementStatus.PROCESSING:
        return <Badge className="bg-yellow-100 text-yellow-800">{isBn ? 'প্রক্রিয়াকরণ' : 'Processing'}</Badge>;
      case AnnouncementStatus.FAILED:
        return <Badge variant="destructive">{isBn ? 'ব্যর্থ' : 'Failed'}</Badge>;
      case AnnouncementStatus.CANCELLED:
        return <Badge variant="outline">{isBn ? 'বাতিল' : 'Cancelled'}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const columns: ColumnDef<Announcement>[] = [
    {
      accessorKey: 'title',
      header: isBn ? 'শিরোনাম' : 'Title',
      cell: ({ row }) => {
        const titleBn = row.original.titleBn;
        const titleEn = row.original.title;
        return <span className="font-medium">{isBn && titleBn ? titleBn : titleEn}</span>;
      },
    },
    {
      accessorKey: 'audienceType',
      header: isBn ? 'শ্রোতা' : 'Audience',
      cell: ({ row }) => {
        const type = row.getValue('audienceType') as string;
        if (isBn && type === 'EVERYONE') return <span>সবাই</span>;
        if (isBn && type === 'ROLE') return <span>নির্দিষ্ট রোল</span>;
        if (isBn && type === 'MULTIPLE_ROLES') return <span>একাধিক রোল</span>;
        if (isBn && type === 'SELECTED_USERS') return <span>নির্বাচিত ব্যবহারকারী</span>;
        return <span className="capitalize">{type.replace('_', ' ').toLowerCase()}</span>;
      },
    },
    {
      accessorKey: 'status',
      header: isBn ? 'অবস্থা' : 'Status',
      cell: ({ row }) => getStatusBadge(row.getValue('status')),
    },
    {
      accessorKey: 'totalRecipients',
      header: isBn ? 'প্রাপক' : 'Recipients',
      cell: ({ row }) => row.getValue('totalRecipients') || 0,
    },
    {
      accessorKey: 'createdAt',
      header: isBn ? 'তৈরির তারিখ' : 'Created At',
      cell: ({ row }) => format(new Date(row.getValue('createdAt')), 'dd MMM yyyy, h:mm a'),
    },
    {
      id: 'actions',
      header: isBn ? 'অ্যাকশন' : 'Actions',
      cell: ({ row }) => {
        const announcement = row.original;
        
        if (announcement.status === AnnouncementStatus.DRAFT) {
          return (
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8"
              onClick={async () => {
                try {
                  await sendAnnouncement(announcement.id).unwrap();
                  toast.success(isBn ? 'ঘোষণা সফলভাবে পাঠানো হয়েছে!' : 'Announcement sent successfully!');
                } catch (error) {
                  toast.error(isBn ? 'ঘোষণা পাঠাতে ব্যর্থ হয়েছে' : 'Failed to send announcement');
                }
              }}
            >
              <Send className="h-4 w-4 mr-2" />
              {isBn ? 'এখন পাঠান' : 'Send Now'}
            </Button>
          );
        }
        
        return null;
      },
    }
  ];

  // Client-side filtering if search is used
  const filteredData = announcements?.filter(a => {
    const searchString = search.toLowerCase();
    const titleMatch = a.title.toLowerCase().includes(searchString);
    const titleBnMatch = a.titleBn?.toLowerCase().includes(searchString);
    return titleMatch || titleBnMatch;
  }) || [];

  return (
    <div className="space-y-6">
      <div>
        <BackButton
          href={`/${params.lang || 'en'}/super-admin/communication`}
          label="Back to Communication Hub"
          labelBn="কমিউনিকেশন হাবে ফিরে যান"
          lang={params.lang as string}
        />
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Megaphone className="h-6 w-6 text-primary" />
              {isBn ? 'ঘোষণার ইতিহাস' : 'Announcement History'}
            </h2>
            <p className="text-muted-foreground">
              {isBn 
                ? 'অতীতের ঘোষণা এবং তাদের ডেলিভারি পরিসংখ্যান দেখুন।' 
                : 'View past announcements and their delivery statistics.'}
            </p>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        pageCount={1}
        pagination={{ pageIndex: 0, pageSize: filteredData.length || 10 }}
        onPaginationChange={() => {}}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={isBn ? 'ঘোষণা খুঁজুন...' : 'Search announcements...'}
        totalItems={filteredData.length}
        itemLabel={{ 
          singular: isBn ? 'ঘোষণা' : 'announcement', 
          plural: isBn ? 'ঘোষণাগুলি' : 'announcements' 
        }}
        lang={isBn ? 'bn' : 'en'}
      />
    </div>
  );
}
