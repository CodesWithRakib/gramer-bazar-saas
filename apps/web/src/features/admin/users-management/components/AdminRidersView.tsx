'use client';

import React, { useState } from 'react';
import { useGetUsersQuery, User } from '@/features/users/usersApi';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Role } from '@/features/users/usersApi';
import { BackButton } from '@/components/common/BackButton';

export interface AdminRidersViewProps {
  lang?: string;
  namespace?: 'admin' | 'super-admin';
}

export function AdminRidersView({ lang = 'en', namespace = 'admin' }: AdminRidersViewProps) {
  const basePath = namespace === 'super-admin' ? 'super-admin' : 'admin';
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch } = useGetUsersQuery({
    page,
    limit,
    search,
    role: Role.RIDER,
  });

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'firstName',
      header: 'First Name',
    },
    {
      accessorKey: 'lastName',
      header: 'Last Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return <Badge variant={status === 'ACTIVE' ? 'default' : 'destructive'}>{status}</Badge>;
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Registered',
      cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString(),
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {lang === 'bn' ? 'ডেলিভারি রাইডার বহর' : 'Delivery Riders'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {lang === 'bn'
                ? 'সক্রিয় ডেলিভারি কর্মী, অঞ্চল জোন এবং স্থিতি পর্যবেক্ষণ করুন।'
                : 'Monitor active delivery personnel, vehicle allocations, and rider statuses.'}
            </p>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        pageCount={data?.meta.totalPages ?? -1}
        totalCount={data?.meta?.total}
        itemLabel={{ singular: 'rider', plural: 'riders' }}
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
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Search riders by name, phone, or email..."
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
      />
    </div>
  );
}
