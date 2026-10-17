'use client';

import React from 'react';
import Link from 'next/link';
import {
  Fish,
  Truck,
  ArrowRight,
  ShieldCheck,
  Droplets,
  Calendar,
  MapPin,
  Clock,
  Phone,
} from 'lucide-react';
import { useGetMyTankerBookingsQuery } from '@/features/aquaculture';

export default function CustomerAquaculturePage() {
  const { data: bookingsData, isLoading } = useGetMyTankerBookingsQuery();
  const bookings = bookingsData?.data || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Fish className="w-6 h-6 text-teal-600" />
            <span>আমার লাইভ মাছ পরিবহন ও হ্যাচারি অর্ডার (Aquaculture Bookings)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            অক্সিজেন ফিল্ড ট্যাঙ্কারে সরাসরি আড়তে জ্যান্ত মাছ সরবরাহ এবং এসপিএফ চিংড়ি ও পোনা ক্রয়ের চালান
          </p>
        </div>

        <Link
          href="/aquaculture"
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <span>হ্যাচারি মার্কেট দেখুন</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Tanker Bookings */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Truck className="w-5 h-5 text-teal-600" />
          <span>সক্রিয় লাইভ ওয়াটার ট্যাঙ্কার পরিবহন চালান ({bookings.length})</span>
        </h2>

        {isLoading ? (
          <div className="text-xs text-slate-400 py-4">লোড হচ্ছে...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-500 space-y-3">
            <Truck className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <p>আপনার কোনো সক্রিয় লাইভ মাছ ওয়াটার ট্যাঙ্কার বুকিং নেই।</p>
            <Link
              href="/aquaculture"
              className="inline-block text-teal-600 dark:text-teal-400 font-semibold hover:underline"
            >
              লাইভ আরিশ ক্যালকুলেটর থেকে ৩-টন অক্সিজেন ট্যাঙ্কার বুক করুন &rarr;
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {bookings.map((b) => (
              <div key={b.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="font-mono text-teal-600">#{b.bookingNumber}</span>
                    <span>• {b.species}</span>
                    <span className="text-slate-500">({b.approximateFishKg.toLocaleString()} kg)</span>
                  </div>
                  <div className="text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      পিকআপ: {b.pickupDistrict} ({b.pickupUpazila}) &rarr; ড্রপঅফ: {b.dropoffMarket}
                    </span>
                  </div>
                  {b.driverName && (
                    <div className="text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-2 font-medium">
                      <span>চালক: {b.driverName}</span>
                      {b.driverPhone && (
                        <span className="flex items-center gap-1 text-teal-600">
                          <Phone className="w-3 h-3" /> {b.driverPhone}
                        </span>
                      )}
                      {b.vehiclePlateNumber && (
                        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                          {b.vehiclePlateNumber}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full font-bold text-[11px] ${
                      b.waterTankerStatus === 'IN_TRANSIT_LIVE'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : b.waterTankerStatus === 'DELIVERED_ZERO_MORTALITY'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {b.waterTankerStatus.replace(/_/g, ' ')}
                  </span>
                  <div className="font-bold text-teal-600 mt-1">ভাড়া: ৳{Number(b.transportFareBdt).toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400">
                    আনুমানিক বিক্রয়মূল্য: ৳{Number(b.estimatedLivePriceBdt).toLocaleString()}
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
