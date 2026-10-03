'use client';

import React, { useMemo, useState } from 'react';
import {
  useGetAdminAttributesQuery,
  useDeleteAdminAttributeMutation,
  CatalogAttribute,
  AttributeDataType,
} from '@/features/catalog/catalogApi';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { customToast as toast } from '@/components/ui/custom-toast';
import { getApiErrorMessage } from '@/lib/apiError';
import { PageHeader } from '@/components/common/PageHeader';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import {
  AddAttributeDialog,
  EditAttributeDialog,
  AttributeOptionChips,
  ATTRIBUTE_DATA_TYPE_LABELS,
} from './AttributeDialogs';

export interface AdminAttributesViewProps {
  lang?: string;
  namespace?: 'admin' | 'super-admin';
}

export function AdminAttributesView({
  lang = 'en',
  namespace = 'admin',
}: AdminAttributesViewProps) {
  const basePath = namespace === 'super-admin' ? 'super-admin' : 'admin';
  const [search, setSearch] = useState('');
  const [dataTypeFilter, setDataTypeFilter] = useState<string>('ALL');
  const [editingAttribute, setEditingAttribute] = useState<CatalogAttribute | null>(null);
  const [attributeToDelete, setAttributeToDelete] = useState<CatalogAttribute | null>(null);

  const { data, isLoading, isError, refetch } = useGetAdminAttributesQuery({
    search: search || undefined,
  });

  const [deleteAttribute, { isLoading: isDeleting }] = useDeleteAdminAttributeMutation();

  const attributes = useMemo(() => {
    const list = data || [];
    if (dataTypeFilter === 'ALL') return list;
    return list.filter((a) => a.dataType === dataTypeFilter);
  }, [data, dataTypeFilter]);

  const handleConfirmDelete = async () => {
    if (!attributeToDelete) return;
    try {
      await deleteAttribute(attributeToDelete.id).unwrap();
      toast.success(
        lang === 'bn'
          ? `"${attributeToDelete.nameBn || attributeToDelete.nameEn}" অ্যাট্রিবিউট মুছে ফেলা হয়েছে`
          : `Attribute "${attributeToDelete.nameEn}" deleted successfully`
      );
      setAttributeToDelete(null);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error) ||
          (lang === 'bn' ? 'অ্যাট্রিবিউট মুছতে ব্যর্থ হয়েছে' : 'Failed to delete attribute')
      );
    }
  };

  const columns: ColumnDef<CatalogAttribute>[] = [
    {
      accessorKey: 'nameEn',
      header: 'Attribute',
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-foreground">{row.original.nameEn}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.slug}
            {row.original.unit ? ` · ${row.original.unit}` : ''}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'nameBn',
      header: 'Name (BN)',
      cell: ({ row }) => <div className="font-medium text-foreground">{row.original.nameBn}</div>,
    },
    {
      accessorKey: 'dataType',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline" className="border-primary/40 text-primary">
          {ATTRIBUTE_DATA_TYPE_LABELS[row.original.dataType]}
        </Badge>
      ),
    },
    {
      id: 'options',
      header: 'Options',
      cell: ({ row }) => <AttributeOptionChips attribute={row.original} />,
    },
    {
      id: 'flags',
      header: 'Flags',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.isFilterable && (
            <Badge variant="secondary" className="text-xs">
              Filter
            </Badge>
          )}
          {row.original.isVariantAxis && (
            <Badge variant="secondary" className="text-xs">
              Variant
            </Badge>
          )}
          {!row.original.isActive && (
            <Badge variant="destructive" className="text-xs">
              Inactive
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditingAttribute(row.original)}>
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={isDeleting}
            onClick={() => setAttributeToDelete(row.original)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`/${lang}/${basePath}/products`}
        backLabel="Back to Products Hub"
        backLabelBn="পণ্য হাবে ফিরে যান"
        lang={lang}
        title={lang === 'bn' ? 'অ্যাট্রিবিউট ইঞ্জিন' : 'Attribute Engine'}
        description={
          lang === 'bn'
            ? 'পুনরায় ব্যবহারযোগ্য অ্যাট্রিবিউট তৈরি করুন ও ডেটা টাইপ নির্ধারণ করুন।'
            : 'Create reusable product attributes and define their data types.'
        }
      />

      <DataTable
        columns={columns}
        data={attributes}
        pageCount={-1}
        pagination={{ pageIndex: 0, pageSize: attributes.length || 15 }}
        onPaginationChange={() => undefined}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={
          lang === 'bn' ? 'নাম বা স্লাগ দিয়ে খুঁজুন...' : 'Search attributes by name or slug...'
        }
        filterSlot={
          <Select value={dataTypeFilter} onValueChange={setDataTypeFilter}>
            <SelectTrigger className="h-11 w-full rounded-full sm:w-[180px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All types</SelectItem>
              {(Object.keys(ATTRIBUTE_DATA_TYPE_LABELS) as AttributeDataType[]).map((dt) => (
                <SelectItem key={dt} value={dt}>
                  {ATTRIBUTE_DATA_TYPE_LABELS[dt]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        actionSlot={<AddAttributeDialog />}
        totalItems={attributes.length}
        itemsPerPage={attributes.length || 15}
        currentPage={1}
        onPageChange={() => undefined}
        lang={lang as 'en' | 'bn'}
        emptyMessage={
          lang === 'bn'
            ? 'এখনো কোনো অ্যাট্রিবিউট তৈরি করা হয়নি।'
            : 'No attributes created yet.'
        }
      />

      {editingAttribute && (
        <EditAttributeDialog
          attribute={editingAttribute}
          open={!!editingAttribute}
          onOpenChange={(o: boolean) => {
            if (!o) setEditingAttribute(null);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={!!attributeToDelete}
        onClose={() => setAttributeToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={
          lang === 'bn'
            ? `"${attributeToDelete?.nameBn || attributeToDelete?.nameEn}" অ্যাট্রিবিউট মুছে ফেলতে চান?`
            : `Delete attribute "${attributeToDelete?.nameEn}"?`
        }
        description={
          lang === 'bn'
            ? 'এই অ্যাকশনটি বাতিল করা যাবে না।'
            : 'Deleting an attribute removes it from every product type mapping.'
        }
        confirmLabel={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
        cancelLabel={lang === 'bn' ? 'বাতিল' : 'Cancel'}
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}

export default AdminAttributesView;
