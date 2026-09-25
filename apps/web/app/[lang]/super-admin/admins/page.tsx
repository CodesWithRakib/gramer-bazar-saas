"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import {
  useGetUsersQuery,
  useUpdateUserStatusMutation,
  Role,
  User,
} from "@/features/users/usersApi";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, UserPlus, ArrowLeft } from "lucide-react";
import { UserRoleDialog } from "../UserRoleDialog";

export default function SuperAdminAdminsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const isBn = lang === "bn";

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [editingRolesUser, setEditingRolesUser] = useState<User | null>(null);

  const { data, isLoading, isError, refetch } = useGetUsersQuery({
    page,
    limit,
    search,
    role: Role.ADMIN,
  });

  const [updateStatus] = useUpdateUserStatusMutation();

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "firstName",
      header: isBn ? "নাম" : "Name",
      cell: ({ row }) =>
        `${row.original.firstName} ${row.original.lastName}`.trim(),
    },
    {
      accessorKey: "email",
      header: isBn ? "ইমেইল" : "Email",
    },
    {
      accessorKey: "phone",
      header: isBn ? "ফোন নম্বর" : "Phone",
    },
    {
      accessorKey: "roles",
      header: isBn ? "রোল" : "Roles",
      cell: ({ row }) => {
        const roles = row.original.roles as { name: string }[];
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            {roles?.map((r) => (
              <Badge
                key={r.name}
                variant={r.name === "SUPER_ADMIN" ? "default" : "secondary"}
                className="font-medium"
              >
                {r.name}
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setEditingRolesUser(row.original)}
            >
              {isBn ? "পরিবর্তন" : "Edit"}
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: isBn ? "স্ট্যাটাস" : "Status",
      cell: ({ row }) => {
        const status = row.original.status as string;
        const user = row.original;
        return (
          <div className="flex items-center gap-2">
            <Badge variant={status === "ACTIVE" ? "default" : "destructive"}>
              {status}
            </Badge>
            {status !== "ACTIVE" ? (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => updateStatus({ id: user.id, status: "ACTIVE" })}
              >
                {isBn ? "সক্রিয় করুন" : "Activate"}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="destructive"
                className="h-7 text-xs"
                onClick={() =>
                  updateStatus({ id: user.id, status: "SUSPENDED" })
                }
              >
                {isBn ? "স্থগিত করুন" : "Suspend"}
              </Button>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: isBn ? "নিবন্ধনের তারিখ" : "Registered",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={`/${lang}/super-admin`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {isBn ? "অ্যাডমিন পরিচালনা" : "Admin Personnel Roster"}
            </h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {isBn
              ? "প্ল্যাটফর্মের সকল অনুমোদিত অ্যাডমিন ও স্টাফদের তালিকা এবং পারমিশন।"
              : "Authorized platform operators and administrative personnel."}
          </p>
        </div>

        <Button asChild className="rounded-xl shadow-sm">
          <Link href={`/${lang}/super-admin/create-user`}>
            <UserPlus className="w-4 h-4 mr-2" />
            {isBn ? "নতুন অ্যাডমিন তৈরি" : "Add Admin User"}
          </Link>
        </Button>
      </div>

      <div className="flex items-center max-w-sm">
        <Input
          placeholder={isBn ? "অ্যাডমিন খুঁজুন..." : "Search admins..."}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="rounded-xl"
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        pageCount={data?.meta?.totalPages ?? -1}
        pagination={{ pageIndex: page - 1, pageSize: limit }}
        onPaginationChange={(updater) => {
          if (typeof updater === "function") {
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
          onOpenChange={(open) => {
            if (!open) setEditingRolesUser(null);
          }}
          isSuperAdminMode={true}
        />
      )}
    </div>
  );
}
