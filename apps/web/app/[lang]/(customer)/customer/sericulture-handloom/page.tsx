'use client';

import React from 'react';
import Link from 'next/link';
import {
  Scissors,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Truck,
  HeartHandshake,
} from 'lucide-react';
import {
  useGetMyCustomOrdersQuery,
  ArtisanCustomOrder,
  ArtisanOrderEscrowStatus,
} from '@/features/sericulture-handloom';

export default function CustomerSericultureHandloomPage() {
  const { data: ordersData, isLoading } = useGetMyCustomOrdersQuery();
  const orders: ArtisanCustomOrder[] = ordersData?.data || [];

  const getStatusBadge = (status: ArtisanOrderEscrowStatus) => {
    switch (status) {
      case 'ORDER_PLACED_ESCROW_LOCKED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
            <Clock className="w-3 h-3" /> ৫০% এসক্রো জমা
          </span>
        );
      case 'WARPING_LOOM_MOUNTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
            <Layers className="w-3 h-3" /> টানা তাঁতে প্রস্তুত
          </span>
        );
      case 'IN_WEAVING_PROGRESS':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
            <Scissors className="w-3 h-3" /> বুনন চলমান
          </span>
        );
      case 'FINISHED_BOARD_INSPECTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> বুনন সম্পন্ন ও মান নিরীক্ষিত
          </span>
        );
      case 'DISPATCHED_TO_BUYER':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
            <Truck className="w-3 h-3" /> কুরিয়ারে প্রেরিত
          </span>
        );
      case 'ESCROW_RELEASED_TO_WEAVER':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> ডেলিভারি নিশ্চিত ও এসক্রো খালাস
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Scissors className="w-6 h-6 text-amber-600" />
            <span>আমার কাস্টম তাঁত ও রেশম বুনন ফরমায়েশ (My Handloom Commissions)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            তাঁতিকে দেওয়া বিশেষ জামদানি ও রেশম শাড়ির বুনন অগ্রগতি, ৫০% এসক্রো সুরক্ষা ও ডেলিভারি ট্র্যাকিং
          </p>
        </div>

        <Link
          href="/sericulture-handloom"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-800 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <span>তাঁত ও রেশম ক্যাটালগ দেখুন</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Orders List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <span>সক্রিয় কাস্টম বুনন অর্ডার সমূহ ({orders.length})</span>
        </h2>

        {isLoading ? (
          <div className="text-xs text-slate-400 py-6 text-center">তথ্য লোড হচ্ছে...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-500 space-y-3">
            <Scissors className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <p>আপনার কোনো সক্রিয় কাস্টম তাঁত বুনন অর্ডার নেই।</p>
            <Link
              href="/sericulture-handloom"
              className="inline-block text-amber-700 dark:text-amber-400 font-semibold hover:underline"
            >
              তাঁত হাব থেকে আপনার পছন্দের শাড়ির জন্য কাস্টম অর্ডার দিন →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {order.orderNumber}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 mt-0.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full inline-block border border-black/20"
                        style={{ backgroundColor: order.primaryColorHex }}
                      />
                      <span>{order.customMotifDescription}</span>
                    </h3>
                    <span className="text-[11px] text-slate-500">কারিগর: {order.artisanName}</span>
                  </div>
                  {getStatusBadge(order.orderStatus)}
                </div>

                {/* Weft Weaving Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>তাঁতে বুনন অগ্রগতি:</span>
                    <span className="text-amber-700 dark:text-amber-400 font-bold">
                      {order.weftProgressPercentage}% সম্পন্ন
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-600 rounded-full transition-all"
                      style={{ width: `${order.weftProgressPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div>
                    <span className="text-[10px] text-slate-400 block">মোট মূল্য</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      ৳{order.agreedPriceBdt.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">৫০% এসক্রো সংরক্ষিত</span>
                    <span className="font-semibold text-emerald-600">
                      ৳{order.advanceEscrowBdt.toLocaleString()}
                    </span>
                  </div>
                </div>

                {order.inspectionNotes && (
                  <div className="text-[11px] text-slate-500 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <strong>তাঁতি নোট:</strong> {order.inspectionNotes}
                  </div>
                )}

                {order.dispatchedTrackingNumber && (
                  <div className="text-[11px] text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 p-2 rounded-xl flex items-center justify-between">
                    <span>কুরিয়ার ট্র্যাকিং:</span>
                    <span className="font-mono font-bold">{order.dispatchedTrackingNumber}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fair Wage & Direct Weaver Impact Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-rose-900 to-slate-900 rounded-3xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
            <HeartHandshake className="w-3.5 h-3.5 text-amber-300" /> সরাসরি কারিগর অংশীদারিত্ব
          </span>
          <h3 className="text-lg font-bold">দাদনমুক্ত ন্যায্য মজুরি মডেল ও ১০০% খাঁটি জিআই বস্ত্র</h3>
          <p className="text-xs text-amber-100/80 max-w-xl">
            গ্রামের বাজারে আপনার প্রতিটি শাড়ি বা চাদরের অর্ডার সরাসরি তাঁতি সমবায়ের হাতে ন্যায্য পারিশ্রমিক (দৈনিক ৮৫০ টাকা মানদণ্ড) পৌঁছে দেয় এবং হস্তশিল্পীদের ঐতিহ্য রক্ষা করে।
          </p>
        </div>

        <Link
          href="/sericulture-handloom"
          className="inline-flex items-center gap-2 px-5 py-3 bg-white text-amber-900 hover:bg-amber-50 rounded-2xl font-bold text-xs shadow-lg transition-all shrink-0"
        >
          <Scissors className="w-4 h-4 text-amber-800" />
          <span>নতুন শাড়ি অর্ডার করুন</span>
        </Link>
      </div>
    </div>
  );
}
