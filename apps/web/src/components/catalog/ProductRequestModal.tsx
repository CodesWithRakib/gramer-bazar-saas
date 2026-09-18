'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateProductRequestMutation } from '@/features/product-requests/productRequestsApi';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface ProductRequestModalProps {
  lang: string;
  trigger?: React.ReactNode;
}

export function ProductRequestModal({ lang, trigger }: ProductRequestModalProps) {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createProductRequest, { isLoading: loading }] = useCreateProductRequestMutation();
  const token = useSelector((state: RootState) => state.auth.token);

  const [formData, setFormData] = useState({
    requestedProductName: '',
    description: '',
    preferredInformation: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error(isBn ? 'দয়া করে লগইন করুন' : 'Please login to submit a request');
      setOpen(false);
      // Let the login modal be triggered if possible, or just close
      return;
    }

    try {
      await createProductRequest({
        requestedProductName: formData.requestedProductName,
        description: formData.description || undefined,
        preferredInformation: formData.preferredInformation || undefined,
      }).unwrap();
      
      setSuccess(true);
      setFormData({ requestedProductName: '', description: '', preferredInformation: '' });
      toast.success(isBn ? 'আপনার অনুরোধ সফলভাবে জমা হয়েছে!' : 'Your request has been submitted successfully!');
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (error) {
      toast.error(isBn ? 'অনুরোধ জমা দিতে ত্রুটি হয়েছে।' : 'Failed to submit request.');
    }
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
            {!token && (
              <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded-md border border-yellow-200">
                {isBn ? 'অনুরোধ করতে আপনাকে প্রথমে লগইন করতে হবে।' : 'You must log in to submit a request.'}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">{isBn ? 'পণ্যের নাম' : 'Product Name'}</label>
              <Input 
                required 
                placeholder={isBn ? 'যেমন: ফ্রেশ সয়াবিন তেল ৫ লিটার' : 'e.g. Fresh Soybean Oil 5L'}
                value={formData.requestedProductName}
                onChange={(e) => setFormData({ ...formData, requestedProductName: e.target.value })}
                disabled={!token}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{isBn ? 'বিস্তারিত (ঐচ্ছিক)' : 'Details (Optional)'}</label>
              <Input 
                placeholder={isBn ? 'ব্র্যান্ড, পরিমাণ, ইত্যাদি' : 'Brand, quantity, etc.'}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={!token}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{isBn ? 'অন্যান্য তথ্য (ঐচ্ছিক)' : 'Preferred Info (Optional)'}</label>
              <Input 
                placeholder={isBn ? 'দোকানের নাম বা অন্য কিছু' : 'Preferred shop, origin, etc.'} 
                value={formData.preferredInformation}
                onChange={(e) => setFormData({ ...formData, preferredInformation: e.target.value })}
                disabled={!token}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !token}>
              {loading ? (isBn ? 'জমা হচ্ছে...' : 'Submitting...') : (isBn ? 'অনুরোধ জমা দিন' : 'Submit Request')}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
