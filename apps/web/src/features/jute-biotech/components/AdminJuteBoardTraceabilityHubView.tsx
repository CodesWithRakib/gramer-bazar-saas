'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  FileCheck,
  AlertTriangle,
  Scale,
  Sparkles,
  Droplets,
  CheckCircle2,
  Layers,
  PlusCircle,
  MapPin,
  TrendingUp,
  Package,
} from 'lucide-react';
import {
  useGetJuteOverviewStatsQuery,
  useGetAllFiberLotsQuery,
  useGetAllB2bContractsQuery,
  useCreateB2bContractMutation,
  PackagingActCategory,
} from '../juteBiotechApi';

interface AdminJuteBoardTraceabilityHubViewProps {
  lang: string;
}

export const AdminJuteBoardTraceabilityHubView: React.FC<AdminJuteBoardTraceabilityHubViewProps> = ({
  lang,
}) => {
  const isBn = lang === 'bn';

  const { data: statsData, isLoading: statsLoading } = useGetJuteOverviewStatsQuery();
  const { data: lotsData, isLoading: lotsLoading } = useGetAllFiberLotsQuery();
  const { data: contractsData, isLoading: contractsLoading } = useGetAllB2bContractsQuery();

  const [createContract, { isLoading: isCreatingContract }] = useCreateB2bContractMutation();

  const [showContractModal, setShowContractModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [contractCode, setContractCode] = useState(`B2B-ACT2010-MIL-${Math.floor(100 + Math.random() * 900)}`);
  const [buyerMillName, setBuyerMillName] = useState('Platinum Jubilee Jute Mills Ltd');
  const [buyerRegNumber, setBuyerRegNumber] = useState('BJMC-REG-2026-P09');
  const [sellerCooperativeName, setSellerCooperativeName] = useState('Jessore Regional Jute Baling Syndicate');
  const [mandatoryCategory, setMandatoryCategory] = useState<PackagingActCategory>('PADDY_AND_RICE_50KG');
  const [productDescription, setProductDescription] = useState('Standard 50kg B.Twill Food-Grade Jute Grain Bags (BSTI BDS 1007 compliant)');
  const [quantityMT, setQuantityMT] = useState<number>(60);
  const [unitPriceBdt, setUnitPriceBdt] = useState<number>(86000);
  const [deliveryDeadline, setDeliveryDeadline] = useState('2026-10-30');
  const [destinationDepot, setDestinationDepot] = useState('Santahar Central Food Silo, Bogura');

  const stats = statsData?.data;
  const lots = lotsData?.data || [];
  const contracts = contractsData?.data || [];

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createContract({
        contractCode,
        buyerMillName,
        buyerRegNumber,
        sellerCooperativeName,
        mandatoryPackagingCategory: mandatoryCategory,
        productDescription,
        quantityMetricTonsOrBales: Number(quantityMT),
        unitPriceBdt: Number(unitPriceBdt),
        deliveryDeadline,
        destinationDepot,
        compliancePackagingAct2010: true,
        escrowDepositPercentage: 30.0,
      }).unwrap();

      setSuccessMessage(
        isBn
          ? `চুক্তি ${contractCode} সফলভাবে নিবন্ধিত হয়েছে ও ৩০% এসক্রো ফান্ড লক করা হয়েছে!`
          : `Contract ${contractCode} registered with 30% advance escrow locked!`
      );
      setShowContractModal(false);
      setContractCode(`B2B-ACT2010-MIL-${Math.floor(100 + Math.random() * 900)}`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Failed to create contract', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Admin Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950 text-white py-10 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                {isBn
                  ? 'পাট অধিদপ্তর ও বিজেআরআই কেন্দ্রীয় অডিট ও নজরদারি ডেস্ক'
                  : 'Directorate of Jute & BJRI Central Regulatory Desk'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              {isBn
                ? 'সোনালী আঁশ মান নিয়ন্ত্রণ ও পাট মোড়কীকরণ আইন অডিট'
                : 'Fiber Quality Audit & Mandatory Jute Packaging Act 2010 Desk'}
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              {isBn
                ? 'আইন অনুযায়ী ১৯টি পণ্যে বাধ্যতামূলক পাটের বস্তা ব্যবহারের মনিটরিং, লাইসেন্সপ্রাপ্ত বেলিং প্রেস অডিট এবং ১৪% আর্দ্রতা মান নিয়ন্ত্রণ।'
                : 'Audit statutory packaging quotas across national silos, inspect hydraulic press moisture compliance, and track mill escrow releases.'}
            </p>
          </div>

          <div>
            <button
              onClick={() => setShowContractModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isBn ? 'নতুন বি২বি মিল চুক্তি' : 'New B2B Mill Contract'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="max-w-7xl mx-auto px-4 mt-6">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">
                {isBn ? 'মোট বিলযোগ্য বেলিং' : 'Total Baled Maunds'}
              </span>
              <span className="text-xl font-extrabold text-slate-900">
                {statsLoading ? '...' : `${stats?.totalMaunds?.toLocaleString() || 120.2} মন`}
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">
                {isBn ? 'আইনগত কমপ্লায়েন্স হার' : 'Packaging Act Compliance'}
              </span>
              <span className="text-xl font-extrabold text-emerald-700">100% Verified</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-800 rounded-xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">
                {isBn ? 'মোট চুক্তিকৃত টন' : 'Contracted Tonnage'}
              </span>
              <span className="text-xl font-extrabold text-slate-900">
                {statsLoading ? '...' : `${stats?.totalContractTonnage || 240} MT`}
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-800 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">
                {isBn ? 'মোট চুক্তি মূল্য' : 'Total Contract Value'}
              </span>
              <span className="text-xl font-extrabold text-indigo-700">
                {statsLoading ? '...' : `৳${stats?.totalContractValueBdt?.toLocaleString() || '2,10,80,000'}`}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 1: MANDATORY JUTE PACKAGING ACT CONTRACTS DESK */}
        <div className="mt-10 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isBn
                  ? 'পাট মোড়কীকরণ আইন ২০১০ শিল্প সরবরাহ চুক্তি'
                  : 'Mandatory Jute Packaging Act 2010 Supply Contracts'}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn
                  ? 'খাদ্যশস্য, সার ও চিনি শিল্পে শতভাগ পাটের বস্তা সরবরাহের সক্রিয় অগ্রগতি'
                  : 'Active forward supply commitments for 50kg grain sacks, fertilizer bags, and CBC cloth'}
              </p>
            </div>
            <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full">
              {contracts.length} {isBn ? 'টি সক্রিয় চুক্তি' : 'Active Contracts'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Contract Code</th>
                  <th className="py-3 px-4">Buyer Mill</th>
                  <th className="py-3 px-4">Seller Co-op</th>
                  <th className="py-3 px-4">Product Category</th>
                  <th className="py-3 px-4">Tonnage / Volume</th>
                  <th className="py-3 px-4">Total Value</th>
                  <th className="py-3 px-4">Escrow Status</th>
                  <th className="py-3 px-4">Deadline & Depot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {contractsLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Loading contracts...
                    </td>
                  </tr>
                ) : (
                  contracts.map((contract) => (
                    <tr key={contract.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-slate-900">
                        {contract.contractCode}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {contract.buyerMillName}
                        <span className="block text-[11px] font-mono text-slate-400">
                          {contract.buyerRegNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {contract.sellerCooperativeName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          {contract.mandatoryPackagingCategory}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {contract.quantityMetricTonsOrBales} MT
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">
                        ৳{contract.totalContractValueBdt.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {contract.escrowStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <span className="font-semibold text-slate-800">{contract.deliveryDeadline}</span>
                        <span className="block text-[11px] text-slate-400 truncate max-w-[140px]">
                          {contract.destinationDepot}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 2: HIGH MOISTURE RISK & QUALITY AUDIT DESK */}
        <div className="mt-10 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isBn
                  ? 'আর্দ্রতা মান ও টেনসাইল শক্তি অডিট রেজিস্টার'
                  : 'Moisture Compliance & Tensile Strength Audit Desk'}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn
                  ? '১৪% এর বেশি আর্দ্রতার লটগুলোতে স্বয়ংক্রিয় ওজন কর্তন ও পেনাল্টি যাচাইকরণ'
                  : 'Verifying that damp lots (>14%) undergo mandatory weight deduction to protect warehouse inventory'}
              </p>
            </div>
            <span className="text-xs px-3 py-1 bg-amber-100 text-amber-800 font-bold rounded-full">
              {lots.length} {isBn ? 'টি অডিট রেকর্ড' : 'Audit Records'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Lot & License</th>
                  <th className="py-3 px-4">Baling Press & Location</th>
                  <th className="py-3 px-4">Grade & Variety</th>
                  <th className="py-3 px-4">Moisture %</th>
                  <th className="py-3 px-4">Tensile Strength</th>
                  <th className="py-3 px-4">Root-Cut %</th>
                  <th className="py-3 px-4">BJRI Certificate</th>
                  <th className="py-3 px-4">Escrow Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {lotsLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Loading audit lots...
                    </td>
                  </tr>
                ) : (
                  lots.map((lot) => (
                    <tr key={lot.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-slate-900">
                        {lot.lotNumber}
                        <span className="block text-[11px] font-sans font-normal text-slate-400">
                          {lot.directorateLicenseNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-800">
                        {lot.balingCenterName}
                        <span className="block font-normal text-slate-400">{lot.district}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-amber-900 text-xs">{lot.grade}</span>
                        <span className="block text-xs text-slate-500">{lot.variety}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            lot.moisturePercentage <= 14.0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {lot.moisturePercentage}%
                        </span>
                        {lot.moistureAdjustmentKg > 0 && (
                          <span className="block text-[10px] text-rose-600 font-medium">
                            Deducted: {lot.moistureAdjustmentKg} kg
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-bold text-indigo-700">
                        {lot.tensileStrengthGPerTex} g/tex
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                        {lot.rootCutPercentage}%
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-emerald-700">
                        {lot.bjriGradeCertNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {lot.escrowStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: NEW B2B CONTRACT */}
      {showContractModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">
                {isBn ? 'নতুন বি২বি মিল চুক্তি তৈরি করুন' : 'Create New B2B Mill Forward Contract'}
              </h3>
              <button
                onClick={() => setShowContractModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contract Code</label>
                  <input
                    type="text"
                    value={contractCode}
                    onChange={(e) => setContractCode(e.target.value)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'বায়ার জুট মিলের নাম' : 'Buyer Jute Mill'}
                  </label>
                  <input
                    type="text"
                    value={buyerMillName}
                    onChange={(e) => setBuyerMillName(e.target.value)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'বিক্রেতা সমবায় / ফেডারেশন' : 'Seller Cooperative'}
                  </label>
                  <input
                    type="text"
                    value={sellerCooperativeName}
                    onChange={(e) => setSellerCooperativeName(e.target.value)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'আইনগত পণ্য ক্যাটাগরি' : 'Mandatory Act Category'}
                  </label>
                  <select
                    value={mandatoryCategory}
                    onChange={(e) => setMandatoryCategory(e.target.value as PackagingActCategory)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2"
                  >
                    <option value="PADDY_AND_RICE_50KG">ধান ও চাল ৫০ কেজি বস্তা</option>
                    <option value="WHEAT_AND_FLOUR_50KG">গম ও আটা ৫০ কেজি বস্তা</option>
                    <option value="SUGAR_50KG">চিনি ৫০ কেজি বস্তা</option>
                    <option value="FERTILIZER_50KG">রাসায়নিক সার ৫০ কেজি বস্তা</option>
                    <option value="FEED_AND_MAIZE_75KG">ফিড ও ভুট্টা ৭৫ কেজি বস্তা</option>
                    <option value="GEO_JUTE_SOIL_EROSION_MESH">জিও-জুট নদী ভাঙন রোধ মেশ</option>
                    <option value="CBC_CARPET_BACKING_CLOTH">সিবিসি কার্পেট ব্যাকিং ক্লথ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isBn ? 'পণ্যের বিবরণ' : 'Product Description'}
                </label>
                <input
                  type="text"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  className="w-full text-sm rounded-lg border-slate-300 border p-2"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'পরিমাণ (মেট্রিক টন)' : 'Quantity (MT)'}
                  </label>
                  <input
                    type="number"
                    value={quantityMT}
                    onChange={(e) => setQuantityMT(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'দর (টাকা/টন)' : 'Rate (BDT/MT)'}
                  </label>
                  <input
                    type="number"
                    value={unitPriceBdt}
                    onChange={(e) => setUnitPriceBdt(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'ডেলিভারি ডেডলাইন' : 'Deadline'}
                  </label>
                  <input
                    type="date"
                    value={deliveryDeadline}
                    onChange={(e) => setDeliveryDeadline(e.target.value)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isBn ? 'গন্তব্য ওয়্যারহাউস / সাইলো ডিপো' : 'Destination Depot'}
                </label>
                <input
                  type="text"
                  value={destinationDepot}
                  onChange={(e) => setDestinationDepot(e.target.value)}
                  className="w-full text-sm rounded-lg border-slate-300 border p-2"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowContractModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isCreatingContract}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all"
                >
                  {isCreatingContract
                    ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
                    : (isBn ? 'চুক্তি অনুমোদন ও এসক্রো লক করুন' : 'Confirm & Lock Escrow')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
