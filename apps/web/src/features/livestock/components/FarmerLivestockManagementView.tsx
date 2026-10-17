'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  ShieldCheck,
  PlusCircle,
  Sparkles,
  Lock,
  CheckCircle2,
  Calendar,
  Milk,
  Scale,
  X,
} from 'lucide-react';
import {
  useGetSellerLivestockListingsQuery,
  useCreateLivestockListingMutation,
  useCreateAIBookingMutation,
  LivestockListing,
} from '../livestockApi';
import { LivestockPassportModal } from './LivestockPassportModal';

export const FarmerLivestockManagementView: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedPassportTag, setSelectedPassportTag] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerDistrict, setSellerDistrict] = useState('Bogura');
  const [sellerUpazila, setSellerUpazila] = useState('Sherpur');
  const [earTagNumber, setEarTagNumber] = useState('');
  const [category, setCategory] = useState<'DAIRY_COW' | 'BEEF_CATTLE' | 'BULL_CALF' | 'GOAT' | 'SHEEP' | 'BUFFALO'>('DAIRY_COW');
  const [breed, setBreed] = useState('HOLSTEIN_FRIESIAN_CROSS');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('FEMALE');
  const [liveWeightKg, setLiveWeightKg] = useState(350);
  const [teethCount, setTeethCount] = useState(2);
  const [ageMonths, setAgeMonths] = useState(24);
  const [dailyMilkYieldLiters, setDailyMilkYieldLiters] = useState<number | undefined>(12);
  const [askingPrice, setAskingPrice] = useState(180000);
  const [qurbaniEligible, setQurbaniEligible] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Quick AI Booking Modal
  const [aiBookingListing, setAiBookingListing] = useState<LivestockListing | null>(null);
  const [heatTime, setHeatTime] = useState<string>('2026-10-17 06:00 AM');
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string | null>(null);

  const { data, isLoading } = useGetSellerLivestockListingsQuery();
  const listings = data?.data || [];

  const [createListing, { isLoading: isCreating }] = useCreateLivestockListingMutation();
  const [createAIBooking, { isLoading: isBookingAI }] = useCreateAIBookingMutation();

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createListing({
        title,
        sellerName,
        sellerPhone,
        sellerDistrict,
        sellerUpazila,
        earTagNumber,
        category,
        breed,
        gender,
        liveWeightKg,
        teethCount,
        ageMonths,
        dailyMilkYieldLiters: category === 'DAIRY_COW' ? dailyMilkYieldLiters : undefined,
        askingPrice,
        negotiable: true,
        qurbaniEligible,
        mediaUrls: ['https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80'],
      }).unwrap();

      setSuccessMsg('পশু সফলভাবে নিবন্ধিত হয়েছে! সরকারি ডিএলএস স্বাস্থ্য পরীক্ষার জন্য উপজেলা কর্মকর্তার কাছে অনুরোধ পাঠানো হয়েছে।');
      setTimeout(() => {
        setSuccessMsg(null);
        setShowAddModal(false);
        setTitle('');
        setEarTagNumber('');
      }, 3000);
    } catch {
      alert('পশু নিবন্ধনে ত্রুটি হয়েছে। কানট্যাগটি ইতিমধ্যে ব্যবহৃত কিনা পরীক্ষা করুন।');
    }
  };

  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiBookingListing) return;

    try {
      await createAIBooking({
        farmerName: aiBookingListing.sellerName,
        farmerPhone: aiBookingListing.sellerPhone,
        farmerDistrict: aiBookingListing.sellerDistrict,
        farmerUpazila: aiBookingListing.sellerUpazila,
        targetDamEarTag: aiBookingListing.earTagNumber,
        targetDamBreed: aiBookingListing.breed,
        desiredSireBreed: 'HOLSTEIN_FRIESIAN_CROSS',
        strawSource: 'Central Cattle Breeding & Dairy Farm, Savar',
        heatObservationDate: heatTime,
      }).unwrap();

      setAiSuccessMsg('কৃত্রিম প্রজনন (AI) টেকনিশিয়ান বুকিং গৃহীত হয়েছে! সকাল-সন্ধ্যা নিয়মানুযায়ী টেকনিশিয়ান খামারে উপস্থিত হবেন।');
      setTimeout(() => {
        setAiSuccessMsg(null);
        setAiBookingListing(null);
      }, 3000);
    } catch {
      alert('এআই বুকিং ব্যর্থ হয়েছে।');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" /> আমার খামারের গবাদি পশু ও ডিজিটাল বহর
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            পশুর স্বাস্থ্য পাসপোর্ট, কানট্যাগ, নিরাপদ এসক্রো বায়না ও কৃত্রিম প্রজনন সেবা ব্যবস্থাপনা
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> নতুন পশু যুক্ত করুন
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-500">লোড হচ্ছে...</div>
      ) : listings.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Scale className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 dark:text-slate-200">কোনো পশু নিবন্ধিত নেই</h3>
          <p className="text-xs text-slate-500 mt-1">আপনার খামারের প্রথম পশুটি হাটে বিক্রির জন্য যুক্ত করুন।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs space-y-4 p-5"
            >
              <div className="relative h-44 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                <Image
                  src={item.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80'}
                  alt={item.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute top-2 left-2 bg-slate-900/80 text-emerald-300 font-mono text-xs px-2 py-0.5 rounded">
                  {item.earTagNumber}
                </div>
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      item.listingStatus === 'AVAILABLE'
                        ? 'bg-emerald-600 text-white'
                        : item.listingStatus === 'UNDER_ESCROW'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-600 text-white'
                    }`}
                  >
                    {item.listingStatus}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-emerald-600">
                  {item.breed.replace(/_/g, ' ')}
                </span>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm line-clamp-1">
                  {item.title}
                </h3>
                <div className="text-xs text-slate-500 mt-1">
                  ওজন: <strong>{item.liveWeightKg} কেজি</strong> • দাঁত: <strong>{item.teethCount} টি</strong>
                  {item.dailyMilkYieldLiters && ` • দুধ: ${item.dailyMilkYieldLiters} লি./দিন`}
                </div>
              </div>

              {/* Escrow Status banner */}
              {item.escrowStatus === 'HELD_IN_ESCROW' && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/50 text-xs space-y-1">
                  <div className="flex items-center gap-1 font-bold text-amber-800 dark:text-amber-200">
                    <Lock className="w-3.5 h-3.5" /> ক্রেতা কর্তৃক এসক্রো বায়না জমা
                  </div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-300">
                    ক্রেতা: {item.buyerName} ({item.buyerPhone})
                  </div>
                  <div className="font-black text-amber-900 dark:text-amber-100">
                    জমা পরিমাণ: ৳{Number(item.escrowAmount || item.askingPrice).toLocaleString()}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center text-xs font-bold pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">মূল্য:</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-base">
                  ৳{Number(item.askingPrice).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setSelectedPassportTag(item.earTagNumber)}
                  className="py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold border border-emerald-200 dark:border-emerald-800"
                >
                  স্বাস্থ্য সনদ
                </button>

                {item.gender === 'FEMALE' && (
                  <button
                    onClick={() => setAiBookingListing(item)}
                    className="py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-semibold border border-blue-200 dark:border-blue-800 flex items-center justify-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> AI প্রজনন
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Animal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-5 my-8">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" /> নতুন গবাদি পশু নিবন্ধন
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMsg ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                {successMsg}
              </div>
            ) : (
              <form onSubmit={handleCreateSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">পশুর শিরোনাম / নাম</label>
                  <input
                    type="text"
                    required
                    placeholder="উদাঃ হলস্টাইন ফ্রিজিয়ান ক্রসব্রিড গাভী (১৮ লিটার দুধ)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">খামারির নাম</label>
                    <input
                      type="text"
                      required
                      placeholder="উদাঃ আল-হাজ্ব ফারুক"
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">মোবাইল নম্বর</label>
                    <input
                      type="text"
                      required
                      placeholder="০১৭xxxxxxxx"
                      value={sellerPhone}
                      onChange={(e) => setSellerPhone(e.target.value)}
                      className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">জেলা</label>
                    <input
                      type="text"
                      required
                      value={sellerDistrict}
                      onChange={(e) => setSellerDistrict(e.target.value)}
                      className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">উপজেলা</label>
                    <input
                      type="text"
                      required
                      value={sellerUpazila}
                      onChange={(e) => setSellerUpazila(e.target.value)}
                      className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">সরকারি কানট্যাগ নম্বর (Ear Tag)</label>
                    <input
                      type="text"
                      required
                      placeholder="উদাঃ BAN-LIV-892150"
                      value={earTagNumber}
                      onChange={(e) => setEarTagNumber(e.target.value)}
                      className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">পশুর ধরন (Category)</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    >
                      <option value="DAIRY_COW">দুধেল গাভী (Dairy Cow)</option>
                      <option value="BEEF_CATTLE">মাংসের ষাঁড় (Beef Cattle)</option>
                      <option value="BULL_CALF">বাছুর / বকনা (Calf)</option>
                      <option value="GOAT">ছাগল / খাসি (Goat)</option>
                      <option value="BUFFALO">মহিষ (Buffalo)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">লাইভ ওজন (কেজি)</label>
                    <input
                      type="number"
                      required
                      value={liveWeightKg}
                      onChange={(e) => setLiveWeightKg(Number(e.target.value))}
                      className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">দাঁতের সংখ্যা</label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={8}
                      value={teethCount}
                      onChange={(e) => setTeethCount(Number(e.target.value))}
                      className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">বয়স (মাস)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={ageMonths}
                      onChange={(e) => setAgeMonths(Number(e.target.value))}
                      className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                </div>

                {category === 'DAIRY_COW' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">দৈনিক দুধের পরিমাণ (লিটার / দিন)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={dailyMilkYieldLiters || ''}
                      onChange={(e) => setDailyMilkYieldLiters(Number(e.target.value))}
                      className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">প্রত্যাশিত বিক্রয় মূল্য (৳)</label>
                    <input
                      type="number"
                      required
                      value={askingPrice}
                      onChange={(e) => setAskingPrice(Number(e.target.value))}
                      className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="qurbaniCheck"
                      checked={qurbaniEligible}
                      onChange={(e) => setQurbaniEligible(e.target.checked)}
                      className="w-4 h-4 text-emerald-600"
                    />
                    <label htmlFor="qurbaniCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      কোরবানি হাট উপযুক্ত
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md mt-4"
                >
                  {isCreating ? 'নিবন্ধন হচ্ছে...' : 'পশুটি হাটে তালিকাভুক্ত করুন'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* AI Booking Modal */}
      {aiBookingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-blue-500/30 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" /> কৃত্রিম প্রজনন (AI) টেকনিশিয়ান বুকিং
              </h3>
              <button onClick={() => setAiBookingListing(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs">
              গাভী: <span className="font-bold">{aiBookingListing.title}</span> ({aiBookingListing.earTagNumber})
            </div>

            {aiSuccessMsg ? (
              <div className="p-4 bg-blue-50 text-blue-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                {aiSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleAISubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">গরম (Heat) লক্ষণ দেখার সময়</label>
                  <input
                    type="text"
                    required
                    value={heatTime}
                    onChange={(e) => setHeatTime(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    সকাল-সন্ধ্যা নিয়ম: সকালে লক্ষণ দেখলে বিকেলে, বিকেলে দেখলে পরের দিন সকালে ইনসেমিনেশন হবে।
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-xs font-bold text-blue-900 dark:text-blue-200">
                  <span>সরকারি ভর্তুকিপ্রাপ্ত সিমেন ও ফি:</span>
                  <span className="text-base text-blue-600">৳৬৫০</span>
                </div>

                <button
                  type="submit"
                  disabled={isBookingAI}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  {isBookingAI ? 'প্রক্রিয়াধীন...' : 'টেকনিশিয়ান নিশ্চিত করুন'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* DLS Passport Modal */}
      {selectedPassportTag && (
        <LivestockPassportModal
          earTagNumber={selectedPassportTag}
          onClose={() => setSelectedPassportTag(null)}
        />
      )}
    </div>
  );
};
