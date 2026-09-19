"use client";

import React, { useEffect, useState, Suspense, use } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  useSearchProductsQuery,
  useGetPublicCategoriesQuery,
} from "@/features/catalog/catalogApi";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { ProductRequestModal } from "@/components/catalog/ProductRequestModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductFilterSidebar } from "@/components/catalog/ProductFilterSidebar";
import { ProductSortSelect } from "@/components/catalog/ProductSortSelect";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";

function SearchPageContent({ lang }: { lang: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isBn = lang === "bn";

  const q = searchParams.get("q") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const sort = searchParams.get("sort") || "newest";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [localSearch, setLocalSearch] = useState(q);

  useEffect(() => {
    setLocalSearch(q);
  }, [q]);

  const {
    data: searchResults,
    isLoading: isSearchLoading,
    isError,
  } = useSearchProductsQuery({
    q,
    categoryId,
    sort,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    page,
    limit: 20,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl("q", localSearch);
  };

  const updateUrl = (key: string, value: string | number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value.toString());
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const isEmpty = searchResults?.data?.length === 0;
  const meta = searchResults?.meta;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters - Hidden on mobile, visible on md */}
        <div className="hidden md:block">
          <ProductFilterSidebar lang={lang} />
        </div>

        {/* Main Content */}
        <div className="flex-grow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                {q
                  ? isBn
                    ? `"${q}" এর জন্য ফলাফল`
                    : `Results for "${q}"`
                  : isBn
                    ? "সব পণ্য"
                    : "All Products"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {isSearchLoading
                  ? isBn
                    ? "খোঁজা হচ্ছে..."
                    : "Searching..."
                  : isBn
                    ? `${searchResults?.meta.total || 0} টি পণ্য পাওয়া গেছে`
                    : `${searchResults?.meta.total || 0} products found`}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="md:hidden">
                <ProductFilterSidebar lang={lang} isMobile />
              </div>
              <ProductSortSelect lang={lang} />
            </div>
          </div>

          <div className="mb-6 md:hidden">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Input
                type="search"
                placeholder={isBn ? "পণ্য খুঁজুন..." : "Search products..."}
                className="w-full pr-10"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {isError ? (
            <div className="text-center py-12 text-destructive">
              <p>
                {isBn
                  ? "দুঃখিত, কোনো ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।"
                  : "Sorry, an error occurred. Please try again."}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                {isBn ? "পুনরায় চেষ্টা করুন" : "Retry"}
              </Button>
            </div>
          ) : isEmpty && !isSearchLoading ? (
            <div className="text-center py-16 px-4 bg-muted/20 rounded-xl border border-dashed">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isBn
                  ? "দুঃখিত, কোনো পণ্য পাওয়া যায়নি"
                  : "Sorry, no products found"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
                {isBn
                  ? "আপনার খোঁজা পণ্যটি আমাদের স্টকে নেই অথবা ফিল্টারের সাথে মিল নেই। তবে আপনি অনুরোধ করলে আমরা এটি সরবরাহ করার চেষ্টা করব।"
                  : "The product you're looking for isn't in stock right now or doesn't match the filters. But you can request it and we'll try to source it."}
              </p>
              <ProductRequestModal
                lang={lang}
                trigger={
                  <Button
                    variant="secondary"
                    className="rounded-full font-medium"
                  >
                    {isBn ? "পণ্য অনুরোধ করুন" : "Request Product"}
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              <ProductGrid
                products={searchResults?.data}
                isLoading={isSearchLoading}
                lang={lang}
              />

              {meta && meta.totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => updateUrl("page", page - 1)}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    {isBn ? "পূর্ববর্তী" : "Prev"}
                  </Button>
                  <span className="text-sm font-medium">
                    {page} / {meta.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= meta.totalPages}
                    onClick={() => updateUrl("page", page + 1)}
                  >
                    {isBn ? "পরবর্তী" : "Next"}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);

  return (
    <Suspense
      fallback={
        <div className="container p-8">
          <p>Loading...</p>
        </div>
      }
    >
      <SearchPageContent lang={lang} />
    </Suspense>
  );
}
