'use client';

import React, { useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  useGetPublicCategoryTreeQuery,
  useGetCatalogFacetsQuery,
  Category,
} from '@/features/catalog/catalogApi';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Filter, ChevronDown, Layers, RotateCcw, Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductFilterSidebarProps {
  lang: string;
  isMobile?: boolean;
  categorySlug?: string;
  subCategorySlug?: string;
  categoryId?: string;
  categoryPath?: string;
}

interface AttributeFilterMap {
  [slug: string]: string[];
}

export function ProductFilterSidebar({
  lang,
  isMobile = false,
  categorySlug,
  categoryId,
  categoryPath,
}: ProductFilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isBn = lang === 'bn';

  const { data: tree = [] } = useGetPublicCategoryTreeQuery();

  const pathParts = pathname.includes('/categories/')
    ? pathname.split('/categories/')[1]?.split('/') || []
    : [];
  const effectiveCategorySlug = categorySlug || pathParts[0]?.split('?')[0] || '';

  // Resolve category id/path from the tree when not passed explicitly.
  let currentCategory: Category | null = null;
  if (effectiveCategorySlug && tree.length > 0) {
    const stack = [...tree];
    while (stack.length > 0 && !currentCategory) {
      const node = stack.shift()!;
      if (node.slug === effectiveCategorySlug) currentCategory = node;
      else stack.push(...(node.children ?? []));
    }
  }
  const effectiveCategoryId = categoryId || currentCategory?.id;
  const effectiveCategoryPath =
    categoryPath || currentCategory?.path || undefined;

  const currentBrandId = searchParams.get('brandId') || '';
  const productTypeId = searchParams.get('productTypeId') || undefined;
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const inStock = searchParams.get('inStock') === 'true';
  const minRating = searchParams.get('minRating') || '';
  const attributesParam = searchParams.get('attributes') || '';

  let attributeFilters: AttributeFilterMap = {};
  if (attributesParam) {
    try {
      attributeFilters = JSON.parse(attributesParam) as AttributeFilterMap;
    } catch {
      attributeFilters = {};
    }
  }

  const { data: facets, isFetching: isFacetsLoading } = useGetCatalogFacetsQuery(
    {
      categoryId: effectiveCategoryId,
      categoryPath: effectiveCategoryId ? undefined : effectiveCategoryPath,
      productTypeId,
      brandId: currentBrandId || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      inStock: inStock || undefined,
      attributes: attributesParam || undefined,
    },
    { skip: !effectiveCategoryId && !effectiveCategoryPath }
  );

  const hasActiveFilters = Boolean(
    minPrice ||
    maxPrice ||
    currentBrandId ||
    inStock ||
    minRating ||
    productTypeId ||
    Object.keys(attributeFilters).length > 0
  );

  const updateParam = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, val]) => {
        if (val === null || val === '') {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      });
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    ['minPrice', 'maxPrice', 'brandId', 'inStock', 'minRating', 'page', 'attributes'].forEach(
      (key) => params.delete(key)
    );
    router.push(`${pathname}?${params.toString()}`);
  };

  // ---- price ----------------------------------------------------------------
  const [localMin, setLocalMin] = React.useState(minPrice);
  const [localMax, setLocalMax] = React.useState(maxPrice);
  const [prevPriceRange, setPrevPriceRange] = React.useState({ min: minPrice, max: maxPrice });
  if (prevPriceRange.min !== minPrice || prevPriceRange.max !== maxPrice) {
    setPrevPriceRange({ min: minPrice, max: maxPrice });
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
  }

  const applyCustomPrice = () => {
    updateParam({
      minPrice: localMin && Number(localMin) >= 0 ? localMin : null,
      maxPrice: localMax && Number(localMax) > 0 ? localMax : null,
    });
  };

  // ---- attribute + brand toggles -------------------------------------------
  const toggleAttribute = (slug: string, value: string) => {
    const next: AttributeFilterMap = { ...attributeFilters };
    const current = next[slug] ?? [];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    if (updated.length === 0) delete next[slug];
    else next[slug] = updated;
    const serialized = Object.keys(next).length > 0 ? JSON.stringify(next) : null;
    updateParam({ attributes: serialized });
  };

  const toggleBrand = (brandId: string) => {
    updateParam({ brandId: currentBrandId === brandId ? null : brandId });
  };

  const handleRatingFilter = (rating: string) => {
    updateParam({ minRating: minRating === rating ? null : rating });
  };

  const FilterContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-border/70">
        <h3 className="font-bold text-sm md:text-base flex items-center gap-2 text-foreground">
          <Filter className="h-4 w-4 text-primary" />
          <span>{isBn ? 'ফিল্টার' : 'Filters'}</span>
          {isFacetsLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-destructive h-7 px-2 flex items-center gap-1 font-semibold"
          >
            <RotateCcw className="h-3 w-3" />
            <span>{isBn ? 'রিসেট' : 'Reset'}</span>
          </Button>
        )}
      </div>

      {/* Current category + quick switch */}
      {currentCategory ? (
        <div className="space-y-3">
          <div className="bg-primary/5 rounded-2xl p-3 border border-primary/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-2xl flex-shrink-0">{currentCategory.icon || '📦'}</span>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">
                  {isBn ? 'বর্তমান ক্যাটাগরি' : 'Current Category'}
                </span>
                <span className="font-bold text-sm text-foreground truncate block">
                  {isBn ? currentCategory.nameBn : currentCategory.nameEn}
                </span>
              </div>
            </div>
            {currentCategory.productCount !== undefined && currentCategory.productCount > 0 && (
              <span className="text-xs font-bold text-primary px-2 py-0.5 rounded-full bg-primary/15 shrink-0">
                {currentCategory.productCount}
              </span>
            )}
          </div>
          <details className="group">
            <summary className="cursor-pointer text-xs font-semibold text-muted-foreground flex items-center justify-between py-1.5 hover:text-foreground select-none">
              <span className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{isBn ? 'অন্যান্য ক্যাটাগরি দেখুন' : 'Browse Other Categories'}</span>
              </span>
              <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
            </summary>
            <div className="space-y-1 mt-2 max-h-48 overflow-y-auto pe-1">
              {tree
                ?.filter((c) => c.slug !== currentCategory?.slug)
                .map((other) => (
                  <Link
                    key={other.id}
                    href={`/${lang}/categories/${other.slug}`}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span>{other.icon || '📦'}</span>
                      <span className="truncate">{isBn ? other.nameBn : other.nameEn}</span>
                    </div>
                    {other.productCount !== undefined && other.productCount > 0 && (
                      <span className="text-[10px] text-muted-foreground/80 font-bold">
                        ({other.productCount})
                      </span>
                    )}
                  </Link>
                ))}
            </div>
          </details>
        </div>
      ) : (
        <div className="space-y-2">
          <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">
            {isBn ? 'ক্যাটাগরি' : 'Categories'}
          </h4>
          <div className="space-y-1 max-h-60 overflow-y-auto pe-1">
            {tree.map((cat) => (
              <Link
                key={cat.id}
                href={`/${lang}/categories/${cat.slug}`}
                className="flex items-center justify-between py-1.5 px-2.5 rounded-xl hover:bg-muted/60 text-foreground transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base shrink-0">{cat.icon || '📦'}</span>
                  <span className="text-xs md:text-sm truncate">
                    {isBn ? cat.nameBn : cat.nameEn}
                  </span>
                </div>
                {cat.productCount !== undefined && (
                  <span className="text-[11px] font-semibold text-muted-foreground px-1.5">
                    {cat.productCount}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Availability */}
      <div className="pt-3 border-t border-border/60">
        <div
          role="button"
          tabIndex={0}
          onClick={() => updateParam({ inStock: inStock ? null : 'true' })}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') updateParam({ inStock: inStock ? null : 'true' });
          }}
          className={cn(
            'flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors select-none border',
            inStock
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700'
              : 'bg-card border-border/70 hover:bg-muted/50 text-foreground'
          )}
        >
          <div className="flex items-center gap-2.5">
            <Checkbox
              checked={inStock}
              className="pointer-events-none data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
            />
            <span className="text-xs font-semibold">
              {isBn ? 'শুধুমাত্র স্টকে থাকা পণ্য' : 'In Stock Only'}
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic attribute groups from the product type schema */}
      {facets && facets.groups.length > 0 && (
        <div className="space-y-5">
          {facets.groups.map((group) => {
            const selected = attributeFilters[group.slug] ?? [];
            return (
              <div key={group.attributeId} className="space-y-2 pt-3 border-t border-border/60">
                <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">
                  {isBn ? group.nameBn : group.nameEn}
                </h4>
                {group.options.length > 0 && (
                  <div className="space-y-1 max-h-44 overflow-y-auto pe-1">
                    {group.options.map((option) => {
                      const isSelected = selected.includes(option.slug);
                      return (
                        <div
                          key={option.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleAttribute(group.slug, option.slug)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ')
                              toggleAttribute(group.slug, option.slug);
                          }}
                          className={cn(
                            'flex items-center justify-between py-1.5 px-2.5 rounded-xl cursor-pointer transition-colors select-none',
                            isSelected
                              ? 'bg-primary/10 font-bold text-primary'
                              : 'hover:bg-muted/60 text-foreground'
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Checkbox
                              checked={isSelected}
                              className="pointer-events-none data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            {option.hexColor ? (
                              <span
                                aria-hidden
                                className="size-4 rounded-full border border-border shrink-0"
                                style={{ backgroundColor: option.hexColor }}
                              />
                            ) : null}
                            <span className="text-xs md:text-sm truncate">
                              {isBn && option.valueBn ? option.valueBn : option.value}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground/80 font-bold">
                            {option.count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* Numeric attribute range (e.g. Cores, Refresh Rate) */}
                {group.options.length === 0 && group.min !== undefined && (
                  <p className="text-[11px] text-muted-foreground">
                    {isBn ? 'পরিসীমা' : 'Range'}: {group.min}
                    {group.unit ? ` ${group.unit}` : ''} – {group.max}
                    {group.unit ? ` ${group.unit}` : ''}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Price */}
      <div className="space-y-3 pt-3 border-t border-border/60">
        <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">
          {isBn ? 'মূল্যের পরিসীমা (৳)' : 'Price Range (৳)'}
        </h4>
        <div className="flex items-center gap-2 pt-1">
          <Input
            type="number"
            placeholder={isBn ? 'সর্বনিম্ন' : 'Min'}
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            className="h-8 text-xs rounded-lg"
          />
          <span className="text-muted-foreground text-xs font-bold">-</span>
          <Input
            type="number"
            placeholder={isBn ? 'সর্বোচ্চ' : 'Max'}
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            className="h-8 text-xs rounded-lg"
          />
        </div>
        <Button
          onClick={applyCustomPrice}
          size="sm"
          className="w-full h-8 text-xs font-semibold rounded-lg shadow-xs"
        >
          {isBn ? 'প্রয়োগ করুন' : 'Apply'}
        </Button>
      </div>

      {/* Brand facet */}
      {facets && facets.brands.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-border/60">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">
              {isBn ? 'ব্র্যান্ড' : 'Brands'}
            </h4>
            {currentBrandId && (
              <button
                type="button"
                onClick={() => toggleBrand(currentBrandId)}
                className="text-[11px] text-primary hover:underline font-semibold"
              >
                {isBn ? 'মুছুন' : 'Clear'}
              </button>
            )}
          </div>
          <div className="space-y-1 max-h-44 overflow-y-auto pe-1">
            {facets.brands.map((brand) => {
              const isSelected = currentBrandId === brand.id;
              return (
                <div
                  key={brand.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleBrand(brand.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') toggleBrand(brand.id);
                  }}
                  className={cn(
                    'flex items-center justify-between py-1.5 px-2.5 rounded-xl cursor-pointer transition-colors select-none',
                    isSelected
                      ? 'bg-primary/10 font-bold text-primary'
                      : 'hover:bg-muted/60 text-foreground'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Checkbox
                      checked={isSelected}
                      className="pointer-events-none data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <span className="text-xs md:text-sm truncate">
                      {isBn ? brand.nameBn : brand.nameEn}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground/80 font-bold">
                    {brand.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rating */}
      <div className="space-y-2 pt-3 border-t border-border/60">
        <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">
          {isBn ? 'গ্রাহক রেটিং' : 'Customer Rating'}
        </h4>
        <div className="space-y-1">
          {['4', '3'].map((rate) => {
            const isSelected = minRating === rate;
            return (
              <div
                key={rate}
                role="button"
                tabIndex={0}
                onClick={() => handleRatingFilter(rate)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleRatingFilter(rate);
                }}
                className={cn(
                  'flex items-center justify-between py-1.5 px-2.5 rounded-xl cursor-pointer transition-colors select-none',
                  isSelected
                    ? 'bg-primary/10 font-bold text-primary'
                    : 'hover:bg-muted/60 text-foreground'
                )}
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isSelected}
                    className="pointer-events-none data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          'h-3 w-3',
                          star <= Number(rate) ? 'fill-current' : 'text-muted-foreground/30'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground ms-1">
                    {isBn ? `ও তদূর্ধ্ব` : `& above`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2 h-9 rounded-xl">
            <Filter className="h-4 w-4" />
            <span>{isBn ? 'ফিল্টার' : 'Filters'}</span>
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary" />}
          </Button>
        </SheetTrigger>
        <SheetContent
          side={isBn ? 'right' : 'left'}
          className="w-[85vw] max-w-[320px] overflow-y-auto p-5"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{isBn ? 'পণ্য ফিল্টার' : 'Product Filters'}</SheetTitle>
          </SheetHeader>
          <div className="mt-2">{FilterContent}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="w-full bg-card border border-border/80 rounded-3xl p-4 shadow-xs">
      {FilterContent}
    </aside>
  );
}
