'use client';

import React, { useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { getApiErrorMessage } from '@/lib/apiError';
import { setCredentials } from '@/store/slices/authSlice';
import { useRegisterMutation } from '@/features/auth/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { BrandLogo } from '@/components/common/BrandLogo';
import {
  Eye,
  EyeOff,
  User,
  Phone,
  Mail,
  Lock,
  Store,
  Bike,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function RegisterPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const router = useRouter();
  const dispatch = useDispatch();
  const isBn = lang === 'bn';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [register, { isLoading }] = useRegisterMutation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.password.length < 6) {
      setErrorMsg(
        isBn ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' : 'Password must be at least 6 characters'
      );
      return;
    }

    try {
      const res = await register({
        ...formData,
        role: 'CUSTOMER',
      }).unwrap();

      dispatch(setCredentials({ user: res.user, accessToken: res.accessToken }));
      router.push(`/${lang}`);
    } catch (err) {
      setErrorMsg(
        getApiErrorMessage(err) ||
          (isBn
            ? 'রেজিস্ট্রেশন ব্যর্থ হয়েছে। তথ্য যাচাই করুন।'
            : 'Registration failed. Please check information.')
      );
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-muted' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: isBn ? 'দুর্বল' : 'Weak', color: 'bg-destructive' };
    if (score === 2) return { score: 2, label: isBn ? 'মোটামুটি' : 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: isBn ? 'ভালো' : 'Good', color: 'bg-blue-500' };
    return { score: 4, label: isBn ? 'খুব শক্তিশালী' : 'Strong', color: 'bg-emerald-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Bar with Language Switcher */}
      <header className="h-16 px-4 sm:px-8 flex items-center justify-between border-b border-border/40 shrink-0 bg-background/80 backdrop-blur-md">
        <Link
          href={`/${lang}`}
          className="flex items-center gap-2 group hover:opacity-90 transition-opacity"
        >
          <BrandLogo lang={lang} variant="full" width={140} height={38} />
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher currentLocale={lang} />
        </div>
      </header>

      {/* Main Content: Split-Screen on Desktop */}
      <main className="flex-1 flex min-h-0">
        {/* Left Visual Showcase - Dedicated Membership & Harvest Theme */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-10 xl:p-14 overflow-hidden text-white border-e border-border/40">
          {/* Background Image: Pure Honey, Ghee & Rural Harvest */}
          <Image
            src="/banners/banner-honey-ghee.jpg"
            alt={isBn ? 'খাঁটি গ্রাম্য পণ্য' : 'Authentic Rural Products'}
            fill
            className="object-cover"
            priority
            sizes="50vw"
          />
          {/* Warm Dark Gradient Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/75 to-black/40 z-0" />

          {/* Top Pill - Welcome Offer */}
          <div className="relative z-10 flex items-center gap-2.5">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-xs font-bold text-emerald-300 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {isBn ? 'নতুন সদস্য অফার • স্বাগতম বোনাস' : 'New Member Perks • Welcome Bonus'}
              </span>
            </span>
          </div>

          {/* Center Editorial Narrative with Welcome Voucher */}
          <div className="relative z-10 space-y-5 max-w-lg my-auto py-6">
            <h2 className="text-3xl xl:text-4xl 2xl:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
              {isBn
                ? 'খাঁটি ও প্রাকৃতিক গ্রামীণ পণ্যের সাথে যুক্ত হোন'
                : 'Experience 100% Pure Village Produce Directly'}
            </h2>
            <p className="text-sm xl:text-base text-white/85 leading-relaxed font-medium">
              {isBn
                ? 'সুন্দরবনের প্রাকৃতিক মধু, খাঁটি গাওয়া ঘি, ঘানিভাঙা সরিষার তেল ও টাটকা শাকসবজি সরাসরি খামারিদের কাছ থেকে ঘরে বসেই সংগ্রহ করুন।'
                : 'Direct access to raw organic honey, cold-pressed mustard oil, and pure farm harvests delivered right to your doorstep.'}
            </p>

            {/* Special Welcome Voucher Card */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-between gap-3 shadow-lg">
              <div className="space-y-0.5">
                <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
                  {isBn ? 'প্রথম অর্ডারে বিশেষ ছাড়' : 'First Order Special'}
                </span>
                <p className="text-sm font-bold text-white">
                  {isBn
                    ? 'নিশ্চিত ৫০ টাকা ছাড় পেতে ব্যবহার করুন'
                    : 'Get ৳50 Instant Discount with code'}
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs tracking-wider border border-emerald-300 shrink-0">
                WELCOME50
              </div>
            </div>
          </div>

          {/* Bottom Trust & Satisfaction Metric */}
          <div className="relative z-10 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center space-y-0.5">
                <p className="text-base sm:text-lg font-black text-emerald-300">১০০% খাঁটি</p>
                <p className="text-[11px] text-white/80 font-medium">
                  {isBn ? 'রাসায়নিকমুক্ত' : 'Chemical-Free'}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center space-y-0.5">
                <p className="text-base sm:text-lg font-black text-white">
                  {isBn ? 'ন্যায্য মূল্য' : 'Fair Price'}
                </p>
                <p className="text-[11px] text-white/80 font-medium">
                  {isBn ? 'মধ্যস্বত্বভোগীহীন' : 'Zero Middlemen'}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center space-y-0.5">
                <p className="text-base sm:text-lg font-black text-white">
                  {isBn ? 'সহজ রিটার্ন' : 'Easy Return'}
                </p>
                <p className="text-[11px] text-white/80 font-medium">
                  {isBn ? '১০০% সন্তুষ্টি' : '100% Satisfaction'}
                </p>
              </div>
            </div>

            {/* Testimonial Banner */}
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-between text-xs text-white/90">
              <span className="font-semibold">
                {isBn
                  ? 'দিনাজপুর ও উত্তরাঞ্চলের শীর্ষ প্রশংসিত মার্কেটপ্লেস'
                  : 'Top rated rural marketplace in Dinajpur'}
              </span>
              <span className="text-amber-300 font-bold tracking-wider">৪.৯ ★★★★★</span>
            </div>
          </div>
        </div>

        {/* Right Form Area with Framed Card */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-muted/25 dark:bg-muted/5 overflow-y-auto">
          <div className="w-full max-w-md mx-auto bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/5">
            {/* Mobile Brand Link */}
            <div className="lg:hidden mb-6">
              <Link href={`/${lang}`} className="inline-flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  <Store className="w-4 h-4" />
                </div>
                <span className="font-bold text-lg text-foreground tracking-tight">
                  {isBn ? 'গ্রামের বাজার' : 'Gramer Bazar'}
                </span>
              </Link>
            </div>

            <div className="mb-6 space-y-1.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {isBn ? 'নতুন অ্যাকাউন্ট খুলুন' : 'Create an Account'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isBn
                  ? 'তাজা ও খাঁটি গ্রাম্য পণ্যের দুনিয়ায় আপনাকে স্বাগতম'
                  : 'Join Gramer Bazar for authentic rural produce and groceries.'}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs font-semibold text-foreground/90">
                    {isBn ? 'নামের প্রথমাংশ' : 'First Name'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder={isBn ? 'আব্দুর' : 'John'}
                      required
                      disabled={isLoading}
                      className="h-11 rounded-xl pe-10 text-sm border-border/80 focus-visible:ring-primary/20 focus-visible:border-primary shadow-2xs"
                    />
                    <User className="absolute end-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs font-semibold text-foreground/90">
                    {isBn ? 'নামের শেষাংশ' : 'Last Name'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder={isBn ? 'রহিম' : 'Doe'}
                      required
                      disabled={isLoading}
                      className="h-11 rounded-xl pe-10 text-sm border-border/80 focus-visible:ring-primary/20 focus-visible:border-primary shadow-2xs"
                    />
                    <User className="absolute end-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold text-foreground/90">
                  {isBn ? 'মোবাইল নম্বর' : 'Phone Number'}
                </Label>
                <div className="relative">
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="01XXXXXXXXX"
                    required
                    disabled={isLoading}
                    className="h-11 rounded-xl pe-10 text-sm border-border/80 focus-visible:ring-primary/20 focus-visible:border-primary shadow-2xs"
                  />
                  <Phone className="absolute end-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-foreground/90">
                  {isBn ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="user@example.com"
                    disabled={isLoading}
                    className="h-11 rounded-xl pe-10 text-sm border-border/80 focus-visible:ring-primary/20 focus-visible:border-primary shadow-2xs"
                  />
                  <Mail className="absolute end-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-foreground/90">
                    {isBn ? 'পাসওয়ার্ড' : 'Password'}
                  </Label>
                  {formData.password && (
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {isBn ? 'শক্তি:' : 'Strength:'}{' '}
                      <span className="text-foreground">{passwordStrength.label}</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    disabled={isLoading}
                    className="h-11 rounded-xl pe-10 text-sm border-border/80 focus-visible:ring-primary/20 focus-visible:border-primary shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Progress Bar */}
                {formData.password && (
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          passwordStrength.score >= step ? passwordStrength.color : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                )}

                <p className="text-[11px] text-muted-foreground">
                  {isBn
                    ? 'কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন (সংখ্যা বা অক্ষরের মিশ্রণ)'
                    : 'Must be at least 6 characters (mix letters & numbers)'}
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-sm font-bold shadow-md shadow-primary/20 hover:shadow-primary/30 rounded-xl transition-all mt-2"
                disabled={isLoading}
              >
                {isLoading
                  ? isBn
                    ? 'অ্যাকাউন্ট তৈরি হচ্ছে...'
                    : 'Creating Account...'
                  : isBn
                    ? 'রেজিস্টার করুন'
                    : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-border/60 text-center text-xs">
              <span className="text-muted-foreground">
                {isBn ? 'ইতিমধ্যেই অ্যাকাউন্ট আছে?' : 'Already have an account?'}{' '}
              </span>
              <Link href={`/${lang}/login`} className="font-semibold text-primary hover:underline">
                {isBn ? 'লগইন করুন' : 'Sign In'}
              </Link>
            </div>

            {/* Partner Program Links */}
            <div className="mt-5 p-3.5 rounded-2xl bg-muted/40 border border-border/50 text-xs">
              <p className="font-semibold text-foreground mb-1">
                {isBn ? 'ব্যবসায়ী বা রাইডার হতে চান?' : 'Want to Sell or Deliver?'}
              </p>
              <p className="text-[11px] text-muted-foreground mb-3">
                {isBn
                  ? 'সেলার বা রাইডার হতে সরাসরি আমাদের পার্টনার পোর্টালে আবেদন করুন।'
                  : 'Apply through our partner programs to join our merchant or delivery network.'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={`/${lang}/become-a-seller`}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-background border border-border/80 hover:bg-muted text-foreground font-semibold transition-all shadow-2xs"
                >
                  <Store className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate">{isBn ? 'সেলার আবেদন' : 'Seller Program'}</span>
                </Link>
                <Link
                  href={`/${lang}/become-a-rider`}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-background border border-border/80 hover:bg-muted text-foreground font-semibold transition-all shadow-2xs"
                >
                  <Bike className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate">{isBn ? 'রাইডার আবেদন' : 'Rider Program'}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
