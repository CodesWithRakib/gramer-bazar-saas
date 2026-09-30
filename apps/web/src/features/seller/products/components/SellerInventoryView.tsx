'use client';

import React, { useMemo, useState } from 'react';
import {
  Boxes,
  Minus,
  Plus,
  RotateCcw,
  Save,
  Search,
  X,
} from 'lucide-react';
import { customToast as toast } from '@/components/ui/custom-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminPagination } from '@/components/ui/AdminPagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge, type StatusTone } from '@/components/common/StatusBadge';
import { getApiErrorMessage } from '@/lib/apiError';
import { formatCurrency } from '@/lib/format';
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch';
import {
  useBulkUpdateSellerStockMutation,
  useGetSellerProductsQuery,
  type SellerProduct,
  type StockState,
} from '@/features/seller';

export interface SellerInventoryViewProps {
  lang?: string;
}

const STOCK_TONE: Record<StockState, StatusTone> = {
  OUT_OF_STOCK: 'danger',
  LOW: 'warning',
  IN_STOCK: 'success',
};

interface Draft {
  quantity: string;
  threshold: string;
}

const LIMIT_OPTIONS = [20, 50, 100];

export function SellerInventoryView({ lang = 'en' }: SellerInventoryViewProps) {
  const isBn = lang === 'bn';

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [stockFilter, setStockFilter] = useState<
    'ALL' | 'LOW_STOCK' | 'IN_STOCK' | 'OUT_OF_STOCK'
  >('ALL');
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  const { input: searchInput, term: search, onInputChange, reset } = useDebouncedSearch();

  const { data, isLoading, isError, refetch } = useGetSellerProductsQuery({
    page,
    limit,
    search: search || undefined,
    stock: stockFilter,
    sort: 'newest',
  });

  const [bulkUpdate, { isLoading: isSaving }] = useBulkUpdateSellerStockMutation();

  const products = useMemo(() => data?.data ?? [], [data]);

  const dirtyIds = useMemo(
    () =>
      products
        .filter((product) => {
          const draft = drafts[product.id];
          if (!draft) return false;
          return (
            Number(draft.quantity) !== product.quantity ||
            Number(draft.threshold) !== product.lowStockThreshold
          );
        })
        .map((product) => product.id),
    [drafts, products]
  );

  const setDraft = (product: SellerProduct, patch: Partial<Draft>) => {
    setDrafts((prev) => ({
      ...prev,
      [product.id]: {
        quantity: prev[product.id]?.quantity ?? String(product.quantity),
        threshold: prev[product.id]?.threshold ?? String(product.lowStockThreshold),
        ...patch,
      },
    }));
  };

  const clearDrafts = () => setDrafts({});

  const handleSave = async () => {
    const invalid = dirtyIds.find((id) => {
      const draft = drafts[id];
      return Number.isNaN(Number(draft.quantity)) || Number(draft.quantity) < 0;
    });
    if (invalid) {
      toast.error(
        isBn ? 'স্টক ঋণাত্মক হতে পারে না' : 'Stock quantity cannot be negative or empty'
      );
      return;
    }

    try {
      await bulkUpdate({
        items: dirtyIds.map((id) => ({
          id,
          quantity: Number(drafts[id].quantity),
          lowStockThreshold: Number(drafts[id].threshold),
        })),
      }).unwrap();
      toast.success(
        isBn
          ? `${dirtyIds.length}টি পণ্যের স্টক আপডেট হয়েছে`
          : `Updated stock for ${dirtyIds.length} product${dirtyIds.length > 1 ? 's' : ''}`
      );
      clearDrafts();
      void refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error, isBn ? 'আপডেট ব্যর্থ' : 'Could not update stock'));
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        breadcrumbs={[
          { label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', href: `/${lang}/seller` },
          { label: isBn ? 'পণ্য' : 'Products', href: `/${lang}/seller/products` },
          { label: isBn ? 'ইনভেন্টরি' : 'Inventory' },
        ]}
        title={isBn ? 'ইনভেন্টরি' : 'Inventory'}
        description={
          isBn
            ? 'স্টক পরিমাণ একসাথে অনেক পণ্যের জন্য পরিবর্তন করে একবারে সংরক্ষণ করুন।'
            : 'Adjust stock across many products at once and save the whole batch in one go.'
        }
        primaryAction={
          dirtyIds.length > 0 ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={clearDrafts} disabled={isSaving} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                {isBn ? 'বাতিল' : 'Discard'}
              </Button>
              <Button onClick={() => void handleSave()} disabled={isSaving} className="gap-2">
                <Save className="h-4 w-4" />
                {isSaving
                  ? isBn
                    ? 'সংরক্ষণ হচ্ছে...'
                    : 'Saving...'
                  : isBn
                    ? `${dirtyIds.length}টি সংরক্ষণ`
                    : `Save ${dirtyIds.length}`}
              </Button>
            </div>
          ) : null
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MiniStat
          label={isBn ? 'মোট পণ্য' : 'Listings'}
          value={data?.meta.total ?? 0}
          loading={isLoading}
        />
        <MiniStat
          label={isBn ? 'কম স্টক' : 'Low stock'}
          value={data?.lowStockCount ?? 0}
          tone="warning"
          loading={isLoading}
        />
        <MiniStat
          label={isBn ? 'স্টক শেষ' : 'Out of stock'}
          value={data?.outOfStockCount ?? 0}
          tone="danger"
          loading={isLoading}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="text-muted-foreground pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            value={searchInput}
            onChange={(event) => {
              onInputChange(event.target.value);
              setPage(1);
            }}
            placeholder={isBn ? 'নাম বা SKU...' : 'Search name or SKU...'}
            className="h-11 rounded-full ps-10 pe-10"
            aria-label={isBn ? 'ইনভেন্টরি খুঁজুন' : 'Search inventory'}
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                reset();
                setPage(1);
              }}
              aria-label={isBn ? 'মুছুন' : 'Clear'}
              className="text-muted-foreground hover:bg-muted absolute end-2.5 top-1/2 -translate-y-1/2 rounded-full p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="w-full sm:w-52">
          <Select
            value={stockFilter}
            onValueChange={(value) => {
              setStockFilter(value as typeof stockFilter);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-11 w-full rounded-full" aria-label={isBn ? 'স্টক ফিল্টার' : 'Stock filter'}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{isBn ? 'সব স্টক' : 'All stock'}</SelectItem>
              <SelectItem value="IN_STOCK">{isBn ? 'পর্যাপ্ত স্টক' : 'In stock'}</SelectItem>
              <SelectItem value="LOW_STOCK">{isBn ? 'কম স্টক' : 'Low stock'}</SelectItem>
              <SelectItem value="OUT_OF_STOCK">{isBn ? 'স্টক শেষ' : 'Out of stock'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isError ? (
        <ErrorState
          isBn={isBn}
          title={isBn ? 'ইনভেন্টরি লোড করা যায়নি' : 'Could not load inventory'}
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Boxes className="h-8 w-8" />}
          title={
            stockFilter === 'ALL'
              ? isBn
                ? 'ইনভেন্টরিতে কোনো পণ্য নেই'
                : 'No products in inventory'
              : isBn
                ? 'এই ফিল্টারে কোনো পণ্য নেই'
                : 'No products match this filter'
          }
          description={
            isBn
              ? 'পণ্য যোগ করার পর এখানে স্টক পরিমাণ পরিচালনা করতে পারবেন।'
              : 'Once you add products, their stock levels can be managed here.'
          }
          action={{
            label: isBn ? 'পণ্য যোগ করুন' : 'Add a product',
            href: `/${lang}/seller/products/new`,
          }}
        />
      ) : (
        <>
          {/* Desktop */}
          <Card className="hidden overflow-hidden shadow-none lg:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="ps-4">{isBn ? 'পণ্য' : 'Product'}</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>{isBn ? 'মূল্য' : 'Price'}</TableHead>
                  <TableHead>{isBn ? 'বর্তমান' : 'Current'}</TableHead>
                  <TableHead>{isBn ? 'নতুন স্টক' : 'New stock'}</TableHead>
                  <TableHead>{isBn ? 'সীমা' : 'Threshold'}</TableHead>
                  <TableHead className="pe-4">{isBn ? 'অবস্থা' : 'Status'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const draft = drafts[product.id] ?? {
                    quantity: String(product.quantity),
                    threshold: String(product.lowStockThreshold),
                  };
                  const isDirty = dirtyIds.includes(product.id);

                  return (
                    <TableRow key={product.id} className={isDirty ? 'bg-primary/5' : undefined}>
                      <TableCell className="ps-4">
                        <p className="text-foreground max-w-[260px] truncate font-medium">
                          {isBn ? product.nameBn : product.nameEn}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {isBn ? product.categoryNameBn : product.categoryNameEn}
                        </p>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {product.sellerSku || product.sku || '—'}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatCurrency(product.effectivePrice)}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        <span className="text-foreground font-medium">{product.quantity}</span>
                        {product.reservedQuantity > 0 && (
                          <span className="text-muted-foreground ms-1 text-xs">
                            ({product.reservedQuantity} {isBn ? 'রিজার্ভড' : 'reserved'})
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={isBn ? 'এক কমান' : 'Decrease by one'}
                            onClick={() =>
                              setDraft(product, {
                                quantity: String(Math.max(0, Number(draft.quantity) - 1)),
                              })
                            }
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <Input
                            type="number"
                            min={0}
                            value={draft.quantity}
                            onChange={(event) =>
                              setDraft(product, { quantity: event.target.value })
                            }
                            className="h-9 w-20 text-center tabular-nums"
                            aria-label={isBn ? `${product.nameBn} স্টক` : `${product.nameEn} stock`}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={isBn ? 'এক বাড়ান' : 'Increase by one'}
                            onClick={() =>
                              setDraft(product, { quantity: String(Number(draft.quantity) + 1) })
                            }
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          value={draft.threshold}
                          onChange={(event) =>
                            setDraft(product, { threshold: event.target.value })
                          }
                          className="h-9 w-20 text-center tabular-nums"
                          aria-label={
                            isBn
                              ? `${product.nameBn} কম স্টক সীমা`
                              : `${product.nameEn} low stock threshold`
                          }
                        />
                      </TableCell>
                      <TableCell className="pe-4">
                        <StatusBadge
                          tone={STOCK_TONE[product.stockState]}
                          label={stockLabel(product.stockState, isBn)}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile */}
          <ul className="space-y-3 lg:hidden">
            {products.map((product) => {
              const draft = drafts[product.id] ?? {
                quantity: String(product.quantity),
                threshold: String(product.lowStockThreshold),
              };
              const isDirty = dirtyIds.includes(product.id);

              return (
                <li key={product.id}>
                  <Card className={isDirty ? 'border-primary/40 shadow-none' : 'shadow-none'}>
                    <CardContent className="space-y-3 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-foreground line-clamp-2 text-sm font-semibold">
                            {isBn ? product.nameBn : product.nameEn}
                          </p>
                          <p className="text-muted-foreground mt-0.5 font-mono text-xs">
                            {product.sellerSku || product.sku || '—'}
                          </p>
                        </div>
                        <StatusBadge
                          tone={STOCK_TONE[product.stockState]}
                          label={stockLabel(product.stockState, isBn)}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground text-xs">
                          {isBn ? 'বর্তমান স্টক' : 'Current stock'}
                        </span>
                        <span className="text-foreground text-sm font-semibold tabular-nums">
                          {product.quantity}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-muted-foreground text-[11px]">
                            {isBn ? 'নতুন স্টক' : 'New stock'}
                          </label>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 shrink-0"
                              aria-label={isBn ? 'কমান' : 'Decrease'}
                              onClick={() =>
                                setDraft(product, {
                                  quantity: String(Math.max(0, Number(draft.quantity) - 1)),
                                })
                              }
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <Input
                              type="number"
                              min={0}
                              inputMode="numeric"
                              value={draft.quantity}
                              onChange={(event) =>
                                setDraft(product, { quantity: event.target.value })
                              }
                              className="h-9 text-center tabular-nums"
                              aria-label={isBn ? 'স্টক পরিমাণ' : 'Stock quantity'}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 shrink-0"
                              aria-label={isBn ? 'বাড়ান' : 'Increase'}
                              onClick={() =>
                                setDraft(product, { quantity: String(Number(draft.quantity) + 1) })
                              }
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-muted-foreground text-[11px]">
                            {isBn ? 'কম স্টক সীমা' : 'Low-stock limit'}
                          </label>
                          <Input
                            type="number"
                            min={0}
                            inputMode="numeric"
                            value={draft.threshold}
                            onChange={(event) =>
                              setDraft(product, { threshold: event.target.value })
                            }
                            className="h-9 text-center tabular-nums"
                            aria-label={isBn ? 'কম স্টক সীমা' : 'Low stock threshold'}
                          />
                        </div>
                      </div>

                      {isDirty && (
                        <p className="text-primary text-[11px] font-medium">
                          {isBn ? 'সংরক্ষণ করতে উপরের বোতাম চাপুন' : 'Tap save above to apply'}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>

          <AdminPagination
            totalItems={data?.meta.total ?? 0}
            itemsPerPage={limit}
            currentPage={page}
            limitOptions={LIMIT_OPTIONS}
            lang={isBn ? 'bn' : 'en'}
            itemLabel={{
              singular: isBn ? 'পণ্য' : 'product',
              plural: isBn ? 'পণ্য' : 'products',
            }}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        </>
      )}
    </div>
  );
}

function stockLabel(state: StockState, isBn: boolean): string {
  if (state === 'OUT_OF_STOCK') return isBn ? 'স্টক শেষ' : 'Out of stock';
  if (state === 'LOW') return isBn ? 'কম স্টক' : 'Low stock';
  return isBn ? 'পর্যাপ্ত' : 'In stock';
}

function MiniStat({
  label,
  value,
  tone = 'neutral',
  loading,
}: {
  label: string;
  value: number;
  tone?: 'neutral' | 'warning' | 'danger';
  loading?: boolean;
}) {
  const toneClass =
    tone === 'warning'
      ? 'text-amber-600 dark:text-amber-400'
      : tone === 'danger'
        ? 'text-destructive'
        : 'text-foreground';

  return (
    <Card className="shadow-none">
      <CardContent className="flex items-center justify-between gap-2 p-4">
        <span className="text-muted-foreground truncate text-xs">{label}</span>
        {loading ? (
          <Skeleton className="h-6 w-10" />
        ) : (
          <span className={`text-xl font-bold tabular-nums ${toneClass}`}>{value}</span>
        )}
      </CardContent>
    </Card>
  );
}
