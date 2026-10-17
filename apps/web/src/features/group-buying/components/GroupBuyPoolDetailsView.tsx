'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Share2,
  Copy,
  MessageCircle,
  Send,
  TrendingDown,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Flame,
  Check,
} from 'lucide-react';
import {
  useGetPoolByShareCodeQuery,
  useJoinPoolMutation,
  GroupBuyPoolStatus,
} from '../groupBuyingApi';

export function GroupBuyPoolDetailsView({
  shareCode,
  lang = 'en',
}: {
  shareCode: string;
  lang?: string;
}) {
  const isBn = lang === 'bn';

  const { data: poolData, isLoading, isError, refetch } = useGetPoolByShareCodeQuery(shareCode);
  const pool = poolData?.data;

  const [joinPool, { isLoading: isJoining }] = useJoinPoolMutation();

  // Form state
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Countdown timer calculation
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!pool?.expiresAt) return;

    const updateTimer = () => {
      const totalSec = Math.max(0, Math.floor((new Date(pool.expiresAt).getTime() - Date.now()) / 1000));
      const hours = Math.floor(totalSec / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;
      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [pool?.expiresAt]);

  const progressPct = useMemo(() => {
    if (!pool?.campaign) return 0;
    const target = pool.campaign.minParticipants || 5;
    return Math.min(100, Math.round((pool.currentParticipants / target) * 100));
  }, [pool]);

  const remainingParticipants = useMemo(() => {
    if (!pool?.campaign) return 0;
    return Math.max(0, pool.campaign.minParticipants - pool.currentParticipants);
  }, [pool]);

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    if (typeof window === 'undefined' || !pool) return;
    const productTitle = (isBn ? pool.campaign?.titleBn : pool.campaign?.titleEn) || 'পণ্য';
    const text = isBn
      ? `আসসালামু আলাইকুম! গ্রামের বাজার-এ আমাদের পাড়ার জন্য "${productTitle}" দলীয় ক্রয়ের অফার চালু হয়েছে। ৫ জন যোগ দিলেই পাইকারি দরে পাওয়া যাবে! একসাথে অর্ডার করতে এই লিঙ্কে ক্লিক করুন: ${window.location.href}`
      : `Gramer Bazar Community Group Buy: "${productTitle}". Join our pool to unlock bulk discount: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pool) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await joinPool({
        poolId: pool.id,
        body: {
          quantity,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          deliveryAddress: deliveryAddress.trim() || pool.campaign?.dropPointName || '',
        },
      }).unwrap();

      setCustomerName('');
      setCustomerPhone('');
      setDeliveryAddress('');
      setQuantity(1);
      refetch();

      if (res.data.status === 'SUCCESS') {
        setSuccessMessage(
          isBn
            ? 'অভিনন্দন! আপনার যোগদানে দলের লক্ষ্য পূরণ হয়েছে এবং পাইকারি মূল্যছাড় আনলক হয়েছে!'
            : 'Congratulations! Your order reached the participant threshold and unlocked the bulk discount!',
        );
      } else {
        setSuccessMessage(
          isBn
            ? 'আপনার অর্ডার সফলভাবে দলে যুক্ত হয়েছে! আরও প্রতিবেশীদের আমন্ত্রণ জানান।'
            : 'Your order has been committed to the pool! Share with neighbors to complete the target.',
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.data?.message || err.message || 'Failed to join group buy pool');
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <Users className="w-8 h-8 animate-pulse mx-auto mb-2 text-emerald-600" />
        {isBn ? 'দলীয় অফার লোড হচ্ছে...' : 'Loading group buy pool...'}
      </div>
    );
  }

  if (isError || !pool) {
    return (
      <div className="max-w-lg mx-auto py-20 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {isBn ? 'দলটি খুঁজে পাওয়া যায়নি' : 'Group Buy Pool Not Found'}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {isBn ? 'লিঙ্কটি মেয়াদোত্তীর্ণ বা ভুল হতে পারে।' : 'The share code may be invalid or expired.'}
        </p>
        <Link
          href={`/${lang}/group-buy`}
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
        >
          {isBn ? 'সকল সক্রিয় দলীয় অফার দেখুন' : 'Browse All Group Buys'}
        </Link>
      </div>
    );
  }

  const campaign = pool.campaign;
  const isForming = pool.status === 'FORMING';
  const isSuccess = pool.status === 'SUCCESS';
  const isExpired = pool.status === 'EXPIRED';

  const savings = campaign ? Number(campaign.regularPrice) - Number(campaign.groupPrice) : 0;
  const discountPct = campaign ? Math.round((savings / Number(campaign.regularPrice)) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Breadcrumb & Share Code Tag */}
      <div className="flex items-center justify-between text-xs">
        <Link
          href={`/${lang}/group-buy`}
          className="text-emerald-600 hover:underline flex items-center gap-1 font-semibold"
        >
          ← {isBn ? 'সকল দলীয় অফার' : 'All Group Buys'}
        </Link>
        <span className="font-mono px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
          #{pool.shareCode}
        </span>
      </div>

      {/* Main Campaign Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              {isBn ? 'পাড়ার সমবায় পাইকারি ডিল' : 'Community Wholesale Pool'}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {isBn ? campaign?.titleBn : campaign?.titleEn}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isBn ? 'একত্রে ডেলিভারি পয়েন্ট:' : 'Consolidated Drop Point:'}{' '}
                <strong className="text-slate-700 dark:text-slate-300">{campaign?.dropPointName}</strong>
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-right sm:min-w-[180px]">
            <div className="text-xs text-slate-400">
              <span className="line-through">৳{Number(campaign?.regularPrice).toLocaleString()}</span>
              <span className="ml-1 text-rose-600 font-bold">(-{discountPct}%)</span>
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              ৳{Number(campaign?.groupPrice).toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold mt-0.5">
              ৳{savings.toLocaleString()} {isBn ? 'সাশ্রয় প্রতি ইউনিটে' : 'Savings per unit'}
            </div>
          </div>
        </div>

        {/* Pool Progress & Status Block */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {pool.currentParticipants} {isBn ? 'জন যুক্ত হয়েছেন' : 'Buyers Committed'}
              </span>
              <span className="text-slate-400">
                / {campaign?.minParticipants} {isBn ? 'জন আবশ্যক' : 'Min Required'}
              </span>
            </div>

            {isForming && (
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>
                  {timeLeft.hours}h : {timeLeft.minutes}m : {timeLeft.seconds}s {isBn ? 'বাকি' : 'left'}
                </span>
              </div>
            )}

            {isSuccess && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {isBn ? 'লক্ষ্য পূরণ হয়েছে (আনলকড)' : 'Target Met & Discount Unlocked!'}
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isSuccess ? 'bg-emerald-500' : 'bg-emerald-600'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Alert state message */}
          {isForming && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs rounded-xl flex items-center justify-between">
              <span>
                {isBn
                  ? `আর মাত্র ${remainingParticipants} জন ক্রেতা যোগ দিলেই অফারটি নিশ্চিত হবে! লিংকটি প্রতিবেশীদের সাথে শেয়ার করুন।`
                  : `Need ${remainingParticipants} more buyer(s) to unlock the wholesale price! Invite neighbors now.`}
              </span>
            </div>
          )}
        </div>

        {/* 1-Click Viral Social Sharing Bar */}
        <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Share2 className="w-4 h-4 text-emerald-600" />
            <span>{isBn ? 'প্রতিবেশী ও বন্ধুদের আমন্ত্রণ জানান:' : 'Invite Neighbors & Unlock Faster:'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              {isBn ? 'হোয়াটসঅ্যাপে শেয়ার' : 'WhatsApp'}
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? (isBn ? 'কপি হয়েছে!' : 'Copied!') : (isBn ? 'লিঙ্ক কপি' : 'Copy Link')}
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Join Form (Active only when FORMING or SUCCESS) */}
      {!isExpired && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            {isBn ? 'এই দলে যুক্ত হতে অর্ডার নিশ্চিত করুন' : 'Join This Pool & Lock Your Order'}
          </h2>

          <form onSubmit={handleJoinSubmit} className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'আপনার চাহিদাকৃত পরিমাণ (ইউনিট) *' : 'Quantity (Units) *'}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'আপনার নাম *' : 'Your Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={isBn ? 'যেমন: কাশেম মিয়া' : 'e.g. Kashem Mia'}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'মোবাইল নম্বর *' : 'Mobile Number *'}
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
                placeholder={campaign?.dropPointName}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">
                  {isBn ? 'পাইকারি দরে মোট প্রদেয় বিল:' : 'Total Payable (Wholesale Rate):'}
                </div>
                <div className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                  ৳{(quantity * Number(campaign?.groupPrice || 0)).toLocaleString()}
                </div>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {isBn ? 'ক্যাশ অন ডেলিভারি / ওয়ালেট' : 'COD / Wallet Escrow'}
              </span>
            </div>

            <button
              type="submit"
              disabled={isJoining}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              {isJoining
                ? (isBn ? 'অর্ডার নথিভুক্ত হচ্ছে...' : 'Joining...')
                : (isBn ? 'অর্ডার নিশ্চিত করুন ও দলে যোগ দিন' : 'Confirm Order & Join Community Pool')}
            </button>
          </form>
        </div>
      )}

      {/* Committed Members List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-600" />
          {isBn ? 'দলে ইতিমধ্যে যুক্ত প্রতিবেশীবৃন্দ' : 'Committed Pool Members'}
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {pool.members?.length || 0} {isBn ? 'জন' : 'members'}
          </span>
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {!pool.members || pool.members.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              {isBn ? 'এখনও কেউ যুক্ত হননি।' : 'No members yet.'}
            </div>
          ) : (
            pool.members.map((m, idx) => (
              <div key={m.id || idx} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold flex items-center justify-center text-xs">
                    {m.customerName ? m.customerName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span>{m.customerName}</span>
                      {m.isLeader && (
                        <span className="px-1.5 py-0.2 rounded-sm text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          {isBn ? 'দলনেতা' : 'Leader'}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {m.deliveryAddress || 'Village Hub'}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">
                    {m.quantity} {isBn ? 'ইউনিট' : 'unit(s)'} (৳{Number(m.totalAmount).toLocaleString()})
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(m.joinedAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
