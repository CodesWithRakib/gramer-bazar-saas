'use client';

import React, { useState } from 'react';
import { useGetUsersQuery, User, useUpdateUserStatusMutation } from '@/features/users/usersApi';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { UserRoleDialog } from '../../../app/[lang]/(admin)/admin/users/UserRoleDialog';
import { AdminCreateUserDialog } from '../../../app/[lang]/(admin)/admin/users/AdminCreateUserDialog';

interface AdminUsersViewProps {
  namespace: 'admin' | 'super-admin';
}

export function AdminUsersView({ namespace }: AdminUsersViewProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [editingRolesUser, setEditingRolesUser] = useState<User | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useGetUsersQuery({ page, limit, search });
  const [updateStatus] = useUpdateUserStatusMutation();

  const isSuperAdmin = namespace === 'super-admin';

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
      accessorKey: 'roles',
      header: 'Roles',
      cell: ({ row }) => {
        const roles = row.getValue('roles') as { id: string; name: string }[] | undefined;
        return (
          <div className="flex gap-1 flex-wrap">
            {roles?.map((r) => (
              <Badge key={r.id || r.name} variant="secondary">
                {r.name}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge variant={status === 'ACTIVE' ? 'default' : 'destructive'}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const user = row.original;
        const isActive = user.status === 'ACTIVE';

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingRolesUser(user)}
            >
              Roles
            </Button>
            <Button
              variant={isActive ? 'destructive' : 'default'}
              size="sm"
              onClick={async () => {
                await updateStatus({
                  id: user.id,
                  status: isActive ? 'SUSPENDED' : 'ACTIVE',
                });
                refetch();
              }}
            >
              {isActive ? 'Suspend' : 'Activate'}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isSuperAdmin ? 'All Users (Governance & Operations)' : 'User Management'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isSuperAdmin
              ? 'Super Admin view of all platform users, roles, and security access levels.'
              : 'View and manage platform customer, seller, and rider accounts.'}
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      <div className="flex items-center py-2">
        <Input
          placeholder="Search by name, phone or email..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
      </div>

      <DataTable<User, unknown>
        columns={columns}
        data={data?.data || []}
        pageCount={data?.meta?.totalPages ?? -1}
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
        isError={isError}
        onRetry={() => refetch()}
      />

      {editingRolesUser && (
        <UserRoleDialog
          user={editingRolesUser}
          open={!!editingRolesUser}
          onOpenChange={(open) => !open && setEditingRolesUser(null)}
        />
      )}

      <AdminCreateUserDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  );
}
