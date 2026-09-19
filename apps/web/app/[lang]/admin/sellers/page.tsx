'use client';

import React, { useState } from 'react';
import { useGetUsersQuery } from '@/features/users/usersApi';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Role, useUpdateUserStatusMutation } from '@/features/users/usersApi';

export default function AdminSellersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  
  const { data, isLoading } = useGetUsersQuery({ page, limit, search, role: Role.SELLER });
  const [updateStatus] = useUpdateUserStatusMutation();

  const columns: ColumnDef<any>[] = [
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
            <Badge variant={status === 'ACTIVE' ? 'default' : 'destructive'}>
              {status}
            </Badge>
            {status !== 'ACTIVE' && (
              <Button size="sm" variant="outline" onClick={() => updateStatus({ id: user.id, status: 'ACTIVE' })}>
                Approve
              </Button>
            )}
            {status === 'ACTIVE' && (
              <Button size="sm" variant="destructive" onClick={() => updateStatus({ id: user.id, status: 'SUSPENDED' })}>
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Sellers</h1>
      </div>
      
      <div className="flex items-center space-x-2 max-w-sm">
        <Input 
          placeholder="Search sellers..." 
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>
      
      <DataTable 
        columns={columns} 
        data={data?.data || []}
        pageCount={data?.meta.totalPages ?? -1}
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
        isLoading={isLoading}
      />
    </div>
  );
}
