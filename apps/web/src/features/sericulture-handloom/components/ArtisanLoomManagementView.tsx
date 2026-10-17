'use client';

import React, { useState } from 'react';
import {
  Scissors,
  Layers,
  Sparkles,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  MapPin,
  Calendar,
  ShieldCheck,
  Loader2,
  X,
  FileText,
} from 'lucide-react';
import {
  useGetArtisanOrdersQuery,
  useUpdateLoomProgressMutation,
  useCreateHandloomProductMutation,
  useCreateCocoonBatchMutation,
  useGetCocoonBatchesQuery,
  ArtisanOrderEscrowStatus,
  SericultureCraftType,
  WeavingLoomType,
  YarnMaterial,
  SilkGrade,
  AuthenticityStatus,
  CocoonType,
} from '../sericultureHandloomApi';

export function ArtisanLoomManagementView() {
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'cocoons'>('orders');

  // Progress update modal state
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<ArtisanOrderEscrowStatus>('IN_WEAVING_PROGRESS');
  const [weftProgress, setWeftProgress] = useState<number>(50);
  const [progressNotes, setProgressNotes] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  // Add Product modal state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newTitleBn, setNewTitleBn] = useState('');
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newCraft, setNewCraft] = useState<SericultureCraftType>('RAJSHAHI_MULBERRY_SILK');
  const [newDistrict, setNewDistrict] = useState('Rajshahi');
  const [newVillage, setNewVillage] = useState('Sopura');
  const [newLoom, setNewLoom] = useState<WeavingLoomType>('FLY_SHUTTLE_FRAME_LOOM');
  const [newYarn, setNewYarn] = useState<YarnMaterial>('PURE_MULBERRY_SILK_100');
  const [newWarp, setNewWarp] = useState<number>(100);
  const [newWeft, setNewWeft] = useState<number>(100);
  const [newGrade, setNewGrade] = useState<SilkGrade>('GRADE_A_PREMIUM_EXPORT');
  const [newAuth, setNewAuth] = useState<AuthenticityStatus>('BSDB_BHB_CERTIFIED');
  const [newGiCert, setNewGiCert] = useState('GI-BD-SILK-001');
  const [newDays, setNewDays] = useState<number>(10);
  const [newWage, setNewWage] = useState<number>(8500);
  const [newPrice, setNewPrice] = useState<number>(15000);

  // Add Cocoon modal state
  const [isAddCocoonOpen, setIsAddCocoonOpen] = useState(false);
  const [farmerName, setFarmerName] = useState('মোঃ আব্দুল কুদ্দুস');
  const [farmingDistrict, setFarmingDistrict] = useState('Bholahat, Chapainawabganj');
  const [mulberryVariety, setMulberryVariety] = useState('BM-4');
  const [cocoonType, setCocoonType] = useState<CocoonType>('BIVOLTINE');
  const [cocoonWeight, setCocoonWeight] = useState<number>(80);
  const [pricePerKg, setPricePerKg] = useState<number>(680);

  const { data: ordersData, isLoading: isOrdersLoading } = useGetArtisanOrdersQuery();
  const { data: cocoonsData, isLoading: isCocoonsLoading } = useGetCocoonBatchesQuery();

  const [updateLoomProgress, { isLoading: isUpdatingProgress }] = useUpdateLoomProgressMutation();
  const [createProduct, { isLoading: isCreatingProduct }] = useCreateHandloomProductMutation();
  const [createCocoon, { isLoading: isCreatingCocoon }] = useCreateCocoonBatchMutation();

  const orders = ordersData?.data || [];
  const cocoons = cocoonsData?.data || [];

  const handleProgressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return;

    try {
      await updateLoomProgress({
        id: selectedOrderId,
        orderStatus: updateStatus,
        weftProgressPercentage: weftProgress,
        inspectionNotes: progressNotes,
        dispatchedTrackingNumber: trackingNumber || undefined,
      }).unwrap();

      setSelectedOrderId(null);
      alert('তাঁতের বুনন অগ্রগতি সফলভাবে আপডেট হয়েছে!');
    } catch {
      alert('আপডেট করতে ব্যর্থ হয়েছে।');
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProduct({
        titleBn: newTitleBn,
        titleEn: newTitleEn,
        craftType: newCraft,
        originDistrict: newDistrict,
        weavingVillage: newVillage,
        loomType: newLoom,
        yarnMaterial: newYarn,
        threadCountWarp: newWarp,
        threadCountWeft: newWeft,
        silkGrade: newGrade,
        authenticityStatus: newAuth,
        giCertificateNumber: newGiCert || null,
        weavingDurationDays: newDays,
        artisanWageBdt: newWage,
        priceBdt: newPrice,
      }).unwrap();

      setIsAddProductOpen(false);
      setNewTitleBn('');
      alert('নতুন হস্তচালিত তাঁত শাড়ি সফলভাবে ক্যাটালগে যুক্ত হয়েছে!');
    } catch {
      alert('পণ্য যোগ করতে ব্যর্থ হয়েছে।');
    }
  };

  const handleCocoonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCocoon({
        farmerName,
        farmingDistrict,
        mulberryVariety,
        cocoonType,
        freshCocoonWeightKg: cocoonWeight,
        pricePerKgBdt: pricePerKg,
        harvestDate: new Date().toISOString().split('T')[0],
      }).unwrap();

      setIsAddCocoonOpen(false);
      alert('রেশম গুটি লট সফলভাবে নিবন্ধিত হয়েছে!');
    } catch {
      alert('গুটি লট যোগ করতে ব্যর্থ হয়েছে।');
    }
  };

  const getStatusBadge = (status: ArtisanOrderEscrowStatus) => {
    switch (status) {
      case 'ORDER_PLACED_ESCROW_LOCKED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
            <Clock className="w-3 h-3" /> অর্ডার গৃহীত ও ৫০% এসক্রো জমা
          </span>
        );
      case 'WARPING_LOOM_MOUNTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
            <Layers className="w-3 h-3" /> টানা তাঁতে প্রস্তুত
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
            <CheckCircle2 className="w-3 h-3" /> বুনন সম্পন্ন ও পরিদর্শিত
          </span>
        );
      case 'DISPATCHED_TO_BUYER':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
            <Truck className="w-3 h-3" /> কুরিয়ারে প্রেরিত
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
            <Scissors className="w-6 h-6 text-amber-600" />
            <span>কারিগর ও তাঁত ব্যবস্থাপনা হাব (Artisan Loom & Sericulture Desk)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            তাঁতের সক্রিয় কাস্টম অর্ডার অগ্রগতি, টানা-পোড়েন ট্র্যাকিং, নতুন হস্তশিল্প তালিকাভুক্তকরণ ও রেশম গুটি লট
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddProductOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-800 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>নতুন শাড়ি / বস্ত্র যুক্ত করুন</span>
          </button>

          <button
            onClick={() => setIsAddCocoonOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Layers className="w-4 h-4" />
            <span>রেশম গুটি লট লগ করুন</span>
          </button>
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
          <Clock className="w-4 h-4" />
          <span>তাঁতে সক্রিয় কাস্টম অর্ডার ({orders.length})</span>
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
          <span>রেশম চাষী গুটি ফলন লট ({cocoons.length})</span>
        </button>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span>সক্রিয় তাঁত অর্ডার ও এসক্রো জামানত ({orders.length})</span>
          </h2>

          {isOrdersLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-600 mb-2" />
              <span>অর্ডার সমূহ লোড হচ্ছে...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 space-y-2">
              <Scissors className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p>আপনার তাঁতে বর্তমানে কোনো কাস্টম বুনন অর্ডার নেই।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {ord.orderNumber}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-0.5">
                        {ord.customMotifDescription}
                      </h3>
                      <span className="text-[11px] text-slate-500">গ্রাহক: {ord.buyerName} ({ord.buyerPhone})</span>
                    </div>
                    {getStatusBadge(ord.orderStatus)}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>বুনন অগ্রগতি:</span>
                      <span className="text-amber-600">{ord.weftProgressPercentage}% সম্পন্ন</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-600 rounded-full transition-all"
                        style={{ width: `${ord.weftProgressPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <div>
                      <span className="text-[10px] text-slate-400 block">মোট মূল্য</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        ৳{ord.agreedPriceBdt.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">৫০% এসক্রো সুরক্ষিত</span>
                      <span className="font-bold text-emerald-600">
                        ৳{ord.advanceEscrowBdt.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {ord.inspectionNotes && (
                    <div className="text-[11px] text-slate-500 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <strong>নোট:</strong> {ord.inspectionNotes}
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedOrderId(ord.id);
                        setUpdateStatus(ord.orderStatus);
                        setWeftProgress(ord.weftProgressPercentage);
                        setProgressNotes(ord.inspectionNotes || '');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-all"
                    >
                      অগ্রগতি ও তাঁত স্ট্যাটাস আপডেট করুন
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Cocoons */}
      {activeTab === 'cocoons' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <span>নিবন্ধিত রেশম গুটি (Cocoon Lots) ({cocoons.length})</span>
          </h2>

          {isCocoonsLoading ? (
            <div className="py-10 text-center text-xs text-slate-400">লোড হচ্ছে...</div>
          ) : cocoons.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">কোনো গুটি লট নেই।</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cocoons.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-amber-700">{c.lotNumber}</span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">{c.farmerName}</h4>
                      <span className="text-[11px] text-slate-500">{c.farmingDistrict}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {c.cocoonType}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-[10px] text-slate-400 block">কাঁচা গুটি ওজন</span>
                      <span className="font-semibold">{c.freshCocoonWeightKg} কেজি</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">র সিল্ক সুতা ফলন</span>
                      <span className="font-bold text-amber-700">{c.estimatedRawSilkFilamentKg} কেজি</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">শেল রেশিও</span>
                      <span className="font-semibold">{c.shellRatioPercentage}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">দর প্রতি কেজি</span>
                      <span className="font-bold text-emerald-600">৳{c.pricePerKgBdt}</span>
                    </div>
                  </div>

                  {c.bsdbInspectorName && (
                    <div className="text-[10px] text-slate-400 pt-1">
                      BSDB অডিটর: {c.bsdbInspectorName}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Progress Update Modal */}
      {selectedOrderId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Scissors className="w-4 h-4 text-amber-600" />
                <span>তাঁতের বুনন অগ্রগতি হালনাগাদ</span>
              </h3>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProgressSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  বর্তমান পর্যায় (Stage Status)
                </label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value as ArtisanOrderEscrowStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="WARPING_LOOM_MOUNTED">টানা তাঁতে প্রস্তুত (Warping Loom Mounted)</option>
                  <option value="IN_WEAVING_PROGRESS">বুনন চলমান (In Weaving Progress)</option>
                  <option value="FINISHED_BOARD_INSPECTED">বুনন সম্পন্ন ও বোর্ড পরিদর্শন (Finished Inspected)</option>
                  <option value="DISPATCHED_TO_BUYER">কুরিয়ারে প্রেরিত (Dispatched to Buyer)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>বুনন অগ্রগতি (%):</span>
                  <span className="text-amber-600 font-bold">{weftProgress}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={weftProgress}
                  onChange={(e) => setWeftProgress(Number(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  তাঁতি নোট ও অগ্রগতি বিবরণ
                </label>
                <textarea
                  rows={2}
                  placeholder="যেমন: শাড়ির পার ও ২৫ ইঞ্চি বুনন শেষ..."
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              {updateStatus === 'DISPATCHED_TO_BUYER' && (
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    কুরিয়ার ট্র্যাকিং নম্বর (Steadfast/Pathao)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. STF-8921820"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isUpdatingProgress}
                className="w-full py-2.5 rounded-xl bg-amber-800 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isUpdatingProgress ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>হালনাগাদ নিশ্চিত করুন</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-amber-600" />
                <span>নতুন তাঁত / রেশম বস্ত্র নিবন্ধন করুন</span>
              </h3>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">পণ্যের নাম (বাংলা)</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: সোপুরা খাঁটি মালবেরি সিল্ক শাড়ি"
                  value={newTitleBn}
                  onChange={(e) => setNewTitleBn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Product Title (English)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Sopura Pure Mulberry Silk Saree"
                  value={newTitleEn}
                  onChange={(e) => setNewTitleEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">ক্রাফট টাইপ</label>
                  <select
                    value={newCraft}
                    onChange={(e) => setNewCraft(e.target.value as SericultureCraftType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="RAJSHAHI_MULBERRY_SILK">রাজশাহী মালবেরি সিল্ক</option>
                    <option value="NARAYANGANJ_DHAKAI_JAMDANI">ঢাকাই জামদানি</option>
                    <option value="TANGAIL_HANDLOOM_TAANT">টাঙ্গাইল তাঁত শাড়ি</option>
                    <option value="ENDI_ERI_SILK">খাঁটি এন্ডি রেশম</option>
                    <option value="HILL_TRACTS_CHAKMA_PINON_HADI">কোমর তাঁত পিনন হাদি</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">তাঁতের ধরন</label>
                  <select
                    value={newLoom}
                    onChange={(e) => setNewLoom(e.target.value as WeavingLoomType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="FLY_SHUTTLE_FRAME_LOOM">ফ্লাই শাটল ফ্রেম লুম</option>
                    <option value="TRADITIONAL_PIT_LOOM">ঐতিহ্যবাহী পিট লুম</option>
                    <option value="INDIGENOUS_BACKSTRAP_LOOM">কোমর তাঁত</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">জেলা</label>
                  <input
                    type="text"
                    required
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">গ্রাম / ক্লাস্টার</label>
                  <input
                    type="text"
                    required
                    value={newVillage}
                    onChange={(e) => setNewVillage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">বুনন দিন</label>
                  <input
                    type="number"
                    min={1}
                    value={newDays}
                    onChange={(e) => setNewDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">তাঁতির মজুরি (৳)</label>
                  <input
                    type="number"
                    min={500}
                    value={newWage}
                    onChange={(e) => setNewWage(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">বিক্রয়মূল্য (৳)</label>
                  <input
                    type="number"
                    min={1000}
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreatingProduct}
                className="w-full py-2.5 rounded-xl bg-amber-800 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isCreatingProduct ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                <span>পণ্য ক্যাটালগে সংরক্ষণ করুন</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Cocoon Modal */}
      {isAddCocoonOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>রেশম গুটি (Cocoon Lot) নিবন্ধন</span>
              </h3>
              <button
                onClick={() => setIsAddCocoonOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCocoonSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">রেশম চাষীর নাম</label>
                <input
                  type="text"
                  required
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">চাষের এলাকা ও জেলা</label>
                <input
                  type="text"
                  required
                  value={farmingDistrict}
                  onChange={(e) => setFarmingDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">গুটি ওজন (কেজি)</label>
                  <input
                    type="number"
                    min={5}
                    value={cocoonWeight}
                    onChange={(e) => setCocoonWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">দর প্রতি কেজি (৳)</label>
                  <input
                    type="number"
                    min={300}
                    value={pricePerKg}
                    onChange={(e) => setPricePerKg(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreatingCocoon}
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isCreatingCocoon ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                <span>গুটি লট সংরক্ষণ করুন</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
