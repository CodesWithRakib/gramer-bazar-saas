'use client';

import { getApiErrorMessage } from '@/lib/apiError';
import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSendOtpMutation } from '@/features/auth/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Phone, ArrowLeft, KeyRound } from 'lucide-react';
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
      setErrorMsg(isBn ? 'দয়া করে একটি সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন' : 'Please enter a valid 11-digit mobile number');
      return;
    }

    try {
      await sendOtp({ phone }).unwrap();
      router.push(`/${lang}/reset-password?phone=${encodeURIComponent(phone)}`);
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err) || (isBn ? 'ওটিপি পাঠাতে সমস্যা হয়েছে' : 'Failed to send OTP code'));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      {/* Brand Top Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <Link href={`/${lang}`} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <BrandLogo lang={lang} variant="full" width={140} height={38} />
        </Link>
        <LanguageSwitcher currentLocale={lang} />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-card border rounded-xl p-6 sm:p-8">
          <div className="mb-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {isBn ? 'পাসওয়ার্ড পুনরুদ্ধার' : 'Forgot Password'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isBn
                ? 'আপনার অ্যাকাউন্টের সাথে যুক্ত মোবাইল নম্বর দিন'
                : 'Enter your registered mobile number to receive a reset code'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">{isBn ? 'মোবাইল নম্বর' : 'Mobile Number'}</Label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                {isBn ? 'আমরা একটি ৬ সংখ্যার ভেরিফিকেশন কোড পাঠাব' : 'We will send a 6-digit verification code'}
              </p>
            </div>

            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isLoading}>
              {isLoading
                ? (isBn ? 'কোড পাঠানো হচ্ছে...' : 'Sending Code...')
                : (isBn ? 'ভেরিফিকেশন কোড পাঠান' : 'Send Verification Code')}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t text-center">
            <Link
              href={`/${lang}/login`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isBn ? 'লগইন পৃষ্ঠায় ফিরে যান' : 'Back to Login'}</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
