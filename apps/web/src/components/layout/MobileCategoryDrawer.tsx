"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronDown, Zap, ShoppingBag, PhoneCall, HelpCircle, FileText } from "lucide-react";
import { useGetPublicCategoryTreeQuery } from "@/features/catalog/catalogApi";
import { cn } from "@/lib/utils";

interface MobileCategoryDrawerProps {
  lang: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileCategoryDrawer({
  lang,
  isOpen,
  onOpenChange,
}: MobileCategoryDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isBn = lang === "bn";
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const { data: categories = [], isLoading } = useGetPublicCategoryTreeQuery();

  const toggleCategory = (slug: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  const handleLanguageChange = (newLang: string) => {
    if (newLang === lang) return;
    const newPath = pathname.replace(`/${lang}`, `/${newLang}`);
    router.push(newPath);
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[85vw] max-w-[340px] p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="p-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center justify-between">
            <Link href={`/${lang}`} onClick={() => onOpenChange(false)}>
              <Image
                src="/logo.jpg"
                alt="Gramer Bazar"
                width={160}
                height={50}
                className="w-32 h-10 object-cover object-left mix-blend-multiply"
                priority
              />
            </Link>
            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-background border border-border/80 rounded-lg p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleLanguageChange("en")}
                className={cn(
                  "px-2 py-1 rounded transition-colors",
                  !isBn ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange("bn")}
                className={cn(
                  "px-2 py-1 rounded transition-colors",
                  isBn ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                বাংলা
              </button>
            </div>
          </div>
          <SheetTitle className="sr-only">
            {isBn ? "ন্যাভিগেশন মেনু" : "Navigation Menu"}
          </SheetTitle>
        </SheetHeader>

        {/* Scrollable Categories List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick Deals Links */}
          <div className="space-y-1">
            <Link
              href={`/${lang}/flash-sale`}
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
            >
              <Zap className="h-4 w-4 fill-rose-500 text-rose-500" />
              <span>{isBn ? "ফ্ল্যাশ সেল (বিশেষ ছাড়)" : "Flash Sales"}</span>
              <Badge variant="destructive" className="ml-auto text-[10px] h-4 px-1.5 uppercase font-bold">
                {isBn ? "হট" : "Hot"}
              </Badge>
            </Link>

            <Link
              href={`/${lang}/categories`}
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-muted transition-colors text-foreground"
            >
              <ShoppingBag className="h-4 w-4 text-primary" />
              <span>{isBn ? "সকল ক্যাটাগরি ব্রাউজ করুন" : "Browse All Categories"}</span>
            </Link>
          </div>

          <div className="h-px bg-border/60 my-2" />

          {/* Categories Accordion */}
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
              {isBn ? "পণ্য ক্যাটাগরি" : "Product Categories"}
            </div>

            {isLoading ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                {isBn ? "লোড হচ্ছে..." : "Loading categories..."}
              </div>
            ) : (
              <div className="space-y-1">
                {categories.map((cat) => {
                  const isExpanded = !!expandedCategories[cat.slug];
                  const hasChildren = cat.children && cat.children.length > 0;

                  return (
                    <div key={cat.id} className="rounded-xl border border-border/40 overflow-hidden bg-card">
                      <div className="flex items-center justify-between p-2.5 hover:bg-muted/40 transition-colors">
                        <Link
                          href={`/${lang}/categories/${cat.slug}`}
                          onClick={() => onOpenChange(false)}
                          className="flex items-center gap-2.5 flex-1 min-w-0 font-medium text-sm text-foreground"
                        >
                          <span className="text-base flex-shrink-0">{cat.icon || "📦"}</span>
                          <span className="truncate">{isBn ? cat.nameBn : cat.nameEn}</span>
                          {cat.productCount !== undefined && cat.productCount > 0 && (
                            <Badge variant="outline" className="text-[10px] h-4 px-1 text-muted-foreground font-normal">
                              {cat.productCount}
                            </Badge>
                          )}
                        </Link>

                        {hasChildren && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground ml-1"
                            onClick={() => toggleCategory(cat.slug)}
                          >
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 transition-transform duration-200",
                                isExpanded && "rotate-180"
                              )}
                            />
                            <span className="sr-only">Toggle</span>
                          </Button>
                        )}
                      </div>

                      {/* Subcategories */}
                      {hasChildren && isExpanded && (
                        <div className="p-2 pt-0 bg-muted/20 border-t border-border/30 space-y-0.5">
                          {cat.children?.map((sub) => (
                            <Link
                              key={sub.id}
                              href={`/${lang}/categories/${cat.slug}/${sub.slug}`}
                              onClick={() => onOpenChange(false)}
                              className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                            >
                              <span className="truncate">{isBn ? sub.nameBn : sub.nameEn}</span>
                              <div className="flex items-center gap-1">
                                {sub.productCount !== undefined && sub.productCount > 0 && (
                                  <span className="text-[10px] text-muted-foreground/70">
                                    ({sub.productCount})
                                  </span>
                                )}
                                <ChevronRight className="h-3 w-3" />
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer info in drawer */}
        <div className="p-4 border-t border-border/60 bg-muted/20 space-y-2 text-xs">
          <Link
            href={`/${lang}/contact`}
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <PhoneCall className="h-3.5 w-3.5 text-primary" />
            <span>{isBn ? "গ্রাহক সহায়তা" : "Customer Support"}</span>
          </Link>
          <Link
            href={`/${lang}/faq`}
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <HelpCircle className="h-3.5 w-3.5 text-primary" />
            <span>{isBn ? "সাধারণ জিজ্ঞাসা (FAQ)" : "Help & FAQ"}</span>
          </Link>
          <Link
            href={`/${lang}/privacy`}
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <FileText className="h-3.5 w-3.5 text-primary" />
            <span>{isBn ? "প্রাইভেসি পলিসি" : "Privacy Policy"}</span>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
