'use client';

import React from 'react';
import Link from 'next/link';
import { SearchBar } from '@/components/layout/SearchBar';
import { HeroBanners } from './HeroBanners';
import { CustomImage } from '@/components/ui/CustomImage';
import { TrendingUp, MapPin, Flame, Leaf, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface MarketplaceHeroProps {
  lang: string;
}

export function MarketplaceHero({ lang }: MarketplaceHeroProps) {
  const isBn = lang === 'bn';

  const popularTags = isBn
    ? [
        { label: 'মিনিকেট চাল', query: 'rice' },
        { label: 'সরিষার তেল', query: 'oil' },
        { label: 'সুন্দরবনের মধু', query: 'honey' },
        { label: 'পদ্মার ইলিশ', query: 'hilsa' },
        { label: 'দেশি আলু', query: 'potato' },
        { label: 'কাঁচা মরিচ', query: 'chili' },
      ]
    : [
        { label: 'Miniket Rice', query: 'rice' },
        { label: 'Mustard Oil', query: 'oil' },
        { label: 'Sundarban Honey', query: 'honey' },
        { label: 'Padma Hilsa', query: 'hilsa' },
        { label: 'Fresh Potatoes', query: 'potato' },
        { label: 'Green Chili', query: 'chili' },
      ];

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Top Marketplace Context & Trending Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 px-1 w-full max-w-full overflow-hidden">
        {/* Location & Freshness Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border/80 text-xs font-semibold text-foreground/90 shadow-2xs w-fit max-w-full min-w-0">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="truncate min-w-0 text-[11px] sm:text-xs">
            {isBn ? (
              <>
                <span>খানসামা, দিনাজপুর</span>
                <span className="hidden xs:inline"> • সরাসরি স্থানীয় কৃষক থেকে ডেলিভারি</span>
              </>
            ) : (
              <>
                <span>Khansama, Dinajpur</span>
                <span className="hidden xs:inline"> & Nearby Local Markets</span>
              </>
            )}
          </span>
        </div>

        {/* Trending Searches Tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs text-muted-foreground w-full max-w-full flex-nowrap">
          <span className="inline-flex items-center gap-1 font-semibold text-foreground/80 shrink-0">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span className="hidden xs:inline">{isBn ? 'জনপ্রিয়:' : 'Trending:'}</span>
          </span>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {popularTags.map((tag) => (
              <Link
                key={tag.query}
                href={`/${lang}/search?q=${encodeURIComponent(tag.query)}`}
                className="px-2.5 py-0.5 rounded-full bg-card hover:bg-primary/10 hover:text-primary hover:border-primary/40 border border-border/70 text-[11px] font-medium transition-all shrink-0 whitespace-nowrap"
              >
                {tag.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile-Only Search Bar (Desktop already has the prominent search in navbar) */}
      <div className="block sm:hidden">
        <SearchBar
          lang={lang}
          placeholder={
            isBn ? 'চাল, ডাল, তেল, মাছ, শাকসবজি খুঁজুন...' : 'Search rice, oil, fish, vegetables...'
          }
          className="shadow-xs"
        />
      </div>

      {/* Main Split Hero: Carousel on Left (8 cols) + Curated Promo Tiles on Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch">
        {/* Main Carousel Hero (8 Columns on desktop) */}
        <div className="lg:col-span-8 rounded-2xl overflow-hidden shadow-sm h-full">
          <HeroBanners lang={lang} />
        </div>

        {/* Right Side Curated Promo Tiles (4 Columns on desktop, hidden on small screens or stacked) */}
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 h-full">
          {/* Promo Tile 1: Flash Deals */}
          <Link
            href={`/${lang}/flash-sale`}
            className="relative rounded-2xl overflow-hidden border border-border/60 shadow-xs group h-[190px] sm:h-[200px] lg:h-auto flex flex-col justify-end p-5 text-white transition-all duration-300 hover:shadow-md"
          >
            {/* Background Image with Warm Overlay */}
            <div className="absolute inset-0 z-0">
              <CustomImage
                src="/banners/banner-honey-ghee.jpg"
                alt="Flash Deals"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 400px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/30" />
            </div>

            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs w-fit">
                <Flame className="w-3 h-3 fill-current animate-pulse" />
                <span>{isBn ? 'ধামাকা অফার' : 'Flash Deal'}</span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug drop-shadow-xs">
                  {isBn ? 'আজকের সেরা ফ্ল্যাশ ডিল' : "Today's Hot Flash Sale"}
                </h3>
                <p className="text-xs text-white/85 line-clamp-1 mt-0.5">
                  {isBn
                    ? 'নির্বাচিত পণ্যে সর্বোচ্চ ৫০% পর্যন্ত ছাড়!'
                    : 'Up to 50% discount on daily essentials!'}
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:text-amber-300 transition-colors pt-0.5">
                <span>{isBn ? 'অফারগুলো দেখুন' : 'Explore Flash Sale'}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Promo Tile 2: Farm Fresh & Pure */}
          <Link
            href={`/${lang}/categories`}
            className="relative rounded-2xl overflow-hidden border border-border/60 shadow-xs group h-[190px] sm:h-[200px] lg:h-auto flex flex-col justify-end p-5 text-white transition-all duration-300 hover:shadow-md"
          >
            {/* Background Image with Fresh Natural Overlay */}
            <div className="absolute inset-0 z-0">
              <CustomImage
                src="/banners/banner-village-market.jpg"
                alt="Farm Fresh"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 400px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/30" />
            </div>

            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs w-fit">
                <Leaf className="w-3 h-3" />
                <span>{isBn ? '১০০% খাঁটি ও তাজা' : '100% Farm Fresh'}</span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug drop-shadow-xs">
                  {isBn ? 'সরাসরি খামারের তাজা শস্য ও মুদি' : 'Direct From Local Farmers'}
                </h3>
                <p className="text-xs text-white/85 line-clamp-1 mt-0.5">
                  {isBn
                    ? 'খাঁটি ঘি, সরিষার তেল, পদ্মার মাছ ও শাকসবজি'
                    : 'Pure honey, mustard oil & fresh vegetables'}
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 group-hover:text-emerald-200 transition-colors pt-0.5">
                <span>{isBn ? 'সকল ক্যাটাগরি ব্রাউজ করুন' : 'Browse Categories'}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
