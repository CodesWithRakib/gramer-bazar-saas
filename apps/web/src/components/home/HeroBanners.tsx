'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetPublicBannersQuery } from '@/features/banners/bannersApi';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomImage } from '@/components/ui/CustomImage';
import { ProductRequestModal } from '@/components/catalog/ProductRequestModal';
import { Button } from '@/components/ui/button';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function HeroBanners({ lang }: { lang: string }) {
  const isBn = lang === 'bn';
  const { data: banners, isLoading } = useGetPublicBannersQuery();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Touch gesture state
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const bannerCount = banners?.length ?? 0;

  const nextSlide = useCallback(() => {
    if (bannerCount <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % bannerCount);
  }, [bannerCount]);

  const prevSlide = useCallback(() => {
    if (bannerCount <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + bannerCount) % bannerCount);
  }, [bannerCount]);

  // Autoplay with pause support
  useEffect(() => {
    if (!banners || banners.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 5500);

    return () => clearInterval(timer);
  }, [banners, isPaused, nextSlide]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current !== null && touchEndXRef.current !== null) {
      const distance = touchStartXRef.current - touchEndXRef.current;
      const isSwipe = Math.abs(distance) > 40;
      if (isSwipe) {
        if (distance > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
    // Resume autoplay after brief delay
    setTimeout(() => setIsPaused(false), 2000);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
  };

  if (isLoading) {
    return (
      <Skeleton className="w-full h-[320px] sm:h-[360px] md:h-[400px] lg:h-[420px] xl:h-[440px] rounded-2xl" />
    );
  }

  if (!banners || banners.length === 0) {
    return (
      <section className="relative bg-muted/30 pt-8 pb-16 md:py-24 px-4 overflow-hidden border border-border/60 rounded-2xl">
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-semibold mb-6 border border-primary/20 shadow-xs"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {isBn ? 'আপনার বিশ্বস্ত গ্রামীণ ডিজিটাল মার্কেট' : 'Your Trusted Rural Digital Market'}
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold mb-6 text-foreground tracking-tight leading-tight"
          >
            {isBn
              ? 'গ্রামের খাঁটি পণ্য ও নিত্যপ্রয়োজনীয় সবকিছু'
              : 'Pure Village Products & Everyday Needs,'}
            <br className="hidden md:block" />
            <span className="text-primary">
              {isBn ? ' এখন সরাসরি আপনার দোরগোড়ায়' : ' Right at Your Doorstep'}
            </span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            {isBn
              ? 'গ্রামের বাজার থেকে খাঁটি শাকসবজি, মুদি ও ইলেকট্রনিক্স পণ্য কিনুন সরাসরি স্থানীয় বিশ্বস্ত বিক্রেতাদের কাছ থেকে।'
              : 'Buy authentic fresh produce, groceries, and electronics directly from local trusted sellers across Bangladesh.'}
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="w-full sm:w-auto h-12 px-8 rounded-full shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5 text-base font-semibold"
              asChild
            >
              <Link href={`/${lang}/categories`}>{isBn ? 'শপিং শুরু করুন' : 'Start Shopping'}</Link>
            </Button>
            <ProductRequestModal
              lang={lang}
              trigger={
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto h-12 px-8 rounded-full shadow-xs hover:shadow-md transition-all bg-background/60 backdrop-blur text-base hover:-translate-y-0.5"
                >
                  {isBn ? 'পণ্য অনুরোধ' : 'Product Request'}
                </Button>
              }
            />
          </motion.div>
        </div>
      </section>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <div
      className="relative w-full h-[340px] sm:h-[370px] md:h-[400px] lg:h-[420px] xl:h-[440px] rounded-2xl overflow-hidden group select-none shadow-sm border border-border/40 focus:outline-hidden"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label={isBn ? 'প্রধান ব্যানার ক্যারোজেল' : 'Featured banners carousel'}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          className="absolute inset-0"
        >
          {/* Background Banner Image */}
          <div className="w-full h-full relative">
            <CustomImage
              src={currentBanner.imageUrl}
              alt={currentBanner.title}
              fill
              priority={currentIndex === 0}
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 800px"
            />
          </div>

          {/* High-Contrast Directional Scrim for Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 sm:bg-gradient-to-r sm:from-black/85 sm:via-black/50 sm:to-transparent" />

          {/* Banner Editorial Content Overlay */}
          <div className="absolute inset-0 z-10 flex flex-col justify-end sm:justify-center p-4 xs:p-5 sm:p-7 md:p-9 max-w-xl text-white">
            <div className="space-y-2 xs:space-y-2.5 sm:space-y-3.5 pb-2 sm:pb-0">
              {/* Campaign Pill */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-primary/95 text-white text-[10px] sm:text-xs font-bold shadow-md w-fit backdrop-blur-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span>{isBn ? 'বিশেষ গ্রামীণ অফার' : 'Featured Marketplace Deal'}</span>
              </div>

              {/* Title */}
              <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug drop-shadow-md">
                {currentBanner.title ||
                  (isBn ? 'তাজা ও খাঁটি পণ্য সরাসরি খামার থেকে' : 'Fresh & Pure Farm Products')}
              </h2>

              {/* Subtitle */}
              <p className="text-[11px] xs:text-xs sm:text-sm md:text-base text-white/90 line-clamp-2 max-w-md leading-relaxed font-medium">
                {isBn
                  ? 'আপনার এলাকার কৃষক ও খাঁটি খামারিদের উৎপাদিত তাজা শাকসবজি, খাঁটি মধু ও নিত্যপণ্য।'
                  : 'Authentic local vegetables, pure honey, mustard oil & daily essentials delivered fast.'}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 xs:gap-3 pt-1">
                <Button
                  size="default"
                  className="rounded-full h-8 xs:h-9 sm:h-10 px-4 xs:px-5 sm:px-6 bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-bold shadow-lg shadow-primary/30 transition-transform active:scale-95 flex items-center gap-1.5 xs:gap-2 group/btn"
                  asChild
                >
                  <Link href={currentBanner.linkUrl || `/${lang}/products`}>
                    <span>{isBn ? 'এখনই কিনুন' : 'Shop Now'}</span>
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 rtl:rotate-180 transition-transform group-hover/btn:translate-x-0.5" />
                  </Link>
                </Button>
                <Button
                  size="default"
                  variant="outline"
                  className="rounded-full h-8 xs:h-9 sm:h-10 px-3 xs:px-4 sm:px-5 bg-white/15 hover:bg-white/25 text-white border-white/30 text-xs sm:text-sm font-semibold backdrop-blur-sm transition-all"
                  asChild
                >
                  <Link href={`/${lang}/categories`}>
                    <span>{isBn ? 'ক্যাটাগরি দেখুন' : 'Explore'}</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      {bannerCount > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label={isBn ? 'পূর্ববর্তী স্লাইড' : 'Previous slide'}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-all shadow-md z-20"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 rtl:rotate-180" />
          </button>
          <button
            onClick={nextSlide}
            aria-label={isBn ? 'পরবর্তী স্লাইড' : 'Next slide'}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-all shadow-md z-20"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 rtl:rotate-180" />
          </button>

          {/* Indicators / Progress Pills */}
          <div className="absolute bottom-2.5 end-2.5 sm:bottom-4 sm:end-6 flex items-center gap-1.5 z-20 bg-black/40 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/10">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`${isBn ? 'স্লাইড' : 'Slide'} ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'bg-primary w-5 sm:w-6' : 'bg-white/50 hover:bg-white w-1.5 sm:w-2'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
