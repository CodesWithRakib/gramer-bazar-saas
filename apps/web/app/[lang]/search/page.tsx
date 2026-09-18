"use client";

import React, { useEffect, useState, Suspense, use } from "react";
import {
  useSearchParams,
  useRouter,
  usePathname,
} from "next/navigation";
import {
  useSearchProductsQuery,
  useGetPublicCategoriesQuery,
} from "@/features/catalog/catalogApi";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { ProductRequestModal } from "@/components/catalog/ProductRequestModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, X } from "lucide-react";

function SearchPageContent({ lang }: { lang: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isBn = lang === "bn";

  const q = searchParams.get("q") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const sort = searchParams.get("sort") || "newest";

  const [localSearch, setLocalSearch] = useState(q);

  // Sync local search when URL changes
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
  });

  const { data: categories } = useGetPublicCategoriesQuery();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl("q", localSearch);
  };

  const updateUrl = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  const isEmpty = searchResults?.data?.length === 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {isBn ? "ফিল্টার" : "Filters"}
            </h3>
            {(q || categoryId || sort !== "newest") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
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
                  checked={!categoryId}
                  onCheckedChange={() => updateUrl("categoryId", "")}
                />
                <label htmlFor="cat-all" className="text-sm cursor-pointer">
                  {isBn ? "সব" : "All"}
                </label>
              </div>
              {categories?.map((cat) => (
                <div key={cat.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${cat.id}`}
                    checked={categoryId === cat.id}
                    onCheckedChange={(checked) =>
                      checked
                        ? updateUrl("categoryId", cat.id)
                        : updateUrl("categoryId", "")
                    }
                  />
                  <label
                    htmlFor={`cat-${cat.id}`}
                    className="text-sm cursor-pointer line-clamp-1"
                  >
                    {isBn ? cat.nameBn : cat.nameEn}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </aside>

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
              <Select
                value={sort}
                onValueChange={(val) => updateUrl("sort", val)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={isBn ? "সর্ট করুন" : "Sort by"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">
                    {isBn ? "নতুন পণ্য" : "Newest Arrivals"}
                  </SelectItem>
                  <SelectItem value="price_asc">
                    {isBn ? "দাম: কম থেকে বেশি" : "Price: Low to High"}
                  </SelectItem>
                  <SelectItem value="price_desc">
                    {isBn ? "দাম: বেশি থেকে কম" : "Price: High to Low"}
                  </SelectItem>
                </SelectContent>
              </Select>
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
            <div className="text-center py-16 px-4 bg-muted/30 rounded-xl border border-dashed">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isBn
                  ? "দুঃখিত, কোনো পণ্য পাওয়া যায়নি"
                  : "Sorry, no products found"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {isBn
                  ? "আপনার খোঁজা পণ্যটি আমাদের স্টকে নেই। তবে আপনি অনুরোধ করলে আমরা এটি সরবরাহ করার চেষ্টা করব।"
                  : "The product you're looking for isn't in stock right now. But you can request it and we'll try to source it."}
              </p>
              <ProductRequestModal lang={lang} />
            </div>
          ) : (
            <ProductGrid
              products={searchResults?.data}
              isLoading={isSearchLoading}
              lang={lang}
            />
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
