"use client";

import React from "react";
import Link from "next/link";
import { SearchBar } from "@/components/layout/SearchBar";
import { HeroBanners } from "./HeroBanners";
import { TrendingUp, MapPin } from "lucide-react";

interface MarketplaceHeroProps {
  lang: string;
}

export function MarketplaceHero({ lang }: MarketplaceHeroProps) {
  const isBn = lang === "bn";

  const popularTags = isBn
    ? [
        { label: "মিনিকেট চাল", query: "rice" },
        { label: "সরিষার তেল", query: "oil" },
        { label: "সুন্দরবনের মধু", query: "honey" },
        { label: "পদ্মার ইলিশ", query: "hilsa" },
        { label: "দেশি আলু", query: "potato" },
        { label: "কাঁচা মরিচ", query: "chili" },
      ]
    : [
        { label: "Miniket Rice", query: "rice" },
        { label: "Mustard Oil", query: "oil" },
        { label: "Sundarban Honey", query: "honey" },
        { label: "Padma Hilsa", query: "hilsa" },
        { label: "Fresh Potatoes", query: "potato" },
        { label: "Green Chili", query: "chili" },
      ];

  return (
    <div className="space-y-6">
      {/* Marketplace Search Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-primary/10 via-primary/5 to-background border border-primary/15 p-6 md:p-10 shadow-sm text-center">
        {/* Subtle decorative background blur spots */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-background border border-primary/20 text-xs font-semibold text-primary shadow-xs">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span>
              {isBn
                ? "খানসামা, দিনাজপুর ও আশেপাশের লোকাল বাজার"
                : "Serving Khansama, Dinajpur & Nearby Local Markets"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            {isBn ? "আপনার এলাকার যা প্রয়োজন," : "Find what you need"}{" "}
            <span className="text-primary">{isBn ? "সব এক জায়গায়" : "near you"}</span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {isBn
              ? "সরাসরি স্থানীয় কৃষক, খামারি ও ভেরিফাইড দোকান থেকে তাজা শাকসবজি, খাঁটি মধু, তেল ও নিত্যপ্রয়োজনীয় পণ্য কিনুন।"
              : "Discover fresh vegetables, pure groceries, farm-fresh fish & everyday essentials directly from verified local sellers."}
          </p>

          {/* Prominent Large Marketplace Search Bar */}
          <div className="pt-2 max-w-2xl mx-auto">
            <SearchBar
              lang={lang}
              placeholder={
                isBn
                  ? "চাল, ডাল, তেল, মাছ, শাকসবজি বা ব্র্যান্ডের নাম খুঁজুন..."
                  : "Search for rice, oil, fish, vegetables, or brands..."
              }
              className="shadow-md"
            />
          </div>

          {/* Popular Search Suggestions / Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-semibold text-foreground/80">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              {isBn ? "জনপ্রিয় অনুসন্ধান:" : "Trending:"}
            </span>
            {popularTags.map((tag) => (
              <Link
                key={tag.query}
                href={`/${lang}/search?q=${encodeURIComponent(tag.query)}`}
                className="px-2.5 py-1 rounded-full bg-background/80 hover:bg-primary/10 hover:text-primary border border-border/60 transition-colors"
              >
                {tag.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Banners Carousel */}
      <div className="rounded-2xl overflow-hidden shadow-sm">
        <HeroBanners lang={lang} />
      </div>
    </div>
  );
}
