'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Boxes,
  ExternalLink,
  ImageOff,
  Package,
  Pencil,
  Plus,
  Search,
  TriangleAlert,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { CustomImage } from '@/components/ui/CustomImage';
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
import { formatCurrency, formatDate } from '@/lib/format';
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch';
import {
  useGetSellerCategoriesQuery,
  useGetSellerProductsQuery,
  useUpdateSellerProductMutation,
  type SellerProduct,
  type StockState,
} from '@/features/seller';

export interface SellerProductsViewProps {
  lang?: string;
}

const STOCK_TONE: Record<StockState, StatusTone> = {
  OUT_OF_STOCK: 'danger',
  LOW: 'warning',
  IN_STOCK: 'success',
};

const LIMIT_OPTIONS = [10, 20, 50];

export function SellerProductsView({ lang = 'en' }: SellerProductsViewProps) {
  const isBn = lang === 'bn';

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW_STOCK' | 'IN_STOCK' | 'OUT_OF_STOCK'>(
    'ALL'
  );
  const [sort, setSort] = useState<'newest' | 'oldest' | 'price_asc' | 'price_desc'>('newest');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const { input: searchInput, term: search, onInputChange, reset } = useDebouncedSearch();

  const { data: categories = [] } = useGetSellerCategoriesQuery();

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetSellerProductsQuery({
    page,
    limit,
    search: search || undefined,
    status: statusFilter,
    stock: stockFilter,
    sort,
    categoryId: categoryFilter === 'ALL' ? undefined : categoryFilter,
  });

  const [updateProduct] = useUpdateSellerProductMutation();

  const products = data?.data ?? [];
  const meta = data?.meta;
  const hasFilters =
    !!search || statusFilter !== 'ALL' || stockFilter !== 'ALL' || categoryFilter !== 'ALL';

  const handleToggleActive = async (product: SellerProduct, next: boolean) => {
    try {
      await updateProduct({ id: product.id, data: { isActive: next } }).unwrap();
      toast.success(
        next
          ? isBn
            ? 'প্রোডাক্ট চালু করা হয়েছে'
            : 'Product is now visible'
          : isBn
            ? 'প্রোডাক্ট বন্ধ করা হয়েছে'
            : 'Product hidden from customers'
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error, isBn ? 'পরিবর্তন ব্যর্থ' : 'Could not update status'));
    }
  };

  const categoryName = (product: SellerProduct) =>
    (isBn ? product.categoryNameBn : product.categoryNameEn) ?? '—';

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', href: `/${lang}/seller` },
          { label: isBn ? 'পণ্য' : 'Products' },
        ]}
        title={isBn ? 'পণ্য' : 'Products'}
        description={
          isBn
            ? 'আপনার দোকানের সব পণ্য, মূল্য, স্টক ও ছবি এক জায়গায় পরিচালনা করুন।'
            : 'Manage every product in your shop — pricing, stock, images and visibility.'
        }
        primaryAction={
          <Button asChild className="gap-2">
            <Link href={`/${lang}/seller/products/new`}>
              <Plus className="h-4 w-4" />
              {isBn ? 'নতুন পণ্য' : 'Add product'}
            </Link>
          </Button>
        }
        secondaryActions={
          <Button asChild variant="outline" className="gap-2">
            <Link href={`/${lang}/seller/inventory`}>
              <Boxes className="h-4 w-4" />
              {isBn ? 'ইনভেন্টরি' : 'Inventory'}
            </Link>
          </Button>
        }
      />

      {/* Health strip — real counts from the API */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label={isBn ? 'সক্রিয় পণ্য' : 'Active listings'}
          value={meta?.total ?? 0}
          icon={<Package className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <StatCard
          label={isBn ? 'কম স্টক' : 'Low stock'}
          value={data?.lowStockCount ?? 0}
          icon={<TriangleAlert className="h-4 w-4" />}
          tone={(data?.lowStockCount ?? 0) > 0 ? 'warning' : 'neutral'}
          isLoading={isLoading}
        />
        <StatCard
          label={isBn ? 'স্টক শেষ' : 'Out of stock'}
          value={data?.outOfStockCount ?? 0}
          icon={<Boxes className="h-4 w-4" />}
          tone={(data?.outOfStockCount ?? 0) > 0 ? 'danger' : 'neutral'}
          isLoading={isLoading}
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="text-muted-foreground pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            value={searchInput}
            onChange={(event) => {
              onInputChange(event.target.value);
              setPage(1);
            }}
            placeholder={isBn ? 'নাম বা SKU দিয়ে খুঁজুন...' : 'Search by name or SKU...'}
            className="h-11 rounded-full ps-10 pe-10"
            aria-label={isBn ? 'পণ্য খুঁজুন' : 'Search products'}
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                reset();
                setPage(1);
              }}
              aria-label={isBn ? 'অনুসন্ধান মুছুন' : 'Clear search'}
              className="text-muted-foreground hover:bg-muted absolute end-2.5 top-1/2 -translate-y-1/2 rounded-full p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <FilterSelect
            value={categoryFilter}
            onChange={(value) => {
              setCategoryFilter(value);
              setPage(1);
            }}
            placeholder={isBn ? 'সব ক্যাটাগরি' : 'All categories'}
            ariaLabel={isBn ? 'ক্যাটাগরি ফিল্টার' : 'Category filter'}
          >
            <SelectItem value="ALL">{isBn ? 'সব ক্যাটাগরি' : 'All categories'}</SelectItem>
            {categories
              .filter((category) => !category.parentId)
              .map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {isBn ? category.nameBn : category.nameEn}
                </SelectItem>
              ))}
          </FilterSelect>

          <FilterSelect
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value as 'ALL' | 'ACTIVE' | 'INACTIVE');
              setPage(1);
            }}
            placeholder={isBn ? 'সব অবস্থা' : 'All statuses'}
            ariaLabel={isBn ? 'অবস্থা ফিল্টার' : 'Status filter'}
          >
            <SelectItem value="ALL">{isBn ? 'সব অবস্থা' : 'All statuses'}</SelectItem>
            <SelectItem value="ACTIVE">{isBn ? 'দৃশ্যমান' : 'Visible'}</SelectItem>
            <SelectItem value="INACTIVE">{isBn ? 'লুকানো' : 'Hidden'}</SelectItem>
          </FilterSelect>

          <FilterSelect
            value={stockFilter}
            onChange={(value) => {
              setStockFilter(value as typeof stockFilter);
              setPage(1);
            }}
            placeholder={isBn ? 'সব স্টক' : 'All stock'}
            ariaLabel={isBn ? 'স্টক ফিল্টার' : 'Stock filter'}
          >
            <SelectItem value="ALL">{isBn ? 'সব স্টক' : 'All stock'}</SelectItem>
            <SelectItem value="IN_STOCK">{isBn ? 'পর্যাপ্ত স্টক' : 'In stock'}</SelectItem>
            <SelectItem value="LOW_STOCK">{isBn ? 'কম স্টক' : 'Low stock'}</SelectItem>
            <SelectItem value="OUT_OF_STOCK">{isBn ? 'স্টক শেষ' : 'Out of stock'}</SelectItem>
          </FilterSelect>

          <FilterSelect
            value={sort}
            onChange={(value) => {
              setSort(value as typeof sort);
              setPage(1);
            }}
            placeholder={isBn ? 'সাজান' : 'Sort'}
            ariaLabel={isBn ? 'সাজান' : 'Sort products'}
          >
            <SelectItem value="newest">{isBn ? 'নতুন আগে' : 'Newest first'}</SelectItem>
            <SelectItem value="oldest">{isBn ? 'পুরোনো আগে' : 'Oldest first'}</SelectItem>
            <SelectItem value="price_asc">{isBn ? 'কম দাম আগে' : 'Price: low to high'}</SelectItem>
            <SelectItem value="price_desc">{isBn ? 'বেশি দাম আগে' : 'Price: high to low'}</SelectItem>
          </FilterSelect>
        </div>
      </div>

      {isError ? (
        <ErrorState
          isBn={isBn}
          title={isBn ? 'পণ্য লোড করা যায়নি' : 'Could not load products'}
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={hasFilters ? <Search className="h-8 w-8" /> : <Package className="h-8 w-8" />}
          title={
            hasFilters
              ? isBn
                ? 'কোনো পণ্য মেলেনি'
                : 'No products match your filters'
              : isBn
                ? 'এখনও কোনো পণ্য নেই'
                : 'No products yet'
          }
          description={
            hasFilters
              ? isBn
                ? 'ফিল্টার বা অনুসন্ধান পরিবর্তন করে আবার চেষ্টা করুন।'
                : 'Try a different search term or clear the filters.'
              : isBn
                ? 'আপনার প্রথম পণ্য যোগ করে বিক্রি শুরু করুন — নাম, দাম ও ছবি যোগ করতে মাত্র কয়েক মিনিট লাগবে।'
                : 'Add your first product to start selling. It takes a couple of minutes — name, price and a photo.'
          }
          action={
            hasFilters
              ? {
                  label: isBn ? 'ফিল্টার পরিষ্কার' : 'Clear filters',
                  onClick: () => {
                    reset();
                    setStatusFilter('ALL');
                    setStockFilter('ALL');
                    setCategoryFilter('ALL');
                    setPage(1);
                  },
                }
              : {
                  label: isBn ? 'নতুন পণ্য যোগ করুন' : 'Add your first product',
                  href: `/${lang}/seller/products/new`,
                }
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden overflow-hidden shadow-none lg:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="ps-4">{isBn ? 'পণ্য' : 'Product'}</TableHead>
                  <TableHead>{isBn ? 'মূল্য' : 'Price'}</TableHead>
                  <TableHead>{isBn ? 'স্টক' : 'Stock'}</TableHead>
                  <TableHead>{isBn ? 'বিক্রি' : 'Sold'}</TableHead>
                  <TableHead>{isBn ? 'দৃশ্যমান' : 'Visible'}</TableHead>
                  <TableHead>{isBn ? 'যোগ করা' : 'Added'}</TableHead>
                  <TableHead className="text-end pe-4">{isBn ? 'কার্যক্রম' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="ps-4">
                      <div className="flex items-center gap-3">
                        <ProductThumb product={product} isBn={isBn} />
                        <div className="min-w-0">
                          <p className="text-foreground truncate font-medium">
                            {isBn ? product.nameBn : product.nameEn}
                          </p>
                          <p className="text-muted-foreground truncate text-xs">
                            {categoryName(product)}
                            {(product.sellerSku || product.sku) &&
                              ` · ${product.sellerSku || product.sku}`}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-foreground font-semibold tabular-nums">
                          {formatCurrency(product.effectivePrice)}
                        </span>
                        {product.discountPrice !== null && product.discountPrice > 0 && (
                          <span className="text-muted-foreground text-xs line-through tabular-nums">
                            {formatCurrency(product.price)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            product.stockState === 'OUT_OF_STOCK'
                              ? 'text-destructive font-semibold tabular-nums'
                              : 'text-foreground tabular-nums'
                          }
                        >
                          {product.quantity}
                        </span>
                        <StatusBadge
                          tone={STOCK_TONE[product.stockState]}
                          label={
                            product.stockState === 'OUT_OF_STOCK'
                              ? isBn
                                ? 'শেষ'
                                : 'Out'
                              : product.stockState === 'LOW'
                                ? isBn
                                  ? 'কম'
                                  : 'Low'
                                : isBn
                                  ? 'ঠিক আছে'
                                  : 'OK'
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {product.totalSold}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={product.isActive}
                        onCheckedChange={(checked) => void handleToggleActive(product, checked)}
                        aria-label={
                          isBn
                            ? `${product.nameBn} দৃশ্যমান রাখুন`
                            : `Toggle visibility for ${product.nameEn}`
                        }
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDate(product.createdAt, lang, 'short')}
                    </TableCell>
                    <TableCell className="text-end pe-4">
                      <div className="inline-flex items-center gap-1">
                        {product.slug && (
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={isBn ? 'দোকানে দেখুন' : 'View in shop'}
                          >
                            <Link
                              href={`/${lang}/products/${product.slug}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        <Button asChild variant="outline" size="sm" className="gap-1.5">
                          <Link href={`/${lang}/seller/products/${product.id}`}>
                            <Pencil className="h-3.5 w-3.5" />
                            {isBn ? 'সম্পাদনা' : 'Edit'}
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile / tablet cards */}
          <ul className="space-y-3 lg:hidden">
            {products.map((product) => (
              <li key={product.id}>
                <Card className="shadow-none">
                  <CardContent className="space-y-3 p-3">
                    <div className="flex items-start gap-3">
                      <ProductThumb product={product} isBn={isBn} size="lg" />
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground line-clamp-2 text-sm font-semibold">
                          {isBn ? product.nameBn : product.nameEn}
                        </p>
                        <p className="text-muted-foreground mt-0.5 truncate text-xs">
                          {categoryName(product)}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <StatusBadge
                            tone={STOCK_TONE[product.stockState]}
                            label={
                              product.stockState === 'OUT_OF_STOCK'
                                ? isBn
                                  ? 'স্টক শেষ'
                                  : 'Out of stock'
                                : product.stockState === 'LOW'
                                  ? isBn
                                    ? `কম স্টক (${product.quantity})`
                                    : `Low stock (${product.quantity})`
                                  : isBn
                                    ? `স্টক ${product.quantity}`
                                    : `Stock ${product.quantity}`
                            }
                          />
                          {!product.isActive && (
                            <StatusBadge tone="neutral" label={isBn ? 'লুকানো' : 'Hidden'} />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-end justify-between gap-3 border-t pt-3">
                      <div>
                        <p className="text-foreground font-semibold tabular-nums">
                          {formatCurrency(product.effectivePrice)}
                        </p>
                        <p className="text-muted-foreground text-[11px]">
                          {isBn ? 'বিক্রি' : 'Sold'}: {product.totalSold}
                        </p>
                      </div>
                      <Switch
                        checked={product.isActive}
                        onCheckedChange={(checked) => void handleToggleActive(product, checked)}
                        aria-label={
                          isBn ? `${product.nameBn} দৃশ্যমানতা` : `Toggle ${product.nameEn}`
                        }
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Button asChild variant="outline" size="sm" className="flex-1 gap-1.5">
                        <Link href={`/${lang}/seller/products/${product.id}`}>
                          <Pencil className="h-3.5 w-3.5" />
                          {isBn ? 'সম্পাদনা' : 'Edit'}
                        </Link>
                      </Button>
                      {product.slug && (
                        <Button asChild variant="ghost" size="sm" className="gap-1.5">
                          <Link
                            href={`/${lang}/products/${product.slug}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            {isBn ? 'দেখুন' : 'View'}
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>

          <AdminPagination
            totalItems={meta?.total ?? 0}
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

          {isFetching && !isLoading && (
            <p className="text-muted-foreground text-center text-xs">
              {isBn ? 'আপডেট হচ্ছে...' : 'Refreshing…'}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone = 'neutral',
  isLoading,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone?: 'neutral' | 'warning' | 'danger';
  isLoading?: boolean;
}) {
  const toneClass =
    tone === 'warning'
      ? 'text-amber-600 dark:text-amber-400'
      : tone === 'danger'
        ? 'text-destructive'
        : 'text-muted-foreground';

  return (
    <Card className="shadow-none">
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-muted-foreground truncate text-xs">{label}</p>
          {isLoading ? (
            <Skeleton className="mt-1 h-7 w-12" />
          ) : (
            <p className={`text-2xl font-bold tabular-nums ${toneClass}`}>{value}</p>
          )}
        </div>
        <span className={`${toneClass} shrink-0`}>{icon}</span>
      </CardContent>
    </Card>
  );
}

function ProductThumb({
  product,
  isBn,
  size = 'md',
}: {
  product: SellerProduct;
  isBn: boolean;
  size?: 'md' | 'lg';
}) {
  const primary = product.images.find((image) => image.isPrimary) ?? product.images[0];
  const dimension = size === 'lg' ? 'h-16 w-16' : 'h-11 w-11';

  return (
    <div className={`bg-muted relative ${dimension} shrink-0 overflow-hidden rounded-lg`}>
      {primary ? (
        <CustomImage
          src={primary.url}
          alt={isBn ? product.nameBn : product.nameEn}
          fill
          sizes="64px"
          className="object-cover"
        />
      ) : (
        <div className="text-muted-foreground/60 flex h-full w-full items-center justify-center">
          <ImageOff className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  ariaLabel,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-11 w-full rounded-full" aria-label={ariaLabel}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  );
}
