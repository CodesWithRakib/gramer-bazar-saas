'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Truck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import {
  useGetMyTransportBookingsQuery,
  useGetMyAIBookingsQuery,
} from '@/features/livestock';

export default function CustomerLivestockPage() {
  const { data: transportData, isLoading: isTransportLoading } = useGetMyTransportBookingsQuery();
  const transports = transportData?.data || [];

  const { data: aiData, isLoading: isAILoading } = useGetMyAIBookingsQuery();
  const aiBookings = aiData?.data || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" /> আমার গবাদি পশু, পরিবহন ও এআই সেবা
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ডিজিটাল পশুর হাট থেকে ক্রয়কৃত পশু, পরিবহন পিকআপ ট্র্যাকিং এবং কৃত্রিম প্রজনন ভিজিট
          </p>
        </div>

        <Link
          href="/livestock"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs"
        >
          ডিজিটাল হাট দেখুন <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Transports */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Truck className="w-5 h-5 text-emerald-600" /> আমার পশু পরিবহন পিকআপ কনসাইনমেন্ট
        </h2>

        {isTransportLoading ? (
          <div className="text-xs text-slate-400 py-4">লোড হচ্ছে...</div>
        ) : transports.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">
            আপনার কোনো সক্রিয় পশু পরিবহন বুকিং নেই।
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {transports.map((t) => (
              <div key={t.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    {t.bookingNumber} • কানট্যাগ: <span className="font-mono text-emerald-600">{t.earTagNumber}</span>
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    রুট: {t.pickupDistrict} ➔ {t.dropoffDistrict} ({t.dropoffAddress})
                  </div>
                  <div className="text-[11px] text-slate-400">
                    গাড়ি: {t.vehicleType} {t.driverName && `• চালক: ${t.driverName} (${t.driverPhone})`}
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[11px]">
                    {t.status}
                  </span>
                  <div className="font-bold text-emerald-600 mt-1">ভাড়া: ৳{Number(t.fareAmount).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Bookings */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" /> খামারের কৃত্রিম প্রজনন (AI) টেকনিশিয়ান বুকিং
        </h2>

        {isAILoading ? (
          <div className="text-xs text-slate-400 py-4">লোড হচ্ছে...</div>
        ) : aiBookings.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">
            আপনার কোনো সক্রিয় এআই প্রজনন অনুরোধ নেই।
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {aiBookings.map((b) => (
              <div key={b.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    {b.bookingNumber} • কানট্যাগ: <span className="font-mono text-blue-600">{b.targetDamEarTag}</span>
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    কাঙ্ক্ষিত জাত: {b.desiredSireBreed.replace(/_/g, ' ')} • সিমেন: {b.strawSource}
                  </div>
                  {b.technicianName && (
                    <div className="text-blue-600 dark:text-blue-400 mt-0.5 font-medium">
                      টেকনিশিয়ান: {b.technicianName} ({b.technicianPhone})
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full font-bold text-[11px]">
                    {b.status}
                  </span>
                  <div className="font-bold text-blue-600 mt-1">ফি: ৳{Number(b.fee).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
