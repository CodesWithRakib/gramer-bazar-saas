'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  Layers,
  Scissors,
  CheckCircle2,
  Clock,
  Building2,
  FileText,
  Loader2,
  Sparkles,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import {
  useGetAllAdminOrdersQuery,
  useGetCocoonBatchesQuery,
  useSettleCustomOrderMutation,
  ArtisanCustomOrder,
  ArtisanOrderEscrowStatus,
} from '../sericultureHandloomApi';

export function AdminHeritageCraftHubView() {
  const [activeTab, setActiveTab] = useState<'orders' | 'cocoons' | 'gi'>('orders');

  const { data: ordersData, isLoading: isOrdersLoading } = useGetAllAdminOrdersQuery();
  const { data: cocoonsData, isLoading: isCocoonsLoading } = useGetCocoonBatchesQuery();
  const [settleOrder, { isLoading: isSettling }] = useSettleCustomOrderMutation();

  const orders = ordersData?.data || [];
  const cocoons = cocoonsData?.data || [];

  const handleSettle = async (id: string, orderNumber: string) => {
    if (!confirm(`অর্ডার ${orderNumber}-এর বোর্ড পরিদর্শন নিশ্চিত করে তাঁতির এসক্রো খালাস করতে চান?`)) {
      return;
    }
    try {
      await settleOrder(id).unwrap();
      alert(`অর্ডার ${orderNumber}-এর এসক্রো সফলভাবে তাঁতির অনুকূলে খালাস করা হয়েছে!`);
    } catch {
      alert('এসক্রো খালাস করতে ব্যর্থ হয়েছে।');
    }
  };

  const getStatusBadge = (status: ArtisanOrderEscrowStatus) => {
    switch (status) {
      case 'ORDER_PLACED_ESCROW_LOCKED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
            <Clock className="w-3 h-3" /> ৫০% এসক্রো জমা
          </span>
        );
      case 'IN_WEAVING_PROGRESS':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
            <Scissors className="w-3 h-3" /> বুনন চলমান
          </span>
        );
      case 'FINISHED_BOARD_INSPECTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> বোর্ড পরিদর্শন সম্পন্ন
          </span>
        );
      case 'ESCROW_RELEASED_TO_WEAVER':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> এসক্রো পরিশোধিত
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-600" />
            <span>বাংলাদেশ রেশম ও তাঁত বোর্ড নিয়ন্ত্রণ কেন্দ্র (BSDB & BHB Regulatory Hub)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            তাঁতি এসক্রো জামানত নিষ্পত্তি, জিআই প্রত্যয়ন নিরীক্ষা এবং দেশব্যাপী রেশম গুটি উৎপাদন মনিটরিং
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'orders'
              ? 'bg-amber-800 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>তাঁতি কাস্টম অর্ডার ও এসক্রো নিষ্পত্তি ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cocoons')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'cocoons'
              ? 'bg-amber-800 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>BSDB রেশম গুটি পরিদর্শন খতিয়ান ({cocoons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('gi')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'gi'
              ? 'bg-amber-800 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>ভৌগোলিক নির্দেশক (GI) সনদ রেজিস্ট্রি</span>
        </button>
      </div>

      {/* TAB 1: Orders & Escrow Settlement */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-600" />
            <span>দেশব্যাপী সক্রিয় তাঁতি এসক্রো অর্ডার তালিকা ({orders.length})</span>
          </h2>

          {isOrdersLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-600 mb-2" />
              <span>তথ্য লোড হচ্ছে...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">কোনো সক্রিয় অর্ডার পাওয়া যায়নি।</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">অর্ডার নম্বর</th>
                    <th className="py-3 px-4">কারিগর ও ক্লাস্টার</th>
                    <th className="py-3 px-4">গ্রাহক</th>
                    <th className="py-3 px-4">বুনন অগ্রগতি</th>
                    <th className="py-3 px-4">মোট চুক্তিমূল্য</th>
                    <th className="py-3 px-4">এসক্রো স্ট্যাটাস</th>
                    <th className="py-3 px-4 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-700">
                        {o.orderNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 dark:text-white block">{o.artisanName}</span>
                        <span className="text-[10px] text-slate-400">{o.craftType}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800 dark:text-slate-200 block">{o.buyerName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{o.buyerPhone}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-600 rounded-full"
                              style={{ width: `${o.weftProgressPercentage}%` }}
                            />
                          </div>
                          <span className="font-semibold text-[11px]">{o.weftProgressPercentage}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        ৳{o.agreedPriceBdt.toLocaleString()}
                        <span className="text-[10px] text-emerald-600 block">
                          (এসক্রো: ৳{o.advanceEscrowBdt.toLocaleString()})
                        </span>
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(o.orderStatus)}</td>
                      <td className="py-3.5 px-4 text-right">
                        {o.orderStatus !== 'ESCROW_RELEASED_TO_WEAVER' ? (
                          <button
                            onClick={() => handleSettle(o.id, o.orderNumber)}
                            disabled={isSettling}
                            className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[11px] shadow-sm transition-all"
                          >
                            এসক্রো খালাস করুন
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-bold text-[11px] flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> পরিশোধিত
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Cocoon Ledger */}
      {activeTab === 'cocoons' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <span>বাংলাদেশ রেশম উন্নয়ন বোর্ড (BSDB) প্রত্যয়িত গুটি লট খতিয়ান ({cocoons.length})</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">লট নম্বর</th>
                  <th className="py-3 px-4">রেশম চাষী</th>
                  <th className="py-3 px-4">এলাকা</th>
                  <th className="py-3 px-4">জাত ও তুঁত পাতা</th>
                  <th className="py-3 px-4">কাঁচা গুটি ওজন</th>
                  <th className="py-3 px-4">শেল রেশিও</th>
                  <th className="py-3 px-4">সুতা ফিলামেন্ট ফলন</th>
                  <th className="py-3 px-4">BSDB অডিটর</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {cocoons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono font-bold text-amber-700">{c.lotNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{c.farmerName}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{c.farmingDistrict}</td>
                    <td className="py-3 px-4">
                      <span>{c.cocoonType}</span>
                      <span className="text-[10px] text-slate-400 block">{c.mulberryVariety}</span>
                    </td>
                    <td className="py-3 px-4 font-bold">{c.freshCocoonWeightKg} কেজি</td>
                    <td className="py-3 px-4 font-semibold text-emerald-600">{c.shellRatioPercentage}%</td>
                    <td className="py-3 px-4 font-bold text-amber-700">{c.estimatedRawSilkFilamentKg} কেজি</td>
                    <td className="py-3 px-4 text-slate-500">{c.bsdbInspectorName || 'ড. আব্দুর রাজ্জাক'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: GI Register */}
      {activeTab === 'gi' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-teal-600" />
            <span>ভৌগোলিক নির্দেশক (GI) সনদ রেজিস্ট্রি ও ক্লাস্টার বিবরণী</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-bold text-sm text-teal-900 dark:text-teal-200">
                  ঐতিহ্যবাহী ঢাকাই জামদানি শাড়ি
                </span>
                <span className="px-2 py-0.5 rounded-md bg-teal-200 text-teal-900 font-mono font-bold text-[10px]">
                  GI-BD-01
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                শীতলক্ষ্যা নদীর আর্দ্র আবহাওয়া ও রূপগঞ্জ-সোনারগাঁও তাঁতিপাড়ার হস্তকাটা কার্পাস তুলা। ইউনেস্কো ইনট্যানজিবল কালচারাল হেরিটেজ তালিকাভুক্ত।
              </p>
              <div className="text-[10px] text-teal-700 dark:text-teal-400 font-semibold pt-1">
                অধিক্ষেত্র: রূপগঞ্জ ও সোনারগাঁও ক্লাস্টার, নারায়ণগঞ্জ
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-bold text-sm text-amber-900 dark:text-amber-200">
                  রাজশাহী খাঁটি রেশম সিল্ক
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 font-mono font-bold text-[10px]">
                  GI-BD-03
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                পদ্মাপাড়ের মালবেরি তুঁত বাগান ও বোম্বিক্স মোরি রেশম মথ থেকে রিলিংকৃত প্রাকৃতিক ফাইব্রোইন প্রোটিন ফিলামেন্ট।
              </p>
              <div className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold pt-1">
                অধিক্ষেত্র: সোপুরা, ভোলাহাট ও শিবগঞ্জ রেশম জোন
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-bold text-sm text-purple-900 dark:text-purple-200">
                  টাঙ্গাইল হস্তচালিত তাঁতের শাড়ি
                </span>
                <span className="px-2 py-0.5 rounded-md bg-purple-200 text-purple-900 font-mono font-bold text-[10px]">
                  GI-BD-21
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                পাথরাইল ও দেলদুয়ারের বসাক তন্তুবায়দের বিশেষ টানা-পোড়েন ও নরম ডুরে নকশা। ১০০% হস্তচালিত তাঁতের অনন্য ঐতিহ্য।
              </p>
              <div className="text-[10px] text-purple-700 dark:text-purple-400 font-semibold pt-1">
                অধিক্ষেত্র: পাথরাইল ও বাজিতপুর, টাঙ্গাইল
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-bold text-sm text-rose-900 dark:text-rose-200">
                  পার্বত্য আদিবাসী কোমর তাঁত (থামি ও পিনন হাদি)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-rose-200 text-rose-900 font-mono font-bold text-[10px]">
                  BHB-CHT-08
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                চাকমা, মারমা ও ত্রিপুরা আদিবাসী নারীদের ব্যাকস্ট্র্যাপ তাঁতে বোনা প্রাকৃতিক রঙিন জ্যামিতিক নকশার পোশাক।
              </p>
              <div className="text-[10px] text-rose-700 dark:text-rose-400 font-semibold pt-1">
                অধিক্ষেত্র: রাঙ্গামাটি, খাগড়াছড়ি ও বান্দরবান পার্বত্য জেলা
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
