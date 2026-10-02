'use client';

import React, { useState } from 'react';
import { useGetUsersQuery, User } from '@/features/users/usersApi';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Role, useUpdateUserStatusMutation } from '@/features/users/usersApi';
import { BackButton } from '@/components/common/BackButton';

export interface AdminSellersViewProps {
  lang?: string;
  namespace?: 'admin' | 'super-admin';
}

export function AdminSellersView({ lang = 'en', namespace = 'admin' }: AdminSellersViewProps) {
  const basePath = namespace === 'super-admin' ? 'super-admin' : 'admin';
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch } = useGetUsersQuery({
    page,
    limit,
    search,
    role: Role.SELLER,
  });
  const [updateStatus] = useUpdateUserStatusMutation();

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
        const user = row.original;

        return (
          <div className="flex items-center space-x-2">
            <Badge variant={status === 'ACTIVE' ? 'default' : 'destructive'}>{status}</Badge>
            {status !== 'ACTIVE' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateStatus({ id: user.id, status: 'ACTIVE' })}
              >
                Approve
              </Button>
            )}
            {status === 'ACTIVE' && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => updateStatus({ id: user.id, status: 'SUSPENDED' })}
              >
                Suspend
              </Button>
            )}
          </div>
        );
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
              {lang === 'bn' ? 'সেলার ও দোকানসমূহ' : 'Sellers & Stores'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {lang === 'bn'
                ? 'অনুমোদিত মার্চেন্ট অ্যাকাউন্ট ও স্টোর ফ্রন্ট পরিচালনা করুন।'
                : 'Oversee verified merchant stores, inspect status, and manage partner accounts.'}
            </p>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        pageCount={data?.meta.totalPages ?? -1}
        totalCount={data?.meta?.total}
        itemLabel={{ singular: 'seller', plural: 'sellers' }}
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
        searchPlaceholder="Search sellers by name, email, or store..."
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
      />
    </div>
  );
}
