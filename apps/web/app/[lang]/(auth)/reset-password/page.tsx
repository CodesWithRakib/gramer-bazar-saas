'use client';

import { getApiErrorMessage } from '@/lib/apiError';
import React, { useState, use, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useResetPasswordMutation, useSendOtpMutation } from '@/features/auth/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  Lock,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Check,
  X,
  Phone,
} from 'lucide-react';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { BrandLogo } from '@/components/common/BrandLogo';

function ResetPasswordForm({ lang }: { lang: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBn = lang === 'bn';

  const initialPhone = searchParams.get('phone') || '';

  const [phone, setPhone] = useState(initialPhone);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();
  const [sendOtp, { isLoading: isResending }] = useSendOtpMutation();

  const isPasswordMatch = newPassword.length >= 6 && newPassword === confirmPassword;
  const isPasswordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handleResend = async () => {
    if (!phone) return;
    try {
      await sendOtp({ phone }).unwrap();
      setErrorMsg('');
      setSuccessMsg(isBn ? 'নতুন ওটিপি কোড পাঠানো হয়েছে' : 'A new OTP code has been sent');
    } catch (err) {
      setErrorMsg(
        getApiErrorMessage(err) || (isBn ? 'কোড পুনরায় পাঠাতে ব্যর্থ' : 'Failed to resend code')
      );
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setErrorMsg(
        isBn ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' : 'Password must be at least 6 characters'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg(isBn ? 'উভয় পাসওয়ার্ড এক হতে হবে' : 'Passwords do not match');
      return;
    }

    try {
      await resetPassword({ phone, otp, newPassword }).unwrap();
      setSuccessMsg(
        isBn
          ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে! লগইন করুন।'
          : 'Password reset successfully! Please sign in.'
      );
      setTimeout(() => {
        router.push(`/${lang}/login`);
      }, 2000);
    } catch (err) {
      setErrorMsg(
        getApiErrorMessage(err) ||
          (isBn
            ? 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে। ওটিপি যাচাই করুন।'
            : 'Failed to reset password. Check your OTP.')
      );
    }
  };

  return (
    <div className="w-full max-w-lg bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/5 relative z-10 space-y-6">
      {/* Step Progress Bar */}
      <div className="flex items-center justify-between px-2 text-xs font-semibold">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
          <span className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs">
            ✓
          </span>
          <span>{isBn ? 'নম্বর যাচাইকৃত' : 'Phone Verified'}</span>
        </div>
        <div className="h-0.5 flex-1 mx-3 bg-primary rounded-full" />
        <div className="flex items-center gap-2 text-primary font-bold">
          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
            ২
          </span>
          <span>{isBn ? 'নতুন পাসওয়ার্ড' : 'New Password'}</span>
        </div>
      </div>

      <div className="text-center pt-1">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4 ring-8 ring-primary/5">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {isBn ? 'নতুন পাসওয়ার্ড নির্ধারণ' : 'Set New Password'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">
          {isBn
            ? 'ফোনে আসা ৬ সংখ্যার কোড এবং আপনার নতুন পাসওয়ার্ড লিখুন।'
            : 'Enter the 6-digit verification code and your new password.'}
        </p>

        {phone && (
          <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-muted/60 border border-border/80 text-xs font-medium text-muted-foreground">
            <Phone className="w-3.5 h-3.5 text-primary" />
            <span>
              {isBn ? 'কোড পাঠানো হয়েছে:' : 'Sent to:'}{' '}
              <strong className="text-foreground">{phone}</strong>
            </span>
            <Link
              href={`/${lang}/forgot-password`}
              className="text-primary hover:underline ms-1 font-semibold"
            >
              {isBn ? 'বদলান' : 'Change'}
            </Link>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleReset} className="space-y-4">
        {/* If phone wasn't passed via query string, allow input */}
        {!initialPhone && (
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-semibold text-foreground/90">
              {isBn ? 'মোবাইল নম্বর' : 'Mobile Number'}
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={isResetting}
              className="h-11 rounded-xl text-sm border-border/80 focus-visible:ring-primary/20 focus-visible:border-primary shadow-2xs"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="otp" className="text-xs font-semibold text-foreground/90">
              {isBn ? '৬ সংখ্যার ওটিপি কোড' : '6-digit OTP Code'}
            </Label>
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || !phone}
              className="text-xs text-primary hover:underline font-semibold inline-flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
              <span>{isBn ? 'পুনরায় কোড পাঠান' : 'Resend Code'}</span>
            </button>
          </div>
          <Input
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="• • • • • •"
            required
            maxLength={6}
            disabled={isResetting}
            className="h-12 rounded-xl tracking-widest font-mono text-center text-xl font-bold border-border/80 focus-visible:ring-primary/20 focus-visible:border-primary shadow-2xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="newPassword" className="text-xs font-semibold text-foreground/90">
            {isBn ? 'নতুন পাসওয়ার্ড' : 'New Password'}
          </Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              disabled={isResetting}
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
          <p className="text-[11px] text-muted-foreground">
            {isBn
              ? 'কমপক্ষে ৬ অক্ষরের একটি শক্তিশালী পাসওয়ার্ড বেছে নিন'
              : 'Choose a strong password with at least 6 characters'}
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold text-foreground/90">
              {isBn ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}
            </Label>
            {isPasswordMatch && (
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {isBn ? 'পাসওয়ার্ড মিলেছে' : 'Passwords match'}
              </span>
            )}
            {isPasswordMismatch && (
              <span className="text-[11px] font-semibold text-destructive inline-flex items-center gap-1">
                <X className="w-3.5 h-3.5" />
                {isBn ? 'মিলছে না' : 'Does not match'}
              </span>
            )}
          </div>
          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            disabled={isResetting}
            className={`h-11 rounded-xl text-sm border-border/80 focus-visible:ring-primary/20 focus-visible:border-primary shadow-2xs ${
              isPasswordMatch ? 'border-emerald-500 focus-visible:border-emerald-500' : ''
            }`}
          />
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-sm font-bold shadow-md shadow-primary/20 hover:shadow-primary/30 rounded-xl transition-all mt-2"
          disabled={isResetting || (confirmPassword.length > 0 && !isPasswordMatch)}
        >
          {isResetting
            ? isBn
              ? 'পরিবর্তন করা হচ্ছে...'
              : 'Resetting Password...'
            : isBn
              ? 'পাসওয়ার্ড পরিবর্তন সম্পন্ন করুন'
              : 'Complete Password Reset'}
        </Button>
      </form>

      <div className="pt-2 border-t border-border/60 text-center">
        <Link
          href={`/${lang}/login`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
          <span>{isBn ? 'লগইন পৃষ্ঠায় ফিরে যান' : 'Back to Login'}</span>
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);

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

        <Suspense
          fallback={
            <div className="w-full max-w-lg bg-card border rounded-3xl p-8 text-center text-xs text-muted-foreground">
              Loading...
            </div>
          }
        >
          <ResetPasswordForm lang={lang} />
        </Suspense>
      </main>
    </div>
  );
}
