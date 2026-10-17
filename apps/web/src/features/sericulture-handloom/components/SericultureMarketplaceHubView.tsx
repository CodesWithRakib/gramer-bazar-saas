'use client';

import React, { useState } from 'react';
import {
  Scissors,
  Sparkles,
  Flame,
  Award,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  TrendingUp,
  Info,
  Scale,
  ShieldCheck,
  Search,
  ArrowRight,
  X,
  FileCheck2,
  HeartHandshake,
  Loader2,
} from 'lucide-react';
import {
  useGetHandloomCatalogQuery,
  useGetSericultureOverviewStatsQuery,
  useCalculateCocoonReelingMutation,
  useCalculateFairWageMutation,
  useCreateCustomOrderMutation,
  HandloomArtisanProduct,
  SericultureCraftType,
  WeavingLoomType,
  SilkGrade,
  CocoonType,
} from '../sericultureHandloomApi';

export function SericultureMarketplaceHubView() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'reeling' | 'fairwage' | 'guide'>('catalog');
  const [selectedCraft, setSelectedCraft] = useState<string>('ALL');
  const [selectedLoom, setSelectedLoom] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected product for burn-test or custom order
  const [selectedProduct, setSelectedProduct] = useState<HandloomArtisanProduct | null>(null);
  const [isCustomOrderOpen, setIsCustomOrderOpen] = useState(false);
  const [customMotif, setCustomMotif] = useState('');
  const [customColor, setCustomColor] = useState('#800020');
  const [customZari, setCustomZari] = useState('PURE_SILVER_ZARI');
  const [customPrice, setCustomPrice] = useState<number>(25000);
  const [customDeliveryDays, setCustomDeliveryDays] = useState<number>(25);

  // Cocoon Calculator state
  const [cocoonWeight, setCocoonWeight] = useState<number>(100);
  const [cocoonType, setCocoonType] = useState<CocoonType>('BIVOLTINE');
  const [shellRatio, setShellRatio] = useState<number>(22);

  // Fair-Wage Calculator state
  const [wageCraft, setWageCraft] = useState<SericultureCraftType>('NARAYANGANJ_DHAKAI_JAMDANI');
  const [wageDays, setWageDays] = useState<number>(25);
  const [wageZari, setWageZari] = useState('PURE_SILVER_ZARI');

  const { data: statsData } = useGetSericultureOverviewStatsQuery();
  const stats = statsData?.data;

  const { data: catalogData, isLoading: isCatalogLoading } = useGetHandloomCatalogQuery({
    craftType: selectedCraft !== 'ALL' ? (selectedCraft as SericultureCraftType) : undefined,
    loomType: selectedLoom !== 'ALL' ? (selectedLoom as WeavingLoomType) : undefined,
    search: searchQuery || undefined,
  });

  const [calculateReeling, { data: reelingData, isLoading: isReelingLoading }] =
    useCalculateCocoonReelingMutation();
  const [calculateWage, { data: wageData, isLoading: isWageLoading }] =
    useCalculateFairWageMutation();
  const [createCustomOrder, { isLoading: isOrdering }] = useCreateCustomOrderMutation();

  const products = catalogData?.data || [];

  const handleRunReelingCalc = () => {
    calculateReeling({
      freshCocoonWeightKg: cocoonWeight,
      cocoonType,
      shellRatioPercentage: shellRatio,
    });
  };

  const handleRunWageCalc = () => {
    calculateWage({
      craftType: wageCraft,
      weavingDays: wageDays,
      zariType: wageZari,
    });
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      await createCustomOrder({
        artisanId: selectedProduct.artisanId,
        artisanName: selectedProduct.artisanName,
        craftType: selectedProduct.craftType,
        customMotifDescription: customMotif || 'ঐতিহ্যবাহী বুননে কাস্টম শাড়ি',
        primaryColorHex: customColor,
        zariSpecification: customZari,
        agreedPriceBdt: customPrice,
        estimatedDeliveryDays: customDeliveryDays,
      }).unwrap();

      setIsCustomOrderOpen(false);
      setCustomMotif('');
      alert('আপনার কাস্টম বুনন অর্ডারটি সফলভাবে ৫০% এসক্রো সুরক্ষায় জমা হয়েছে!');
    } catch {
      alert('অর্ডার জমা দিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    }
  };

  const getCraftLabel = (type: SericultureCraftType) => {
    switch (type) {
      case 'RAJSHAHI_MULBERRY_SILK':
        return 'রাজশাহী মালবেরি সিল্ক';
      case 'NARAYANGANJ_DHAKAI_JAMDANI':
        return 'ঐতিহ্যবাহী ঢাকাই জামদানি';
      case 'TANGAIL_HANDLOOM_TAANT':
        return 'টাঙ্গাইল তাঁত শাড়ি';
      case 'ENDI_ERI_SILK':
        return 'খাঁটি এন্ডি এরি সিল্ক';
      case 'HILL_TRACTS_CHAKMA_PINON_HADI':
        return 'পাহাড়ি কোমর তাঁত';
      case 'MIRPUR_BANARASI_KATAN':
        return 'মিরপুর বেনারসি কাতান';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero & Statistics Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-900 via-rose-950 to-slate-900 p-8 text-white shadow-xl border border-amber-800/30">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>বাংলাদেশ রেশম ও ঐতিহ্যবাহী গ্রামীণ তাঁতশিল্প হাব (BSDB & Handloom Board)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            খাঁটি রাজশাহী রেশম, জামদানি ও প্রান্তিক তাঁতির সরাসরি বাজার
          </h1>
          <p className="text-amber-100/80 text-sm sm:text-base leading-relaxed">
            মধ্যস্বত্বভোগী দাদন ছাড়াই সরাসরি তাঁতি সমবায় থেকে জিআই প্রত্যয়িত ঢাকাই জামদানি, সোপুরা মালবেরি সিল্ক ও কোমর তাঁতের বস্ত্র। ১০০% খাঁটি সিল্ক বার্ন টেস্ট সনদ ও ন্যায্য পারিশ্রমিক গ্যারান্টি।
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-medium">
              <Scissors className="w-4 h-4" />
              <span>ঐতিহ্যবাহী বস্ত্র ক্যাটালগ</span>
            </div>
            <div className="text-2xl font-bold mt-1 text-white">
              {stats?.totalArtisanProducts ?? '—'} টি
            </div>
            <div className="text-[11px] text-amber-200/60 mt-0.5">তাঁত সমবায় দ্বারা প্রস্তুত</div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-rose-300 text-xs font-medium">
              <Layers className="w-4 h-4" />
              <span>রেশম কোকুন গুটি ফলন</span>
            </div>
            <div className="text-2xl font-bold mt-1 text-white">
              {stats?.totalCocoonWeightKg?.toLocaleString() ?? '—'} কেজি
            </div>
            <div className="text-[11px] text-rose-200/60 mt-0.5">BSDB প্রত্যয়িত গুটি লট</div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-teal-300 text-xs font-medium">
              <Award className="w-4 h-4" />
              <span>নিবন্ধিত জিআই (GI) ক্রাফট</span>
            </div>
            <div className="text-2xl font-bold mt-1 text-white">
              {stats?.registeredGIProductsCount ?? 4} টি
            </div>
            <div className="text-[11px] text-teal-200/60 mt-0.5">ভৌগোলিক নির্দেশক সনদপ্রাপ্ত</div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>নিরাপদ তাঁতি এসক্রো</span>
            </div>
            <div className="text-2xl font-bold mt-1 text-emerald-400">
              ৳{stats?.totalEscrowLockedBdt?.toLocaleString() ?? '—'}
            </div>
            <div className="text-[11px] text-emerald-200/60 mt-0.5">৫০% অগ্রিম এসক্রো সুরক্ষিত</div>
          </div>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'catalog'
              ? 'bg-amber-800 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>তাঁত ও রেশম ক্যাটালগ (Heritage Showcase)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('reeling');
            if (!reelingData) handleRunReelingCalc();
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'reeling'
              ? 'bg-amber-800 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>কোকুন-টু-সিল্ক রিলিং ক্যালকুলেটর (Renditta Engine)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('fairwage');
            if (!wageData) handleRunWageCalc();
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'fairwage'
              ? 'bg-amber-800 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>তাঁতির ন্যায্য মজুরি ম্যাট্রিক্স (Fair-Wage Transparency)</span>
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'guide'
              ? 'bg-amber-800 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>খাঁটি সিল্ক বার্ন-টেস্ট ও জিআই গাইড</span>
        </button>
      </div>

      {/* TAB 1: Heritage Catalog */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="শাড়ি, শাল বা তাঁতির নাম খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <select
                value={selectedCraft}
                onChange={(e) => setSelectedCraft(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-700 dark:text-slate-200"
              >
                <option value="ALL">সকল ঐতিহ্যবাহী ক্রাফট (All Crafts)</option>
                <option value="RAJSHAHI_MULBERRY_SILK">রাজশাহী রেশম সিল্ক</option>
                <option value="NARAYANGANJ_DHAKAI_JAMDANI">ঐতিহ্যবাহী ঢাকাই জামদানি</option>
                <option value="TANGAIL_HANDLOOM_TAANT">টাঙ্গাইল তাঁত শাড়ি</option>
                <option value="ENDI_ERI_SILK">খাঁটি এন্ডি এরি সিল্ক</option>
                <option value="HILL_TRACTS_CHAKMA_PINON_HADI">পাহাড়ি কোমর তাঁত</option>
              </select>
            </div>

            <div>
              <select
                value={selectedLoom}
                onChange={(e) => setSelectedLoom(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-700 dark:text-slate-200"
              >
                <option value="ALL">সকল তাঁতের ধরণ (All Looms)</option>
                <option value="TRADITIONAL_PIT_LOOM">ঐতিহ্যবাহী পিট লুম (গর্ত তাঁত)</option>
                <option value="FLY_SHUTTLE_FRAME_LOOM">ফ্লাই শাটল ফ্রেম লুম</option>
                <option value="INDIGENOUS_BACKSTRAP_LOOM">আদিবাসী কোমর তাঁত</option>
              </select>
            </div>

            <div className="flex items-center justify-end text-xs text-slate-500 font-medium px-2">
              <span>মোট পাওয়া গেছে: <strong>{products.length}</strong> টি পণ্য</span>
            </div>
          </div>

          {/* Product Cards Grid */}
          {isCatalogLoading ? (
            <div className="py-20 text-center text-xs text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600 mb-2" />
              <span>ঐতিহ্যবাহী তাঁত ও সিল্ক পণ্য লোড হচ্ছে...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
              <Scissors className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p>আপনার অনুসন্ধানে কোনো হস্তচালিত তাঁত পণ্য খুঁজে পাওয়া যায়নি।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
                >
                  <div className="space-y-3">
                    {/* Media Image Thumbnail */}
                    <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img
                        src={item.mediaGalleryUrls?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'}
                        alt={item.titleBn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-900/80 text-amber-200 backdrop-blur-md border border-amber-700/50">
                          {getCraftLabel(item.craftType)}
                        </span>
                        {item.giCertificateNumber && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-800/90 text-teal-200 backdrop-blur-md flex items-center gap-1">
                            <Award className="w-3 h-3" /> GI প্রত্যয়িত
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-black/60 text-white backdrop-blur-sm">
                          {item.threadCountWarp}x{item.threadCountWeft} কাউন্ট
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {item.weavingVillage}, {item.originDistrict}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-2 mt-0.5">
                          {item.titleBn}
                        </h3>
                      </div>

                      {/* Artisan & Weaving Details */}
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                          <span className="text-[11px] text-slate-400">কারিগর / তাঁতি:</span>
                          <span className="font-semibold">{item.artisanName}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                          <span className="text-[11px] text-slate-400">তাঁতের ধরন:</span>
                          <span className="font-medium text-[11px]">{item.loomType.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                          <span className="text-[11px] text-slate-400">বুনন সময়কাল:</span>
                          <span className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {item.weavingDurationDays} দিন
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 pt-1 border-t border-slate-200/60 dark:border-slate-700">
                          <span className="text-[10px]">তাঁতির সরাসরি মজুরি:</span>
                          <span className="font-bold text-xs">৳{item.artisanWageBdt.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Burn Test Snippet */}
                      {item.burnTestResultNotes && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-amber-50/50 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200/50 dark:border-amber-900/30 flex items-start gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{item.burnTestResultNotes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price & Action Buttons */}
                  <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 mt-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block">স্বচ্ছ বিক্রয়মূল্য</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">
                        ৳{item.priceBdt.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.isCustomOrderAvailable && (
                        <button
                          onClick={() => {
                            setSelectedProduct(item);
                            setCustomPrice(item.priceBdt);
                            setCustomDeliveryDays(item.weavingDurationDays + 10);
                            setIsCustomOrderOpen(true);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-amber-800 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>কাস্টম বুনন</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Cocoon-to-Silk Reeling Calculator */}
      {activeTab === 'reeling' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-600" />
                <span>সিল্ক কোকুন রিলিং ক্যালকুলেটর</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                কাঁচা রেশম গুটি থেকে খাঁটি সিল্ক ফিলামেন্ট সুতা ও পিউপা উপজাত ফলন হিসাব
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  কাঁচা কোকুন গুটির ওজন (কেজি)
                </label>
                <input
                  type="number"
                  min={5}
                  value={cocoonWeight}
                  onChange={(e) => setCocoonWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  রেশম গুটির জাত (Cocoon Variety)
                </label>
                <select
                  value={cocoonType}
                  onChange={(e) => setCocoonType(e.target.value as CocoonType)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="BIVOLTINE">বাইভোল্টিন উন্নত রেশম (উচ্চ ফলনশীল রেনডিট্টা)</option>
                  <option value="MULTIVOLTINE">মাল্টিভোল্টিন দেশি ঐতিহ্যবাহী গুটি</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>শেল রেশিও (Shell Ratio):</span>
                  <span className="text-amber-600 font-bold">{shellRatio}%</span>
                </div>
                <input
                  type="range"
                  min={16}
                  max={26}
                  step={0.5}
                  value={shellRatio}
                  onChange={(e) => setShellRatio(Number(e.target.value))}
                  className="w-full accent-amber-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>১৬% (সাধারণ)</span>
                  <span>২২% (স্ট্যান্ডার্ড)</span>
                  <span>২৬% (প্রিমিয়াম BSDB)</span>
                </div>
              </div>

              <button
                onClick={handleRunReelingCalc}
                disabled={isReelingLoading}
                className="w-full py-2.5 rounded-xl bg-amber-800 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isReelingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scale className="w-4 h-4" />}
                <span>রিলিং ফলন ও মূল্য হিসাব করুন</span>
              </button>
            </div>
          </div>

          {/* Results Output */}
          <div className="lg:col-span-2 space-y-5">
            {reelingData?.data ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                      রেশম উন্নয়ন বোর্ড (BSDB) রিলিং স্ট্যান্ডার্ড
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      রেনডিট্টা অনুপাত: {reelingData.data.rendittaRatio} (১ কেজি র সিল্ক উৎপাদন)
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">ন্যায্য মূল্য সংযোজন</span>
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                      +{reelingData.data.valueAdditionPercentage}%
                    </span>
                  </div>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                    <span className="text-[10px] text-slate-400 block">কাঁচা গুটি ওজন</span>
                    <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {reelingData.data.freshCocoonWeightKg} কেজি
                    </span>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200/50 dark:border-amber-900/40">
                    <span className="text-[10px] text-amber-700 dark:text-amber-300 block">র সিল্ক ফিলামেন্ট ফলন</span>
                    <span className="text-base font-black text-amber-800 dark:text-amber-200">
                      {reelingData.data.estimatedRawSilkFilamentKg} কেজি
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                    <span className="text-[10px] text-slate-400 block">পিউপা প্রোটিন উপজাত</span>
                    <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {reelingData.data.chrysalisPupaeByProductKg} কেজি
                    </span>
                  </div>

                  <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200/50 dark:border-emerald-900/40">
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block">নিট অতিরিক্ত মুনাফা</span>
                    <span className="text-base font-black text-emerald-700 dark:text-emerald-300">
                      ৳{reelingData.data.netValueAddedBdt.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Financial Comparison */}
                <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl text-xs">
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                    <span>কাঁচা গুটি স্থানীয় বাজারে বিক্রয়মূল্য:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      ৳{reelingData.data.cocoonFarmgateTotalBdt.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                    <span>রিলিংকৃত গ্রেড-এ সিল্ক ফিলামেন্ট বিক্রয়মূল্য:</span>
                    <span className="font-semibold text-amber-600">
                      ৳{reelingData.data.reeledRawSilkValueBdt.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                    <span>মৎস্য/পোল্ট্রি ফিড হিসেবে পিউপা বিক্রয়মূল্য:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      ৳{reelingData.data.chrysalisProteinValueBdt.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">চাষী ও সমবায়ের জন্য দিকনির্দেশনা: </span>
                    <span>{reelingData.data.recommendationBn}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                বাম পাশের ক্যালকুলেটরে মান নির্ধারণ করে গণনা শুরু করুন।
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Fair-Wage Transparency Matrix */}
      {activeTab === 'fairwage' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-amber-600" />
                <span>তাঁতির ন্যায্য মজুরি মডেল</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                মহাজনী দাদন মুক্ত সরাসরি পারিশ্রমিক ও উৎপাদন খরচ বিভাজন
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  বস্ত্রের প্রকারভেদ (Textile Craft)
                </label>
                <select
                  value={wageCraft}
                  onChange={(e) => setWageCraft(e.target.value as SericultureCraftType)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="NARAYANGANJ_DHAKAI_JAMDANI">নারায়ণগঞ্জ ঢাকাই জামদানি (হস্তকাটা)</option>
                  <option value="RAJSHAHI_MULBERRY_SILK">রাজশাহী মালবেরি রেশম শাড়ি</option>
                  <option value="TANGAIL_HANDLOOM_TAANT">টাঙ্গাইল তাঁত শাড়ি</option>
                  <option value="ENDI_ERI_SILK">খাঁটি এন্ডি রেশম শাল</option>
                  <option value="HILL_TRACTS_CHAKMA_PINON_HADI">পাহাড়ি কোমর তাঁতের পিনন হাদি</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  বুনন সময়কাল (Artisan Man-Days)
                </label>
                <input
                  type="number"
                  min={2}
                  max={120}
                  value={wageDays}
                  onChange={(e) => setWageDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  জামদানি সাধারণত ২০-৪০ দিন, সিল্ক শাড়ি ১০-২০ দিন সময় নেয়
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  জরি ও কারুকাজ (Zari Quality)
                </label>
                <select
                  value={wageZari}
                  onChange={(e) => setWageZari(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="PURE_SILVER_ZARI">খাঁটি রূপালী জরি (Pure Tested Silver)</option>
                  <option value="METALLIC_GOLD_ZARI">স্ট্যান্ডার্ড মেটালিক গোল্ডেন জরি</option>
                  <option value="COTTON_THREAD_ONLY">শুধুমাত্র কটন সুতার বুটা (নো জরি)</option>
                </select>
              </div>

              <button
                onClick={handleRunWageCalc}
                disabled={isWageLoading}
                className="w-full py-2.5 rounded-xl bg-amber-800 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isWageLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <HeartHandshake className="w-4 h-4" />}
                <span>মজুরি ও স্বচ্ছ মূল্য ম্যাট্রিক্স দেখুন</span>
              </button>
            </div>
          </div>

          {/* Results Output */}
          <div className="lg:col-span-2 space-y-5">
            {wageData?.data ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                      ন্যায্য বাণিজ্য ও তাঁতি অংশীদারিত্ব
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      তাঁতির দৈনিক পারিশ্রমিক মান: ৳{wageData.data.dailyArtisanFairWageBdt}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">মোট মূল্যে তাঁতির অংশ</span>
                    <span className="text-xl font-black text-amber-700 dark:text-amber-400">
                      {wageData.data.artisanWageSharePercentage}%
                    </span>
                  </div>
                </div>

                {/* Transparency Breakdown Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200/50 dark:border-emerald-900/40">
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block">তাঁতির প্রত্যক্ষ মজুরি</span>
                    <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                      ৳{wageData.data.totalArtisanWageBdt.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-600 mt-1 block">
                      +{wageData.data.directBenefitIncreasePercentage}% বেশি
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                    <span className="text-[10px] text-slate-400 block">কাঁচা সুতা খরচ</span>
                    <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                      ৳{wageData.data.rawYarnCostBdt.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                    <span className="text-[10px] text-slate-400 block">জরি ও টানা প্রস্তুতি</span>
                    <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                      ৳{(wageData.data.zariCostBdt + wageData.data.loomWarpingPrepCostBdt).toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200/50 dark:border-amber-900/40">
                    <span className="text-[10px] text-amber-700 dark:text-amber-300 block">স্বচ্ছ চূড়ান্ত মূল্য</span>
                    <span className="text-lg font-black text-amber-800 dark:text-amber-200">
                      ৳{wageData.data.fairTransparentRetailPriceBdt.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Verdict Explainer */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-400">
                    <Info className="w-4 h-4" />
                    <span>মহাজনী দাদন বনাম গ্রামের বাজার স্বচ্ছ মডেলের তুলনা:</span>
                  </div>
                  <p className="leading-relaxed">
                    ঐতিহ্যবাহী ব্যবস্থায় একজন জামদানি বা সিল্ক তাঁতিকে দৈনিক মাত্র ৩০০-৪০০ টাকা দিয়ে মধ্যস্বত্বভোগী ফড়িয়ারা শাড়ি ৪০,০০০ টাকায় বিক্রি করে। গ্রামের বাজার প্ল্যাটফর্মে কারিগর সরাসরি <strong>{wageData.data.artisanWageSharePercentage}%</strong> লভ্যাংশ পাচ্ছেন এবং গ্রাহক ১০০% খাঁটি পণ্য পাচ্ছেন।
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                বাম পাশের ক্যালকুলেটরে দিন ও ক্রাফট নির্বাচন করে মজুরি দেখুন।
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Burn-Test & GI Heritage Guide */}
      {activeTab === 'guide' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5 text-amber-700 dark:text-amber-400 font-bold text-base">
              <Flame className="w-5 h-5" />
              <span>খাঁটি রেশম সিল্ক চেনার বৈজ্ঞানিক বার্ন টেস্ট (Burn Test Protocol)</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              সিল্ক মূলত প্রাকৃতিক প্রোটিন ফাইবার (ফাইব্রোইন ও সেরিসিন)। কৃত্রিম পলিয়েস্টার বা রেয়ন মিশ্রণ শনাক্ত করতে ল্যাব অনুমোদিত বার্ন টেস্ট পদ্ধতি:
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 block">১০০% খাঁটি মালবেরি সিল্ক:</span>
                <p className="text-slate-600 dark:text-slate-300 mt-1">
                  আগুনের শিখায় ধীরে ধীরে জ্বলে, পোড়া চুলের গন্ধ নিঃসৃত হয়। শিখা সরিয়ে নিলে নিভে যায় এবং অবশিষ্ট ছাই নরম, কালো ও আঙুল দিয়ে চাপলে গুঁড়ো হয়ে যায়।
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60">
                <span className="font-bold text-rose-800 dark:text-rose-300 block">ভেজাল পলিয়েস্টার বা সিন্থেটিক রেশম:</span>
                <p className="text-slate-600 dark:text-slate-300 mt-1">
                  দ্রুত পুড়ে গলে যায়, ঝাঁঝালো প্লাস্টিকের ধোঁয়া ছড়ায় এবং শক্ত প্লাস্টিকের মতো শক্ত দানা বা বিড তৈরি করে যা কখনো ভাঙা যায় না।
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5 text-teal-700 dark:text-teal-400 font-bold text-base">
              <Award className="w-5 h-5" />
              <span>বাংলাদেশ ভৌগোলিক নির্দেশক (GI) সনদপ্রাপ্ত বস্ত্র সমূহ</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              আন্তর্জাতিকভাবে স্বীকৃত ভৌগোলিক নির্দেশক সনদপ্রাপ্ত ঐতিহ্যবাহী শিল্পকর্ম, যা কেবল নির্দিষ্ট জেলার বংশানুক্রমিক তাঁতিদের দ্বারাই উৎপন্ন হয়:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="font-semibold">১. ঐতিহ্যবাহী ঢাকাই জামদানি (রূপগঞ্জ, নারায়ণগঞ্জ)</span>
                <span className="px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 font-mono text-[10px] font-bold">GI-BD-01</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="font-semibold">২. রাজশাহী রেশম সিল্ক (সোপুরা ও ভোলাহাট ক্লাস্টার)</span>
                <span className="px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 font-mono text-[10px] font-bold">GI-BD-03</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="font-semibold">৩. টাঙ্গাইল তাঁতের শাড়ি (পাথরাইল, দেলদুয়ার)</span>
                <span className="px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 font-mono text-[10px] font-bold">GI-BD-21</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="font-semibold">৪. পাহাড়ি কোমর তাঁত ও পিনন হাদি (পার্বত্য জেলাসমূহ)</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 font-mono text-[10px] font-bold">BHB তালিকাভুক্ত</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Commission Modal */}
      {isCustomOrderOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  কাস্টম বুনন ফরমায়েশ (Custom Weaving Commission)
                </h3>
              </div>
              <button
                onClick={() => setIsCustomOrderOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOrderSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200/50 dark:border-amber-900/30">
                <span className="text-[10px] text-amber-700 block">কারিগর ও ক্রাফট</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedProduct.titleBn}</span>
                <span className="text-slate-500 block text-[11px] mt-0.5">তাঁতি: {selectedProduct.artisanName}</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  নকশা, বুটা ও আঁচলের বিশেষ বিবরণ
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="যেমন: গাড় নীল জমিনে ময়ূরপঙ্খী বুটা, আঁচলে বিশেষ জামদানি কারুকাজ..."
                  value={customMotif}
                  onChange={(e) => setCustomMotif(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    পছন্দের জমিন রঙ (কালার কোড)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border-0 cursor-pointer"
                    />
                    <span className="font-mono text-[11px]">{customColor}</span>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    জরি স্পেসিফিকেশন
                  </label>
                  <select
                    value={customZari}
                    onChange={(e) => setCustomZari(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <option value="PURE_SILVER_ZARI">খাঁটি রূপালী জরি (Silver)</option>
                    <option value="METALLIC_GOLD_ZARI">গোল্ডেন মেটালিক জরি (Gold)</option>
                    <option value="NO_ZARI_COTTON">শুধু সুতার কাজ (No Zari)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    মোট প্রস্তাবিত মূল্য (৳)
                  </label>
                  <input
                    type="number"
                    min={3000}
                    value={customPrice}
                    onChange={(e) => setCustomPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    প্রত্যাশিত ডেলিভারি (দিন)
                  </label>
                  <input
                    type="number"
                    min={10}
                    value={customDeliveryDays}
                    onChange={(e) => setCustomDeliveryDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Escrow note */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>৫০% নিরাপদ এসক্রো জামানত:</span>
                  <span>৳{Math.round(customPrice * 0.5).toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                  অর্ডার প্লেস করার পর ৫০% অর্থ এসক্রোতে জমা থাকবে। তাঁতি বুনন শেষ করে আপনি পণ্য নিশ্চিত পেলে সম্পূর্ণ অর্থ খালাস হবে।
                </p>
              </div>

              <button
                type="submit"
                disabled={isOrdering}
                className="w-full py-3 rounded-2xl bg-amber-800 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isOrdering ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>৫০% এসক্রো সুরক্ষায় অর্ডার নিশ্চিত করুন</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
