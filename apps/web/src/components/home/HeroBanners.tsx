import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetPublicBannersQuery } from '@/features/banners/bannersApi';
import { Skeleton } from '@/components/ui/skeleton';

import { ProductRequestModal } from '@/components/catalog/ProductRequestModal';
import { Button } from '@/components/ui/button';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function HeroBanners({ lang }: { lang: string }) {
  const isBn = lang === 'bn';
  const { data: banners, isLoading } = useGetPublicBannersQuery();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  if (isLoading) {
    return <Skeleton className="w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-2xl" />;
  }

  if (!banners || banners.length === 0) {
    return (
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-background pt-8 pb-16 md:py-24 px-4 overflow-hidden border-b rounded-2xl">
        {/* Modern abstract shapes for premium feel */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-80 h-80 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20 shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {isBn ? 'আপনার বিশ্বস্ত অনলাইন মার্কেট' : 'Your Trusted Online Market'}
          </motion.div>
          <motion.h1 
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-6 text-foreground tracking-tight leading-tight"
          >
            {isBn ? 'আপনার প্রয়োজনীয় সবকিছু' : 'Everything You Need,'}
            <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
              {isBn ? ' এখন এক ক্লিকে' : ' Just a Click Away'}
            </span>
          </motion.h1>
          <motion.p 
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            {isBn 
              ? 'গ্রামের বাজার থেকে খাঁটি এবং ফ্রেশ পণ্য কিনুন সরাসরি স্থানীয় বিক্রেতাদের কাছ থেকে। আজই অর্ডার করুন!' 
              : 'Buy authentic and fresh products directly from local sellers at Gramer Bazar. Shop locally, support locally!'}
          </motion.p>
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" className="w-full sm:w-auto h-12 px-8 rounded-full shadow-lg shadow-primary/25 transition-transform hover:-translate-y-1 text-base" asChild>
              <Link href={`/${lang}/categories`}>{isBn ? 'শপিং শুরু করুন' : 'Start Shopping'}</Link>
            </Button>
            <ProductRequestModal lang={lang} trigger={
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 rounded-full shadow-sm hover:shadow-md transition-all bg-background/50 backdrop-blur text-base hover:-translate-y-1">
                {isBn ? 'পণ্য অনুরোধ' : 'Product Request'}
              </Button>
            } />
          </motion.div>
        </div>
      </section>
    );
  }

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % banners.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);

  return (
    <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-2xl overflow-hidden group">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {banners[currentIndex].linkUrl ? (
            <Link href={banners[currentIndex].linkUrl}>
              <div className="relative w-full h-full">
                <Image
                  src={banners[currentIndex].imageUrl}
                  alt={banners[currentIndex].title}
                  fill
                  className="object-cover cursor-pointer"
                  priority
                />
              </div>
            </Link>
          ) : (
            <div className="relative w-full h-full">
              <Image
                src={banners[currentIndex].imageUrl}
                alt={banners[currentIndex].title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/50 hover:bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          >
            <ChevronLeft className="h-6 w-6 text-foreground" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/50 hover:bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          >
            <ChevronRight className="h-6 w-6 text-foreground" />
          </button>
          
          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-primary w-6' : 'bg-primary/30 hover:bg-primary/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
