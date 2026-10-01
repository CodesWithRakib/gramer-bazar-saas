'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { CategoryCard } from '@/components/catalog/CategoryCard';
import { ShopCard } from '@/components/catalog/ShopCard';
import { ProductRequestModal } from '@/components/catalog/ProductRequestModal';
import { useGetHomepageDataQuery } from '@/features/catalog/catalogApi';
import { useGetPublicCouponsQuery } from '@/features/coupons/couponsApi';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import {
  ArrowRight,
  ShieldCheck,
  Leaf,
  Clock,
  MapPin,
  Sparkles,
  Store,
  Flame,
  PackagePlus,
  Ticket,
  Copy,
} from 'lucide-react';
import { toast } from '@/components/ui/custom-toast';
import { motion } from 'framer-motion';
import { MarketplaceHero } from '@/components/home/MarketplaceHero';
import { FlashSalesSection } from '@/components/home/FlashSalesSection';
import { PromotionalModal } from '@/components/promotions/PromotionalModal';
import { formatCurrency, formatDate } from '@/lib/format';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const motionProps = {
  initial: 'hidden' as const,
  whileInView: 'visible' as const,
  viewport: { once: true, margin: '-60px' },
  variants: fadeUp,
  transition: { duration: 0.35 },
};

interface SectionHeaderProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  viewAllLabel: string;
  viewAllHref: string;
}

/**
 * Shared section header used by every homepage block so headings, "view all"
 * links and RTL arrow direction stay identical across sections.
 */
function SectionHeader({
  icon,
  title,
  description,
  viewAllLabel,
  viewAllHref,
}: SectionHeaderProps) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-2.5">
        {icon && <div className="rounded-lg bg-primary/10 p-1.5 text-primary">{icon}</div>}
        <div className="min-w-0">
          <h2 className="text-lg font-bold tracking-tight text-foreground md:text-xl lg:text-2xl">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground md:text-sm">{description}</p>
          )}
        </div>
      </div>
      <Link
        href={viewAllHref}
        className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline md:text-sm"
      >
        <span>{viewAllLabel}</span>
        <ArrowRight className="h-4 w-4 rtl:rotate-180" />
      </Link>
    </div>
  );
}

export default function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';

  // Single performant cached endpoint returning curated homepage data
  const { data: homeData, isLoading, isError, refetch } = useGetHomepageDataQuery();
  const { data: coupons = [] } = useGetPublicCouponsQuery();

  const categories = homeData?.categories || [];
  const featuredProducts = homeData?.featuredProducts || [];
  const popularProducts = homeData?.popularProducts || [];
  const featuredShops = homeData?.featuredShops || [];
  const categorySections = homeData?.categorySections || [];
  const recentlyAdded = homeData?.recentlyAdded || [];

  // Lazily capture "now" so the coupon expiry check is not an impure call
  // during render.
  const [now] = React.useState(() => Date.now());
  const activeCoupons = coupons.filter(
    (c) => c.isActive !== false && !c.shopId && (!c.endDate || new Date(c.endDate).getTime() > now)
  );

  const copyCoupon = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(isBn ? `কুপন কোড ${code} কপি হয়েছে` : `Coupon code ${code} copied`);
    } catch {
      toast.info(code);
    }
  };

  if (isError) {
    return (
      <div className="container mx-auto px-4 pt-6">
        <MarketplaceHero lang={lang} />
        <div className="mt-8">
          <ErrorState
            isBn={isBn}
            title={isBn ? 'ক্যাটালগ লোড করা যায়নি' : 'Could not load the catalog'}
            message={
              isBn
                ? 'সার্ভার থেকে পণ্য ও ক্যাটাগরি সংগ্রহ করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।'
                : 'We could not fetch products and categories. Check your connection and try again.'
            }
            onRetry={() => refetch()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-24 md:gap-14 md:pb-16 w-full min-w-0 max-w-full overflow-x-hidden">
      {/* Promotional Campaign Modal (frequency controlled) */}
      <PromotionalModal lang={lang} />

      {/* 1. Header / Hero / Search / Banners (Strictly NO Gradients) */}
      <section className="container mx-auto mt-4 px-4 max-w-7xl">
        <MarketplaceHero lang={lang} />
      </section>

      {/* 2. Trust USPs */}
      <section className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border/80 bg-card p-5 shadow-xs md:grid-cols-4 md:gap-6 md:p-6">
          {[
            {
              icon: MapPin,
              iconClass: 'bg-primary/10 text-primary',
              title: isBn ? 'আপনার এলাকায়' : 'Local delivery',
              desc: isBn ? 'খানসামা ও সংলগ্ন অঞ্চল' : 'Khansama & nearby',
            },
            {
              icon: ShieldCheck,
              iconClass: 'bg-primary/10 text-primary',
              title: isBn ? 'ভেরিফাইড দোকান' : 'Verified sellers',
              desc: isBn ? '১০০% আসল ও নিরাপদ' : '100% genuine',
            },
            {
              icon: Leaf,
              iconClass: 'bg-primary/10 text-primary',
              title: isBn ? 'তাজা ও খাঁটি পণ্য' : 'Fresh & pure',
              desc: isBn ? 'সরাসরি খামার থেকে' : 'Farm fresh daily',
            },
            {
              icon: Clock,
              iconClass: 'bg-primary/10 text-primary',
              title: isBn ? 'ক্যাশ অন ডেলিভারি' : 'Cash on delivery',
              desc: isBn ? 'পণ্য হাতে পেয়ে মূল্য দিন' : 'Pay when received',
            },
          ].map((usp) => {
            const Icon = usp.icon;
            return (
              <div
                key={usp.title}
                className="flex flex-col items-center justify-center gap-2 p-2 text-center"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-xs md:h-12 md:w-12 ${usp.iconClass}`}
                >
                  <Icon className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-foreground md:text-sm">{usp.title}</h3>
                  <p className="text-[11px] text-muted-foreground md:text-xs">{usp.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Category Discovery (Shop by Category) */}
      <section className="container mx-auto px-4 max-w-7xl">
        <SectionHeader
          title={isBn ? 'ক্যাটাগরি ব্রাউজ করুন' : 'Shop by category'}
          description={
            isBn
              ? 'আপনার প্রয়োজনীয় খাদ্য, মুদি ও নিত্যপণ্য নির্বাচন করুন'
              : 'Find groceries, essentials and more'
          }
          viewAllLabel={isBn ? 'সকল ক্যাটাগরি' : 'All categories'}
          viewAllHref={`/${lang}/categories`}
        />

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {categories.slice(0, 7).map((category) => (
              <CategoryCard key={category.id} category={category} lang={lang} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Featured Products (Curated small set) */}
      {isLoading ? (
        <section className="container mx-auto px-4 max-w-7xl">
          <Skeleton className="mb-4 h-8 w-48 rounded-lg" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-2xl" />
            ))}
          </div>
        </section>
      ) : featuredProducts.length > 0 ? (
        <motion.section
          {...motionProps}
          className="container mx-auto px-4 max-w-7xl overflow-hidden"
        >
          <SectionHeader
            icon={<Sparkles className="h-5 w-5" />}
            title={isBn ? 'নির্বাচিত পণ্যসমূহ' : 'Featured products'}
            description={
              isBn
                ? 'স্থানীয় বাজারের সেরা মানের কিউরেটেড পণ্য'
                : 'Handpicked quality from local sellers'
            }
            viewAllLabel={isBn ? 'সব দেখুন' : 'View all'}
            viewAllHref={`/${lang}/products?featured=true`}
          />
          <ProductGrid products={featuredProducts} isLoading={false} lang={lang} />
        </motion.section>
      ) : null}

      {/* 5. Today's offers / coupons — a deliberately different presentation */}
      {activeCoupons.length > 0 && (
        <section className="container mx-auto px-4 max-w-7xl">
          <SectionHeader
            icon={<Ticket className="h-5 w-5" />}
            title={isBn ? 'আজকের কুপন ও অফার' : "Today's coupons & offers"}
            description={
              isBn
                ? 'চেকআউটে কোড ব্যবহার করে সাথে সাথে ছাড় নিন'
                : 'Apply a code at checkout to save'
            }
            viewAllLabel={isBn ? 'সব অফার' : 'All offers'}
            viewAllHref={`/${lang}/offers`}
          />
          <div className="w-full min-w-0 max-w-full overflow-hidden">
            <div
              className="hide-scrollbar scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 w-full min-w-0 max-w-full overscroll-x-contain"
              data-scroll-x
            >
              {activeCoupons.slice(0, 6).map((coupon) => {
                const value =
                  coupon.discountType === 'PERCENTAGE'
                    ? `${coupon.discountValue}% ${isBn ? 'ছাড়' : 'OFF'}`
                    : `${formatCurrency(coupon.discountValue)} ${isBn ? 'ছাড়' : 'OFF'}`;
                return (
                  <div
                    key={coupon.id}
                    className="w-[190px] min-w-[190px] sm:w-[220px] sm:min-w-[220px] snap-start shrink-0 flex flex-col"
                  >
                    <Card className="w-full h-full rounded-xl sm:rounded-2xl border-dashed border-primary/40 bg-primary/5 p-3 sm:p-3.5 shadow-2xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Ticket className="h-3.5 w-3.5" />
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-foreground">
                            {value}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground line-clamp-1">
                          {isBn ? 'সর্বনিম্ন অর্ডার' : 'Min. order'}{' '}
                          {formatCurrency(coupon.minOrderAmount)}
                          {coupon.endDate ? (
                            <>
                              <span aria-hidden className="mx-1">
                                •
                              </span>
                              {isBn ? 'মেয়াদ' : 'ends'} {formatDate(coupon.endDate, lang, 'short')}
                            </>
                          ) : null}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyCoupon(coupon.code)}
                        className="mt-2.5 flex w-full items-center justify-between gap-1.5 rounded-lg border border-dashed border-primary/50 bg-background px-2.5 py-1.5 text-start transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="font-mono text-[11px] sm:text-xs font-bold tracking-wide text-primary">
                          {coupon.code}
                        </span>
                        <Copy className="h-3 w-3 shrink-0 text-primary" />
                        <span className="sr-only">
                          {isBn ? `${coupon.code} কপি করুন` : `Copy code ${coupon.code}`}
                        </span>
                      </button>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 6. Popular Products */}
      {!isLoading && popularProducts.length > 0 ? (
        <section className="container mx-auto border-t border-border/40 px-4 pt-10 max-w-7xl overflow-hidden">
          <SectionHeader
            icon={<Flame className="h-5 w-5 fill-current" />}
            title={isBn ? 'জনপ্রিয় পণ্য' : 'Popular products'}
            description={isBn ? 'গ্রাহকদের সবচেয়ে পছন্দের পণ্য' : 'Most loved by village shoppers'}
            viewAllLabel={isBn ? 'সব দেখুন' : 'View all'}
            viewAllHref={`/${lang}/products?sort=popular`}
          />
          <ProductGrid products={popularProducts} isLoading={false} lang={lang} />
        </section>
      ) : null}

      {/* 7. Featured Local Shops */}
      {!isLoading && featuredShops.length > 0 ? (
        <motion.section
          {...motionProps}
          className="container mx-auto border-t border-border/40 px-4 pt-10 max-w-7xl overflow-hidden"
        >
          <SectionHeader
            icon={<Store className="h-5 w-5" />}
            title={isBn ? 'স্থানীয় বিশ্বস্ত দোকান' : 'Featured local shops'}
            description={
              isBn
                ? 'আপনার আশেপাশের বিশ্বস্ত ব্যবসায়ীদের দোকান থেকে কিনুন'
                : 'Support neighborhood stores near you'
            }
            viewAllLabel={isBn ? 'সব দোকান' : 'All shops'}
            viewAllHref={`/${lang}/shops`}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {featuredShops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} lang={lang} />
            ))}
          </div>
        </motion.section>
      ) : null}

      {/* 8. Active Flash Sales / Offers */}
      <FlashSalesSection lang={lang} />

      {/* 9. Independent Category Shelves */}
      {categorySections.length > 0 && (
        <div className="container mx-auto space-y-12 border-t border-border/40 px-4 pt-10 max-w-7xl overflow-hidden">
          {categorySections.map((sec) => {
            const { category, products } = sec;
            const categoryName = isBn ? category.nameBn : category.nameEn;
            const categoryDesc = isBn
              ? category.descriptionBn || category.descriptionEn
              : category.descriptionEn;

            return (
              <section key={category.id} className="space-y-4 max-w-7xl overflow-hidden">
                <SectionHeader
                  icon={
                    <span className="text-base leading-none" aria-hidden>
                      {category.icon || '📦'}
                    </span>
                  }
                  title={categoryName}
                  description={categoryDesc || undefined}
                  viewAllLabel={isBn ? `সব ${categoryName} দেখুন` : `View all ${categoryName}`}
                  viewAllHref={`/${lang}/categories/${category.slug}`}
                />

                <ProductGrid products={products} isLoading={false} lang={lang} />
              </section>
            );
          })}
        </div>
      )}

      {/* 10. Recently Added Products */}
      {!isLoading && recentlyAdded.length > 0 ? (
        <motion.section
          {...motionProps}
          className="container mx-auto border-t border-border/40 px-4 pt-10 max-w-7xl overflow-hidden"
        >
          <SectionHeader
            icon={<PackagePlus className="h-5 w-5" />}
            title={isBn ? 'নতুন যুক্ত পণ্য' : 'Recently added'}
            description={
              isBn ? 'সম্প্রতি বাজারে যুক্ত হওয়া পণ্যসমূহ' : 'Fresh arrivals just listed'
            }
            viewAllLabel={isBn ? 'সব দেখুন' : 'View all'}
            viewAllHref={`/${lang}/products?sort=newest`}
          />
          <ProductGrid products={recentlyAdded} isLoading={false} lang={lang} />
        </motion.section>
      ) : null}

      {/* 11. Product Request Banner CTA (Solid Primary Surface - Strictly NO Gradients) */}
      <motion.section {...motionProps} className="container mx-auto px-4 max-w-7xl overflow-hidden">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary p-8 text-center text-primary-foreground shadow-md md:p-12">
          <div className="relative z-10 mx-auto max-w-2xl space-y-4">
            <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              {isBn
                ? 'আপনার প্রয়োজনীয় পণ্যটি খুঁজে পাচ্ছেন না?'
                : 'Cannot find what you are looking for?'}
            </h2>
            <p className="text-sm leading-relaxed text-primary-foreground/90 md:text-base">
              {isBn
                ? 'আমাদের জানান আপনার কী প্রয়োজন। আমাদের টিম স্থানীয় বাজার ও খামার থেকে সংগ্রহ করে আপনার দোরগোড়ায় পৌঁছে দেবে।'
                : 'Tell us what you need. Our local sourcing team will find it from farmers or trusted merchants and deliver it to your door.'}
            </p>
            <div className="pt-2">
              <ProductRequestModal
                lang={lang}
                trigger={
                  <Button
                    size="lg"
                    className="rounded-xl bg-background px-8 py-3 font-bold text-foreground shadow-xs hover:bg-background/90"
                  >
                    {isBn ? 'পণ্যের রিকোয়েস্ট পাঠান' : 'Request a product'}
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
