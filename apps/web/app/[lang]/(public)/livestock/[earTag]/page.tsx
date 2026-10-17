'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  ShieldCheck,
  Scale,
  Sparkles,
  ArrowLeft,
  Calendar,
  Lock,
  Phone,
  Truck,
  FileCheck2,
  Thermometer,
  Stethoscope,
} from 'lucide-react';
import {
  useGetLivestockListingByEarTagQuery,
  useGetHealthPassportQuery,
} from '@/features/livestock';

export default function LivestockDetailsPage() {
  const params = useParams();
  const earTag = params?.earTag as string;
  const lang = (params?.lang as string) || 'bn';

  const { data: listingData, isLoading: isListingLoading } =
    useGetLivestockListingByEarTagQuery(earTag, { skip: !earTag });
  const { data: passportData, isLoading: isPassportLoading } =
    useGetHealthPassportQuery(earTag, { skip: !earTag });

  const listing = listingData?.data;
  const passport = passportData?.data;

  if (isListingLoading || isPassportLoading) {
    return (
      <div className="min-h-screen py-24 text-center text-slate-500">
        <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
        পশুর বিবরণ ও স্বাস্থ্য সনদ লোড হচ্ছে...
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen py-24 text-center">
        <h2 className="text-xl font-bold text-slate-800">পশুটি পাওয়া যায়নি</h2>
        <Link
          href={`/${lang}/livestock`}
          className="mt-4 inline-flex items-center gap-2 text-emerald-600 font-bold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> হাটে ফিরে যান
        </Link>
      </div>
    );
  }

  const meatYield = Math.round(Number(listing.liveWeightKg) * 0.54 * 0.72);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          href={`/${lang}/livestock`}
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> ডিজিটাল পশুর হাটে ফিরে যান
        </Link>

        {/* Hero Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg grid grid-cols-1 md:grid-cols-2">
          {/* Media */}
          <div className="relative h-80 md:h-full min-h-[340px] bg-slate-100 dark:bg-slate-800">
            <Image
              src={listing.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80'}
              alt={listing.title}
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute top-4 left-4 bg-slate-900/90 text-emerald-300 font-mono text-sm px-3 py-1 rounded-xl border border-emerald-500/30">
              {listing.earTagNumber}
            </div>
            {listing.qurbaniEligible && (
              <div className="absolute top-4 right-4 bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1 shadow-md">
                <Sparkles className="w-4 h-4" /> কোরবানি উপযুক্ত
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  {listing.breed.replace(/_/g, ' ')}
                </span>
                <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
                  {listing.title}
                </h1>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {listing.description || 'সুস্থ ও স্বাস্থ্যবান গবাদি পশু। নিয়মিত ভ্যাকসিন ও কৃমিনাশক সম্পন্ন।'}
                </p>
              </div>

              {/* Trait Matrix */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <span className="text-slate-500">লাইভ ওজন:</span>
                  <div className="font-extrabold text-slate-900 dark:text-slate-100 text-base mt-0.5">
                    {listing.liveWeightKg} কেজি
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium">(~{meatYield} কেজি নিট মাংস)</span>
                </div>

                <div>
                  <span className="text-slate-500">দাঁতের সংখ্যা ও বয়স:</span>
                  <div className="font-extrabold text-slate-900 dark:text-slate-100 text-base mt-0.5">
                    {listing.teethCount} দাঁত • {listing.ageMonths} মাস
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">লিঙ্গ: {listing.gender === 'FEMALE' ? 'মাদী' : 'পুরুষ'}</span>
                </div>
              </div>

              {listing.dailyMilkYieldLiters && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 text-xs flex justify-between items-center">
                  <span className="text-blue-700 dark:text-blue-300 font-semibold">দৈনিক দুধ উৎপাদন:</span>
                  <span className="font-black text-blue-900 dark:text-blue-100 text-sm">
                    {listing.dailyMilkYieldLiters} লিটার / দিন
                  </span>
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-4">
                <span className="text-xs text-slate-400">নির্ধারিত বিক্রয় মূল্য:</span>
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  ৳{Number(listing.askingPrice).toLocaleString()}
                </div>
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                <div className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> খামার ও যোগাযোগের তথ্য
                </div>
                <div className="text-slate-600 dark:text-slate-300">খামার: {listing.sellerName}</div>
                <div className="text-slate-600 dark:text-slate-300">ঠিকানা: {listing.sellerUpazila}, {listing.sellerDistrict}</div>
                <div className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" /> ফোন: {listing.sellerPhone}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DLS Health Passport Embedded */}
        {passport && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950 rounded-2xl">
                <FileCheck2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  সরকারি প্রাণিসম্পদ অধিদপ্তর (DLS) স্বাস্থ্য পাসপোর্ট
                </h2>
                <p className="text-xs text-slate-500">
                  প্রত্যয়নকারী: {passport.veterinaryOfficerName} ({passport.veterinaryRegNumber}) • {passport.upazilaHospital}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-emerald-600" /> শারীরিক তাপমাত্রা ও অবস্থা
                </div>
                <div>তাপমাত্রা: <strong>{passport.bodyTemperatureCelsius} °C (স্বাভাবিক)</strong></div>
                <div>কৃমিনাশক ডোজ: <strong>{passport.dewormingDate || 'সম্পন্ন'}</strong></div>
                <div className="text-[11px] text-slate-500">মন্তব্য: {passport.healthRemarks}</div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
                <div className="font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> সরকারি টিকাদান ছাড়পত্র
                </div>
                <div className="divide-y divide-emerald-200 dark:divide-emerald-800">
                  {passport.vaccinationLedger.map((v, i) => (
                    <div key={i} className="py-1.5 flex justify-between">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{v.vaccine}</span>
                      <span className="text-slate-500">দেওয়া হয়েছে: {v.doseDate}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
