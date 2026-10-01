'use client';

import React, { useState } from 'react';
import { useGetAnnouncementsQuery } from '../announcementsApi';
import { Announcement, AnnouncementStatus } from '../types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Megaphone } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

export function AnnouncementsHistoryView() {
  const { data: announcements, isLoading, isError, refetch } = useGetAnnouncementsQuery();
  const [search, setSearch] = useState('');

  const getStatusBadge = (status: AnnouncementStatus) => {
    switch (status) {
      case AnnouncementStatus.SENT:
        return <Badge className="bg-green-100 text-green-800">Sent</Badge>;
      case AnnouncementStatus.DRAFT:
        return <Badge variant="secondary">Draft</Badge>;
      case AnnouncementStatus.SCHEDULED:
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case AnnouncementStatus.PROCESSING:
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>;
      case AnnouncementStatus.FAILED:
        return <Badge variant="destructive">Failed</Badge>;
      case AnnouncementStatus.CANCELLED:
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const columns: ColumnDef<Announcement>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => <span className="font-medium">{row.getValue('title')}</span>,
    },
    {
      accessorKey: 'audienceType',
      header: 'Audience',
      cell: ({ row }) => {
        const type = row.getValue('audienceType') as string;
        return <span className="capitalize">{type.replace('_', ' ').toLowerCase()}</span>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.getValue('status')),
    },
    {
      accessorKey: 'totalRecipients',
      header: 'Recipients',
      cell: ({ row }) => row.getValue('totalRecipients') || 0,
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => format(new Date(row.getValue('createdAt')), 'dd MMM yyyy, h:mm a'),
    },
  ];

  // Client-side filtering if search is used
  const filteredData = announcements?.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-primary" />
            Announcement History
          </h2>
          <p className="text-muted-foreground">
            View past announcements and their delivery statistics.
          </p>
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
        searchPlaceholder="Search announcements..."
        totalItems={filteredData.length}
        itemLabel={{ singular: 'announcement', plural: 'announcements' }}
      />
    </div>
  );
}
