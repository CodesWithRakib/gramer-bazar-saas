'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Sparkles,
  Plus,
  Clock,
  MapPin,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Flame,
  Layers,
  RefreshCw,
} from 'lucide-react';
import {
  useGetSellerCampaignsQuery,
  useGetAdminPoolsQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  GroupBuyCampaign,
} from '../groupBuyingApi';
import { useGetSellerProductsQuery } from '@/features/seller';

export function SellerGroupBuyView({ lang = 'en' }: { lang?: string }) {
  const isBn = lang === 'bn';

  const [activeTab, setActiveTab] = useState<'campaigns' | 'pools'>('campaigns');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Queries
  const { data: campaignsData, isLoading: isCampaignsLoading, refetch: refetchCampaigns } = useGetSellerCampaignsQuery();
  const campaigns = campaignsData?.data || [];

  const { data: poolsData, isLoading: isPoolsLoading, refetch: refetchPools } = useGetAdminPoolsQuery();
  const pools = poolsData?.data || [];

  const { data: productsData } = useGetSellerProductsQuery({ page: 1, limit: 100 });
  const products = productsData?.data || [];

  const [createCampaign, { isLoading: isCreating }] = useCreateCampaignMutation();
  const [updateCampaign] = useUpdateCampaignMutation();

  // Create Campaign Form State
  const [titleEn, setTitleEn] = useState('');
  const [titleBn, setTitleBn] = useState('');
  const [sellerProductId, setSellerProductId] = useState('');
  const [regularPrice, setRegularPrice] = useState<number | ''>('');
  const [groupPrice, setGroupPrice] = useState<number | ''>('');
  const [minParticipants, setMinParticipants] = useState(5);
  const [durationHours, setDurationHours] = useState(48);
  const [targetDistrict, setTargetDistrict] = useState('Bogra');
  const [targetUpazila, setTargetUpazila] = useState('Sariakandi');
  const [dropPointName, setDropPointName] = useState('Sariakandi Union Parishad Chattar');
  const [formError, setFormError] = useState<string | null>(null);

  // Auto-fill prices when product selected
  const handleProductSelect = (prodId: string) => {
    setSellerProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      const basePrice = Number(prod.price);
      setRegularPrice(basePrice);
      setGroupPrice(Math.round(basePrice * 0.8)); // Default 20% discount
      setTitleEn(`Bulk ${prod.nameEn || 'Product'} Community Pool`);
      setTitleBn(`পাইকারি ${prod.nameBn || prod.nameEn || 'পণ্য'} সমবায় ক্রয়`);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const reg = typeof regularPrice === 'number' ? regularPrice : 0;
    const grp = typeof groupPrice === 'number' ? groupPrice : 0;

    if (!sellerProductId || reg <= 0 || grp <= 0 || grp >= reg) {
      setFormError(
        isBn
          ? 'অনুগ্রহ করে সঠিক পণ্য নির্বাচন করুন এবং পাইকারি দর খুচরা মূল্যের চেয়ে কম নির্ধারণ করুন।'
          : 'Please select a product and ensure group price is lower than regular price.',
      );
      return;
    }

    try {
      await createCampaign({
        titleEn: titleEn.trim(),
        titleBn: titleBn.trim(),
        sellerProductId,
        regularPrice: reg,
        groupPrice: grp,
        minParticipants,
        durationHours,
        targetDistrict: targetDistrict.trim() || undefined,
        targetUpazila: targetUpazila.trim() || undefined,
        dropPointName: dropPointName.trim(),
      }).unwrap();

      setShowCreateModal(false);
      refetchCampaigns();
    } catch (err: any) {
      setFormError(err?.data?.message || err.message || 'Failed to create campaign');
    }
  };

  const handleToggleStatus = async (c: GroupBuyCampaign) => {
    const newStatus = c.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await updateCampaign({
        id: c.id,
        body: { status: newStatus },
      }).unwrap();
      refetchCampaigns();
    } catch (err: any) {
      alert(err?.data?.message || err.message || 'Failed to update campaign status');
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const totalCampaigns = campaigns.length;
    const activePools = pools.filter((p) => p.status === 'FORMING').length;
    const successPools = pools.filter((p) => p.status === 'SUCCESS').length;
    const totalCommittedUnits = pools.reduce((sum, p) => sum + Number(p.currentCommittedQty || 0), 0);

    return {
      totalCampaigns,
      activePools,
      successPools,
      totalCommittedUnits,
    };
  }, [campaigns, pools]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {isBn ? 'দলীয় সমবায় পাইকারি বিক্রয় হাব' : 'Community Group Buy Campaigns'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isBn
                  ? 'কৃষক ও গ্রামীণ ক্রেতাদের জন্য বাল্ক ডিসকাউন্ট ক্যাম্পেইন চালু করুন এবং কনসোলিডেটেড অর্ডার ডেলিভারি দিন'
                  : 'Launch bulk volume tier campaigns for rural communities with consolidated single-drop delivery'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              {isBn ? 'নতুন ক্যাম্পেইন চালু করুন' : 'Launch New Campaign'}
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('campaigns')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'campaigns'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Flame className="w-4 h-4" />
            {isBn ? 'ক্যাম্পেইন তালিকা' : 'Active Campaigns'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pools')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'pools'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            {isBn ? 'চলমান ক্রেতা পুল ও অগ্রগতি' : 'Live Buyer Pools'}{' '}
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
              {metrics.activePools}
            </span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500">{isBn ? 'মোট ক্যাম্পেইন' : 'Total Campaigns'}</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {metrics.totalCampaigns}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-950/20 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-amber-800 dark:text-amber-300 font-bold">
            {isBn ? 'গঠনরত ক্রেতা পুল' : 'Forming Pools'}
          </div>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">
            {metrics.activePools}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
            {isBn ? 'লক্ষ্য পূরণের অপেক্ষায়' : 'Awaiting min buyers'}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-emerald-800 dark:text-emerald-300 font-bold">
            {isBn ? 'সফল আনলকড পুল' : 'Unlocked (Success) Pools'}
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {metrics.successPools}
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1">
            {isBn ? 'ডেলিভারির জন্য প্রস্তুত' : 'Ready for single-drop dispatch'}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500">{isBn ? 'মোট প্রতিশ্রুতিবদ্ধ ইউনিট' : 'Total Units Committed'}</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {metrics.totalCommittedUnits.toLocaleString()}
          </div>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: CAMPAIGNS TABLE
          ========================================================================= */}
      {activeTab === 'campaigns' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">{isBn ? 'ক্যাম্পেইন' : 'Campaign'}</th>
                  <th className="p-3">{isBn ? 'খুচরা দর' : 'Retail'}</th>
                  <th className="p-3">{isBn ? 'পাইকারি দলীয় দর' : 'Group Price'}</th>
                  <th className="p-3">{isBn ? 'ন্যূনতম ক্রেতা' : 'Min Buyers'}</th>
                  <th className="p-3">{isBn ? 'ডেলিভারি ড্রপ পয়েন্ট' : 'Drop Point'}</th>
                  <th className="p-3">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="p-3 text-right">{isBn ? 'পদক্ষেপ' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isCampaignsLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-500" />
                      {isBn ? 'লোড হচ্ছে...' : 'Loading campaigns...'}
                    </td>
                  </tr>
                ) : campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      {isBn ? 'কোনো দলীয় ক্যাম্পেইন তৈরি করা হয়নি।' : 'No group buy campaigns created yet.'}
                    </td>
                  </tr>
                ) : (
                  campaigns.map((c) => {
                    const savings = Number(c.regularPrice) - Number(c.groupPrice);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3">
                          <div className="font-bold text-slate-900 dark:text-slate-100">
                            {isBn ? c.titleBn : c.titleEn}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {c.durationHours}h {isBn ? 'কাউন্টডাউন' : 'duration'}
                          </div>
                        </td>
                        <td className="p-3 text-slate-400 line-through">
                          ৳{Number(c.regularPrice).toLocaleString()}
                        </td>
                        <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          ৳{Number(c.groupPrice).toLocaleString()}
                          <span className="block text-[10px] text-emerald-700 dark:text-emerald-300 font-normal">
                            -৳{savings}
                          </span>
                        </td>
                        <td className="p-3 font-bold">{c.minParticipants} {isBn ? 'জন' : 'buyers'}</td>
                        <td className="p-3 max-w-[200px] truncate text-slate-600 dark:text-slate-400">
                          {c.dropPointName}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            c.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(c)}
                            className="px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 text-[11px] font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            {c.status === 'ACTIVE'
                              ? (isBn ? 'সাময়িক বন্ধ' : 'Pause')
                              : (isBn ? 'চালু করুন' : 'Activate')}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: BUYER POOLS TABLE
          ========================================================================= */}
      {activeTab === 'pools' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">{isBn ? 'কোড' : 'Share Code'}</th>
                  <th className="p-3">{isBn ? 'ক্যাম্পেইন' : 'Campaign'}</th>
                  <th className="p-3">{isBn ? 'দলনেতা' : 'Pool Leader'}</th>
                  <th className="p-3">{isBn ? 'ক্রেতা অগ্রগতি' : 'Buyers Progress'}</th>
                  <th className="p-3">{isBn ? 'প্রতিশ্রুতিবদ্ধ ইউনিট' : 'Committed Qty'}</th>
                  <th className="p-3">{isBn ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="p-3 text-right">{isBn ? 'লিঙ্ক' : 'Link'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isPoolsLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-500" />
                      {isBn ? 'লোড হচ্ছে...' : 'Loading pools...'}
                    </td>
                  </tr>
                ) : pools.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      {isBn ? 'কোনো চলমান ক্রেতা পুল নেই।' : 'No buyer pools currently.'}
                    </td>
                  </tr>
                ) : (
                  pools.map((p) => {
                    const target = p.campaign?.minParticipants || 5;
                    const pct = Math.min(100, Math.round((p.currentParticipants / target) * 100));
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-emerald-600">
                          #{p.shareCode}
                        </td>
                        <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 max-w-[200px] truncate">
                          {isBn ? p.campaign?.titleBn : p.campaign?.titleEn}
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {p.leader?.firstName} {p.leader?.lastName}
                          </div>
                          <div className="text-[10px] text-slate-400">{p.leader?.phone}</div>
                        </td>
                        <td className="p-3 min-w-[140px]">
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="font-bold">{p.currentParticipants}/{target}</span>
                            <span className="text-slate-400">{pct}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-600 h-full rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </td>
                        <td className="p-3 font-bold">{p.currentCommittedQty} {isBn ? 'ইউনিট' : 'units'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            p.status === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : p.status === 'FORMING'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <Link
                            href={`/${lang}/group-buy/${p.shareCode}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline font-semibold"
                          >
                            <span>{isBn ? 'দেখুন' : 'View'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          CREATE CAMPAIGN MODAL
          ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Flame className="w-5 h-5 text-emerald-600" />
              {isBn ? 'নতুন দলীয় পাইকারি ক্যাম্পেইন তৈরি করুন' : 'Launch New Group Buy Campaign'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isBn
                ? 'পাড়ার কৃষকদের সমবায় ক্রয়ের জন্য পাইকারি ডিসকাউন্ট মূল্য এবং নির্দিষ্ট ডেলিভারি পয়েন্ট নির্ধারণ করুন।'
                : 'Configure bulk volume pricing and community drop points for farmer pooling.'}
            </p>

            {formError && (
              <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'পণ্য নির্বাচন করুন *' : 'Select Product *'}
                </label>
                <select
                  required
                  value={sellerProductId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 font-medium"
                >
                  <option value="">{isBn ? '-- পণ্য নির্বাচন করুন --' : '-- Select Product --'}</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {(isBn ? p.nameBn : p.nameEn) || p.nameEn || 'Product'} (৳{p.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'ক্যাম্পেইন নাম (বাংলা) *' : 'Title (Bangla) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={titleBn}
                    onChange={(e) => setTitleBn(e.target.value)}
                    placeholder="পাইকারি ইউরিয়া সার"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'ক্যাম্পেইন নাম (ইংরেজি) *' : 'Title (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="Bulk Urea Fertilizer Pool"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'খুচরা স্ট্যান্ডার্ড মূল্য (৳) *' : 'Regular Price (৳) *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={regularPrice}
                    onChange={(e) => setRegularPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'পাইকারি দলীয় মূল্য (৳) *' : 'Group Price (৳) *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={groupPrice}
                    onChange={(e) => setGroupPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 rounded-lg border border-emerald-400 dark:border-emerald-600 text-xs bg-slate-50 dark:bg-slate-800 font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'ন্যূনতম ক্রেতা সংখ্যা *' : 'Min Buyers Target *'}
                  </label>
                  <input
                    type="number"
                    min="2"
                    required
                    value={minParticipants}
                    onChange={(e) => setMinParticipants(Math.max(2, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'মেয়াদ (ঘণ্টা) *' : 'Duration (Hours) *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={durationHours}
                    onChange={(e) => setDurationHours(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'টার্গেট জেলা' : 'Target District'}
                  </label>
                  <input
                    type="text"
                    value={targetDistrict}
                    onChange={(e) => setTargetDistrict(e.target.value)}
                    placeholder="Bogra"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'টার্গেট উপজেলা' : 'Target Upazila'}
                  </label>
                  <input
                    type="text"
                    value={targetUpazila}
                    onChange={(e) => setTargetUpazila(e.target.value)}
                    placeholder="Sariakandi"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'একত্রে ডেলিভারি পয়েন্টের নাম *' : 'Consolidated Drop Point *'}
                </label>
                <input
                  type="text"
                  required
                  value={dropPointName}
                  onChange={(e) => setDropPointName(e.target.value)}
                  placeholder={isBn ? 'সারিয়াকান্দি ইউনিয়ন পরিষদ চত্বর' : 'Sariakandi Union Parishad Chattar'}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  {isCreating
                    ? (isBn ? 'চালু হচ্ছে...' : 'Launching...')
                    : (isBn ? 'ক্যাম্পেইন চালু করুন' : 'Launch Campaign')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
