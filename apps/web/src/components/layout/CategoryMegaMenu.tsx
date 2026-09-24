"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight, Grid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetPublicCategoryTreeQuery } from "@/features/catalog/catalogApi";
import { cn } from "@/lib/utils";

interface CategoryMegaMenuProps {
  lang: string;
}

export function CategoryMegaMenu({ lang }: CategoryMegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isBn = lang === "bn";

  const { data: categories = [], isLoading } = useGetPublicCategoryTreeQuery();

  const activeCategorySlug = selectedCategorySlug || categories[0]?.slug;
  const activeCategory = categories.find((c) => c.slug === activeCategorySlug) || categories[0];

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative inline-block">
      <Button
        variant="default"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "gap-2 font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-3.5 py-2 shadow-sm transition-all",
          isOpen && "ring-2 ring-primary/30"
        )}
      >
        <Grid className="h-4 w-4" />
        <span>{isBn ? "সকল ক্যাটাগরি" : "All Categories"}</span>
        <ChevronDown
          className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")}
        />
      </Button>

      {/* Mega Menu Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-[720px] bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              {isBn ? "ক্যাটাগরি লোড হচ্ছে..." : "Loading categories..."}
            </div>
          ) : (
            <div className="flex divide-x divide-border/60 min-h-[380px]">
              {/* Left Column: Categories List */}
              <div className="w-[280px] p-2 bg-muted/20 space-y-1">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {isBn ? "ক্যাটাগরি সমূহ" : "Main Categories"}
                </div>
                {categories.map((cat) => {
                  const isActive = activeCategory?.slug === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onMouseEnter={() => setSelectedCategorySlug(cat.slug)}
                      onClick={() => setSelectedCategorySlug(cat.slug)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all group",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-foreground hover:bg-accent/70"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base flex-shrink-0">{cat.icon || "📦"}</span>
                        <span className="truncate">{isBn ? cat.nameBn : cat.nameEn}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        {cat.productCount !== undefined && cat.productCount > 0 && (
                          <span
                            className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                              isActive
                                ? "bg-primary-foreground/20 text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {cat.productCount}
                          </span>
                        )}
                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 -rotate-90 transition-transform",
                            isActive ? "text-primary-foreground" : "text-muted-foreground/60 group-hover:text-foreground"
                          )}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Subcategories & Quick Link */}
              <div className="flex-1 p-5 flex flex-col justify-between bg-card">
                {activeCategory ? (
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/50">
                      <div>
                        <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                          <span>{activeCategory.icon || "📦"}</span>
                          <span>{isBn ? activeCategory.nameBn : activeCategory.nameEn}</span>
                        </h3>
                        {activeCategory.descriptionEn && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {isBn ? activeCategory.descriptionBn || activeCategory.descriptionEn : activeCategory.descriptionEn}
                          </p>
                        )}
                      </div>
                      <Link
                        href={`/${lang}/categories/${activeCategory.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        <span>{isBn ? "সব পণ্য দেখুন" : "View All"}</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>

                    {/* Subcategories Grid */}
                    {activeCategory.children && activeCategory.children.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1">
                        {activeCategory.children.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/${lang}/categories/${activeCategory.slug}/${sub.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-between p-2 rounded-xl text-sm hover:bg-accent/60 transition-colors group border border-transparent hover:border-border/50"
                          >
                            <span className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                              {isBn ? sub.nameBn : sub.nameEn}
                            </span>
                            {sub.productCount !== undefined && sub.productCount > 0 && (
                              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 ml-2 font-normal">
                                {sub.productCount}
                              </Badge>
                            )}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-xs text-muted-foreground">
                        {isBn ? "কোন উপ-ক্যাটাগরি নেই" : "No subcategories available"}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    {isBn ? "একটি ক্যাটাগরি নির্বাচন করুন" : "Select a category"}
                  </div>
                )}

                {/* Bottom Bar: Direct category link */}
                {activeCategory && (
                  <div className="pt-4 border-t border-border/50 mt-auto flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {isBn ? "মোট পণ্য: " : "Available items: "}
                      <strong className="text-foreground">{activeCategory.productCount || 0}</strong>
                    </span>
                    <Link
                      href={`/${lang}/categories/${activeCategory.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="px-3 py-1.5 bg-primary/10 text-primary font-medium rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1.5"
                    >
                      <span>{isBn ? `${activeCategory.nameBn}-এর পেজে যান` : `Browse ${activeCategory.nameEn}`}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
