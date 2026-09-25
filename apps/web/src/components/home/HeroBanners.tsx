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
    return <Skeleton className="w-full h-[260px] sm:h-[340px] md:h-[420px] lg:h-[480px] rounded-2xl" />;
  }

  if (!banners || banners.length === 0) {
    return (
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-background pt-8 pb-16 md:py-24 px-4 overflow-hidden border border-border/60 rounded-2xl">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-80 h-80 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

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
            {isBn ? 'গ্রামের খাঁটি পণ্য ও নিত্যপ্রয়োজনীয় সবকিছু' : 'Pure Village Products & Everyday Needs,'}
            <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600">
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
      className="relative w-full h-[260px] sm:h-[340px] md:h-[420px] lg:h-[480px] rounded-2xl overflow-hidden group select-none shadow-sm border border-border/40 focus:outline-hidden"
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
          {currentBanner.linkUrl ? (
            <Link href={currentBanner.linkUrl} className="block w-full h-full relative cursor-pointer">
              <CustomImage
                src={currentBanner.imageUrl}
                alt={currentBanner.title}
                fill
                priority={currentIndex === 0}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1200px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </Link>
          ) : (
            <div className="w-full h-full relative">
              <CustomImage
                src={currentBanner.imageUrl}
                alt={currentBanner.title}
                fill
                priority={currentIndex === 0}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1200px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      {bannerCount > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label={isBn ? 'পূর্ববর্তী স্লাইড' : 'Previous slide'}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-background/70 hover:bg-background/95 backdrop-blur-md flex items-center justify-center opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-all shadow-md z-10"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
          </button>
          <button
            onClick={nextSlide}
            aria-label={isBn ? 'পরবর্তী স্লাইড' : 'Next slide'}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-background/70 hover:bg-background/95 backdrop-blur-md flex items-center justify-center opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-all shadow-md z-10"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
          </button>

          {/* Indicators / Dots */}
          <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 bg-black/20 backdrop-blur-xs px-3 py-1.5 rounded-full">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`${isBn ? 'স্লাইড' : 'Slide'} ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'bg-primary w-6'
                    : 'bg-white/60 hover:bg-white w-2'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
