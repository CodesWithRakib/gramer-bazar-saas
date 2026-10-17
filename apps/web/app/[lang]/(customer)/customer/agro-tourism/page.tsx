'use client';

import React from 'react';
import Link from 'next/link';
import {
  Trees,
  Calendar,
  MapPin,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Phone,
} from 'lucide-react';
import { useGetMyBookingsQuery } from '@/features/agro-tourism';

export default function CustomerAgroTourismPage() {
  const { data: bookingsData, isLoading } = useGetMyBookingsQuery();
  const bookings = bookingsData?.data || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Trees className="w-6 h-6 text-emerald-600" />
            <span>আমার গ্রামীণ ফার্ম স্টে ও ট্যুর বুকিং (My Agro-Tourism Trips)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            আপনার সংরক্ষিত খামার কটেজ, আগমন সিক্রেট পিন ও গ্রামীণ হোস্টের সাথে যোগাযোগ ভাউচার
          </p>
        </div>

        <Link
          href="/agro-tourism"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <span>নতুন কটেজ বুক করুন</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Bookings List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <span>আমার ট্রাভেল ভাউচার সমূহ ({bookings.length})</span>
        </h2>

        {isLoading ? (
          <div className="text-xs text-slate-400 py-6">লোড হচ্ছে...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-500 space-y-3">
            <Trees className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <p>আপনার কোনো সক্রিয় বা অতীত খামার কটেজ বুকিং নেই।</p>
            <Link
              href="/agro-tourism"
              className="inline-block text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
            >
              ঐতিহ্যবাহী মাটির ঘর ও চা বাগান কটেজ ক্যাটালগ দেখুন &rarr;
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {bookings.map((b) => (
              <div key={b.id} className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-600 text-sm">#{b.bookingNumber}</span>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                      {b.farmStay?.titleEn}
                    </span>
                  </div>

                  <div className="text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{b.farmStay?.villageAddress}, {b.farmStay?.upazila}, {b.farmStay?.district}</span>
                  </div>

                  <div className="text-slate-600 dark:text-slate-300 flex items-center gap-3 text-[11px]">
                    <span>তারিখ: {b.checkInDate} &rarr; {b.checkOutDate} ({b.nightsCount} রাত)</span>
                    <span>• অতিথি: {b.adultGuestsCount} জন</span>
                    <span className="capitalize">• খাবার: {b.mealPlan.toLowerCase().replace(/_/g, ' ')}</span>
                  </div>

                  {b.farmStay?.hostName && (
                    <div className="text-slate-500 flex items-center gap-2 text-[11px]">
                      <span>হোস্ট: {b.farmStay.hostName}</span>
                      {b.farmStay.hostPhone && (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {b.farmStay.hostPhone}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-center min-w-[150px]">
                    <div className="text-[10px] text-emerald-800 dark:text-emerald-300 font-medium">
                      চেক-ইন ভেরিফিকেশন পিন
                    </div>
                    <div className="font-mono text-xl font-black tracking-widest text-emerald-700 dark:text-emerald-300 mt-0.5">
                      {b.checkInPinCode}
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        b.escrowStatus === 'COMPLETED_PAYOUT_RELEASED'
                          ? 'bg-blue-100 text-blue-800'
                          : b.escrowStatus === 'CHECKED_IN_VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {b.escrowStatus.replace(/_/g, ' ')}
                    </span>
                    <div className="font-bold text-emerald-600 mt-1">৳{Number(b.totalAmountBdt).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
