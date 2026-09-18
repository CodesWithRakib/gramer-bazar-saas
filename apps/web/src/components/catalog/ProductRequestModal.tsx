'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProductRequestModalProps {
  lang: string;
  trigger?: React.ReactNode;
}

export function ProductRequestModal({ lang, trigger }: ProductRequestModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 2000);
    }, 1000);
  };

  const isBn = lang === 'bn';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">{isBn ? 'পণ্য অনুরোধ করুন' : 'Request a Product'}</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isBn ? 'পণ্য অনুরোধ' : 'Product Request'}</DialogTitle>
          <DialogDescription>
            {isBn 
              ? 'আপনার কাঙ্ক্ষিত পণ্যটি খুঁজে পাচ্ছেন না? আমাদের জানান, আমরা এটি সরবরাহ করার চেষ্টা করব।' 
              : "Can't find what you're looking for? Let us know and we'll try to source it for you."}
          </DialogDescription>
        </DialogHeader>
        {success ? (
          <div className="py-6 text-center text-green-600 font-medium">
            {isBn ? 'আপনার অনুরোধ সফলভাবে জমা হয়েছে!' : 'Your request has been submitted successfully!'}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{isBn ? 'পণ্যের নাম' : 'Product Name'}</label>
              <Input required placeholder={isBn ? 'যেমন: ফ্রেশ সয়াবিন তেল ৫ লিটার' : 'e.g. Fresh Soybean Oil 5L'} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{isBn ? 'বিস্তারিত (ঐচ্ছিক)' : 'Details (Optional)'}</label>
              <Input placeholder={isBn ? 'ব্র্যান্ড, পরিমাণ, ইত্যাদি' : 'Brand, quantity, etc.'} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{isBn ? 'আপনার মোবাইল নম্বর' : 'Your Mobile Number'}</label>
              <Input required type="tel" placeholder="01XXXXXXXXX" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (isBn ? 'জমা হচ্ছে...' : 'Submitting...') : (isBn ? 'অনুরোধ জমা দিন' : 'Submit Request')}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
