"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  useGetPublicCategoryTreeQuery,
  useGetPublicBrandsQuery,
  Category,
} from "@/features/catalog/catalogApi";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Filter, ChevronDown, Layers, RotateCcw, Star, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductFilterSidebarProps {
  lang: string;
  isMobile?: boolean;
  categorySlug?: string;
  subCategorySlug?: string;
}

export function ProductFilterSidebar({
  lang,
  isMobile = false,
  categorySlug,
  subCategorySlug,
}: ProductFilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isBn = lang === "bn";

  const { data: tree = [] } = useGetPublicCategoryTreeQuery();
  const { data: brands = [] } = useGetPublicBrandsQuery();

  // Auto-detect current category & subcategory from props, query params, or pathname
  const pathParts = pathname.includes("/categories/")
    ? pathname.split("/categories/")[1]?.split("/") || []
    : [];
  const querySubCategory = searchParams.get("subCategory") || searchParams.get("subCategorySlug") || "";
  const effectiveCategorySlug = categorySlug || pathParts[0]?.split("?")[0] || "";
  const effectiveSubCategorySlug = subCategorySlug || querySubCategory || pathParts[1]?.split("?")[0] || "";

  // Query parameter filters
  const currentBrandId = searchParams.get("brandId") || "";
  const currentCategorySlugParam = searchParams.get("categorySlug") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const inStock = searchParams.get("inStock") === "true";
  const minRating = searchParams.get("minRating") || "";

  // Local state for price inputs
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);
  const [prevPriceRange, setPrevPriceRange] = useState({ min: minPrice, max: maxPrice });

  if (prevPriceRange.min !== minPrice || prevPriceRange.max !== maxPrice) {
    setPrevPriceRange({ min: minPrice, max: maxPrice });
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
  }

  // Robust category resolution
  let currentCategory: Category | null = null;
  if (effectiveCategorySlug && tree.length > 0) {
    for (const root of tree) {
      if (root.slug === effectiveCategorySlug) {
        currentCategory = root;
        break;
      }
      const child = root.children?.find((c) => c.slug === effectiveCategorySlug);
      if (child) {
        currentCategory = root;
        break;
      }
    }
  }

  const hasActiveFilters = Boolean(
    minPrice ||
    maxPrice ||
    currentBrandId ||
    inStock ||
    minRating ||
    (!effectiveCategorySlug && currentCategorySlugParam)
  );

  const updateParam = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("minPrice");
    params.delete("maxPrice");
    params.delete("brandId");
    params.delete("inStock");
    params.delete("minRating");
    params.delete("page");
    if (!effectiveCategorySlug) {
      params.delete("categorySlug");
      params.delete("categoryId");
    }
    setLocalMin("");
    setLocalMax("");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePricePreset = (min: string, max: string) => {
    setLocalMin(min);
    setLocalMax(max);
    updateParam({ minPrice: min || null, maxPrice: max || null });
  };

  const applyCustomPrice = () => {
    updateParam({
      minPrice: localMin && Number(localMin) >= 0 ? localMin : null,
      maxPrice: localMax && Number(localMax) > 0 ? localMax : null,
    });
  };

  const handleBrandChange = (brandId: string) => {
    updateParam({ brandId: currentBrandId === brandId ? null : brandId });
  };

  const handleInStockToggle = () => {
    updateParam({ inStock: inStock ? null : "true" });
  };

  const handleRatingFilter = (rating: string) => {
    updateParam({ minRating: minRating === rating ? null : rating });
  };

  const handleSearchCategoryToggle = (catSlug: string) => {
    updateParam({ categorySlug: currentCategorySlugParam === catSlug ? null : catSlug });
  };

  const pricePresets = [
    { label: isBn ? "৳১০০ এর নিচে" : "Under ৳100", min: "", max: "100" },
    { label: isBn ? "৳১০০ - ৳৫০০" : "৳100 - ৳500", min: "100", max: "500" },
    { label: isBn ? "৳৫০০ - ৳১,০০০" : "৳500 - ৳1,000", min: "500", max: "1000" },
    { label: isBn ? "৳১,০০০ এর উপরে" : "Above ৳1,000", min: "1000", max: "" },
  ];

  const FilterContent = (
    <div className="space-y-6">
      {/* 1. Header with Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-border/70">
        <h3 className="font-bold text-sm md:text-base flex items-center gap-2 text-foreground">
          <Filter className="h-4 w-4 text-primary" />
          <span>{isBn ? "ফিল্টার" : "Filters"}</span>
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-destructive h-7 px-2 flex items-center gap-1 font-semibold"
          >
            <RotateCcw className="h-3 w-3" />
            <span>{isBn ? "রিসেট" : "Reset"}</span>
          </Button>
        )}
      </div>

      {/* 2. Category / Department Context */}
      {currentCategory ? (
        /* Inside Category: Show Active Category Card with Clean Switcher (NO DUPLICATE SUBCATEGORY PILLS) */
        <div className="space-y-3">
          <div className="bg-primary/5 rounded-2xl p-3 border border-primary/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-2xl flex-shrink-0">{currentCategory.icon || "🥬"}</span>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">
                  {isBn ? "বর্তমান ক্যাটাগরি" : "Current Category"}
                </span>
                <span className="font-bold text-sm text-foreground truncate block">
                  {isBn ? currentCategory.nameBn : currentCategory.nameEn}
                </span>
              </div>
            </div>
            {currentCategory.productCount !== undefined && currentCategory.productCount > 0 && (
              <span className="text-xs font-bold text-primary px-2 py-0.5 rounded-full bg-primary/15 shrink-0">
                {currentCategory.productCount} {isBn ? "টি" : ""}
              </span>
            )}
          </div>

          {/* Quick Switch to Other Departments Accordion */}
          <details className="group">
            <summary className="cursor-pointer text-xs font-semibold text-muted-foreground flex items-center justify-between py-1.5 hover:text-foreground select-none">
              <span className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{isBn ? "অন্যান্য ক্যাটাগরি দেখুন" : "Browse Other Categories"}</span>
              </span>
              <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
            </summary>
            <div className="space-y-1 mt-2 max-h-48 overflow-y-auto pr-1">
              {tree
                ?.filter((c) => c.slug !== currentCategory?.slug)
                .map((other) => (
                  <Link
                    key={other.id}
                    href={`/${lang}/categories/${other.slug}`}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span>{other.icon || "📦"}</span>
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
        /* On Search / General Page: Show Root Categories */
        <div className="space-y-2">
          <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">
            {isBn ? "ক্যাটাগরি" : "Categories"}
          </h4>
          <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleSearchCategoryToggle("")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleSearchCategoryToggle("");
              }}
              className={cn(
                "flex items-center justify-between py-1.5 px-2.5 rounded-xl cursor-pointer transition-colors select-none",
                !currentCategorySlugParam ? "bg-primary/10 font-bold text-primary" : "hover:bg-muted/60 text-foreground"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Checkbox
                  checked={!currentCategorySlugParam}
                  className="pointer-events-none data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-xs md:text-sm truncate">
                  {isBn ? "সকল ক্যাটাগরি" : "All Categories"}
                </span>
              </div>
            </div>

            {tree.map((cat) => {
              const isSelected = currentCategorySlugParam === cat.slug;
              return (
                <div
                  key={cat.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSearchCategoryToggle(cat.slug)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleSearchCategoryToggle(cat.slug);
                  }}
                  className={cn(
                    "flex items-center justify-between py-1.5 px-2.5 rounded-xl cursor-pointer transition-colors select-none",
                    isSelected ? "bg-primary/10 font-bold text-primary" : "hover:bg-muted/60 text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Checkbox
                      checked={isSelected}
                      className="pointer-events-none data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <span className="text-base shrink-0">{cat.icon || "📦"}</span>
                    <span className="text-xs md:text-sm truncate">
                      {isBn ? cat.nameBn : cat.nameEn}
                    </span>
                  </div>
                  {cat.productCount !== undefined && (
                    <span className="text-[11px] font-semibold text-muted-foreground px-1.5">
                      {cat.productCount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Availability Filter (In Stock Only) */}
      <div className="pt-3 border-t border-border/60">
        <div
          role="button"
          tabIndex={0}
          onClick={handleInStockToggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleInStockToggle();
          }}
          className={cn(
            "flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors select-none border",
            inStock ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700" : "bg-card border-border/70 hover:bg-muted/50 text-foreground"
          )}
        >
          <div className="flex items-center gap-2.5">
            <Checkbox
              checked={inStock}
              className="pointer-events-none data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
            />
            <span className="text-xs font-semibold">
              {isBn ? "শুধুমাত্র স্টকে থাকা পণ্য" : "In Stock Only"}
            </span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        </div>
      </div>

      {/* 4. Price Range Filter with Quick Presets */}
      <div className="space-y-3 pt-3 border-t border-border/60">
        <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">
          {isBn ? "মূল্যের পরিসীমা (৳)" : "Price Range (৳)"}
        </h4>

        {/* Quick Preset Chips */}
        <div className="grid grid-cols-2 gap-1.5">
          {pricePresets.map((preset, idx) => {
            const isPresetActive = minPrice === preset.min && maxPrice === preset.max;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handlePricePreset(preset.min, preset.max)}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all border text-center",
                  isPresetActive
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border/60"
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Custom Min / Max Inputs */}
        <div className="flex items-center gap-2 pt-1">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
              ৳
            </span>
            <Input
              type="number"
              placeholder={isBn ? "সর্বনিম্ন" : "Min"}
              value={localMin}
              onChange={(e) => setLocalMin(e.target.value)}
              className="h-8 text-xs pl-6 rounded-lg"
            />
          </div>
          <span className="text-muted-foreground text-xs font-bold">-</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
              ৳
            </span>
            <Input
              type="number"
              placeholder={isBn ? "সর্বোচ্চ" : "Max"}
              value={localMax}
              onChange={(e) => setLocalMax(e.target.value)}
              className="h-8 text-xs pl-6 rounded-lg"
            />
          </div>
        </div>

        <Button
          onClick={applyCustomPrice}
          size="sm"
          className="w-full h-8 text-xs font-semibold rounded-lg shadow-xs"
        >
          {isBn ? "প্রয়োগ করুন" : "Apply"}
        </Button>
      </div>

      {/* 5. Brand Filter Section */}
      {brands.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-border/60">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">
              {isBn ? "ব্র্যান্ড" : "Brands"}
            </h4>
            {currentBrandId && (
              <button
                type="button"
                onClick={() => handleBrandChange(currentBrandId)}
                className="text-[11px] text-primary hover:underline font-semibold"
              >
                {isBn ? "মুছুন" : "Clear"}
              </button>
            )}
          </div>

          <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
            {brands.map((brand) => {
              const isSelected = currentBrandId === brand.id;
              return (
                <div
                  key={brand.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleBrandChange(brand.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleBrandChange(brand.id);
                  }}
                  className={cn(
                    "flex items-center justify-between py-1.5 px-2.5 rounded-xl cursor-pointer transition-colors select-none",
                    isSelected ? "bg-primary/10 font-bold text-primary" : "hover:bg-muted/60 text-foreground"
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
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Rating Filter Section */}
      <div className="space-y-2 pt-3 border-t border-border/60">
        <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">
          {isBn ? "গ্রাহক রেটিং" : "Customer Rating"}
        </h4>
        <div className="space-y-1">
          {["4", "3"].map((rate) => {
            const isSelected = minRating === rate;
            return (
              <div
                key={rate}
                role="button"
                tabIndex={0}
                onClick={() => handleRatingFilter(rate)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleRatingFilter(rate);
                }}
                className={cn(
                  "flex items-center justify-between py-1.5 px-2.5 rounded-xl cursor-pointer transition-colors select-none",
                  isSelected ? "bg-primary/10 font-bold text-primary" : "hover:bg-muted/60 text-foreground"
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
                          "h-3 w-3",
                          star <= Number(rate) ? "fill-current" : "text-muted-foreground/30"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground ml-1">
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
            <span>{isBn ? "ফিল্টার" : "Filters"}</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-primary" />
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[85vw] max-w-[320px] p-5 overflow-y-auto">
          <SheetHeader className="sr-only">
            <SheetTitle>{isBn ? "পণ্য ফিল্টার" : "Product Filters"}</SheetTitle>
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
