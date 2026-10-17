'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  ShieldCheck,
  Search,
  Scale,
  Sparkles,
  Truck,
  CheckCircle2,
  Calendar,
  Lock,
  HeartHandshake,
  Clock,
  Phone,
  Milk,
} from 'lucide-react';
import {
  useGetLivestockListingsQuery,
  useGetLivestockOverviewStatsQuery,
  useCommitEscrowPurchaseMutation,
  useCreateTransportBookingMutation,
  LivestockListing,
} from '../livestockApi';
import { LivestockPassportModal } from './LivestockPassportModal';

export const LivestockMarketplaceView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchDistrict, setSearchDistrict] = useState<string>('');
  const [qurbaniOnly, setQurbaniOnly] = useState<boolean>(false);
  const [selectedPassportTag, setSelectedPassportTag] = useState<string | null>(null);

  // Meat Yield Calc state
  const [meatCalcWeight, setMeatCalcWeight] = useState<number>(400);
  const [meatCalcCategory, setMeatCalcCategory] = useState<string>('BEEF_CATTLE');
  const [showMeatModal, setShowMeatModal] = useState<boolean>(false);

  // Escrow Purchase Modal state
  const [escrowListing, setEscrowListing] = useState<LivestockListing | null>(null);
  const [buyerName, setBuyerName] = useState<string>('');
  const [buyerPhone, setBuyerPhone] = useState<string>('');
  const [escrowSuccessMsg, setEscrowSuccessMsg] = useState<string | null>(null);

  // Transport Booking state
  const [transportListing, setTransportListing] = useState<LivestockListing | null>(null);
  const [dropoffAddress, setDropoffAddress] = useState<string>('');
  const [dropoffDistrict, setDropoffDistrict] = useState<string>('Dhaka');
  const [transportSuccessMsg, setTransportSuccessMsg] = useState<string | null>(null);

  const { data: statsData } = useGetLivestockOverviewStatsQuery();
  const stats = statsData?.data;

  const { data: listingsData, isLoading } = useGetLivestockListingsQuery({
    category: selectedCategory !== 'ALL' && selectedCategory !== 'QURBANI' ? selectedCategory : undefined,
    district: searchDistrict.trim() || undefined,
    qurbaniOnly: qurbaniOnly || selectedCategory === 'QURBANI',
  });

  const listings = listingsData?.data || [];

  const [commitEscrow, { isLoading: isCommittingEscrow }] = useCommitEscrowPurchaseMutation();
  const [bookTransport, { isLoading: isBookingTransport }] = useCreateTransportBookingMutation();

  const handleEscrowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!escrowListing || !buyerName || !buyerPhone) return;

    try {
      await commitEscrow({
        id: escrowListing.id,
        buyerName,
        buyerPhone,
        escrowAmount: escrowListing.askingPrice,
      }).unwrap();

      setEscrowSuccessMsg(`৳${escrowListing.askingPrice.toLocaleString()} নিরাপদ এসক্রো ফান্ডে জমা হয়েছে। খামারে পশু পৌঁছে যাচাইয়ের পর বিক্রেতা টাকা পাবেন।`);
      setTimeout(() => {
        setEscrowSuccessMsg(null);
        setEscrowListing(null);
        setBuyerName('');
        setBuyerPhone('');
      }, 4000);
    } catch {
      alert('এসক্রো বায়না প্রক্রিয়াকরণে সমস্যা হয়েছে। দয়া করে পুনরায় চেষ্টা করুন।');
    }
  };

  const handleTransportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transportListing || !buyerName || !buyerPhone || !dropoffAddress) return;

    try {
      await bookTransport({
        buyerName,
        buyerPhone,
        livestockId: transportListing.id,
        earTagNumber: transportListing.earTagNumber,
        pickupDistrict: transportListing.sellerDistrict,
        pickupUpazila: transportListing.sellerUpazila,
        pickupAddress: `${transportListing.sellerName}, ${transportListing.sellerUpazila}`,
        dropoffDistrict,
        dropoffUpazila: 'Sadar',
        dropoffAddress,
        fareAmount: 7500,
        hasTransitInsurance: true,
      }).unwrap();

      setTransportSuccessMsg(`পশু পরিবহন ট্রাক বুকিং সফল হয়েছে! খড় বিছানো বিশেষায়িত পিকআপ প্রেরক খামারের উদ্দেশ্যে রওনা দেবে।`);
      setTimeout(() => {
        setTransportSuccessMsg(null);
        setTransportListing(null);
        setDropoffAddress('');
      }, 4000);
    } catch {
      alert('পরিবহন বুকিংয়ে সমস্যা হয়েছে।');
    }
  };

  // Meat Calculation Math
  const dressingPct = meatCalcCategory === 'GOAT' ? 50 : 55;
  const carcassKg = Math.round((meatCalcWeight * dressingPct) / 100);
  const bonelessMeatKg = Math.round(carcassKg * 0.72);
  const ratePerKg = meatCalcCategory === 'GOAT' ? 1150 : 780;
  const estimatedTotalVal = bonelessMeatKg * ratePerKg;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-8 sm:p-12 shadow-xl border border-emerald-500/20">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> ডিজিটাল পশুর হাট ও ডিএলএস স্বাস্থ্য পাসপোর্ট
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              মধ্যস্বত্বভোগী ও হাসিলমুক্ত <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">
                নিরাপদ ডিজিটাল গবাদি পশুর হাট
              </span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              সরকারি কানট্যাগ নম্বর দিয়ে প্রাণিসম্পদ কর্মকর্তার স্বাক্ষরিত ডিজিটাল স্বাস্থ্য পাসপোর্ট, টিকাদান সনদ, লাইভ ওজন ও মাংসের অনুপাত যাচাই করে খামারি থেকে সরাসরি কিনুন সম্পূর্ণ এসক্রো সুরক্ষায়।
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => setShowMeatModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-900/40 transition-all"
              >
                <Scale className="w-4 h-4" /> লাইভ ওজন ও মাংসের ক্যালকুলেটর
              </button>
              <a
                href="#listings-grid"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-semibold border border-white/20 transition-all"
              >
                <Search className="w-4 h-4" /> হাট ব্রাউজ করুন
              </a>
            </div>
          </div>
        </div>

        {/* Live Marketplace Telemetry & Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-slate-400">হাটে মোট গবাদি পশু</span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
              {stats?.totalListings || 4} টি
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> শতভাগ যাচাইকৃত খামার
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-slate-400">DLS স্বাস্থ্য সনদপ্রাপ্ত</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {stats?.dlsCertifiedPercentage || 100}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> সরকারি পশু হাসপাতাল প্রত্যয়িত
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-slate-400">নিরাপদ এসক্রো লেনদেন</span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
              ৳{(stats?.totalEscrowHeldBdt || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-teal-600 dark:text-teal-400 mt-1 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> ০% হাসিল প্রতারণামুক্ত
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-slate-400">কৃত্রিম প্রজনন (AI) সম্পন্ন</span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
              {stats?.completedAIBreedings || 12} টি
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> সাভার ও ব্র্যাক উন্নত সিমেন
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div id="listings-grid" className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {[
                { id: 'ALL', label: 'সকল পশু' },
                { id: 'DAIRY_COW', label: 'দুধেল গাভী' },
                { id: 'BEEF_CATTLE', label: 'মাংসের ষাঁড়/বলদ' },
                { id: 'QURBANI', label: 'কোরবানি হাট' },
                { id: 'GOAT', label: 'খাসি ও বকরি' },
                { id: 'BULL_CALF', label: 'উন্নত বাছুর' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedCategory(tab.id);
                    if (tab.id === 'QURBANI') setQurbaniOnly(true);
                    else setQurbaniOnly(false);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    selectedCategory === tab.id
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* District Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="জেলা দিয়ে খুঁজুন (উদাঃ বগুড়া, পাবনা)..."
                value={searchDistrict}
                onChange={(e) => setSearchDistrict(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-500">
            <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
            হাটের গবাদি পশু লোড হচ্ছে...
          </div>
        ) : listings.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Scale className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 dark:text-slate-200">কোনো পশু পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500 mt-1">অন্য কোনো ক্যাটাগরি বা জেলা নির্বাচন করে অনুসন্ধান করুন।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item) => {
              const meatYield = Math.round(Number(item.liveWeightKg) * 0.54 * 0.72);

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Media Image & Badges */}
                    <div className="relative h-56 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <Image
                        src={item.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80'}
                        alt={item.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Ear Tag badge */}
                      <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-emerald-300 font-mono text-xs px-2.5 py-1 rounded-lg border border-emerald-500/40">
                        {item.earTagNumber}
                      </div>

                      {/* DLS & Qurbani Badges */}
                      <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                        {item.healthStatus === 'CERTIFIED_HEALTHY' && (
                          <span className="bg-emerald-600/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                            <ShieldCheck className="w-3.5 h-3.5" /> DLS সনদপ্রাপ্ত
                          </span>
                        )}
                        {item.qurbaniEligible && (
                          <span className="bg-amber-500/90 text-slate-950 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                            <Sparkles className="w-3.5 h-3.5" /> কোরবানি উপযুক্ত
                          </span>
                        )}
                      </div>

                      {/* Weight & Teeth stats overlay */}
                      <div className="absolute bottom-3 left-3 right-3 flex justify-between text-white text-xs">
                        <span className="bg-black/50 backdrop-blur-xs px-2 py-1 rounded-md">
                          লাইভ ওজন: <strong>{item.liveWeightKg} কেজি</strong> (~{meatYield} কেজি মাংস)
                        </span>
                        <span className="bg-black/50 backdrop-blur-xs px-2 py-1 rounded-md">
                          দাঁত: <strong>{item.teethCount} টি</strong> • বয়স: {item.ageMonths} মাস
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-3">
                      <div>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          {item.breed.replace(/_/g, ' ')}
                        </span>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base line-clamp-2 mt-0.5">
                          {item.title}
                        </h3>
                      </div>

                      {item.dailyMilkYieldLiters && (
                        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex items-center justify-between text-xs">
                          <span className="text-blue-700 dark:text-blue-300 flex items-center gap-1 font-medium">
                            <Milk className="w-3.5 h-3.5" /> দৈনিক দুধ উৎপাদন:
                          </span>
                          <span className="font-bold text-blue-950 dark:text-blue-100">
                            {item.dailyMilkYieldLiters} লিটার / দিন
                          </span>
                        </div>
                      )}

                      <div className="text-xs text-slate-500 space-y-1">
                        <div>খামার: <span className="text-slate-800 dark:text-slate-200 font-medium">{item.sellerName}</span></div>
                        <div>অবস্থান: <span className="text-slate-800 dark:text-slate-200 font-medium">{item.sellerUpazila}, {item.sellerDistrict}</span></div>
                      </div>

                      <div className="flex items-baseline justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="text-xs text-slate-400">বিক্রয় মূল্য:</span>
                          <div className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                            ৳{Number(item.askingPrice).toLocaleString()}
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {item.negotiable ? 'দরদাম আলোচনা সাপেক্ষ' : 'একদাম'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedPassportTag(item.earTagNumber)}
                      className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> পশু পাসপোর্ট
                    </button>

                    <button
                      onClick={() => setEscrowListing(item)}
                      disabled={item.listingStatus !== 'AVAILABLE'}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white disabled:text-slate-500 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      {item.listingStatus === 'AVAILABLE' ? 'এসক্রো ক্রয়' : item.listingStatus}
                    </button>

                    <button
                      onClick={() => setTransportListing(item)}
                      className="col-span-2 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Truck className="w-3.5 h-3.5" /> বিশেষায়িত পশু পরিবহন ট্রাক বুকিং
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Meat Yield Calculator Modal */}
        {showMeatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                    লাইভ ওজন ও নিট মাংস ক্যালকুলেটর
                  </h3>
                </div>
                <button
                  onClick={() => setShowMeatModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">পশুর ধরন</label>
                  <select
                    value={meatCalcCategory}
                    onChange={(e) => setMeatCalcCategory(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  >
                    <option value="BEEF_CATTLE">ষাঁড় / বলদ (Beef Cattle - ৫৫% ড্রেসিং)</option>
                    <option value="DAIRY_COW">গাভী (Dairy Cow - ৫২% ড্রেসিং)</option>
                    <option value="GOAT">খাসি / ছাগল (Goat - ৫০% ড্রেসিং)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span>লাইভ ওজন (কেজি):</span>
                    <span className="text-emerald-600 font-bold">{meatCalcWeight} কেজি</span>
                  </div>
                  <input
                    type="range"
                    min={meatCalcCategory === 'GOAT' ? 15 : 150}
                    max={meatCalcCategory === 'GOAT' ? 60 : 900}
                    step={meatCalcCategory === 'GOAT' ? 1 : 5}
                    value={meatCalcWeight}
                    onChange={(e) => setMeatCalcWeight(Number(e.target.value))}
                    className="w-full mt-2 accent-emerald-600"
                  />
                </div>

                {/* Results Card */}
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">প্রত্যাশিত ড্রেসড কারকাস:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{carcassKg} কেজি ({dressingPct}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">নিট হাড়ছাড়া খাওয়ার উপযোগী মাংস:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300 text-sm">{bonelessMeatKg} কেজি</span>
                  </div>
                  <div className="flex justify-between border-t border-emerald-200 dark:border-emerald-800 pt-2">
                    <span className="text-slate-600 dark:text-slate-300">মাংসের বাজার মূল্যমান:</span>
                    <span className="font-extrabold text-emerald-800 dark:text-emerald-200 text-sm">
                      ৳{estimatedTotalVal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowMeatModal(false)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs"
              >
                হিসাব সম্পন্ন
              </button>
            </div>
          </div>
        )}

        {/* Escrow Booking Modal */}
        {escrowListing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-emerald-500/30 space-y-5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                    নিরাপদ এসক্রো ক্রয় ও বায়না
                  </h3>
                </div>
                <button
                  onClick={() => setEscrowListing(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
                <div className="font-bold text-slate-900 dark:text-slate-100">{escrowListing.title}</div>
                <div className="text-slate-500">কানট্যাগ: {escrowListing.earTagNumber} • বিক্রেতা: {escrowListing.sellerName}</div>
                <div className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base">
                  মোট মূল্য: ৳{Number(escrowListing.askingPrice).toLocaleString()}
                </div>
              </div>

              {escrowSuccessMsg ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  {escrowSuccessMsg}
                </div>
              ) : (
                <form onSubmit={handleEscrowSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">আপনার পুরো নাম</label>
                    <input
                      type="text"
                      required
                      placeholder="উদাঃ আব্দুর রহিম"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">মোবাইল নম্বর (বিকাশ / ব্যাংক নোটিফিকেশন)</label>
                    <input
                      type="text"
                      required
                      placeholder="০১৭xxxxxxxx"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-200">
                    <HeartHandshake className="w-4 h-4 inline mr-1 text-amber-600" />
                    <strong>এসক্রো নিশ্চয়তা:</strong> টাকা প্ল্যাটফর্মের সুরক্ষিত এসক্রো অ্যাকাউন্টে জমা থাকবে। আপনি নিজে বা আপনার প্রতিনিধি পশুটি দেখে সন্তুষ্ট হলে তবেই বিক্রেতা টাকা পাবেন। কোনো প্রতারণা বা অসুস্থতায় সম্পূর্ণ টাকা ফেরত দেওয়া হবে।
                  </div>

                  <button
                    type="submit"
                    disabled={isCommittingEscrow}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md"
                  >
                    {isCommittingEscrow ? 'প্রক্রিয়াধীন...' : `৳${escrowListing.askingPrice.toLocaleString()} এসক্রো বায়না নিশ্চিত করুন`}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Transport Booking Modal */}
        {transportListing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                    বিশেষায়িত পশু পরিবহন পিকআপ বুকিং
                  </h3>
                </div>
                <button
                  onClick={() => setTransportListing(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
                <div>পশু: <span className="font-bold">{transportListing.title}</span></div>
                <div>পিকআপ অবস্থান: <span className="text-emerald-600 font-semibold">{transportListing.sellerUpazila}, {transportListing.sellerDistrict}</span></div>
                <div>গাড়ি: খড় বিছানো বায়ু চলাচলযুক্ত ১.৫ টন পিকআপ ও ট্রানজিট বীমা অন্তর্ভুক্ত</div>
              </div>

              {transportSuccessMsg ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  {transportSuccessMsg}
                </div>
              ) : (
                <form onSubmit={handleTransportSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">গ্রহীতার নাম</label>
                    <input
                      type="text"
                      required
                      placeholder="উদাঃ আব্দুর রহিম"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">যোগাযোগের মোবাইল</label>
                    <input
                      type="text"
                      required
                      placeholder="০১৭xxxxxxxx"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">গন্তব্য জেলা</label>
                    <input
                      type="text"
                      required
                      value={dropoffDistrict}
                      onChange={(e) => setDropoffDistrict(e.target.value)}
                      className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">বিস্তারিত ড্রপ-অফ ঠিকানা (গ্রাম / বাড়ি / খামার)</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="উদাঃ বাড়ি নং ১২, রোড নং ৩, মিরপুর ডিওএইচএস, ঢাকা"
                      value={dropoffAddress}
                      onChange={(e) => setDropoffAddress(e.target.value)}
                      className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>

                  <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    <span>আনুমানিক পরিবহন ভাড়া + ট্রানজিট লাইফ ইন্স্যুরেন্স:</span>
                    <span className="text-base text-emerald-600">৳৭,৫০০</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isBookingTransport}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md"
                  >
                    {isBookingTransport ? 'প্রক্রিয়াধীন...' : 'নিরাপদ পরিবহন বুক করুন'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* DLS Health Passport Modal */}
        {selectedPassportTag && (
          <LivestockPassportModal
            earTagNumber={selectedPassportTag}
            onClose={() => setSelectedPassportTag(null)}
          />
        )}
      </div>
    </div>
  );
};
