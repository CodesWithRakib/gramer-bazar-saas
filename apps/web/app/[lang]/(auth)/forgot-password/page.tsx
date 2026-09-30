'use client';

import { getApiErrorMessage } from '@/lib/apiError';
import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSendOtpMutation } from '@/features/auth/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Phone, ArrowLeft, KeyRound, AlertCircle, ShieldCheck, HelpCircle, CheckCircle2 } from 'lucide-react';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { BrandLogo } from '@/components/common/BrandLogo';

export default function ForgotPasswordPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const router = useRouter();
  const isBn = lang === 'bn';

  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [sendOtp, { isLoading }] = useSendOtpMutation();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!phone || phone.length < 11) {
      setErrorMsg(
        isBn
          ? 'দয়া করে একটি সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন'
          : 'Please enter a valid 11-digit mobile number'
      );
      return;
    }

    try {
      await sendOtp({ phone }).unwrap();
      router.push(`/${lang}/reset-password?phone=${encodeURIComponent(phone)}`);
    } catch (err) {
      setErrorMsg(
        getApiErrorMessage(err) || (isBn ? 'ওটিপি পাঠাতে সমস্যা হয়েছে' : 'Failed to send OTP code')
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Brand Top Bar */}
      <header className="h-16 px-4 sm:px-8 flex items-center justify-between border-b border-border/40 shrink-0 bg-background/80 backdrop-blur-md">
        <Link
          href={`/${lang}`}
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <BrandLogo lang={lang} variant="full" width={140} height={38} />
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher currentLocale={lang} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-muted/25 dark:bg-muted/5 relative overflow-hidden">
        {/* Subtle Decorative Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-lg bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/5 relative z-10 space-y-6">
          {/* Step Progress Bar */}
          <div className="flex items-center justify-between px-2 text-xs font-semibold">
            <div className="flex items-center gap-2 text-primary font-bold">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                ১
              </span>
              <span>{isBn ? 'নম্বর প্রদান' : 'Phone'}</span>
            </div>
            <div className="h-0.5 flex-1 mx-3 bg-border rounded-full" />
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs">
                ২
              </span>
              <span>{isBn ? 'নতুন পাসওয়ার্ড' : 'New Password'}</span>
            </div>
          </div>

          <div className="text-center pt-2">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4 ring-8 ring-primary/5">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {isBn ? 'পাসওয়ার্ড পুনরুদ্ধার' : 'Forgot Password'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">
              {isBn
                ? 'আপনার নিবন্ধিত মোবাইল নম্বর দিন। আমরা একটি ওটিপি কোড পাঠাব।'
                : 'Enter your registered mobile number to receive a verification code.'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold text-foreground/90">
                {isBn ? 'নিবন্ধিত মোবাইল নম্বর' : 'Registered Mobile Number'}
              </Label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  required
                  disabled={isLoading}
                  className="h-11 rounded-xl pe-10 text-sm border-border/80 focus-visible:ring-primary/20 focus-visible:border-primary shadow-2xs"
                />
                <Phone className="absolute end-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {isBn
                  ? 'আমরা এই নম্বরে এসএমএস এর মাধ্যমে ৬ সংখ্যার ওটিপি পাঠাব'
                  : 'We will send a 6-digit OTP code to this number via SMS'}
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-sm font-bold shadow-md shadow-primary/20 hover:shadow-primary/30 rounded-xl transition-all mt-2"
              disabled={isLoading}
            >
              {isLoading
                ? isBn
                  ? 'কোড পাঠানো হচ্ছে...'
                  : 'Sending Code...'
                : isBn
                  ? 'ওটিপি কোড পাঠান'
                  : 'Send OTP Code'}
            </Button>
          </form>

          {/* Security Advisory Callout */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="text-muted-foreground leading-relaxed text-[11px]">
              <span className="font-semibold text-foreground">
                {isBn ? 'নিরাপত্তা বার্তা: ' : 'Security Notice: '}
              </span>
              {isBn
                ? 'গ্রামের বাজার কর্তৃপক্ষ কখনই ফোন বা মেসেজে আপনার গোপন পিন বা পাসওয়ার্ড চাইবে না।'
                : 'Gramer Bazar will never ask for your confidential OTP or password via phone calls.'}
            </div>
          </div>

          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs font-semibold">
            <Link
              href={`/${lang}/login`}
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
              <span>{isBn ? 'লগইন পৃষ্ঠায় ফিরে যান' : 'Back to Login'}</span>
            </Link>

            <Link
              href={`/${lang}/contact`}
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{isBn ? 'সহায়তা প্রয়োজন?' : 'Need Help?'}</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
