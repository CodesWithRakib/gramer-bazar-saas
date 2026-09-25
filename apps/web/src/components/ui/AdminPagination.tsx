'use client';

import * as React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface AdminPaginationProps {
  /** Total number of items from API */
  totalItems: number;
  /** Items per page (default: 10) */
  itemsPerPage?: number;
  /** Current page number (optional, if controlled by parent) */
  currentPage?: number;
  /** Number of sibling pages to show on each side of current (default: 1) */
  siblingCount?: number;
  /** Current language ('en' | 'bn' | 'ar') */
  lang?: 'ar' | 'en' | 'bn' | string;
  /** Optional extra class name */
  className?: string;
  /** Label for the summary text (e.g., "products", "orders") */
  itemLabel?: { singular: string; plural: string };
  /** Whether to show the rows-per-page / limit selector dropdown (default: true) */
  showLimitSelector?: boolean;
  /** Array of available page size limits (default: [10, 20, 50, 100]) */
  limitOptions?: number[];
  /** Query parameter name for page limit in URL (default: "limit") */
  limitParamName?: string;
  /** Query parameter name for current page in URL (default: "page") */
  pageParamName?: string;
  /** Layout mode: "auto" (responsive side-by-side on wide screens) or "stacked" */
  layout?: 'auto' | 'stacked';
  /** Optional callback fired when the limit changes */
  onLimitChange?: (limit: number) => void;
  /** Optional callback fired when page changes */
  onPageChange?: (page: number) => void;
}

function getPageNumbers(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
): (number | 'ellipsis')[] {
  const totalNumbers = siblingCount * 2 + 5;

  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - 1;

  const pages: (number | 'ellipsis')[] = [];

  pages.push(1);

  if (showLeftEllipsis) {
    pages.push('ellipsis');
  } else {
    for (let i = 2; i < leftSiblingIndex; i++) {
      pages.push(i);
    }
  }

  for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
    if (i !== 1 && i !== totalPages) {
      pages.push(i);
    }
  }

  if (showRightEllipsis) {
    pages.push('ellipsis');
  } else {
    for (let i = rightSiblingIndex + 1; i < totalPages; i++) {
      pages.push(i);
    }
  }

  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

const DEFAULT_LIMIT_OPTIONS = [10, 20, 50, 100];

export function AdminPagination({
  totalItems,
  itemsPerPage = 10,
  currentPage: propCurrentPage,
  siblingCount = 1,
  lang = 'en',
  className,
  itemLabel,
  showLimitSelector = true,
  limitOptions = DEFAULT_LIMIT_OPTIONS,
  limitParamName = 'limit',
  pageParamName = 'page',
  layout = 'auto',
  onLimitChange,
  onPageChange,
}: AdminPaginationProps) {
  const isRtl = lang === 'ar';
  const isBn = lang === 'bn';
  const dir = isRtl ? 'rtl' : 'ltr';
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentLimit = React.useMemo(() => {
    if (onLimitChange && propCurrentPage !== undefined) {
      return itemsPerPage;
    }
    const fromQuery = Number(searchParams?.get(limitParamName));
    return fromQuery > 0 ? fromQuery : itemsPerPage;
  }, [searchParams, limitParamName, itemsPerPage, onLimitChange, propCurrentPage]);

  const activePage = Math.max(
    1,
    propCurrentPage ?? (Number(searchParams?.get(pageParamName)) || 1),
  );
  const totalPages = Math.max(1, Math.ceil(totalItems / currentLimit));
  const safeCurrentPage = Math.min(activePage, totalPages);

  const effectiveLimitOptions = React.useMemo(() => {
    const set = new Set(limitOptions);
    if (currentLimit > 0) {
      set.add(currentLimit);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [limitOptions, currentLimit]);

  const createQueryString = React.useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      return params.toString();
    },
    [searchParams],
  );

  const rawFrom = totalItems === 0 ? 0 : (safeCurrentPage - 1) * currentLimit + 1;
  const to = Math.min(safeCurrentPage * currentLimit, totalItems);
  const from = Math.min(rawFrom, to);

  const goToPage = React.useCallback(
    (page: number) => {
      const clamped = Math.min(Math.max(1, page), totalPages);
      if (clamped === safeCurrentPage) return;

      onPageChange?.(clamped);

      // If purely controlled by onPageChange without URL routing
      if (!searchParams) return;

      const query = createQueryString({
        [pageParamName]: clamped === 1 ? '' : String(clamped),
      });

      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [totalPages, safeCurrentPage, onPageChange, searchParams, createQueryString, pageParamName, router, pathname],
  );

  const handleLimitChange = React.useCallback(
    (value: string) => {
      const newLimit = Number(value);
      if (!newLimit || newLimit === currentLimit) return;

      const newPage = Math.max(1, Math.floor((from - 1) / newLimit) + 1);

      onLimitChange?.(newLimit);
      if (newPage !== safeCurrentPage) {
        onPageChange?.(newPage);
      }

      if (!searchParams) return;

      const query = createQueryString({
        [limitParamName]: String(newLimit),
        [pageParamName]: newPage === 1 ? '' : String(newPage),
      });

      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [currentLimit, from, onLimitChange, safeCurrentPage, onPageChange, searchParams, createQueryString, limitParamName, pageParamName, router, pathname],
  );

  const pages = React.useMemo(
    () => getPageNumbers(safeCurrentPage, totalPages, siblingCount),
    [safeCurrentPage, totalPages, siblingCount],
  );

  if (totalItems === 0) return null;

  const defaultItemLabel = isBn
    ? { singular: 'আইটেম', plural: 'আইটেম' }
    : isRtl
    ? { singular: 'عنصر', plural: 'عناصر' }
    : { singular: 'item', plural: 'items' };

  const label =
    totalItems === 1
      ? (itemLabel?.singular ?? defaultItemLabel.singular)
      : (itemLabel?.plural ?? defaultItemLabel.plural);

  const isStacked = layout === 'stacked';

  return (
    <div
      className={cn(
        'mt-4 flex flex-col gap-3',
        !isStacked && 'xl:flex-row xl:items-center xl:justify-between xl:gap-4',
        className,
      )}
      dir={dir}
    >
      {/* Rows per page & Summary */}
      <div
        className={cn(
          'flex w-full flex-wrap items-center justify-between gap-2.5 text-xs text-gray-500 sm:gap-4 sm:text-sm dark:text-muted-foreground',
          !isStacked && 'xl:w-auto xl:flex-nowrap xl:justify-start',
        )}
      >
        {showLimitSelector && (
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <span className="font-medium whitespace-nowrap text-gray-500 dark:text-muted-foreground">
              <span className="sm:hidden">
                {isBn ? 'প্রতি পৃষ্ঠা:' : isRtl ? 'لكل صفحة:' : 'Rows:'}
              </span>
              <span className="hidden sm:inline">
                {isBn ? 'প্রতি পৃষ্ঠায় সারি:' : isRtl ? 'لكل صفحة:' : 'Rows per page:'}
              </span>
            </span>
            <Select value={String(currentLimit)} onValueChange={handleLimitChange}>
              <SelectTrigger
                className="h-8 w-auto min-w-[76px] rounded-lg border-gray-200 bg-white px-2.5 font-medium text-gray-700 shadow-xs hover:bg-gray-50/80 focus:border-primary focus:ring-1 focus:ring-primary/20 dark:border-border dark:bg-card dark:text-foreground"
                aria-label={isBn ? 'প্রতি পৃষ্ঠায় সংখ্যা' : isRtl ? 'عدد العناصر لكل صفحة' : 'Rows per page'}
              >
                <SelectValue placeholder={String(currentLimit)} />
              </SelectTrigger>
              <SelectContent dir={dir} className="min-w-[76px]">
                {effectiveLimitOptions.map((opt) => (
                  <SelectItem
                    key={opt}
                    value={String(opt)}
                    dir={dir}
                    className="cursor-pointer text-xs font-medium sm:text-sm"
                  >
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showLimitSelector && !isStacked && (
          <div className="hidden h-4 w-px shrink-0 bg-gray-200 dark:bg-border xl:block" aria-hidden />
        )}

        {/* Summary text */}
        <div className="shrink-0 text-xs whitespace-nowrap text-gray-500 dark:text-muted-foreground sm:text-sm">
          {isBn ? (
            <>
              মোট <span className="font-semibold text-gray-900 dark:text-foreground">{totalItems}</span> {label} এর মধ্যে{' '}
              <span className="font-semibold text-gray-900 dark:text-foreground">{from}</span>–
              <span className="font-semibold text-gray-900 dark:text-foreground">{to}</span> দেখানো হচ্ছে
            </>
          ) : isRtl ? (
            <>
              عرض <span className="font-semibold text-gray-800">{from}</span>–
              <span className="font-semibold text-gray-800">{to}</span> من{' '}
              <span className="font-semibold text-gray-800">{totalItems}</span> {label}
            </>
          ) : (
            <>
              Showing <span className="font-semibold text-gray-900 dark:text-foreground">{from}</span>–
              <span className="font-semibold text-gray-900 dark:text-foreground">{to}</span> of{' '}
              <span className="font-semibold text-gray-900 dark:text-foreground">{totalItems}</span> {label}
            </>
          )}
        </div>
      </div>

      {/* Page navigation buttons */}
      <div
        className={cn(
          'flex w-full shrink-0 flex-nowrap items-center justify-center gap-1 sm:gap-1.5',
          !isStacked && 'xl:w-auto xl:justify-end',
        )}
      >
        <Button
          variant="outline"
          size="sm"
          disabled={safeCurrentPage <= 1}
          onClick={() => goToPage(safeCurrentPage - 1)}
          className="h-8 w-8 border-gray-200 p-0 text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:pointer-events-none disabled:opacity-30 dark:border-border dark:text-muted-foreground dark:hover:bg-muted"
          aria-label={isBn ? 'পূর্ববর্তী পৃষ্ঠা' : isRtl ? 'الصفحة السابقة' : 'Previous page'}
        >
          <ChevronLeft className={cn('h-4 w-4', isRtl && 'rotate-180')} />
        </Button>

        {pages.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex h-8 min-w-5 items-center justify-center text-xs tracking-widest text-gray-400 select-none sm:min-w-6"
                aria-hidden
              >
                ...
              </span>
            );
          }

          const isCurrent = safeCurrentPage === page;
          const isOuterSibling = !isCurrent && page !== 1 && page !== totalPages && pages.length >= 7;

          return (
            <Button
              key={page}
              variant={isCurrent ? 'default' : 'outline'}
              size="sm"
              onClick={() => goToPage(page as number)}
              className={cn(
                'h-8 min-w-8 px-1.5 text-xs font-medium tabular-nums transition-colors sm:px-2 sm:text-sm',
                isOuterSibling && 'hidden sm:inline-flex',
                isCurrent
                  ? 'bg-primary hover:bg-primary/90 border-primary font-semibold text-white shadow-xs'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-border dark:text-muted-foreground dark:hover:bg-muted',
              )}
              aria-current={isCurrent ? 'page' : undefined}
            >
              {page}
            </Button>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          disabled={safeCurrentPage >= totalPages}
          onClick={() => goToPage(safeCurrentPage + 1)}
          className="h-8 w-8 border-gray-200 p-0 text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:pointer-events-none disabled:opacity-30 dark:border-border dark:text-muted-foreground dark:hover:bg-muted"
          aria-label={isBn ? 'পরবর্তী পৃষ্ঠা' : isRtl ? 'الصفحة التالية' : 'Next page'}
        >
          <ChevronRight className={cn('h-4 w-4', isRtl && 'rotate-180')} />
        </Button>
      </div>
    </div>
  );
}

export default AdminPagination;
