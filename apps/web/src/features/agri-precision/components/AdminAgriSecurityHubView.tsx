'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  Building2,
  CheckCircle2,
  Plane,
  FlaskConical,
  Gavel,
} from 'lucide-react';
import {
  useGetCounterfeitReportsQuery,
  useEscalateCounterfeitReportMutation,
  useGetPrecisionStatsQuery,
  AgriInputCounterfeitReport,
} from '../agriPrecisionApi';

export function AdminAgriSecurityHubView({ lang = 'en' }: { lang?: string }) {
  const isBn = lang === 'bn';

  const [searchQuery, setSearchQuery] = useState('');

  const { data: stats } = useGetPrecisionStatsQuery();
  const { data: reports = [], isLoading, isFetching, refetch } = useGetCounterfeitReportsQuery();
  const [escalateReport, { isLoading: isEscalating }] = useEscalateCounterfeitReportMutation();

  const filtered = reports.filter((r) => {
    return (
      r.reportTicketNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.retailShopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.retailShopDistrict.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleEscalate = async (id: string) => {
    try {
      await escalateReport(id).unwrap();
      refetch();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to escalate report');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 text-xs font-bold border border-red-300 dark:border-red-800">
                {isBn ? 'ডিএই ও ভোক্তা অধিকার আইন প্রয়োগ সেল' : 'DAE & Consumer Rights Enforcement'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
              {isBn
                ? 'ভেজাল সার ও কীটনাশক আইন প্রয়োগ ও সালিশি হাব'
                : 'Anti-Counterfeit Agri-Inputs & Precision Security Hub'}
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              {isBn
                ? 'সারাদেশের কৃষকদের প্রেরিত নকল রাসায়নিকের অভিযোগ পর্যালোচনা করুন ও ভ্রাম্যমাণ আদালতের ম্যাজিস্ট্রেটের নিকট প্রেরণ করুন।'
                : 'Investigate citizen counterfeit reports, track illegal pesticide distribution, and deploy DAE mobile court raids.'}
            </p>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-red-600' : ''}`} />
            <span>{isBn ? 'রিফ্রেশ' : 'Refresh Feed'}</span>
          </button>
        </div>

        {/* National Security Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-500">{isBn ? 'ডিএই অনুমোদিত পণ্য' : 'DAE Verified Inputs'}</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {stats?.totalVerifiedInputs ?? 4}
            </p>
            <span className="text-[11px] text-emerald-600">Active Registry</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-500">{isBn ? 'ভেজাল অভিযোগ টিকিট' : 'Counterfeit Alerts'}</span>
            <p className="text-2xl font-black text-red-600 mt-1">
              {stats?.totalCounterfeitReports ?? reports.length}
            </p>
            <span className="text-[11px] text-red-500 font-medium">Pending Enforcement</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-500">{isBn ? 'ড্রোন স্প্রে করা একর' : 'Drone Covered'}</span>
            <p className="text-2xl font-black text-teal-600 mt-1">
              {(stats?.totalAcresDroneSprayed ?? 535.5).toLocaleString()} Acres
            </p>
            <span className="text-[11px] text-slate-400">Zero drift certified</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-500">{isBn ? 'ইস্যুকৃত মৃত্তিকা কার্ড' : 'Soil Cards Issued'}</span>
            <p className="text-2xl font-black text-indigo-600 mt-1">
              {stats?.totalSoilCardsIssued ?? 15}
            </p>
            <span className="text-[11px] text-slate-400">SRDI scientific formula</span>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isBn ? 'টিকিট নং, পণ্য, দোকান বা জেলা দিয়ে খুঁজুন...' : 'Search ticket, shop, brand, district...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Counterfeit Reports Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Ticket #</th>
                  <th className="p-4">Suspected Brand & Barcode</th>
                  <th className="p-4">Retailer Name & Address</th>
                  <th className="p-4">Symptoms / Defect Reported</th>
                  <th className="p-4">Reporter</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Enforcement Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      Loading complaints...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No citizen counterfeit complaints found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                        {r.reportTicketNo}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-red-600">{r.brandName}</p>
                        <p className="font-mono text-[10px] text-slate-400">{r.suspectedItemBarcode}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-900 dark:text-white">{r.retailShopName}</p>
                        <p className="text-[11px] text-slate-500">
                          {r.retailShopAddress}, {r.retailShopUpazila}, {r.retailShopDistrict}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-slate-600 dark:text-slate-300 max-w-xs line-clamp-2">
                          {r.suspectedDefectDescription}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-slate-900 dark:text-white">{r.reporterName}</p>
                        <p className="text-[10px] text-slate-400">{r.reporterPhone}</p>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.isEscalatedToDae
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {r.daeInvestigationStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {!r.isEscalatedToDae ? (
                          <button
                            onClick={() => handleEscalate(r.id)}
                            disabled={isEscalating}
                            className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold flex items-center gap-1 ml-auto"
                          >
                            <Gavel className="w-3.5 h-3.5" />
                            <span>Escalate to Mobile Court</span>
                          </button>
                        ) : (
                          <span className="text-amber-600 font-bold text-[11px]">
                            ⚖️ Under DAE Raid
                          </span>
                        )}
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
