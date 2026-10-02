'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { userHasRole } from '@/lib/roles';
import {
  useSubmitSellerApplicationMutation,
  useGetMySellerApplicationQuery,
} from '@/features/applications/applicationsApi';
import { getApiErrorMessage } from '@/lib/apiError';
import {
  Store,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  ShieldCheck,
  Truck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/custom-toast';
import { Badge } from '@/components/ui/badge';
import { CustomImage } from '@/components/ui/CustomImage';

export default function BecomeASellerPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const isAlreadySeller = userHasRole(user, 'SELLER');

  const { data: myApp, refetch } = useGetMySellerApplicationQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [submitApp, { isLoading: isSubmitting }] = useSubmitSellerApplicationMutation();

  const [formData, setFormData] = useState({
    shopNameEn: '',
    shopNameBn: '',
    shopSlug: '',
    phone: user?.phone || '',
    email: user?.email || '',
    description: '',
    address: '',
    tradeLicenseNumber: '',
    nidNumber: '',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [isReapplying, setIsReapplying] = useState(false);

  const handleStartReapply = () => {
    if (myApp) {
      setFormData({
        shopNameEn: myApp.shopNameEn || '',
        shopNameBn: myApp.shopNameBn || '',
        shopSlug: myApp.shopSlug || '',
        phone: myApp.phone || user?.phone || '',
        email: myApp.email || user?.email || '',
        description: myApp.description || '',
        address: myApp.address || '',
        tradeLicenseNumber: myApp.tradeLicenseNumber || '',
        nidNumber: myApp.nidNumber || '',
      });
    }
    setIsReapplying(true);
  };

  const handleSlugify = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleShopNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      shopNameEn: val,
      shopSlug:
        prev.shopSlug === handleSlugify(prev.shopNameEn) ? handleSlugify(val) : prev.shopSlug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      await submitApp({
        shopNameEn: formData.shopNameEn.trim(),
        shopNameBn: formData.shopNameBn.trim(),
        shopSlug: formData.shopSlug.trim() || handleSlugify(formData.shopNameEn),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        description: formData.description.trim() || undefined,
        address: formData.address.trim() || undefined,
        tradeLicenseNumber: formData.tradeLicenseNumber.trim() || undefined,
        nidNumber: formData.nidNumber.trim() || undefined,
      }).unwrap();

      toast.success(
        isBn
          ? 'আবেদনটি সফলভাবে জমা দেওয়া হয়েছে!'
          : 'Application submitted successfully! Our team will review it shortly.'
      );
      setIsReapplying(false);
      refetch();
    } catch (err) {
      const msg =
        getApiErrorMessage(err) ||
        (isBn ? 'আবেদন জমা দিতে ব্যর্থ হয়েছে' : 'Failed to submit application');
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white py-14 sm:py-20 md:py-24 border-b border-emerald-500/20 shadow-md">
        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
          <CustomImage
            src="/banners/banner-village-market.jpg"
            alt="Seller Hero Banner"
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container max-w-5xl mx-auto px-4 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 text-xs font-semibold text-yellow-300 shadow-xs">
            <Store className="w-4 h-4" />
            <span>{isBn ? 'গ্রামের বাজার সেলার নেটওয়ার্ক' : 'Gramer Bazar Merchant Network'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            {isBn
              ? 'আপনার স্থানীয় ব্যবসা ছড়িয়ে দিন হাজারো গ্রাহকের কাছে'
              : 'Grow Your Local Business Across Rural Bangladesh'}
          </h1>

          <p className="max-w-2xl mx-auto text-white/85 text-xs sm:text-base md:text-lg leading-relaxed">
            {isBn
              ? 'জিরো প্ল্যাটফর্ম ফিতে যুক্ত হোন গ্রামের বাজারের সাথে। সহজেই পণ্য তালিকাভুক্ত করুন এবং দ্রুত ডেলিভারির মাধ্যমে আপনার বিক্রি বাড়ান।'
              : 'Join as a verified merchant. Reach thousands of local households in your Upazila with automated catalog management, direct weekly settlements, and swift deliveries.'}
          </p>

          {/* Quick Stats Pills */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-semibold text-emerald-200">
            <span className="bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-1 rounded-full">
              ✨ {isBn ? '০% প্ল্যাটফর্ম ফি' : '0% Initial Platform Fee'}
            </span>
            <span className="bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-1 rounded-full">
              ⚡ {isBn ? '২৪ ঘণ্টায় ভেরিফিকেশন' : '24h Fast Approval'}
            </span>
            <span className="bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-1 rounded-full">
              💰 {isBn ? 'সাপ্তাহিক সরাসরি পেআউট' : 'Weekly Direct Settlements'}
            </span>
          </div>

          {!isAuthenticated && (
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-stone-900 font-extrabold rounded-2xl px-8 h-12 shadow-lg transition-transform active:scale-95" asChild>
                <Link
                  href={`/${lang}/login?redirect=${encodeURIComponent(`/${lang}/become-a-seller`)}`}
                >
                  {isBn ? 'লগইন করে আবেদন করুন' : 'Login to Apply'}
                  <ArrowRight className="w-4 h-4 ms-2 rtl:rotate-180" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/25 rounded-2xl px-8 h-12 backdrop-blur-sm" asChild>
                <Link href={`/${lang}/register`}>
                  {isBn ? 'নতুন অ্যাকাউন্ট খুলুন' : 'Create Free Account'}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* 4-Step Onboarding Timeline */}
      <section className="container max-w-5xl mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="text-center mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              {isBn ? 'সহজ ৪ ধাপে সেলার হওয়ার উপায়' : 'Become a Verified Seller in 4 Easy Steps'}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {isBn ? 'ঝামেলামুক্ত দ্রুত ভেরিফিকেশন ও লিস্টিং প্রক্রিয়া' : 'Frictionless digital onboarding designed for local traders & farmers'}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">1</div>
              <h3 className="font-bold text-xs sm:text-sm text-foreground">{isBn ? '১. আবেদন জমা দিন' : '1. Submit Form'}</h3>
              <p className="text-[11px] text-muted-foreground">{isBn ? 'দোকানের নাম, ঠিকানা এবং NID/ট্রেড লাইসেন্স প্রদান করুন।' : 'Fill shop info, category, and valid NID/Trade License details.'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">2</div>
              <h3 className="font-bold text-xs sm:text-sm text-foreground">{isBn ? '২. হাব ভেরিফিকেশন' : '2. Hub Verification'}</h3>
              <p className="text-[11px] text-muted-foreground">{isBn ? 'আমাদের উপজেলা টিম ২৪ ঘণ্টার মধ্যে যাচাই ও অনুমোদন করবে।' : 'Our local Upazila team reviews and activates your account.'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">3</div>
              <h3 className="font-bold text-xs sm:text-sm text-foreground">{isBn ? '৩. পণ্য তালিকাভুক্ত করুন' : '3. List Products'}</h3>
              <p className="text-[11px] text-muted-foreground">{isBn ? 'সেলার পোর্টাল থেকে ছবি ও দামসহ পণ্য যোগ করুন সহজে।' : 'Upload catalog items with simple photo and price inputs.'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">4</div>
              <h3 className="font-bold text-xs sm:text-sm text-foreground">{isBn ? '৪. ডেলিভারি ও পেআউট' : '4. Fulfill & Earn'}</h3>
              <p className="text-[11px] text-muted-foreground">{isBn ? 'রাইডার এসে পার্সেল নেবে এবং প্রতি সপ্তাহে সরাসরি টাকা বুঝে নিন।' : 'Riders pick up orders, and revenue settles weekly directly.'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="container max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-card border shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">
              {isBn ? 'বিক্রি ও আয় বৃদ্ধি' : 'Accelerated Revenue'}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isBn
                ? 'স্থানীয় বাজার ও প্রত্যন্ত এলাকার ক্রেতাদের সরাসরি আপনার দোকানে আকর্ষণ করুন।'
                : 'Tap into ready demand across your union and upazila without needing storefront expansion.'}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-card border shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">
              {isBn ? 'সহজ ডেলিভারি নেটওয়ার্ক' : 'Dedicated Delivery Network'}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isBn
                ? 'ডেলিভারির চিন্তা নেই। গ্রামের বাজারের নিজস্ব রাইডার টিম আপনার দোকান থেকে পণ্য তুলে পৌঁছে দেবে।'
                : 'Our verified local rider network picks up from your shop and handles doorstep delivery.'}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-card border shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">
              {isBn ? 'স্বচ্ছ ও নিরাপদ পেআউট' : 'Transparent Payouts'}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isBn
                ? 'বিকাশ, নগদ বা ব্যাংক অ্যাকাউন্টে নিয়মিত এবং ঝামেলামুক্ত পেমেন্ট গ্রহণ করুন।'
                : 'Direct digital settlements to your mobile financial wallet (bKash/Nagad) or bank.'}
            </p>
          </div>
        </div>
      </section>

      {/* Application / Status Section */}
      <section className="container max-w-3xl mx-auto px-4 py-8">
        {isAlreadySeller ? (
          <div className="p-8 rounded-3xl bg-card border shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">
              {isBn ? 'আপনি একজন অনুমোদিত সেলার!' : 'You Are an Approved Seller!'}
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              {isBn
                ? 'আপনার দোকান সক্রিয় রয়েছে। সেলার পোর্টালে গিয়ে পণ্য তালিকাভুক্ত ও অর্ডার পরিচালনা করুন।'
                : 'Your merchant profile is active. Access your dedicated portal to list products and fulfill incoming orders.'}
            </p>
            <div className="pt-2">
              <Button asChild size="lg" className="rounded-2xl px-8 shadow-sm">
                <Link href={`/${lang}/seller`}>
                  {isBn ? 'সেলার পোর্টাল খুলুন' : 'Go to Seller Portal'}
                  <ArrowRight className="w-4 h-4 ms-2 rtl:rotate-180" />
                </Link>
              </Button>
            </div>
          </div>
        ) : myApp && !isReapplying ? (
          <div className="p-8 rounded-3xl bg-card border shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  {isBn ? 'আপনার আবেদনের বর্তমান অবস্থা' : 'Your Seller Application Status'}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isBn ? 'আবেদনের তারিখ:' : 'Submitted on:'}{' '}
                  {new Date(myApp.createdAt).toLocaleDateString()}
                </p>
              </div>

              {myApp.status === 'PENDING' && (
                <Badge className="bg-amber-50 text-amber-800 border-amber-300 gap-1.5 px-3 py-1 text-sm font-semibold">
                  <Clock className="w-4 h-4" />
                  {isBn ? 'পর্যালোচনাধীন' : 'Under Review'}
                </Badge>
              )}

              {myApp.status === 'APPROVED' && (
                <Badge className="bg-emerald-500 text-white gap-1.5 px-3 py-1 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  {isBn ? 'অনুমোদিত' : 'Approved'}
                </Badge>
              )}

              {myApp.status === 'REJECTED' && (
                <Badge variant="destructive" className="gap-1.5 px-3 py-1 text-sm font-semibold">
                  <XCircle className="w-4 h-4" />
                  {isBn ? 'বাতিল' : 'Rejected'}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/30 border text-sm">
              <div>
                <span className="text-xs text-muted-foreground block">
                  {isBn ? 'দোকানের নাম' : 'Shop Name'}
                </span>
                <span className="font-semibold">
                  {myApp.shopNameEn} ({myApp.shopNameBn})
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  {isBn ? 'ফোন নম্বর' : 'Phone'}
                </span>
                <span className="font-semibold">{myApp.phone}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  {isBn ? 'ট্রেড লাইসেন্স' : 'Trade License'}
                </span>
                <span className="font-mono">{myApp.tradeLicenseNumber || '—'}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">
                  {isBn ? 'জাতীয় পরিচয়পত্র' : 'NID'}
                </span>
                <span className="font-mono">{myApp.nidNumber || '—'}</span>
              </div>
            </div>

            {myApp.status === 'PENDING' && (
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-sm text-muted-foreground flex gap-3 items-start">
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p>
                  {isBn
                    ? 'আমাদের অ্যাডমিন টিম আপনার আবেদন এবং নথিপত্র যাচাই করছে। অনুমোদন সম্পন্ন হলে আপনার অ্যাকাউন্টে সেলার অ্যাক্সেস চালু হয়ে যাবে।'
                    : 'Our verification team is reviewing your documents. Once approved, your account will immediately unlock seller capabilities.'}
                </p>
              </div>
            )}

            {myApp.status === 'REJECTED' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  <span className="font-bold block mb-1">
                    {isBn ? 'বাতিলের কারণ:' : 'Reason for Rejection:'}
                  </span>
                  <p>
                    {myApp.adminNotes ||
                      (isBn
                        ? 'প্রদত্ত তথ্য যাচাই করা যায়নি।'
                        : 'Submitted details could not be verified.')}
                  </p>
                </div>
                <div className="pt-2 flex justify-center">
                  <Button
                    type="button"
                    onClick={handleStartReapply}
                    variant="outline"
                    className="rounded-2xl px-6 gap-2"
                  >
                    {isBn ? 'সংশোধন করে পুনরায় আবেদন করুন' : 'Edit & Resubmit Application'}
                  </Button>
                </div>
              </div>
            )}

            {myApp.status === 'APPROVED' && (
              <div className="pt-2 text-center">
                <Button asChild size="lg" className="rounded-2xl px-8 shadow-sm">
                  <Link href={`/${lang}/seller`}>
                    {isBn ? 'সেলার পোর্টাল খুলুন' : 'Launch Seller Portal'}
                    <ArrowRight className="w-4 h-4 ms-2 rtl:rotate-180" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        ) : !isAuthenticated ? (
          <div className="p-8 rounded-3xl bg-card border shadow-sm text-center space-y-4">
            <h2 className="text-2xl font-bold">
              {isBn ? 'আবেদন শুরু করতে লগইন করুন' : 'Login to Start Your Application'}
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              {isBn
                ? 'সেলার হতে হলে প্রথমে আপনার গ্রাহক অ্যাকাউন্ট দিয়ে লগইন অথবা একটি নতুন অ্যাকাউন্ট তৈরি করতে হবে।'
                : 'To apply as a vendor partner, please sign in with your customer account or create a new one.'}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Button asChild className="rounded-xl px-6">
                <Link
                  href={`/${lang}/login?redirect=${encodeURIComponent(`/${lang}/become-a-seller`)}`}
                >
                  {isBn ? 'লগইন' : 'Login'}
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl px-6">
                <Link href={`/${lang}/register`}>{isBn ? 'রেজিস্টার' : 'Register'}</Link>
              </Button>
            </div>
          </div>
        ) : (
          /* Application Form */
          <div className="p-8 rounded-3xl bg-card border shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {isReapplying
                    ? isBn
                      ? 'সংশোধিত সেলার আবেদন'
                      : 'Resubmit Updated Seller Application'
                    : isBn
                      ? 'সেলার পার্টনারশিপ আবেদন ফরম'
                      : 'Seller Partner Application Form'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {isBn
                    ? 'আপনার দোকানের সঠিক তথ্য প্রদান করুন। অ্যাডমিন পর্যালোচনার পর আপনার স্টোর সক্রিয় হবে।'
                    : 'Please provide authentic business details for verification and onboarding.'}
                </p>
              </div>
              {isReapplying && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsReapplying(false)}
                  className="self-start sm:self-center"
                >
                  {isBn ? 'বাতিল করুন' : 'Cancel'}
                </Button>
              )}
            </div>

            {errorMsg && (
              <div className="p-4 rounded-2xl bg-destructive/10 text-destructive text-sm font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="shopNameEn">
                    {isBn ? 'দোকানের নাম (ইংরেজি)' : 'Shop Name (English)'}
                  </Label>
                  <Input
                    id="shopNameEn"
                    value={formData.shopNameEn}
                    onChange={handleShopNameChange}
                    placeholder="Green Agro Farm"
                    required
                    disabled={isSubmitting}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="shopNameBn">
                    {isBn ? 'দোকানের নাম (বাংলা)' : 'Shop Name (Bengali)'}
                  </Label>
                  <Input
                    id="shopNameBn"
                    value={formData.shopNameBn}
                    onChange={(e) => setFormData((p) => ({ ...p, shopNameBn: e.target.value }))}
                    placeholder="গ্রিন এগ্রো ফার্ম"
                    required
                    disabled={isSubmitting}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="shopSlug">
                  {isBn ? 'শপ ওয়েব ইউআরএল স্ল্যাগ' : 'Shop URL Slug'}
                </Label>
                <div className="flex items-center rounded-xl border bg-muted/20 px-3">
                  <span className="text-xs text-muted-foreground select-none">
                    gramerbazar.com/shops/
                  </span>
                  <Input
                    id="shopSlug"
                    value={formData.shopSlug}
                    onChange={(e) => setFormData((p) => ({ ...p, shopSlug: e.target.value }))}
                    placeholder="green-agro-farm"
                    required
                    disabled={isSubmitting}
                    className="border-0 shadow-none focus-visible:ring-0 px-1 py-0 h-10 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">{isBn ? 'যোগাযোগের মোবাইল নম্বর' : 'Phone Number'}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                    required
                    disabled={isSubmitting}
                    placeholder="01711223344"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">{isBn ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    disabled={isSubmitting}
                    placeholder="shop@example.com"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="tradeLicenseNumber">
                    {isBn ? 'ট্রেড লাইসেন্স নম্বর (যদি থাকে)' : 'Trade License No. (Optional)'}
                  </Label>
                  <Input
                    id="tradeLicenseNumber"
                    value={formData.tradeLicenseNumber}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        tradeLicenseNumber: e.target.value,
                      }))
                    }
                    disabled={isSubmitting}
                    placeholder="TL-882736"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nidNumber">{isBn ? 'এনআইডি নম্বর' : 'National ID No.'}</Label>
                  <Input
                    id="nidNumber"
                    value={formData.nidNumber}
                    onChange={(e) => setFormData((p) => ({ ...p, nidNumber: e.target.value }))}
                    disabled={isSubmitting}
                    placeholder="1990123456789"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address">{isBn ? 'দোকানের ঠিকানা' : 'Store Address'}</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                  disabled={isSubmitting}
                  placeholder="Khansama Bazar, Dinajpur"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">
                  {isBn ? 'দোকান ও পণ্যের বিবরণ' : 'Description of Goods'}
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  disabled={isSubmitting}
                  placeholder="Fresh organic vegetables, seeds, local poultry, etc."
                  className="rounded-xl min-h-[90px]"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full rounded-2xl shadow-sm mt-4"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? isBn
                    ? 'আবেদন জমা হচ্ছে...'
                    : 'Submitting Application...'
                  : isBn
                    ? 'আবেদন জমা দিন'
                    : 'Submit Seller Application'}
              </Button>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}
