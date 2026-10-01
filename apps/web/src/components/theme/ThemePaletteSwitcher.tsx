'use client';

import React, { useState } from 'react';
import { Palette, Check, Bell, X } from 'lucide-react';
import { useThemePalette } from '@/providers/ThemePaletteProvider';
import { ThemePaletteId } from '@/config/theme';
import { toast } from '@/components/ui/custom-toast';

interface ThemePaletteSwitcherProps {
  className?: string;
  lang?: string;
  showToastDemo?: boolean;
}

export function ThemePaletteSwitcher({
  className = '',
  lang = 'bn',
  showToastDemo = false,
}: ThemePaletteSwitcherProps) {
  const isBn = lang === 'bn';
  const { palette, setPalette, availablePalettes } = useThemePalette();
  const [isOpen, setIsOpen] = useState(false);

  const triggerToastDemo = (type: 'success' | 'error' | 'warning' | 'info' | 'loading') => {
    switch (type) {
      case 'success':
        toast.success({
          title: isBn ? 'পণ্যটি সফলভাবে কার্টে যোগ করা হয়েছে' : 'Product added successfully',
          description: isBn
            ? 'আপনার শপিং ব্যাগ প্রস্তুত। চেকআউট করতে কার্ট দেখুন।'
            : 'Your shopping cart is ready. Proceed to checkout anytime.',
          badge: isBn ? 'সফল' : 'Success',
          action: {
            label: isBn ? 'কার্ট দেখুন' : 'View Cart',
            onClick: () => {},
          },
        });
        break;
      case 'error':
        toast.error({
          title: isBn ? 'অর্ডার প্রক্রিয়া ব্যর্থ হয়েছে' : 'Order processing failed',
          description: isBn
            ? 'সার্ভারের সাথে সংযোগ বিচ্ছিন্ন হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
            : 'Unable to communicate with payment gateway. Please retry.',
          badge: isBn ? 'ত্রুটি' : 'Error',
        });
        break;
      case 'warning':
        toast.warning({
          title: isBn ? 'সীমিত স্টক সতর্কতা' : 'Low stock warning',
          description: isBn
            ? 'এই পণ্যটির মাত্র ২টি আইটেম স্টকে অবশিষ্ট আছে।'
            : 'Only 2 items left in stock for this selected variant.',
          badge: isBn ? 'সতর্কতা' : 'Warning',
        });
        break;
      case 'info':
        toast.info({
          title: isBn ? 'নতুন কুপন উপলব্ধ' : 'New coupon available',
          description: isBn
            ? 'কুপন কোড GRAM20 ব্যবহারে ২০% পর্যন্ত ছাড় পান।'
            : 'Apply coupon code GRAM20 for up to 20% discount on fresh produce.',
          badge: isBn ? 'অফার' : 'Offer',
          link: {
            href: '/' + lang + '/offers',
            label: isBn ? 'অফারসমূহ' : 'Offers',
          },
        });
        break;
      case 'loading':
        toast.loading({
          title: isBn ? 'পেমেন্ট ভেরিফাই করা হচ্ছে...' : 'Verifying payment...',
          description: isBn
            ? 'অনুগ্রহ করে অপেক্ষা করুন, উইন্ডো বন্ধ করবেন না।'
            : 'Securing transaction credentials with gateway.',
          badge: isBn ? 'অপেক্ষমান' : 'Pending',
        });
        break;
    }
  };

  return (
    <div className={'relative ' + className}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isBn ? 'থিম প্যালেট পরিবর্তন' : 'Switch theme palette'}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/80 bg-card text-card-foreground hover:bg-muted/70 shadow-xs text-xs font-semibold transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Palette className="w-3.5 h-3.5 text-primary" />
        <span className="truncate max-w-[120px]">
          {availablePalettes
            .find((p) => p.id === palette)
            ?.[isBn ? 'nameBn' : 'nameEn']?.split('—')[1]
            ?.trim() || 'Theme'}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[9991] bg-black/40 backdrop-blur-xs sm:bg-transparent sm:backdrop-blur-none"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-x-3 bottom-16 sm:absolute sm:inset-x-auto sm:start-0 sm:bottom-full sm:mb-2 w-auto sm:w-96 max-w-[calc(100vw-24px)] rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl p-4 shadow-2xl z-[9992] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  {isBn ? 'কালার প্যালেট নির্বাচন' : 'Color Palette System'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {isBn
                ? 'এক ক্লিকে সম্পূর্ণ অ্যাপ্লিকেশনের রঙ ও ব্র্যান্ডিং পরিবর্তন করুন।'
                : 'Instantly preview different color identities across the entire Gramer Bazar interface.'}
            </p>

            <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pe-1">
              {availablePalettes.map((p) => {
                const isActive = p.id === palette;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setPalette(p.id as ThemePaletteId);
                    }}
                    className={
                      'w-full p-2.5 rounded-xl border text-start flex items-start gap-3 transition-all cursor-pointer ' +
                      (isActive
                        ? 'border-primary bg-primary/8 shadow-xs'
                        : 'border-border/60 hover:border-border hover:bg-muted/40')
                    }
                  >
                    <div
                      className="w-7 h-7 rounded-lg shrink-0 mt-0.5 shadow-xs flex items-center justify-center border border-black/10"
                      style={{ backgroundColor: p.primaryHex }}
                    >
                      {isActive && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-foreground">
                          {isBn ? p.nameBn : p.nameEn}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-bold text-primary px-1.5 py-0.2 rounded-md bg-primary/10">
                            {isBn ? 'সক্রিয়' : 'Active'}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                        {isBn ? p.descriptionBn : p.descriptionEn}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-border/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-primary" />
                  {isBn ? 'টোস্ট টেস্ট করুন' : 'Test Custom Toasts'}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {isBn ? 'লাইভ প্রিভিউ' : 'Live Preview'}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
                <button
                  type="button"
                  onClick={() => triggerToastDemo('success')}
                  className="px-1.5 py-1 text-[10px] font-semibold rounded-lg gb-btn-preview-success transition-all cursor-pointer text-center"
                >
                  Success
                </button>
                <button
                  type="button"
                  onClick={() => triggerToastDemo('error')}
                  className="px-1.5 py-1 text-[10px] font-semibold rounded-lg gb-btn-preview-error transition-all cursor-pointer text-center"
                >
                  Error
                </button>
                <button
                  type="button"
                  onClick={() => triggerToastDemo('warning')}
                  className="px-1.5 py-1 text-[10px] font-semibold rounded-lg gb-btn-preview-warning transition-all cursor-pointer text-center"
                >
                  Warning
                </button>
                <button
                  type="button"
                  onClick={() => triggerToastDemo('info')}
                  className="px-1.5 py-1 text-[10px] font-semibold rounded-lg gb-btn-preview-info transition-all cursor-pointer text-center"
                >
                  Info
                </button>
                <button
                  type="button"
                  onClick={() => triggerToastDemo('loading')}
                  className="px-1.5 py-1 text-[10px] font-semibold rounded-lg gb-btn-preview-loading transition-all cursor-pointer text-center"
                >
                  Loading
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
