'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Building2,
  TrendingUp,
  Coins,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  Scale,
  Calendar,
  Sparkles,
  ArrowRight,
  Truck,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import {
  useGetAllContractAgreementsQuery,
  useGetContractPlatformStatsQuery,
  useUpdateContractAgreementStatusMutation,
  ContractFarmingAgreement,
  AgreementStatus,
} from '../contractFarmingApi';

export function AdminContractArbitrationView({ lang = 'en' }: { lang?: string }) {
  const isBn = lang === 'bn';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AgreementStatus | 'ALL'>('ALL');

  const { data: stats } = useGetContractPlatformStatsQuery();
  const { data: agreements = [], isLoading, isFetching, refetch } = useGetAllContractAgreementsQuery();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateContractAgreementStatusMutation();

  const filtered = agreements.filter((agr) => {
    const matchesSearch =
      agr.agreementNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agr.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agr.campaign?.buyerCompanyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agr.plotDistrict.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || agr.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (agreementId: string, newStatus: AgreementStatus) => {
    try {
      await updateStatus({
        id: agreementId,
        body: { status: newStatus },
      }).unwrap();
      refetch();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to update agreement status');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 text-xs font-bold border border-indigo-300 dark:border-indigo-800">
                {isBn ? 'জাতীয় কন্ট্রাক্ট ফার্মিং মনিটরিং ও এসক্রো অডিট' : 'National Contract Farming & Escrow Oversight'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
              {isBn
                ? 'চুক্তিভিত্তিক চাষাবাদ ও সালিশি ব্যবস্থাপনা হাব'
                : 'Contract Farming Arbitration & Escrow Supervision Hub'}
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              {isBn
                ? 'সারা দেশের কর্পোরেট বায়ব্যাক চুক্তি, ইনপুট মূলধন বিতরণ ও ডিজিটাল ওয়েইব্রিজ নজরদারি।'
                : 'National overview of forward purchase agreements, escrow collateral flows, and dispute mitigation.'}
            </p>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{isBn ? 'তথ্য রিফ্রেশ' : 'Refresh Feed'}</span>
          </button>
        </div>

        {/* National Stats KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-500">{isBn ? 'সক্রিয় ক্যাম্পেইন' : 'Active Campaigns'}</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats?.totalCampaigns ?? 4}
            </p>
            <span className="text-[11px] text-slate-400">
              {stats?.totalAgreements ?? agreements.length} {isBn ? 'চুক্তি নিবন্ধিত' : 'agreements enrolled'}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-500">{isBn ? 'চুক্তিভুক্ত মোট জমি' : 'Total Farmland'}</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {(stats?.totalEnrolledAcres ?? 485.5).toLocaleString()} {isBn ? 'একর' : 'Acres'}
            </p>
            <span className="text-[11px] text-emerald-600/80">
              {isBn ? 'দেশব্যাপী কৃষকদের অন্তর্ভুক্ত' : 'Enrolled nationwide'}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-500">{isBn ? 'ছাড়কৃত ইনপুট নগদ অগ্রিম' : 'Advance Disbursed'}</span>
            <p className="text-2xl font-black text-amber-500 mt-1">
              ৳{(stats?.totalAdvanceDisbursed ?? 2450000).toLocaleString()}
            </p>
            <span className="text-[11px] text-slate-400">{isBn ? 'বীজ ও সার সহায়তা' : 'Seed & input capital'}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-500">{isBn ? 'নিট ফসল সংগ্রহ' : 'Net Crop Intake'}</span>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              {(stats?.totalDeliveredKg ?? 184500).toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-500">kg</span>
            </p>
            <span className="text-[11px] text-slate-400">{isBn ? 'ডিজিটাল ওয়েইব্রিজে অডিটকৃত' : 'Weighbridge audited'}</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isBn ? 'চুক্তি নং, বায়ার, কৃষক বা জেলা খুঁজুন...' : 'Search agreement, farmer, buyer...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AgreementStatus | 'ALL')}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="ALL">{isBn ? 'সকল অবস্থা (All Status)' : 'All Status'}</option>
              <option value="APPLIED">Applied</option>
              <option value="APPROVED">Approved</option>
              <option value="ACTIVE_PLANTED">Active / Planted</option>
              <option value="MILESTONES_VERIFIED">Milestones Verified</option>
              <option value="DELIVERING">Delivering</option>
              <option value="SETTLED">Settled</option>
              <option value="DISPUTED">Disputed</option>
            </select>
          </div>
        </div>

        {/* Master Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">{isBn ? 'চুক্তি দলিল নং' : 'Agreement #'}</th>
                  <th className="p-4">{isBn ? 'বায়ার প্রতিষ্ঠান' : 'Buyer Corp'}</th>
                  <th className="p-4">{isBn ? 'কৃষক ও ফোন' : 'Farmer & Phone'}</th>
                  <th className="p-4">{isBn ? 'জমি ও জেলা' : 'Land & District'}</th>
                  <th className="p-4">{isBn ? 'চুক্তি মূল্য' : 'Value (৳)'}</th>
                  <th className="p-4">{isBn ? 'অগ্রিম ইনপুট' : 'Advance'}</th>
                  <th className="p-4">{isBn ? 'সরবরাহকৃত' : 'Delivered'}</th>
                  <th className="p-4">{isBn ? 'অবস্থা' : 'Status'}</th>
                  <th className="p-4 text-right">{isBn ? 'সালিশি একশন' : 'Arbitration'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      Loading agreements...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      No agreements found matching your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((agr) => (
                    <tr key={agr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                      <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                        {agr.agreementNumber}
                      </td>
                      <td className="p-4 font-semibold text-emerald-700 dark:text-emerald-400">
                        {agr.campaign?.buyerCompanyName || 'Agro Corp'}
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-900 dark:text-white">{agr.farmerName}</p>
                        <p className="text-[11px] text-slate-500">{agr.farmerPhone}</p>
                      </td>
                      <td className="p-4">
                        <span className="font-bold">{agr.landAreaBighas} Bighas</span>
                        <p className="text-[11px] text-slate-500">{agr.plotDistrict}</p>
                      </td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        ৳{Number(agr.totalEstAgreementValue).toLocaleString()}
                      </td>
                      <td className="p-4 font-bold text-amber-500">
                        ৳{Number(agr.advanceWorkingCapitalDisbursed).toLocaleString()}
                      </td>
                      <td className="p-4 font-bold text-indigo-600">
                        {Number(agr.deliveredTotalKg).toLocaleString()} kg
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800">
                          {agr.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1">
                        <select
                          value={agr.status}
                          disabled={isUpdating}
                          onChange={(e) =>
                            handleStatusChange(agr.id, e.target.value as AgreementStatus)
                          }
                          className="px-2 py-1 text-[11px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                        >
                          <option value="APPLIED">APPLIED</option>
                          <option value="APPROVED">APPROVED</option>
                          <option value="ACTIVE_PLANTED">ACTIVE_PLANTED</option>
                          <option value="MILESTONES_VERIFIED">MILESTONES_VERIFIED</option>
                          <option value="DELIVERING">DELIVERING</option>
                          <option value="SETTLED">SETTLED</option>
                          <option value="DISPUTED">DISPUTED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
