'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGetActiveFlashSalesQuery } from '@/features/flash-sales/flashSalesApi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CountdownTimer } from '@/components/common/CountdownTimer';
import { Sparkles, Flame, ArrowRight, X } from 'lucide-react';
import Image from 'next/image';

interface PromotionalModalProps {
  lang: string;
}

const STORAGE_KEY = 'gb_promotional_modal_v1';

export function PromotionalModal({ lang }: { lang: string }) {
  const isBn = lang === 'bn';
  const [isOpen, setIsOpen] = useState(false);
  const { data: flashSales } = useGetActiveFlashSalesQuery();

  useEffect(() => {
    // Check if dismissed in this session
    try {
      const alreadyDismissed = sessionStorage.getItem(STORAGE_KEY);
      if (alreadyDismissed) return;

      // Small delay for smooth entry after page hydration
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);

      return () => clearTimeout(timer);
    } catch {
      // Storage access error handling
    }
  }, []);

  const handleClose = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
    setIsOpen(false);
  };

  const activeSale = flashSales && flashSales.length > 0 ? flashSales[0] : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden rounded-3xl border-0 shadow-2xl bg-card">
        {/* Banner Header Image / Graphic */}
        <div className="relative h-44 w-full bg-gradient-to-tr from-emerald-800 via-teal-700 to-green-600 flex flex-col justify-end p-6 text-white overflow-hidden">
          {activeSale?.bannerImage ? (
            <Image
              src={activeSale.bannerImage}
              alt="Promotion"
              fill
              className="object-cover opacity-35 pointer-events-none"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-600 via-orange-600 to-amber-500 opacity-90" />
          )}

          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-1">
            <Badge className="bg-yellow-400 text-black font-extrabold text-[10px] tracking-wider uppercase mb-1 shadow-xs">
              <Sparkles className="w-3 h-3 mr-1 inline" />
              {isBn ? 'বিশেষ প্রচারণা' : 'EXCLUSIVE CAMPAIGN'}
            </Badge>

            <DialogTitle className="text-2xl font-black tracking-tight text-white leading-tight">
              {activeSale ? activeSale.name : isBn ? 'গ্রামের বাজার মেগা অফার!' : 'Gramer Bazar Mega Deals!'}
            </DialogTitle>

            <DialogDescription className="text-white/90 text-xs line-clamp-1">
              {isBn
                ? 'সেরা মূল্যে খাঁটি ও তাজা পণ্য কিনতে এখনই অর্ডার করুন'
                : 'Limited time discounts on top quality local essentials'}
            </DialogDescription>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {activeSale && (
            <div className="bg-muted/40 border border-border/80 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-500 fill-current" />
                <span className="text-xs font-semibold text-foreground">
                  {isBn ? 'অফার শেষ হতে বাকি:' : 'Deal ends in:'}
                </span>
              </div>
              <CountdownTimer targetDate={activeSale.endDate} lang={lang} />
            </div>
          )}

          <div className="space-y-2 text-center sm:text-left">
            <h4 className="text-sm font-bold text-foreground">
              {isBn ? 'দারুণ সব ডিসকাউন্ট ও ফ্রি ডেলিভারি' : 'Great Discounts & Village Delivery'}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isBn
                ? 'স্থানীয় বিশ্বস্ত বিক্রেতাদের সরাসরি তাজা পণ্য ও গ্যাজেট কিনুন। প্রতিটি অর্ডারে পাচ্ছেন দ্রুততম ডেলিভারি ও মানসম্পন্ন সার্ভিসের নিশ্চয়তা।'
                : 'Discover fresh local vegetables, authentic groceries and gadgets from verified shops delivered right to your home.'}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              asChild
              className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl shadow-md h-11 text-sm font-bold"
              onClick={handleClose}
            >
              <Link href={activeSale ? `/${lang}/flash-sale` : `/${lang}/offers`}>
                {isBn ? 'অফার দেখুন' : 'Explore Deals'}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>

            <Button
              variant="outline"
              className="rounded-xl h-11 text-xs px-4"
              onClick={handleClose}
            >
              {isBn ? 'পরে দেখব' : 'Dismiss'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
