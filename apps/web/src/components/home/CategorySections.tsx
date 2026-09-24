"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useGetCategorySectionsQuery } from "@/features/catalog/catalogApi";

interface CategorySectionsProps {
  lang: string;
}

export function CategorySections({ lang }: CategorySectionsProps) {
  const isBn = lang === "bn";
  const { data: sections = [], isLoading } = useGetCategorySectionsQuery();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 space-y-12">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-48 rounded-lg" />
              <Skeleton className="h-6 w-24 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-72 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Filter out any sections that don't have products (per Phase 3 & 42 rule)
  const populatedSections = sections.filter(
    (sec) => sec.products && sec.products.length > 0
  );

  if (populatedSections.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 space-y-14 md:space-y-16">
      {populatedSections.map((section) => {
        const { category, products } = section;
        const categoryName = isBn ? category.nameBn : category.nameEn;
        const categoryDesc = isBn
          ? category.descriptionBn || category.descriptionEn
          : category.descriptionEn;

        return (
          <section
            key={category.id}
            className="space-y-5 border-t border-border/40 pt-8 first:border-t-0 first:pt-0"
          >
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl md:text-3xl flex-shrink-0">
                    {category.icon || "📦"}
                  </span>
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
                    {categoryName}
                  </h2>
                  {category.productCount !== undefined && category.productCount > 0 && (
                    <Badge variant="secondary" className="text-xs font-semibold px-2 py-0.5">
                      {category.productCount} {isBn ? "টি পণ্য" : "items"}
                    </Badge>
                  )}
                </div>
                {categoryDesc && (
                  <p className="text-xs md:text-sm text-muted-foreground mt-1 max-w-xl">
                    {categoryDesc}
                  </p>
                )}
              </div>

              {/* View All Link */}
              <Link
                href={`/${lang}/categories/${category.slug}`}
                className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-primary hover:text-primary/80 transition-colors group self-start sm:self-auto"
              >
                <span>{isBn ? `সব ${categoryName} দেখুন` : `View all ${categoryName}`}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Subcategory Pills Navigation (Phase 5, 25 & 42) */}
            {category.subCategories && category.subCategories.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 md:mx-0 md:px-0">
                <Link
                  href={`/${lang}/categories/${category.slug}`}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-xs whitespace-nowrap"
                >
                  {isBn ? "সবগুলো" : "All"}
                </Link>
                {category.subCategories.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/${lang}/categories/${category.slug}/${sub.slug}`}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors whitespace-nowrap flex items-center gap-1.5 border border-border/40"
                  >
                    <span>{isBn ? sub.nameBn : sub.nameEn}</span>
                    {sub.productCount > 0 && (
                      <span className="text-[10px] text-muted-foreground/80 font-normal">
                        ({sub.productCount})
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}

            {/* Product Grid (Phase 8: 2 cols on mobile, 3 on tablet, 4 on desktop) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  lang={lang}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
