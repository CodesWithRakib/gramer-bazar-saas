'use client';

import React, { useState } from 'react';
import {
  useGetManufacturersQuery,
  useDeleteAdminManufacturerMutation,
  Manufacturer,
} from '@/features/catalog/catalogApi';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AddManufacturerDialog, EditManufacturerDialog } from './ManufacturerDialogs';
import { BackButton } from '@/components/common/BackButton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { customToast as toast } from '@/components/ui/custom-toast';
import { getApiErrorMessage } from '@/lib/apiError';
import { Edit, Trash2, Building, ExternalLink, Search } from 'lucide-react';

export interface AdminManufacturersViewProps {
  lang?: string;
  namespace?: 'admin' | 'super-admin';
}

export function AdminManufacturersView({
  lang = 'en',
  namespace = 'admin',
}: AdminManufacturersViewProps) {
  const isBn = lang === 'bn';
  const basePath = namespace === 'super-admin' ? 'super-admin' : 'admin';
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [editingManufacturer, setEditingManufacturer] = useState<Manufacturer | null>(null);
  const [manufacturerToDelete, setManufacturerToDelete] = useState<Manufacturer | null>(null);

  const { data: manufacturers = [], isLoading, isError, refetch } = useGetManufacturersQuery({
    search: search || undefined,
  });

  const total = manufacturers.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const paginatedData = manufacturers.slice((page - 1) * limit, page * limit);

  const [deleteManufacturer, { isLoading: isDeleting }] = useDeleteAdminManufacturerMutation();

  const handleConfirmDelete = async () => {
    if (!manufacturerToDelete) return;
    try {
      await deleteManufacturer(manufacturerToDelete.id).unwrap();
      toast.success(
        isBn
          ? `"${manufacturerToDelete.nameBn || manufacturerToDelete.nameEn}" মুছে ফেলা হয়েছে`
          : `Manufacturer "${manufacturerToDelete.nameEn}" deleted successfully`
      );
      setManufacturerToDelete(null);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error) ||
          (isBn ? 'প্রস্তুতকারক মুছতে ব্যর্থ হয়েছে' : 'Failed to delete manufacturer')
      );
    }
  };

  const columns: ColumnDef<Manufacturer>[] = [
    {
      accessorKey: 'nameEn',
      header: isBn ? 'নাম (ইংরেজি)' : 'Name (EN)',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
            <Building className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold text-foreground">{row.original.nameEn}</div>
            <div className="text-xs text-muted-foreground">{row.original.nameBn}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'slug',
      header: isBn ? 'স্লাগ' : 'Slug',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">{row.original.slug}</span>
      ),
    },
    {
      accessorKey: 'country',
      header: isBn ? 'দেশ' : 'Country',
      cell: ({ row }) => <span>{row.original.country || '—'}</span>,
    },
    {
      accessorKey: 'website',
      header: isBn ? 'ওয়েবসাইট' : 'Website',
      cell: ({ row }) => {
        const site = row.original.website;
        if (!site) return <span className="text-muted-foreground">—</span>;
        return (
          <a
            href={site}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-mono"
          >
            <span>{site.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: isBn ? 'অবস্থা' : 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'} className="text-xs">
          {row.original.isActive ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'নিষ্ক্রিয়' : 'Inactive')}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: isBn ? 'অ্যাকশন' : 'Actions',
      cell: ({ row }) => {
        const m = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setEditingManufacturer(m)}
              title={isBn ? 'সম্পাদনা করুন' : 'Edit'}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
              disabled={isDeleting}
              onClick={() => setManufacturerToDelete(m)}
              title={isBn ? 'মুছুন' : 'Delete'}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <BackButton
          href={`/${lang}/${basePath}/products`}
          label="Back to Products Hub"
          labelBn="পণ্য হাবে ফিরে যান"
          lang={lang}
        />
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {isBn ? 'ফার্মাসিউটিক্যাল ও পণ্য প্রস্তুতকারক' : 'Manufacturers Directory'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isBn
                ? 'আইনগত ও লাইসেন্সপ্রাপ্ত ওষুধ এবং স্বাস্থ্যসেবা পণ্য প্রস্তুতকারী কোম্পানি পরিচালনা করুন।'
                : 'Manage verified pharmaceutical and product manufacturers, origin countries, and official details.'}
            </p>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginatedData}
        pageCount={totalPages}
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
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder={isBn ? 'প্রস্তুতকারক খুঁজুন...' : 'Search manufacturers...'}
        actionSlot={<AddManufacturerDialog lang={lang} />}
        totalItems={total}
        itemsPerPage={limit}
        currentPage={page}
        onPageChange={setPage}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        lang={lang as any}
      />

      {editingManufacturer && (
        <EditManufacturerDialog
          manufacturer={editingManufacturer}
          open={!!editingManufacturer}
          onOpenChange={(open) => !open && setEditingManufacturer(null)}
          lang={lang}
        />
      )}

      {manufacturerToDelete && (
        <ConfirmDialog
          open={!!manufacturerToDelete}
          onOpenChange={(open) => !open && setManufacturerToDelete(null)}
          title={isBn ? 'প্রস্তুতকারক মুছে ফেলতে চান?' : 'Delete Manufacturer?'}
          description={
            isBn
              ? `আপনি কি নিশ্চিত যে "${manufacturerToDelete.nameBn || manufacturerToDelete.nameEn}" প্রস্তুতকারকটি মুছে ফেলতে চান? পণ্যের সাথে যুক্ত থাকলে এটি মুছে ফেলা যাবে না।`
              : `Are you sure you want to delete "${manufacturerToDelete.nameEn}"? If any products reference this manufacturer, deletion will be blocked.`
          }
          confirmLabel={isBn ? 'হ্যাঁ, মুছুন' : 'Delete'}
          cancelLabel={isBn ? 'বাতিল' : 'Cancel'}
          variant="destructive"
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
