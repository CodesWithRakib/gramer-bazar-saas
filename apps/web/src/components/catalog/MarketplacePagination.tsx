'use client';

import React from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/format';
import { Button, buttonVariants } from '@/components/ui/button';

export interface MarketplacePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  lang: string;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
  className?: string;
  scrollToTop?: boolean;
  buildHref?: (page: number) => string;
}

function getPageRange(
  currentPage: number,
  totalPages: number,
  siblingCount = 1
): (number | 'ellipsis')[] {
  const totalNumbers = siblingCount * 2 + 3; // current + siblings + first + last
  const totalBlocks = totalNumbers + 2; // + 2 ellipses

  if (totalPages <= totalBlocks) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftEllipsis = leftSiblingIndex > 2;
  const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 1;

  if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, 'ellipsis', totalPages];
  }

  if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + i + 1
    );
    return [1, 'ellipsis', ...rightRange];
  }

  if (shouldShowLeftEllipsis && shouldShowRightEllipsis) {
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [1, 'ellipsis', ...middleRange, 'ellipsis', totalPages];
  }

  return Array.from({ length: totalPages }, (_, i) => i + 1);
}

export function MarketplacePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  lang,
  onPageChange,
  onLimitChange,
  limitOptions = [24, 48, 72],
  className,
  scrollToTop = true,
  buildHref,
}: MarketplacePaginationProps) {
  const isBn = lang === 'bn';

  const safeCurrentPage = Math.max(1, Number(currentPage) || 1);
  const safeTotalPages = Math.max(1, Number(totalPages) || 1);
  const safeTotalItems = Math.max(0, Number(totalItems) || 0);
  const safeLimit = Math.max(1, Number(itemsPerPage) || 24);

  if (safeTotalPages <= 1 && safeTotalItems <= safeLimit && !onLimitChange) {
    return null;
  }

  const from = safeTotalItems > 0 ? (safeCurrentPage - 1) * safeLimit + 1 : 0;
  const to = Math.min(safeCurrentPage * safeLimit, safeTotalItems);

  const pages = getPageRange(safeCurrentPage, safeTotalPages, 1);

  const handlePageClick = (e: React.MouseEvent, page: number) => {
    if (page === safeCurrentPage || page < 1 || page > safeTotalPages) {
      e.preventDefault();
      return;
    }
    onPageChange(page);
    if (scrollToTop && typeof window !== 'undefined') {
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-border/60 select-none',
        className
      )}
    >
      {/* Range and Summary Info */}
      <div className="text-xs sm:text-sm text-muted-foreground font-medium order-2 sm:order-1 text-center sm:text-start">
        {safeTotalItems > 0 ? (
          <span>
            {isBn ? (
              <>
                মোট{' '}
                <strong className="text-foreground">{formatNumber(safeTotalItems, lang)}</strong> টি
                পণ্যের মধ্যে{' '}
                <strong className="text-foreground">
                  {formatNumber(from, lang)}–{formatNumber(to, lang)}
                </strong>{' '}
                দেখানো হচ্ছে
              </>
            ) : (
              <>
                Showing{' '}
                <strong className="text-foreground">
                  {from}–{to}
                </strong>{' '}
                of <strong className="text-foreground">{safeTotalItems}</strong> products
              </>
            )}
          </span>
        ) : null}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1 sm:gap-1.5 order-1 sm:order-2 flex-wrap justify-center">
        {/* Jump to First Page (if totalPages > 4) */}
        {safeTotalPages > 4 &&
          (buildHref && safeCurrentPage > 1 ? (
            <Link
              href={buildHref(1)}
              onClick={(e) => handlePageClick(e, 1)}
              className={cn(
                buttonVariants({ variant: 'outline', size: 'icon' }),
                'h-9 w-9 rounded-xl border-border/80 hover:bg-muted hidden sm:inline-flex'
              )}
              aria-label={isBn ? 'প্রথম পৃষ্ঠা' : 'First page'}
              title={isBn ? 'প্রথম পৃষ্ঠা' : 'First page'}
            >
              <ChevronsLeft className="h-4 w-4 rtl:rotate-180" />
            </Link>
          ) : (
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => handlePageClick(e, 1)}
              disabled={safeCurrentPage <= 1}
              className="h-9 w-9 rounded-xl border-border/80 hover:bg-muted hidden sm:inline-flex"
              aria-label={isBn ? 'প্রথম পৃষ্ঠা' : 'First page'}
              title={isBn ? 'প্রথম পৃষ্ঠা' : 'First page'}
            >
              <ChevronsLeft className="h-4 w-4 rtl:rotate-180" />
            </Button>
          ))}

        {/* Previous Button */}
        {buildHref && safeCurrentPage > 1 ? (
          <Link
            href={buildHref(safeCurrentPage - 1)}
            onClick={(e) => handlePageClick(e, safeCurrentPage - 1)}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'h-9 px-2.5 sm:px-3 text-xs sm:text-sm font-semibold rounded-xl border-border/80 hover:bg-muted gap-1 shadow-2xs'
            )}
            aria-label={isBn ? 'আগের পৃষ্ঠা' : 'Previous page'}
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            <span className="hidden xs:inline">{isBn ? 'আগেরটি' : 'Prev'}</span>
          </Link>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => handlePageClick(e, safeCurrentPage - 1)}
            disabled={safeCurrentPage <= 1}
            className="h-9 px-2.5 sm:px-3 text-xs sm:text-sm font-semibold rounded-xl border-border/80 hover:bg-muted gap-1 shadow-2xs"
            aria-label={isBn ? 'আগের পৃষ্ঠা' : 'Previous page'}
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            <span className="hidden xs:inline">{isBn ? 'আগেরটি' : 'Prev'}</span>
          </Button>
        )}

        {/* Numbered Page Buttons */}
        <div className="flex items-center gap-1">
          {pages.map((item, idx) => {
            if (item === 'ellipsis') {
              return (
                <div
                  key={`ellipsis-${idx}`}
                  className="h-9 w-7 flex items-center justify-center text-muted-foreground"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              );
            }

            const isActive = Number(item) === safeCurrentPage;

            const buttonStyle = cn(
              'h-9 min-w-9 px-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center shadow-2xs',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-105 pointer-events-none'
                : 'bg-card text-foreground hover:bg-muted border border-border/70 hover:border-border'
            );

            if (buildHref && !isActive) {
              return (
                <Link
                  key={item}
                  href={buildHref(item)}
                  onClick={(e) => handlePageClick(e, item)}
                  aria-current={isActive ? 'page' : undefined}
                  className={buttonStyle}
                >
                  {formatNumber(item, lang)}
                </Link>
              );
            }

            return (
              <button
                key={item}
                type="button"
                onClick={(e) => handlePageClick(e, item)}
                aria-current={isActive ? 'page' : undefined}
                className={buttonStyle}
              >
                {formatNumber(item, lang)}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        {buildHref && safeCurrentPage < safeTotalPages ? (
          <Link
            href={buildHref(safeCurrentPage + 1)}
            onClick={(e) => handlePageClick(e, safeCurrentPage + 1)}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'h-9 px-2.5 sm:px-3 text-xs sm:text-sm font-semibold rounded-xl border-border/80 hover:bg-muted gap-1 shadow-2xs'
            )}
            aria-label={isBn ? 'পরের পৃষ্ঠা' : 'Next page'}
          >
            <span className="hidden xs:inline">{isBn ? 'পরেরটি' : 'Next'}</span>
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => handlePageClick(e, safeCurrentPage + 1)}
            disabled={safeCurrentPage >= safeTotalPages}
            className="h-9 px-2.5 sm:px-3 text-xs sm:text-sm font-semibold rounded-xl border-border/80 hover:bg-muted gap-1 shadow-2xs"
            aria-label={isBn ? 'পরের পৃষ্ঠা' : 'Next page'}
          >
            <span className="hidden xs:inline">{isBn ? 'পরেরটি' : 'Next'}</span>
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        )}

        {/* Jump to Last Page (if totalPages > 4) */}
        {safeTotalPages > 4 &&
          (buildHref && safeCurrentPage < safeTotalPages ? (
            <Link
              href={buildHref(safeTotalPages)}
              onClick={(e) => handlePageClick(e, safeTotalPages)}
              className={cn(
                buttonVariants({ variant: 'outline', size: 'icon' }),
                'h-9 w-9 rounded-xl border-border/80 hover:bg-muted hidden sm:inline-flex'
              )}
              aria-label={isBn ? 'শেষ পৃষ্ঠা' : 'Last page'}
              title={isBn ? 'শেষ পৃষ্ঠা' : 'Last page'}
            >
              <ChevronsRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          ) : (
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => handlePageClick(e, safeTotalPages)}
              disabled={safeCurrentPage >= safeTotalPages}
              className="h-9 w-9 rounded-xl border-border/80 hover:bg-muted hidden sm:inline-flex"
              aria-label={isBn ? 'শেষ পৃষ্ঠা' : 'Last page'}
              title={isBn ? 'শেষ পৃষ্ঠা' : 'Last page'}
            >
              <ChevronsRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          ))}
      </div>

      {/* Items Per Page Selector */}
      {onLimitChange && safeTotalItems > 12 && (
        <div className="flex items-center gap-2 order-3 text-xs text-muted-foreground font-medium">
          <span className="hidden lg:inline">{isBn ? 'প্রতি পৃষ্ঠায়:' : 'Per page:'}</span>
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60">
            {limitOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onLimitChange(opt)}
                className={cn(
                  'px-2 py-1 rounded-lg text-xs font-semibold transition-all',
                  safeLimit === opt
                    ? 'bg-background text-foreground shadow-2xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {formatNumber(opt, lang)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
