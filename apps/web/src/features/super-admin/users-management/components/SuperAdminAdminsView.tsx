'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { ColumnDef } from '@tanstack/react-table';
import {
  useGetAdminsQuery,
  useDeactivateAdminMutation,
  useResetAdminPasswordMutation,
  AdminAccount,
} from '../adminsApi';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { customToast } from '@/components/ui/custom-toast';
import { RootState } from '@/store/store';
import { userIsSuperAdmin } from '@/lib/roles';
import { UserPlus, ArrowLeft, MoreVertical, KeyRound, Shield, UserX, Loader2 } from 'lucide-react';
import { AdminPermissionsDialog } from './AdminPermissionsDialog';
import { AdminCreateDialog } from './AdminCreateDialog';
import { BackButton } from '@/components/common/BackButton';

export interface SuperAdminAdminsViewProps {
  lang?: string;
}

export function SuperAdminAdminsView({ lang = 'en' }: SuperAdminAdminsViewProps) {
  const isBn = lang === 'bn';
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const canCreateSuperAdmin = userIsSuperAdmin(currentUser);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const [permissionsAdmin, setPermissionsAdmin] = useState<AdminAccount | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<AdminAccount | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [deactivateTarget, setDeactivateTarget] = useState<AdminAccount | null>(null);

  const { data, isLoading, isError, refetch } = useGetAdminsQuery({ page, limit, search });
  const [deactivateAdmin, { isLoading: isDeactivating }] = useDeactivateAdminMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetAdminPasswordMutation();

  const handleResetPassword = async () => {
    if (!resetTarget) return;
    if (newPassword.length < 8) {
      customToast.error(isBn ? 'কমপক্ষে ৮ অক্ষর' : 'Password must be at least 8 characters');
      return;
    }
    try {
      await resetPassword({ id: resetTarget.id, newPassword }).unwrap();
      customToast.success(isBn ? 'পাসওয়ার্ড রিসেট হয়েছে' : 'Password reset successfully');
      setResetTarget(null);
      setNewPassword('');
    } catch {
      customToast.error(isBn ? 'রিসেট ব্যর্থ' : 'Could not reset password');
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    try {
      await deactivateAdmin({ id: deactivateTarget.id }).unwrap();
      customToast.success(isBn ? 'অ্যাকাউন্ট নিষ্ক্রিয় হয়েছে' : 'Account deactivated');
    } catch {
      customToast.error(isBn ? 'নিষ্ক্রিয় করা যায়নি' : 'Could not deactivate account');
    }
  };

  const columns: ColumnDef<AdminAccount>[] = [
    {
      accessorKey: 'firstName',
      header: isBn ? 'নাম' : 'Name',
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="font-medium truncate">
            {`${row.original.firstName ?? ''} ${row.original.lastName ?? ''}`.trim() || '—'}
          </p>
          <p className="text-xs text-muted-foreground truncate lg:hidden">
            {row.original.email || row.original.phone}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: isBn ? 'ইমেইল' : 'Email',
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate">{row.original.email || '—'}</p>
          <p className="text-xs text-muted-foreground">{row.original.phone}</p>
        </div>
      ),
    },
    {
      accessorKey: 'roles',
      header: isBn ? 'রোল' : 'Role',
      cell: ({ row }) => (
        <Badge
          variant={row.original.isSuperAdmin ? 'default' : 'secondary'}
          className="font-medium"
        >
          {row.original.isSuperAdmin ? 'SUPER_ADMIN' : 'ADMIN'}
        </Badge>
      ),
    },
    {
      id: 'permissions',
      header: isBn ? 'পারমিশন' : 'Permissions',
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => setPermissionsAdmin(row.original)}
        >
          <Shield className="w-3.5 h-3.5 me-1.5" />
          {row.original.isSuperAdmin
            ? isBn
              ? 'সিস্টেম'
              : 'System'
            : `${row.original.directPermissions.length} +${row.original.effectivePermissions.length}`}
        </Button>
      ),
    },
    {
      accessorKey: 'status',
      header: isBn ? 'স্ট্যাটাস' : 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'ACTIVE' ? 'default' : 'destructive'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'lastLoginAt',
      header: isBn ? 'শেষ লগইন' : 'Last login',
      cell: ({ row }) =>
        row.original.lastLoginAt ? (
          <span className="text-xs text-muted-foreground">
            {new Date(row.original.lastLoginAt).toLocaleString()}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
              <span className="sr-only">{isBn ? 'অ্যাকশন' : 'Actions'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              className="cursor-pointer text-xs gap-2"
              onClick={() => setPermissionsAdmin(row.original)}
            >
              <Shield className="w-3.5 h-3.5" />
              {isBn ? 'পারমিশন ব্যবস্থাপনা' : 'Manage permissions'}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-xs gap-2"
              onClick={() => setResetTarget(row.original)}
            >
              <KeyRound className="w-3.5 h-3.5" />
              {isBn ? 'পাসওয়ার্ড রিসেট' : 'Reset password'}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-xs gap-2 text-destructive focus:text-destructive"
              disabled={row.original.status !== 'ACTIVE' || row.original.id === currentUser?.id}
              onClick={() => setDeactivateTarget(row.original)}
            >
              <UserX className="w-3.5 h-3.5" />
              {isBn ? 'নিষ্ক্রিয় করুন' : 'Deactivate'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <BackButton
          href={`/${lang}/super-admin/users-management`}
          label="Back to Users & Staff"
          labelBn="ব্যবহারকারী হাবে ফিরে যান"
          lang={lang}
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {isBn ? 'অ্যাডমিন পরিচালনা' : 'Admin Management'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isBn
                ? 'অ্যাডমিন অ্যাকাউন্ট তৈরি করুন, পারমিশন নির্ধারণ করুন এবং অ্যাকাউন্ট নিয়ন্ত্রণ করুন।'
                : 'Create administrative accounts, assign granular permissions, and control access.'}
            </p>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        pageCount={data?.meta?.totalPages ?? -1}
        totalCount={data?.meta?.total}
        itemLabel={{ singular: isBn ? 'অ্যাডমিন' : 'admin', plural: isBn ? 'অ্যাডমিন' : 'admins' }}
        isBn={isBn}
        pagination={{ pageIndex: page - 1, pageSize: limit }}
        onPaginationChange={(updater) => {
          const state =
            typeof updater === 'function'
              ? updater({ pageIndex: page - 1, pageSize: limit })
              : updater;
          setPage(state.pageIndex + 1);
          setLimit(state.pageSize);
        }}
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder={
          isBn ? 'নাম, ইমেইল বা ফোন দিয়ে খুঁজুন...' : 'Search by name, email or phone...'
        }
        actionSlot={
          <Button onClick={() => setCreateOpen(true)} className="!h-11 rounded-full px-6 shadow-xs">
            <UserPlus className="w-4 h-4 me-2" />
            {isBn ? 'নতুন অ্যাডমিন' : 'New admin'}
          </Button>
        }
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
      />

      <AdminPermissionsDialog
        admin={permissionsAdmin}
        open={!!permissionsAdmin}
        onOpenChange={(open) => {
          if (!open) setPermissionsAdmin(null);
        }}
        lang={lang}
      />

      <AdminCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        lang={lang}
        canCreateSuperAdmin={canCreateSuperAdmin}
      />

      <Dialog open={!!resetTarget} onOpenChange={(open) => !open && setResetTarget(null)}>
        <DialogContent className="sm:max-w-md w-[calc(100vw-1.5rem)]">
          <DialogHeader>
            <DialogTitle>{isBn ? 'পাসওয়ার্ড রিসেট' : 'Reset Password'}</DialogTitle>
            <DialogDescription className="text-xs">
              {resetTarget?.email || resetTarget?.phone}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <Label className="text-xs">{isBn ? 'নতুন পাসওয়ার্ড' : 'New password'}</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setResetTarget(null)}>
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button onClick={handleResetPassword} disabled={isResetting}>
              {isResetting && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
              {isBn ? 'রিসেট' : 'Reset'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={!!deactivateTarget}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
        title={isBn ? 'অ্যাকাউন্ট নিষ্ক্রিয় করুন' : 'Deactivate account'}
        description={
          isBn
            ? 'এই অ্যাডমিন আর লগইন করতে পারবেন না এবং তাদের সেশন বাতিল হবে।'
            : 'This admin will immediately lose access and all active sessions will be revoked.'
        }
        confirmLabel={isBn ? 'নিষ্ক্রিয় করুন' : 'Deactivate'}
        isLoading={isDeactivating}
        onConfirm={handleDeactivate}
        isBn={isBn}
      />
    </div>
  );
}
