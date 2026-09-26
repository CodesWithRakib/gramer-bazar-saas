"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, ArrowRight, Tag, Layers, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetSearchSuggestionsQuery } from "@/features/catalog/catalogApi";

interface SearchBarProps {
  lang: string;
  className?: string;
  id?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({ lang, className, id, placeholder, autoFocus }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qParam = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(qParam);
  const [debouncedTerm, setDebouncedTerm] = useState(qParam);
  const [prevQ, setPrevQ] = useState(qParam);
  if (qParam !== prevQ) {
    setPrevQ(qParam);
    setSearchTerm(qParam);
    setDebouncedTerm(qParam);
  }
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isBn = lang === "bn";

  // Debounce search query for live suggestions
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim());
    }, 250);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: suggestions, isFetching } = useGetSearchSuggestionsQuery(
    debouncedTerm,
    { skip: debouncedTerm.length < 2 }
  );

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    if (searchTerm.trim()) {
      router.push(`/${lang}/search?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push(`/${lang}/search`);
    }
  };

  const hasSuggestions =
    suggestions &&
    (suggestions.products.length > 0 ||
      suggestions.categories.length > 0 ||
      suggestions.brands.length > 0);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form onSubmit={handleSearch} className="relative flex w-full items-center">
        <Input
          id={id}
          type="search"
          autoFocus={autoFocus}
          placeholder={
            placeholder ||
            (isBn ? "পণ্য, ক্যাটাগরি বা ব্র্যান্ড খুঁজুন..." : "Search for products, categories or brands...")
          }
          className="w-full pr-20 pl-4 py-2 text-sm rounded-full bg-muted/60 border-muted focus-visible:ring-2 focus-visible:ring-primary shadow-xs transition-all"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (searchTerm.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
        />
        {searchTerm.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setDebouncedTerm("");
              setIsOpen(false);
            }}
            className="absolute right-12 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors"
            aria-label={isBn ? "অনুসন্ধান মুছুন" : "Clear search"}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full w-12 rounded-r-full text-muted-foreground hover:text-primary hover:bg-transparent"
        >
          {isFetching ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="sr-only">{isBn ? "খুঁজুন" : "Search"}</span>
        </Button>
      </form>

      {/* Live Suggestions Dropdown */}
      {isOpen && debouncedTerm.length >= 2 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-150">
          {isFetching && !suggestions ? (
            <div className="p-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              {isBn ? "অনুসন্ধান করা হচ্ছে..." : "Searching..."}
            </div>
          ) : hasSuggestions ? (
            <div className="max-h-[380px] overflow-y-auto divide-y divide-border/50">
              {/* Category Suggestions */}
              {suggestions.categories.length > 0 && (
                <div className="p-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1 flex items-center gap-1.5">
                    <Layers className="h-3 w-3" />
                    {isBn ? "ক্যাটাগরি" : "Categories"}
                  </div>
                  <div className="space-y-0.5">
                    {suggestions.categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/${lang}/categories/${cat.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between px-3 py-1.5 rounded-lg text-sm hover:bg-accent/60 transition-colors group"
                      >
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {isBn ? cat.nameBn : cat.nameEn}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Suggestions */}
              {suggestions.products.length > 0 && (
                <div className="p-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1 flex items-center gap-1.5">
                    <Tag className="h-3 w-3" />
                    {isBn ? "পণ্যসমূহ" : "Products"}
                  </div>
                  <div className="space-y-1">
                    {suggestions.products.map((item) => (
                      <Link
                        key={item.id}
                        href={`/${lang}/products/${item.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent/60 transition-colors group"
                      >
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted/40 flex-shrink-0 border border-border/50">
                          {item.thumbnail ? (
                            <Image
                              src={item.thumbnail}
                              alt={isBn ? item.nameBn : item.nameEn}
                              fill
                              unoptimized
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                              🌾
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                            {isBn ? item.nameBn : item.nameEn}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span className="font-semibold text-primary">৳{item.price}</span>
                            {item.unit && <span>/ {item.unit}</span>}
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-all opacity-0 group-hover:opacity-100" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* View all results button */}
              <div className="p-2 bg-muted/20">
                <button
                  type="button"
                  onClick={handleSearch}
                  className="w-full py-2 px-3 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>{isBn ? `"${searchTerm}" এর সব ফলাফল দেখুন` : `View all results for "${searchTerm}"`}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isBn ? `"${debouncedTerm}" সম্পর্কিত কোনো ফলাফল পাওয়া যায়নি` : `No results found for "${debouncedTerm}"`}
              </p>
              <button
                type="button"
                onClick={handleSearch}
                className="mt-2 text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
              >
                <span>{isBn ? "সার্চ পেজে সব দেখুন" : "Search in catalog"}</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
