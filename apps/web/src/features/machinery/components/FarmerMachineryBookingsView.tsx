'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Tractor,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  RotateCcw,
} from 'lucide-react';
import {
  useGetMyMachineryBookingsQuery,
  useUpdateMachineryBookingStatusMutation,
  MachineryBooking,
} from '../machineryApi';

export function FarmerMachineryBookingsView({ lang = 'en' }: { lang?: string }) {
  const isBn = lang === 'bn';

  const { data: bookings = [], isLoading, refetch } = useGetMyMachineryBookingsQuery();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateMachineryBookingStatusMutation();

  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<MachineryBooking | null>(null);

  const handleCancelBooking = async (id: string) => {
    const confirmCancel = window.confirm(
      isBn ? 'আপনি কি নিশ্চিত যে এই বুকিং বাতিল করতে চান?' : 'Are you sure you want to cancel this booking?',
    );
    if (!confirmCancel) return;

    try {
      await updateStatus({
        id,
        status: 'CANCELLED',
        cancellationReason: 'Cancelled by farmer',
      }).unwrap();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to cancel booking');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {isBn ? 'নিশ্চিত' : 'Confirmed'}
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 animate-pulse">
            {isBn ? 'চলমান' : 'In Progress'}
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">
            {isBn ? 'সম্পন্ন' : 'Completed'}
          </span>
        );
      case 'DISPUTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            {isBn ? 'বিতর্কিত' : 'Disputed'}
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
            {isBn ? 'বাতিল' : 'Cancelled'}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {isBn ? 'আমার কৃষি যন্ত্রপাতি ভাড়া সমূহ' : 'My Farm Machinery Bookings'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {isBn
              ? 'আপনার জমি চাষ, সেচ বা ফসল তোলার জন্য বুক করা সকল যন্ত্রপাতির স্থিতি ও এসক্রো ট্র্যাকিং।'
              : 'Track status, digital inspection reports, and escrow security deposit for your equipment bookings.'}
          </p>
        </div>

        <Link
          href={`/${lang}/machinery`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition"
        >
          <Tractor className="w-4 h-4" />
          <span>{isBn ? 'নতুন যন্ত্রপাতি বুক করুন' : 'Rent New Equipment'}</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">{isBn ? 'বুকিং লোড হচ্ছে...' : 'Loading bookings...'}</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Tractor className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
            {isBn ? 'কোনো বুকিং পাওয়া যায়নি' : 'No machinery bookings yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            {isBn
              ? 'আপনার জমিতে পাওয়ার টিলার, সেচ পাম্প বা হারভেস্টার বুক করতে মার্কেটপ্লেসে ভিজিট করুন।'
              : 'Hire agricultural equipment with neighboring cluster discounts directly to your plot.'}
          </p>
          <Link
            href={`/${lang}/machinery`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
          >
            {isBn ? 'যন্ত্রপাতি খুঁজুন' : 'Browse Machinery'}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {booking.bookingReference}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span className="text-xs text-slate-500">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {booking.isClusterDiscountApplied && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <TrendingDown className="w-3 h-3" />
                      {isBn ? 'সমবায় ছাড় প্রাপ্ত' : 'Cluster Save'}
                    </span>
                  )}
                  {getStatusBadge(booking.status)}
                </div>
              </div>

              {/* Booking Body Details */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 my-3 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">{isBn ? 'যন্ত্রপাতি' : 'Equipment'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {booking.machinery ? (isBn ? booking.machinery.titleBn : booking.machinery.titleEn) : '---'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">{isBn ? 'জমির পরিমাপ ও শিডিউল' : 'Plot / Schedule'}</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300 block">
                    {booking.plotSizeValue} {booking.machinery?.pricingBasis === 'PER_BIGHA' ? (isBn ? 'বিঘা' : 'Bighas') : (isBn ? 'ঘণ্টা' : 'Hours')}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">{isBn ? 'অবস্থান' : 'Location'}</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300 block">
                    {booking.plotUpazila}, {booking.plotDistrict}
                  </span>
                  <span className="text-[11px] text-slate-500 truncate block">
                    {booking.plotAddress}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">{isBn ? 'পরিশোধ ও জামানত' : 'Amount & Escrow'}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm block">
                    ৳{booking.grandTotal.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Status: {booking.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Actions & Inspection Log Trigger */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {booking.inspections && booking.inspections.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedBookingForDetails(booking)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isBn ? 'ডিজিটাল চেকলিস্ট রিপোর্ট দেখুন' : 'View Inspection Report'}</span>
                    </button>
                  )}
                </div>

                {booking.status === 'CONFIRMED' && (
                  <button
                    type="button"
                    onClick={() => handleCancelBooking(booking.id)}
                    disabled={isUpdating}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition"
                  >
                    {isBn ? 'বুকিং বাতিল করুন' : 'Cancel Booking'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspection Modal */}
      {selectedBookingForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {isBn ? 'ডিজিটাল পরিদর্শন রিপোর্ট' : 'Digital Inspection Audit'}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedBookingForDetails(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {selectedBookingForDetails.inspections?.map((insp, idx) => (
                <div key={insp.id || idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {insp.inspectionType === 'PRE_DISPATCH'
                        ? isBn ? 'কাজের পূর্বে পরিদর্শন (Pre-Dispatch)' : 'Pre-Dispatch Check'
                        : isBn ? 'কাজ শেষে পরিদর্শন (Post-Return)' : 'Post-Return Check'}
                    </span>
                    <span className="text-slate-400">{new Date(insp.createdAt).toLocaleString()}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400 mb-2">
                    <span>Meter Hours: <strong>{insp.meterHours} hrs</strong></span>
                    <span>Fuel Level: <strong>{insp.fuelLevelPct}%</strong></span>
                    <span>Engine Operational: <strong>{insp.isEngineOperational ? 'Yes' : 'No'}</strong></span>
                    <span>Working Condition: <strong>{insp.isOperational ? 'Good' : 'Damaged'}</strong></span>
                  </div>

                  {insp.damageNotes && (
                    <p className="text-rose-600 dark:text-rose-400 font-medium">
                      Note: {insp.damageNotes}
                    </p>
                  )}

                  {insp.claimDamageDeduction > 0 && (
                    <div className="mt-2 p-2 rounded bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold">
                      Claim Deduction: ৳{insp.claimDamageDeduction}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setSelectedBookingForDetails(null)}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200"
            >
              {isBn ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
