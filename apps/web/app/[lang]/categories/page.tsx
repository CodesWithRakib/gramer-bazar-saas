'use client';

import React from 'react';
import Link from 'next/link';
import { useGetPublicCategoryTreeQuery } from '@/features/catalog/catalogApi';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { use } from 'react';
import { ArrowRight, ChevronRight, Home, Layers } from 'lucide-react';

export default function CategoriesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';

  const { data: categories = [], isLoading } = useGetPublicCategoryTreeQuery();

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 max-w-7xl">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
        <Link href={`/${lang}`} className="hover:text-primary transition-colors flex items-center gap-1">
          <Home className="h-3.5 w-3.5" />
          <span>{isBn ? 'হোম' : 'Home'}</span>
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
        <span className="text-foreground font-medium">{isBn ? 'সকল ক্যাটাগরি' : 'All Categories'}</span>
      </nav>

      {/* Header */}
      <div className="text-center mb-10 max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <Layers className="h-3.5 w-3.5" />
          <span>{isBn ? 'পণ্য তালিকা' : 'Product Catalog'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
          {isBn ? 'সকল পণ্য ক্যাটাগরি' : 'All Categories'}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {isBn 
            ? 'খাঁটি গ্রাম্য খাবার, তাজা শাকসবজি, নিত্যপ্রয়োজনীয় মুদি সামগ্রী ও অন্যান্য পণ্য আপনার পছন্দের ক্যাটাগরি থেকে ব্রাউজ করুন।' 
            : 'Explore fresh farm produce, pure grocery essentials, local foods, cosmetics and health products from our curated categories.'}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const categoryName = isBn ? category.nameBn : category.nameEn;
            const categoryDesc = isBn ? category.descriptionBn || category.descriptionEn : category.descriptionEn;

            return (
              <div
                key={category.id}
                className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs hover:shadow-lg hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                      {category.icon || '📦'}
                    </div>
                    {category.productCount !== undefined && category.productCount > 0 && (
                      <Badge variant="secondary" className="font-semibold text-xs px-2.5 py-0.5">
                        {category.productCount} {isBn ? 'টি পণ্য' : 'products'}
                      </Badge>
                    )}
                  </div>

                  <Link href={`/${lang}/categories/${category.slug}`}>
                    <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {categoryName}
                    </h2>
                  </Link>

                  {categoryDesc && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {categoryDesc}
                    </p>
                  )}

                  {/* Subcategories */}
                  {category.children && category.children.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        {isBn ? 'উপ-ক্যাটাগরি সমূহ:' : 'Subcategories:'}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {category.children.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/${lang}/categories/${category.slug}/${sub.slug}`}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-muted/60 hover:bg-primary hover:text-primary-foreground text-foreground transition-colors border border-border/40 inline-flex items-center gap-1"
                          >
                            <span>{isBn ? sub.nameBn : sub.nameEn}</span>
                            {sub.productCount !== undefined && sub.productCount > 0 && (
                              <span className="text-[10px] opacity-75">
                                ({sub.productCount})
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {isBn ? 'সব দেখতে ক্লিক করুন' : 'Browse full selection'}
                  </span>
                  <Link
                    href={`/${lang}/categories/${category.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>{isBn ? 'ক্যাটাগরি পেজ' : 'Explore'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
