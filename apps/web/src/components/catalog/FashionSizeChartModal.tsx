'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Ruler, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface FashionSizeChartModalProps {
  lang: string;
  categorySlug?: string;
  productTypeName?: string;
  triggerButton?: React.ReactNode;
}

type Unit = 'in' | 'cm';

// Convert inches to cm helper (1 inch = 2.54 cm)
const toCm = (inches: number) => Math.round(inches * 2.54);

export function FashionSizeChartModal({
  lang,
  categorySlug = '',
  productTypeName = '',
  triggerButton,
}: FashionSizeChartModalProps) {
  const isBn = lang === 'bn';
  const [unit, setUnit] = useState<Unit>('in');
  const [open, setOpen] = useState(false);

  // Determine initial active tab based on category / product type
  const lowerCat = `${categorySlug} ${productTypeName}`.toLowerCase();
  let defaultTab = 'tops';
  if (lowerCat.includes('shoe') || lowerCat.includes('footwear') || lowerCat.includes('sneaker') || lowerCat.includes('sandal')) {
    defaultTab = 'footwear';
  } else if (lowerCat.includes('pant') || lowerCat.includes('jean') || lowerCat.includes('trouser')) {
    defaultTab = 'bottoms';
  } else if (lowerCat.includes('panjabi') || lowerCat.includes('kurti') || lowerCat.includes('saree') || lowerCat.includes('traditional')) {
    defaultTab = 'traditional';
  } else if (lowerCat.includes('kid') || lowerCat.includes('boy') || lowerCat.includes('girl') || lowerCat.includes('baby')) {
    defaultTab = 'kids';
  }

  // Format value based on unit
  const formatDim = (valInInches: number, range?: number) => {
    if (unit === 'in') {
      return range ? `${valInInches} - ${range}"` : `${valInInches}"`;
    }
    const cmVal = toCm(valInInches);
    const cmRange = range ? toCm(range) : undefined;
    return cmRange ? `${cmVal} - ${cmRange} cm` : `${cmVal} cm`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2.5 text-xs text-primary font-bold hover:bg-primary/10 flex items-center gap-1.5 rounded-lg"
          >
            <Ruler className="h-3.5 w-3.5" />
            <span>{isBn ? 'সাইজ চার্ট ও গাইড' : 'Size Guide'}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-7 rounded-3xl">
        <DialogHeader className="pb-3 border-b border-border/70 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
              <Ruler className="h-5 w-5 text-primary" />
              <span>{isBn ? 'পোশাক ও জুতার সাইজ গাইড' : 'Size Chart & Measurement Guide'}</span>
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {isBn
                ? 'সঠিক সাইজ নির্ধারণ করতে আপনার শরীরের পরিমাপের সাথে নিচের তালিকা মিলিয়ে নিন।'
                : 'Compare your body measurements with the guide below to find your perfect fit.'}
            </p>
          </div>
        </DialogHeader>

        {/* Unit Toggle Switch */}
        <div className="flex items-center justify-between py-2">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider">
            {isBn ? 'পরিমাপের একক:' : 'Measurement Unit:'}
          </span>
          <div className="inline-flex rounded-xl p-1 bg-muted border border-border/80 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setUnit('in')}
              className={`px-3 py-1 rounded-lg transition-all ${
                unit === 'in'
                  ? 'bg-background text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isBn ? 'ইঞ্চি (in)' : 'Inches (in)'}
            </button>
            <button
              type="button"
              onClick={() => setUnit('cm')}
              className={`px-3 py-1 rounded-lg transition-all ${
                unit === 'cm'
                  ? 'bg-background text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isBn ? 'সেন্টিমিটার (cm)' : 'Centimeters (cm)'}
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid grid-cols-5 h-9 bg-muted/80 rounded-xl p-1 text-xs font-semibold">
            <TabsTrigger value="tops" className="rounded-lg text-[11px] sm:text-xs">
              {isBn ? 'শার্ট / টি-শার্ট' : 'Tops / Shirts'}
            </TabsTrigger>
            <TabsTrigger value="bottoms" className="rounded-lg text-[11px] sm:text-xs">
              {isBn ? 'প্যান্ট / জিন্স' : 'Pants / Jeans'}
            </TabsTrigger>
            <TabsTrigger value="traditional" className="rounded-lg text-[11px] sm:text-xs">
              {isBn ? 'পাঞ্জাবি / কুর্তি' : 'Traditional'}
            </TabsTrigger>
            <TabsTrigger value="footwear" className="rounded-lg text-[11px] sm:text-xs">
              {isBn ? 'জুতা (Shoe)' : 'Footwear'}
            </TabsTrigger>
            <TabsTrigger value="kids" className="rounded-lg text-[11px] sm:text-xs">
              {isBn ? 'বাচ্চাদের' : 'Kids'}
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: TOPS & SHIRTS */}
          <TabsContent value="tops" className="space-y-4 pt-3">
            <div className="border border-border/80 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-xs text-start">
                <thead className="bg-muted/70 text-foreground font-bold border-b border-border/80">
                  <tr>
                    <th className="p-2.5 text-start">{isBn ? 'সাইজ' : 'Size'}</th>
                    <th className="p-2.5 text-center">{isBn ? 'বুক (Chest)' : 'Chest'}</th>
                    <th className="p-2.5 text-center">{isBn ? 'দৈর্ঘ্য (Length)' : 'Length'}</th>
                    <th className="p-2.5 text-center">{isBn ? 'কাঁধ (Shoulder)' : 'Shoulder'}</th>
                    <th className="p-2.5 text-center">{isBn ? 'হাতা (Sleeve)' : 'Sleeve'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {[
                    { size: 'S', chest: 38, length: 27, shoulder: 17, sleeve: 8 },
                    { size: 'M', chest: 40, length: 28, shoulder: 18, sleeve: 8.5 },
                    { size: 'L', chest: 42, length: 29, shoulder: 19, sleeve: 9 },
                    { size: 'XL', chest: 44, length: 30, shoulder: 20, sleeve: 9.5 },
                    { size: 'XXL', chest: 46, length: 31, shoulder: 21, sleeve: 10 },
                  ].map((row, idx) => (
                    <tr key={row.size} className={idx % 2 === 1 ? 'bg-muted/20' : 'bg-card'}>
                      <td className="p-2.5 font-bold text-primary">{row.size}</td>
                      <td className="p-2.5 text-center">{formatDim(row.chest)}</td>
                      <td className="p-2.5 text-center">{formatDim(row.length)}</td>
                      <td className="p-2.5 text-center">{formatDim(row.shoulder)}</td>
                      <td className="p-2.5 text-center">{formatDim(row.sleeve)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* TAB 2: BOTTOMS & PANTS */}
          <TabsContent value="bottoms" className="space-y-4 pt-3">
            <div className="border border-border/80 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-xs text-start">
                <thead className="bg-muted/70 text-foreground font-bold border-b border-border/80">
                  <tr>
                    <th className="p-2.5 text-start">{isBn ? 'কোমর (Waist)' : 'Waist Size'}</th>
                    <th className="p-2.5 text-center">{isBn ? 'হিপ (Hip)' : 'Hip'}</th>
                    <th className="p-2.5 text-center">{isBn ? 'লম্বা (Length)' : 'Outseam Length'}</th>
                    <th className="p-2.5 text-center">{isBn ? 'থাই (Thigh)' : 'Thigh'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {[
                    { size: '28', hip: 36, length: 39, thigh: 21 },
                    { size: '30', hip: 38, length: 40, thigh: 22 },
                    { size: '32', hip: 40, length: 40.5, thigh: 23 },
                    { size: '34', hip: 42, length: 41, thigh: 24 },
                    { size: '36', hip: 44, length: 41.5, thigh: 25 },
                    { size: '38', hip: 46, length: 42, thigh: 26 },
                  ].map((row, idx) => (
                    <tr key={row.size} className={idx % 2 === 1 ? 'bg-muted/20' : 'bg-card'}>
                      <td className="p-2.5 font-bold text-primary">{row.size}</td>
                      <td className="p-2.5 text-center">{formatDim(row.hip)}</td>
                      <td className="p-2.5 text-center">{formatDim(row.length)}</td>
                      <td className="p-2.5 text-center">{formatDim(row.thigh)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* TAB 3: TRADITIONAL / PANJABI */}
          <TabsContent value="traditional" className="space-y-4 pt-3">
            <div className="border border-border/80 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-xs text-start">
                <thead className="bg-muted/70 text-foreground font-bold border-b border-border/80">
                  <tr>
                    <th className="p-2.5 text-start">{isBn ? 'পাঞ্জাবি সাইজ' : 'Panjabi Size'}</th>
                    <th className="p-2.5 text-center">{isBn ? 'বুক (Chest)' : 'Chest'}</th>
                    <th className="p-2.5 text-center">{isBn ? 'লম্বা (Length)' : 'Length'}</th>
                    <th className="p-2.5 text-center">{isBn ? 'কলার (Collar)' : 'Collar'}</th>
                    <th className="p-2.5 text-center">{isBn ? 'হাতা (Sleeve)' : 'Sleeve'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {[
                    { size: '38 (S)', chest: 40, length: 40, collar: 15, sleeve: 24.5 },
                    { size: '40 (M)', chest: 42, length: 42, collar: 15.5, sleeve: 25 },
                    { size: '42 (L)', chest: 44, length: 44, collar: 16, sleeve: 25.5 },
                    { size: '44 (XL)', chest: 46, length: 45, collar: 16.5, sleeve: 26 },
                  ].map((row, idx) => (
                    <tr key={row.size} className={idx % 2 === 1 ? 'bg-muted/20' : 'bg-card'}>
                      <td className="p-2.5 font-bold text-primary">{row.size}</td>
                      <td className="p-2.5 text-center">{formatDim(row.chest)}</td>
                      <td className="p-2.5 text-center">{formatDim(row.length)}</td>
                      <td className="p-2.5 text-center">{formatDim(row.collar)}</td>
                      <td className="p-2.5 text-center">{formatDim(row.sleeve)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* TAB 4: FOOTWEAR */}
          <TabsContent value="footwear" className="space-y-4 pt-3">
            <div className="border border-border/80 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-xs text-start">
                <thead className="bg-muted/70 text-foreground font-bold border-b border-border/80">
                  <tr>
                    <th className="p-2.5 text-start">{isBn ? 'বাংলাদেশ / EU' : 'BD / EU'}</th>
                    <th className="p-2.5 text-center">{isBn ? 'UK সাইজ' : 'UK Size'}</th>
                    <th className="p-2.5 text-center">{isBn ? 'US সাইজ' : 'US Size'}</th>
                    <th className="p-2.5 text-center">{isBn ? 'পায়ের দৈর্ঘ্য (Foot Length)' : 'Foot Length'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {[
                    { eu: '39', uk: '5.5', us: '6.5', footLengthInches: 9.7 },
                    { eu: '40', uk: '6.5', us: '7.5', footLengthInches: 10.0 },
                    { eu: '41', uk: '7.5', us: '8.5', footLengthInches: 10.2 },
                    { eu: '42', uk: '8.0', us: '9.0', footLengthInches: 10.5 },
                    { eu: '43', uk: '9.0', us: '10.0', footLengthInches: 10.8 },
                    { eu: '44', uk: '9.5', us: '10.5', footLengthInches: 11.0 },
                    { eu: '45', uk: '10.5', us: '11.5', footLengthInches: 11.3 },
                  ].map((row, idx) => (
                    <tr key={row.eu} className={idx % 2 === 1 ? 'bg-muted/20' : 'bg-card'}>
                      <td className="p-2.5 font-bold text-primary">EU {row.eu}</td>
                      <td className="p-2.5 text-center">UK {row.uk}</td>
                      <td className="p-2.5 text-center">US {row.us}</td>
                      <td className="p-2.5 text-center font-medium">
                        {unit === 'in' ? `${row.footLengthInches}"` : `${toCm(row.footLengthInches)} cm`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* TAB 5: KIDS */}
          <TabsContent value="kids" className="space-y-4 pt-3">
            <div className="border border-border/80 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-xs text-start">
                <thead className="bg-muted/70 text-foreground font-bold border-b border-border/80">
                  <tr>
                    <th className="p-2.5 text-start">{isBn ? 'বয়স (Age)' : 'Age / Size'}</th>
                    <th className="p-2.5 text-center">{isBn ? 'উচ্চতা (Height)' : 'Child Height'}</th>
                    <th className="p-2.5 text-center">{isBn ? 'বুক (Chest)' : 'Chest'}</th>
                    <th className="p-2.5 text-center">{isBn ? 'কোমর (Waist)' : 'Waist'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {[
                    { age: '2Y - 3Y', height: 36, chest: 21, waist: 20 },
                    { age: '4Y - 5Y', height: 42, chest: 23, waist: 21.5 },
                    { age: '6Y - 7Y', height: 48, chest: 25, waist: 22.5 },
                    { age: '8Y - 9Y', height: 53, chest: 27, waist: 24 },
                    { age: '10Y - 12Y', height: 58, chest: 29, waist: 25.5 },
                  ].map((row, idx) => (
                    <tr key={row.age} className={idx % 2 === 1 ? 'bg-muted/20' : 'bg-card'}>
                      <td className="p-2.5 font-bold text-primary">{row.age}</td>
                      <td className="p-2.5 text-center">{formatDim(row.height)}</td>
                      <td className="p-2.5 text-center">{formatDim(row.chest)}</td>
                      <td className="p-2.5 text-center">{formatDim(row.waist)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>

        {/* How to Measure Advisory Box */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-xs space-y-2 mt-2">
          <div className="flex items-center gap-1.5 font-bold text-primary">
            <HelpCircle className="h-4 w-4 shrink-0" />
            <span>{isBn ? 'সঠিক মাপ নেওয়ার টিপস (How to Measure)' : 'How to Measure Yourself'}</span>
          </div>
          <ul className="space-y-1.5 text-muted-foreground list-none ps-0">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>{isBn ? 'বুক (Chest):' : 'Chest:'}</strong>{' '}
                {isBn
                  ? 'ফিতাটি আপনার বগল ও বুকের সবচেয়ে প্রশস্ত অংশের চারপাশ দিয়ে সোজা রাখুন।'
                  : 'Measure around the fullest part of your chest, keeping the tape horizontal.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>{isBn ? 'কোমর (Waist):' : 'Waist:'}</strong>{' '}
                {isBn
                  ? 'যেখানে সচরাচর প্যান্ট পরেন, সেই স্বাভাবিক কোমর বরাবর পরিমাপ করুন।'
                  : 'Measure around your natural waistline where your trousers normally sit.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>{isBn ? 'জুতা (Foot Length):' : 'Footwear:'}</strong>{' '}
                {isBn
                  ? 'একটি সমতল জায়গায় দাঁড়িয়ে গোড়ালি থেকে পায়ের সবচেয়ে লম্বা আঙুল পর্যন্ত মাপ নিন।'
                  : 'Stand upright on a flat surface and measure from your heel to your longest toe.'}
              </span>
            </li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
