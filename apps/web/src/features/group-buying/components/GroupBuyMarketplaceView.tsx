'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Sparkles,
  ShoppingBag,
  Clock,
  MapPin,
  TrendingDown,
  ArrowRight,
  Share2,
  CheckCircle2,
  Filter,
  RefreshCw,
  Plus,
  Flame,
} from 'lucide-react';
import {
  useGetActiveCampaignsQuery,
  useStartPoolMutation,
  GroupBuyCampaign,
} from '../groupBuyingApi';

export function GroupBuyMarketplaceView({ lang = 'en' }: { lang?: string }) {
  const isBn = lang === 'bn';

  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedCampaignForPool, setSelectedCampaignForPool] = useState<GroupBuyCampaign | null>(null);

  // Start pool form state
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: campaignsData, isLoading, refetch } = useGetActiveCampaignsQuery(
    selectedDistrict ? { district: selectedDistrict } : undefined,
  );
  const campaigns = campaignsData?.data || [];

  const [startPool] = useStartPoolMutation();

  const handleStartPoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignForPool) return;
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await startPool({
        campaignId: selectedCampaignForPool.id,
        quantity,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: deliveryAddress.trim() || selectedCampaignForPool.dropPointName,
      }).unwrap();

      // Redirect to pool details
      window.location.href = `/${lang}/group-buy/${res.data.shareCode}`;
    } catch (err: any) {
      setErrorMessage(err?.data?.message || err.message || 'Failed to start group buy pool');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Banner: How Community Group Buying Works */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 sm:p-10 shadow-lg">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-100 text-xs font-semibold backdrop-blur-xs mb-3">
            <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            {isBn ? 'দলীয় সমবায় পাইকারি ক্রয় অফার' : 'Community Bulk Group Buy'}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {isBn
              ? 'পাড়ার সবাই মিলে একসাথে কিনুন — পাইকারি দরে সর্বোচ্চ সাশ্রয় করুন!'
              : 'Pool Orders with Neighbors — Unlock True Mandi Wholesale Rates!'}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            {isBn
              ? 'কৃষি সার, হাইব্রিড বীজ, পোল্ট্রি ফিড কিংবা পরিবারের নিত্যপণ্য — ৫ জন বা ততোধিক ক্রেতা একত্রিত হয়ে অর্ডার করলেই মিলবে ২০-৩৫% পাইকারি মূল্যছাড় এবং নির্দিষ্ট ইউনিয়ন চত্বরে ফ্রি ডেলিভারি।'
              : 'Agri inputs, hybrid seeds, poultry feed, and staples. Join with 5+ neighbors in your village to lock in 20-35% wholesale discounts with single-drop consolidated delivery.'}
          </p>

          {/* 3 Simple Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-emerald-600/60 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shrink-0">১</span>
              <span>{isBn ? 'পছন্দের পণ্যে দল শুরু করুন' : '1. Start or Join a Pool'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shrink-0">২</span>
              <span>{isBn ? 'হোয়াটসঅ্যাপে বন্ধুদের আমন্ত্রণ জানান' : '2. Share on WhatsApp'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shrink-0">৩</span>
              <span>{isBn ? 'লক্ষ্য পূরণেই পাইকারি দরে ডেলিভারি' : '3. Discount Unlocks!'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Heading Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            {isBn ? 'চলতি সক্রিয় দলীয় ক্রয় অফারসমূহ' : 'Active Community Group Deals'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isBn
              ? 'নির্দিষ্ট সময়সীমার মধ্যে লক্ষ্য পূরণ হলে সরাসরি সেন্ট্রাল হাব থেকে ডেলিভারি সম্পন্ন হবে'
              : 'Target-locked bulk orders dispatched directly from regional hubs'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">{isBn ? 'সকল জেলা (All Districts)' : 'All Districts'}</option>
            <option value="Bogra">বগুড়া (Bogra)</option>
            <option value="Sirajganj">সিরাজগঞ্জ (Sirajganj)</option>
            <option value="Dinajpur">দিনাজপুর (Dinajpur)</option>
            <option value="Rangpur">রংপুর (Rangpur)</option>
            <option value="Pabna">পাবনা (Pabna)</option>
            <option value="Faridpur">ফরিদপুর (Faridpur)</option>
            <option value="Jessore">যশোর (Jessore)</option>
          </select>
        </div>
      </div>

      {/* Campaign Cards Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-emerald-600" />
          {isBn ? 'দলীয় অফারসমূহ লোড হচ্ছে...' : 'Loading community deals...'}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {isBn ? 'এই অঞ্চলে কোনো সক্রিয় দলীয় অফার নেই' : 'No active group buy deals in this area'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {isBn
              ? 'শীঘ্রই নতুন মৌসুমি সার, বীজ ও ফসলের বাল্ক ডিল যোগ করা হবে। অন্যান্য জেলা নির্বাচন করে দেখুন।'
              : 'New seasonal deals will be launched soon. Try selecting another district.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((c) => {
            const savings = Number(c.regularPrice) - Number(c.groupPrice);
            const discountPct = Math.round((savings / Number(c.regularPrice)) * 100);
            const title = (isBn ? c.titleBn : c.titleEn) || c.titleEn;
            const activePoolsCount = c.pools?.filter((p) => p.status === 'FORMING').length || 0;

            return (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                      <TrendingDown className="w-3 h-3" />
                      ৳{savings.toLocaleString()} {isBn ? 'সাশ্রয়' : 'Off'} ({discountPct}%)
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <Clock className="w-3 h-3" />
                      {c.durationHours} {isBn ? 'ঘণ্টা উইন্ডো' : 'Hours'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                    {title}
                  </h3>

                  {/* Drop point & district */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">
                      {c.dropPointName} {c.targetDistrict ? `(${c.targetDistrict})` : ''}
                    </span>
                  </div>

                  {/* Price Comparison Block */}
                  <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-baseline justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400">
                        {isBn ? 'খুচরা মূল্য:' : 'Retail Price:'}{' '}
                        <span className="line-through">৳{Number(c.regularPrice).toLocaleString()}</span>
                      </div>
                      <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                        ৳{Number(c.groupPrice).toLocaleString()}
                        <span className="text-xs font-normal text-slate-500 ml-1">
                          {isBn ? '/ ইউনিট' : '/ unit'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-bold">
                        <Users className="w-3 h-3" />
                        {c.minParticipants} {isBn ? 'জন আবশ্যক' : 'Min Buyers'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Area */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    {activePoolsCount > 0 ? (
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {activePoolsCount} {isBn ? 'টি দল চলমান' : 'pools active'}
                      </span>
                    ) : (
                      <span>{isBn ? 'নতুন দল শুরু করুন' : 'Be first to start'}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedCampaignForPool(c)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>{isBn ? 'দল গঠন করুন' : 'Start a Pool'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Start Pool Modal */}
      {selectedCampaignForPool && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              {isBn ? 'নতুন দলীয় ক্রয় পুল শুরু করুন' : 'Start a Community Group Buy Pool'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isBn
                ? 'আপনি এই দলের দলনেতা (Pool Leader) হবেন। লিংকটি পাড়ার প্রতিবেশী ও কৃষকদের সাথে হোয়াটসঅ্যাপে শেয়ার করে দল সম্পূর্ণ করুন।'
                : 'You will be the Pool Leader. Share the link with neighbors on WhatsApp to unlock the wholesale price.'}
            </p>

            {errorMessage && (
              <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs rounded-lg">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleStartPoolSubmit} className="mt-4 space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 text-xs">
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {isBn ? selectedCampaignForPool.titleBn : selectedCampaignForPool.titleEn}
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>{isBn ? 'পাইকারি দর:' : 'Group Price:'}</span>
                  <span className="font-bold text-emerald-600">৳{selectedCampaignForPool.groupPrice}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>{isBn ? 'পিকআপ স্থান:' : 'Consolidated Drop:'}</span>
                  <span>{selectedCampaignForPool.dropPointName}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'আপনার চাহিদাকৃত পরিমাণ (ইউনিট) *' : 'Your Order Quantity (Units) *'}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-bold bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'আপনার নাম *' : 'Your Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={isBn ? 'যেমন: রহিম মিয়া' : 'e.g. Rahim Mia'}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'মোবাইল নম্বর *' : 'Phone Number *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'গ্রাম / ইউনিয়ন ঠিকানা' : 'Village / Union Address'}
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder={selectedCampaignForPool.dropPointName}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                />
              </div>

              {/* Total calculation */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  {isBn ? 'আপনার মোট প্রদেয় বিল:' : 'Total Amount Payable:'}
                </span>
                <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                  ৳{(quantity * Number(selectedCampaignForPool.groupPrice)).toLocaleString()}
                </span>
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCampaignForPool(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  {isSubmitting
                    ? (isBn ? 'দল তৈরি হচ্ছে...' : 'Creating Pool...')
                    : (isBn ? 'দল শুরু করুন ও ইনভাইট লিংক পান' : 'Start Pool & Get Invite Link')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
