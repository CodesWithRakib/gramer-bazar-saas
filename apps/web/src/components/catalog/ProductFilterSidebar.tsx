"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useGetPublicCategoriesQuery, useGetPublicBrandsQuery } from "@/features/catalog/catalogApi";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter, X } from "lucide-react";

interface ProductFilterSidebarProps {
  lang: string;
  isMobile?: boolean;
}

export function ProductFilterSidebar({ lang, isMobile = false }: ProductFilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isBn = lang === "bn";

  const { data: categories } = useGetPublicCategoriesQuery();
  const { data: brands } = useGetPublicBrandsQuery();

  const currentCategoryId = searchParams.get("categoryId") || "";
  const currentBrandId = searchParams.get("brandId") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  
  // Local state for price inputs so it doesn't jump on every keystroke
  const [localMin, setLocalMin] = React.useState(minPrice);
  const [localMax, setLocalMax] = React.useState(maxPrice);

  const [prevPriceRange, setPrevPriceRange] = React.useState({
    min: minPrice,
    max: maxPrice,
  });
  if (prevPriceRange.min !== minPrice || prevPriceRange.max !== maxPrice) {
    setPrevPriceRange({ min: minPrice, max: maxPrice });
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
  }

  const updateUrl = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // reset page when filtering
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (localMin) params.set("minPrice", localMin);
    else params.delete("minPrice");
    
    if (localMax) params.set("maxPrice", localMax);
    else params.delete("maxPrice");
    
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    // Keep search query if it exists
    const q = searchParams.get("q");
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasActiveFilters = currentCategoryId || minPrice || maxPrice;

  const FilterContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Filter className="h-5 w-5" />
          {isBn ? "ফিল্টার" : "Filters"}
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground h-8 px-2"
          >
            {isBn ? "রিসেট" : "Reset"}
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-sm">
          {isBn ? "ক্যাটাগরি" : "Categories"}
        </h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="cat-all"
              checked={!currentCategoryId}
              onCheckedChange={() => updateUrl("categoryId", "")}
            />
            <label htmlFor="cat-all" className="text-sm cursor-pointer select-none">
              {isBn ? "সব ক্যাটাগরি" : "All Categories"}
            </label>
          </div>
          {categories?.map((cat) => (
            <div key={cat.id} className="flex items-center space-x-2">
              <Checkbox
                id={`cat-${cat.id}`}
                checked={currentCategoryId === cat.id}
                onCheckedChange={(checked) =>
                  checked ? updateUrl("categoryId", cat.id) : updateUrl("categoryId", "")
                }
              />
              <label
                htmlFor={`cat-${cat.id}`}
                className="text-sm cursor-pointer line-clamp-1 select-none"
              >
                {isBn ? cat.nameBn : cat.nameEn}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-sm">
          {isBn ? "ব্র্যান্ড" : "Brands"}
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="brand-all"
              checked={!currentBrandId}
              onCheckedChange={() => updateUrl("brandId", "")}
            />
            <label htmlFor="brand-all" className="text-sm cursor-pointer select-none">
              {isBn ? "সব ব্র্যান্ড" : "All Brands"}
            </label>
          </div>
          {brands?.map((brand) => (
            <div key={brand.id} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand.id}`}
                checked={currentBrandId === brand.id}
                onCheckedChange={(checked) =>
                  checked ? updateUrl("brandId", brand.id) : updateUrl("brandId", "")
                }
              />
              <label
                htmlFor={`brand-${brand.id}`}
                className="text-sm cursor-pointer line-clamp-1 select-none"
              >
                {isBn ? brand.nameBn : brand.nameEn}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-sm">
          {isBn ? "দামের সীমা (৳)" : "Price Range (৳)"}
        </h4>
        <div className="flex items-center gap-2">
          <Input 
            type="number" 
            placeholder="Min" 
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            className="h-9"
          />
          <span className="text-muted-foreground">-</span>
          <Input 
            type="number" 
            placeholder="Max" 
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            className="h-9"
          />
        </div>
        <Button onClick={applyPriceFilter} size="sm" variant="secondary" className="w-full">
          {isBn ? "প্রয়োগ করুন" : "Apply Price"}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {isBn ? "ফিল্টার" : "Filters"}
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-primary absolute top-0 right-0 translate-x-1/3 -translate-y-1/3" />
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[350px] overflow-y-auto">
          <div className="mt-4">
            {FilterContent}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      {FilterContent}
    </aside>
  );
}
