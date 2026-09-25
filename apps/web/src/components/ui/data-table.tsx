'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  PaginationState,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AdminPagination } from '@/components/ui/AdminPagination';
import { Search, X, Loader2, TriangleAlert, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount: number;
  pagination: PaginationState;
  onPaginationChange: React.Dispatch<React.SetStateAction<PaginationState>>;
  totalCount?: number;
  totalItems?: number;
  currentPage?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  lang?: 'ar' | 'en' | 'bn';
  itemLabel?: { singular: string; plural: string };
  sorting?: SortingState;
  onSortingChange?: React.Dispatch<React.SetStateAction<SortingState>>;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  /** Label for the empty state, already localized by the caller. */
  emptyMessage?: string;
  /** Label for the error state, already localized by the caller. */
  errorMessage?: string;
  isBn?: boolean;
  /** Optional top toolbar search string */
  search?: string;
  /** Optional callback for search input change */
  onSearchChange?: (value: string) => void;
  /** Optional placeholder for search input */
  searchPlaceholder?: string;
  /** Optional loading state for search */
  isSearching?: boolean;
  /** Optional slot for filter controls (e.g. status dropdown, category selector) */
  filterSlot?: React.ReactNode;
  /** Optional slot for action buttons (e.g. "+ Add Product", "+ Create User") */
  actionSlot?: React.ReactNode;
  /** Custom class for the wrapper card */
  className?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  pagination,
  onPaginationChange,
  totalCount,
  totalItems,
  currentPage,
  itemsPerPage,
  onPageChange,
  onLimitChange,
  lang,
  itemLabel,
  sorting,
  onSortingChange,
  isLoading,
  isError,
  onRetry,
  emptyMessage,
  errorMessage,
  isBn = false,
  search,
  onSearchChange,
  searchPlaceholder,
  isSearching = false,
  filterSlot,
  actionSlot,
  className,
}: DataTableProps<TData, TValue>) {
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      pagination,
      ...(sorting ? { sorting } : {}),
    },
    onPaginationChange,
    ...(onSortingChange ? { onSortingChange } : {}),
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  const hasToolbar = Boolean(onSearchChange || filterSlot || actionSlot);
  const effectiveTotalItems =
    totalItems ?? totalCount ?? (pageCount > 0 ? pageCount * pagination.pageSize : data.length);
  const effectiveLang = lang ?? (isBn ? 'bn' : 'en');

  return (
    <div
      className={cn(
        'rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 dark:border-border dark:bg-card',
        className,
      )}
    >
      {/* Top Filters & Actions Toolbar */}
      {hasToolbar && (
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full flex-1 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            {onSearchChange && (
              <div className="relative w-full max-w-md min-w-[220px] flex-1 sm:w-auto">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-muted-foreground" />
                <input
                  type="text"
                  value={search ?? ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={
                    searchPlaceholder ??
                    (isBn ? 'অনুসন্ধান করুন...' : 'Search...')
                  }
                  className="h-11 w-full rounded-full border border-gray-200 bg-white pl-11 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-border dark:bg-background dark:text-foreground dark:placeholder:text-muted-foreground"
                />
                <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
                  {isSearching && (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  )}
                  {search && (
                    <button
                      type="button"
                      onClick={() => onSearchChange('')}
                      className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none dark:hover:bg-muted"
                      aria-label="Clear search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {filterSlot}
          </div>

          {actionSlot && (
            <div className="flex shrink-0 items-center gap-2">{actionSlot}</div>
          )}
        </div>
      )}

      {/* Inner Table Container */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xs dark:border-border dark:bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-200 bg-gray-50/80 dark:border-border dark:bg-muted/40">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-700 sm:px-6 dark:text-muted-foreground"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`} className="animate-pulse">
                    {columns.map((_, colIndex) => (
                      <TableCell key={colIndex} className="px-4 py-4 sm:px-6">
                        <div
                          className="h-4 rounded bg-gray-200 dark:bg-muted"
                          style={{
                            width: `${Math.max(40, (colIndex * 37) % 90 + 30)}%`,
                          }}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-36 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 text-destructive">
                      <TriangleAlert className="h-7 w-7 opacity-80" />
                      <p className="font-medium">
                        {errorMessage ??
                          (isBn
                            ? 'ডেটা লোড করা যায়নি।'
                            : 'Failed to load data.')}
                      </p>
                      {onRetry && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onRetry}
                          className="mt-1 rounded-full border-gray-200 text-xs"
                        >
                          {isBn ? 'আবার চেষ্টা করুন' : 'Try again'}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="transition-colors hover:bg-gray-50/70 dark:hover:bg-muted/30"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-4 py-3.5 text-sm text-gray-800 sm:px-6 dark:text-gray-200"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-gray-500 sm:px-6"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-muted">
                        <Inbox className="h-6 w-6 text-gray-400 dark:text-muted-foreground" />
                      </div>
                      <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-foreground">
                        {isBn ? 'কোনো তথ্য পাওয়া যায়নি' : 'No records found'}
                      </h3>
                      <p className="max-w-md text-xs text-gray-500 dark:text-muted-foreground">
                        {search
                          ? isBn
                            ? 'অনুসন্ধানের সাথে কোনো মিল পাওয়া যায়নি।'
                            : 'No records match your search criteria.'
                          : emptyMessage ??
                            (isBn
                              ? 'প্রদর্শনের জন্য কোনো ডেটা নেই।'
                              : 'There are no items to display at this time.')}
                      </p>
                      {search && onSearchChange && (
                        <button
                          type="button"
                          onClick={() => onSearchChange('')}
                          className="mt-3 text-xs font-semibold text-primary hover:underline"
                        >
                          {isBn ? 'অনুসন্ধান মুছুন' : 'Clear search'}
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Container */}
      <div className="mt-4">
        <AdminPagination
          totalItems={effectiveTotalItems}
          itemsPerPage={itemsPerPage ?? pagination.pageSize}
          currentPage={currentPage ?? (pagination.pageIndex + 1)}
          lang={effectiveLang}
          itemLabel={itemLabel}
          onPageChange={(page) => {
            onPageChange?.(page);
            onPaginationChange((prev) => ({
              ...prev,
              pageIndex: page - 1,
            }));
          }}
          onLimitChange={(limit) => {
            onLimitChange?.(limit);
            onPaginationChange((prev) => ({
              ...prev,
              pageSize: limit,
              pageIndex: 0,
            }));
          }}
        />
      </div>
    </div>
  );
}
