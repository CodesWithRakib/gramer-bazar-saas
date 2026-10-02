'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateProductRequestMutation } from '@/features/product-requests/productRequestsApi';
import { toast } from '@/components/ui/custom-toast';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { PackagePlus, LogIn, UserPlus, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProductRequestModalProps {
  lang: string;
  trigger?: React.ReactNode;
}

export function ProductRequestModal({ lang, trigger }: ProductRequestModalProps) {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createProductRequest, { isLoading: loading }] = useCreateProductRequestMutation();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const pathname = usePathname();
  const isBn = lang === 'bn';

  const [formData, setFormData] = useState({
    requestedProductName: '',
    description: '',
    preferredInformation: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error(isBn ? 'দয়া করে লগইন করুন' : 'Please login to submit a request');
      return;
    }

    if (!formData.requestedProductName.trim()) {
      toast.error(isBn ? 'পণ্যের নাম লিখুন' : 'Please enter the product name');
      return;
    }

    try {
      await createProductRequest({
        requestedProductName: formData.requestedProductName.trim(),
        description: formData.description.trim() || undefined,
        preferredInformation: formData.preferredInformation.trim() || undefined,
      }).unwrap();

      setSuccess(true);
      setFormData({ requestedProductName: '', description: '', preferredInformation: '' });
      toast.success(
        isBn ? 'আপনার অনুরোধ সফলভাবে জমা হয়েছে!' : 'Your request has been submitted successfully!'
      );
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 2200);
    } catch {
      toast.error(isBn ? 'অনুরোধ জমা দিতে ত্রুটি হয়েছে।' : 'Failed to submit request.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="rounded-xl">
            <PackagePlus className="w-4 h-4 me-2 text-primary" />
            {isBn ? 'পণ্য অনুরোধ করুন' : 'Request a Product'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-full max-w-[420px] rounded-3xl p-5 sm:p-6 border shadow-2xl bg-card">
        <DialogHeader className="text-start space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl font-bold text-foreground">
                {isBn ? 'পণ্য সোর্সিং অনুরোধ' : 'Request a Product'}
              </DialogTitle>
              <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0">
                {isBn ? 'হাইপার-লোকাল সোর্সিং' : 'Hyper-Local Sourcing'}
              </Badge>
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
            {isBn
              ? 'আপনার কাঙ্ক্ষিত পণ্যটি খুঁজে পাচ্ছেন না? নাম ও বিবরণ দিন, আমরা স্থানীয় বাজার ও কৃষকের থেকে তা সংগ্রহ করে দেব।'
              : "Can't find what you need? Tell us the details and our local team will source it directly from farmers or verified merchants."}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-base text-foreground">
              {isBn ? 'অনুরোধটি সফলভাবে গৃহীত হয়েছে!' : 'Request Submitted Successfully!'}
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              {isBn
                ? 'পণ্যটি সংগ্রহ করা সম্ভব হলে আমরা আপনাকে এসএমএস বা কলের মাধ্যমে জানাব।'
                : 'Our local hub will check availability and notify you via SMS once found.'}
            </p>
          </div>
        ) : !isAuthenticated ? (
          <div className="py-6 space-y-5 text-center">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-start space-y-2">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs sm:text-sm">
                <Sparkles className="w-4 h-4" />
                <span>{isBn ? 'লগইন প্রয়োজন' : 'Authentication Required'}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isBn
                  ? 'আপনার অনুরোধের স্থিতি ট্র্যাক করতে এবং ডেলিভারি ঠিকানা সংযুক্ত করতে অনুগ্রহ করে প্রথমে আপনার অ্যাকাউন্টে লগইন করুন।'
                  : 'Please sign in to track your request updates, receive rider notifications, and specify your delivery address.'}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              <Button
                asChild
                className="w-full rounded-2xl h-11 text-xs sm:text-sm font-bold shadow-md"
                onClick={() => setOpen(false)}
              >
                <Link href={`/${lang}/login?redirect=${encodeURIComponent(pathname || `/${lang}`)}`}>
                  <LogIn className="w-4 h-4 me-2" />
                  {isBn ? 'লগইন করুন' : 'Sign In to Continue'}
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full rounded-2xl h-11 text-xs sm:text-sm font-semibold"
                onClick={() => setOpen(false)}
              >
                <Link href={`/${lang}/register`}>
                  <UserPlus className="w-4 h-4 me-2" />
                  {isBn ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'Create Free Account'}
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5 text-start">
              <Label className="text-xs font-semibold text-foreground">
                {isBn ? 'পণ্যের নাম ও পরিমাণ *' : 'Product Name & Quantity *'}
              </Label>
              <Input
                required
                placeholder={isBn ? 'উদা: খাঁটি সরিষার তেল ৫ লিটার বা দেশি ডিম' : 'e.g. Pure Mustard Oil 5L or Organic Eggs'}
                value={formData.requestedProductName}
                onChange={(e) => setFormData({ ...formData, requestedProductName: e.target.value })}
                className="rounded-xl h-10 text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-1.5 text-start">
              <Label className="text-xs font-semibold text-foreground">
                {isBn ? 'বিস্তারিত বিবরণ (ঐচ্ছিক)' : 'Details & Brand (Optional)'}
              </Label>
              <Textarea
                rows={2}
                placeholder={isBn ? 'পছন্দের ব্র্যান্ড, সাইজ, জাত বা কোনো বিশেষ গুণাবলী...' : 'Preferred brand, package size, variety...'}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="rounded-xl text-xs sm:text-sm resize-none"
              />
            </div>

            <div className="space-y-1.5 text-start">
              <Label className="text-xs font-semibold text-foreground">
                {isBn ? 'পছন্দের উৎস বা বাজার (ঐচ্ছিক)' : 'Preferred Origin or Shop (Optional)'}
              </Label>
              <Input
                placeholder={isBn ? 'উদা: খানসামা বাজার, সুন্দরবন, দিনাজপুরের চাল' : 'e.g. Khansama local market, Sundarban, Dinajpur'}
                value={formData.preferredInformation}
                onChange={(e) => setFormData({ ...formData, preferredInformation: e.target.value })}
                className="rounded-xl h-10 text-xs sm:text-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl h-11 text-xs sm:text-sm font-bold shadow-md mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 me-2 animate-spin" />
                  {isBn ? 'অনুরোধ পাঠানো হচ্ছে...' : 'Submitting...'}
                </>
              ) : (
                isBn ? 'অনুরোধ জমা দিন' : 'Submit Sourcing Request'
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
