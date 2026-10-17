'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Plane,
  FlaskConical,
  ShieldAlert,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
  Droplets,
  Coins,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import {
  useGetFarmerDroneBookingsQuery,
  useGetFarmerSoilCardsQuery,
  DroneBookingStatus,
} from '../agriPrecisionApi';

export function FarmerPrecisionPortfolioView({ lang = 'en' }: { lang?: string }) {
  const isBn = lang === 'bn';

  const [activeTab, setActiveTab] = useState<'DRONES' | 'SOIL'>('DRONES');

  const { data: droneBookings = [], isLoading: loadingDrones, refetch: refetchDrones } =
    useGetFarmerDroneBookingsQuery();
  const { data: soilCards = [], isLoading: loadingSoil, refetch: refetchSoil } =
    useGetFarmerSoilCardsQuery();

  const getStatusBadge = (status: DroneBookingStatus) => {
    switch (status) {
      case 'REQUESTED':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {isBn ? 'আবেদন গৃহীত' : 'Requested'}
          </span>
        );
      case 'CONFIRMED_DISPATCH':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            {isBn ? 'পাইলট ও ড্রোন নির্ধারিত' : 'Pilot Confirmed'}
          </span>
        );
      case 'IN_FLIGHT_SPRAYING':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse">
            {isBn ? 'এরিয়াল স্প্রে চলমান' : 'In Flight Spraying'}
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
            {isBn ? 'মিশন সম্পন্ন' : 'Mission Completed'}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 text-xs font-bold border border-teal-300 dark:border-teal-800">
                {isBn ? 'কৃষক প্রযুক্তি পোর্টফোলিও' : 'Farmer Smart Ag Portfolio'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
              {isBn
                ? 'আমার ড্রোন স্প্রে মিশন ও মৃত্তিকা স্বাস্থ্য কার্ড'
                : 'My Precision Drone Missions & Soil Health Records'}
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              {isBn
                ? 'আপনার শিডিউল করা ড্রোন ফ্লাইট, এরিয়াল কীটনাশক প্রয়োগের অগ্রগতি ও জমির সুষম সার প্রেসক্রিপশন।'
                : 'Monitor aerial drone missions, water savings counters, and customized soil diagnostic cards.'}
            </p>
          </div>

          <Link
            href={`/${lang}/agri-precision`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-md shadow-teal-600/30 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isBn ? 'নতুন সেবা বুক করুন' : 'Book New Smart Service'}</span>
          </Link>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('DRONES')}
            className={`px-5 py-3 text-xs md:text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'DRONES'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Plane className="w-4 h-4" />
            <span>
              {isBn ? 'ড্রোন স্প্রে মিশন' : 'Drone Spraying Missions'} ({droneBookings.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('SOIL')}
            className={`px-5 py-3 text-xs md:text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'SOIL'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>
              {isBn ? 'মৃত্তিকা স্বাস্থ্য কার্ড' : 'Soil Health Cards'} ({soilCards.length})
            </span>
          </button>
        </div>

        {/* TAB 1: DRONE BOOKINGS */}
        {activeTab === 'DRONES' && (
          <div className="space-y-4">
            {loadingDrones ? (
              <div className="py-20 text-center">
                <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">Loading drone bookings...</p>
              </div>
            ) : droneBookings.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8">
                <Plane className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isBn ? 'কোনো ড্রোন বুকিং পাওয়া যায়নি' : 'No Drone Spraying Bookings Found'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 mb-6 max-w-md mx-auto">
                  {isBn
                    ? 'কৃষি ড্রোন দিয়ে মাত্র ১৮০ টাকা বিঘায় আলু ও ধানের ব্লাইট ও পোকা দমন স্প্রে করুন। সময় ও পানি সাশ্রয় করুন।'
                    : 'Schedule certified drone spraying to protect crops against late blight and blast with 90% water savings.'}
                </p>
                <Link
                  href={`/${lang}/agri-precision`}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-semibold"
                >
                  {isBn ? 'ড্রোন স্প্রে শিডিউল করুন' : 'Schedule Drone Spray'}
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {droneBookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-500">
                            {b.bookingNumber}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-400">{b.scheduledDate}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                          {b.targetCrop} — {b.targetInfestationOrFormula}
                        </h3>
                      </div>
                      <div>{getStatusBadge(b.status)}</div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-xs mb-3">
                      <div>
                        <span className="text-slate-400">Land Area:</span>
                        <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                          {b.landAreaBighas} Bighas
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">Total Cost:</span>
                        <p className="font-bold text-teal-600 mt-0.5">৳{b.totalBookingCost}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Water Saved:</span>
                        <p className="font-bold text-cyan-600 mt-0.5">{b.waterSavedLiters} L</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Time Window:</span>
                        <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                          {b.scheduledTimeSlot}
                        </p>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      <strong>Plot Location: </strong>
                      {b.plotAddress}, {b.plotUpazila}, {b.plotDistrict}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SOIL HEALTH CARDS */}
        {activeTab === 'SOIL' && (
          <div className="space-y-4">
            {loadingSoil ? (
              <div className="py-20 text-center">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">Loading soil health cards...</p>
              </div>
            ) : soilCards.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8">
                <FlaskConical className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isBn ? 'কোনো ডিজিটাল মৃত্তিকা স্বাস্থ্য কার্ড নেই' : 'No Soil Health Cards Found'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 mb-6 max-w-md mx-auto">
                  {isBn
                    ? 'মাটির ল্যাব পরীক্ষার মান ইনপুট দিয়ে সুষম সার প্রয়োগের সঠিক মাত্রা এবং অম্লতা সংশোধনের পরামর্শ জানুন।'
                    : 'Input soil test results to compute customized SRDI nutrient fertilizer prescriptions.'}
                </p>
                <Link
                  href={`/${lang}/agri-precision`}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  {isBn ? 'মাটি পরীক্ষা বিশ্লেষণ করুন' : 'Analyze Soil Card'}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {soilCards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="font-mono text-xs text-slate-400">{card.soilCardNumber}</span>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                          {card.targetCrop} ({card.soilTexture})
                        </h3>
                      </div>
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        pH {card.phLevel}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs mb-3 text-center">
                      <div>
                        <span className="text-slate-400">Urea:</span>
                        <p className="font-bold">{card.calculatedUreaKgPerBigha} kg</p>
                      </div>
                      <div>
                        <span className="text-slate-400">TSP:</span>
                        <p className="font-bold">{card.calculatedTspKgPerBigha} kg</p>
                      </div>
                      <div>
                        <span className="text-slate-400">MOP:</span>
                        <p className="font-bold">{card.calculatedMopKgPerBigha} kg</p>
                      </div>
                    </div>

                    {card.phCorrectionAdvice && (
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-xl mb-3">
                        <strong>Lime Advice: </strong> {card.phCorrectionAdvice}
                      </p>
                    )}

                    <p className="text-[11px] text-slate-500 truncate">
                      <strong>Schedule: </strong> {card.fertilizerApplicationSchedule}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
