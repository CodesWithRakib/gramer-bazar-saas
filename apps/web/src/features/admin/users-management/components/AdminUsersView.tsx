'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { useGetUsersQuery, User, useUpdateUserStatusMutation } from '@/features/users/usersApi';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCog } from 'lucide-react';
import { RootState } from '@/store/store';
import { userIsSuperAdmin } from '@/lib/roles';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserRoleDialog } from './UserRoleDialog';
import { AdminCreateUserDialog } from './AdminCreateUserDialog';
import { ImpersonateUserDialog } from './ImpersonateUserDialog';
import { isImpersonatable } from '@/features/users/impersonationEligibility';
import { BackButton } from '@/components/common/BackButton';

export interface AdminUsersViewProps {
  lang?: string;
  namespace?: 'admin' | 'super-admin';
}

export function AdminUsersView({ lang = 'en', namespace = 'admin' }: AdminUsersViewProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [editingRolesUser, setEditingRolesUser] = useState<User | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [impersonateTarget, setImpersonateTarget] = useState<User | null>(null);

  const { data, isLoading, isError, refetch } = useGetUsersQuery({ page, limit, search });
  const [updateStatus] = useUpdateUserStatusMutation();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const isSuperAdmin = namespace === 'super-admin' || userIsSuperAdmin(currentUser);
  const basePath = namespace === 'super-admin' ? 'super-admin' : 'admin';
  const viewLabel = lang === 'bn' ? 'দেখুন' : 'View';

  const filteredUsers = React.useMemo(() => {
    let list = data?.data || [];
    if (roleFilter !== 'ALL') {
      list = list.filter((user) => user.roles?.some((r) => r.name === roleFilter));
    }
    return list;
  }, [data?.data, roleFilter]);

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
        return <Badge variant={status === 'ACTIVE' ? 'default' : 'destructive'}>{status}</Badge>;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const user = row.original;
        const isActive = user.status === 'ACTIVE';

        return (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/${lang}/${basePath}/users-management/users/${user.id}`}>
                {viewLabel}
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setEditingRolesUser(user)}>
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
            {userIsSuperAdmin(currentUser) && isImpersonatable(user, currentUser?.id) && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setImpersonateTarget(user)}
                aria-label={`Impersonate ${user.firstName ?? user.phone}`}
              >
                <UserCog className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
                {lang === 'bn' ? 'প্রবেশ' : 'Impersonate'}
              </Button>
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
        </div>
      </div>

      <DataTable<User, unknown>
        columns={columns}
        data={filteredUsers}
        pageCount={data?.meta?.totalPages ?? -1}
        totalCount={data?.meta?.total}
        itemLabel={{ singular: 'user', plural: 'users' }}
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
        searchPlaceholder="Search by name, phone or email..."
        filterSlot={
          <div className="w-full sm:w-44">
            <Select
              value={roleFilter}
              onValueChange={(val) => {
                setRoleFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="!h-11 w-full rounded-full border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-0 focus:ring-offset-0 dark:border-border dark:bg-card dark:text-foreground">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
                <SelectItem value="SELLER">Seller</SelectItem>
                <SelectItem value="RIDER">Rider</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
        actionSlot={
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="!h-11 rounded-full px-6 font-medium shadow-xs"
          >
            <UserPlus className="me-2 h-4 w-4" />
            Create User
          </Button>
        }
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

      {impersonateTarget && (
        <ImpersonateUserDialog
          user={impersonateTarget}
          open={!!impersonateTarget}
          onOpenChange={(open) => !open && setImpersonateTarget(null)}
          lang={lang}
        />
      )}
    </div>
  );
}
