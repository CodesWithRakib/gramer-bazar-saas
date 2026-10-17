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
  PlusCircle,
  Check,
  Eye,
  RefreshCw,
} from 'lucide-react';
import {
  useGetBuyerContractAgreementsQuery,
  useGetContractCampaignsQuery,
  useCreateContractCampaignMutation,
  useUpdateContractAgreementStatusMutation,
  useSubmitContractMilestoneInspectionMutation,
  useRecordContractHarvestDeliveryMutation,
  useSettleContractAgreementMutation,
  ContractFarmingAgreement,
  ContractCropType,
  DeliveryGrade,
  MilestoneStage,
} from '../contractFarmingApi';

export function BuyerContractFleetView({ lang = 'en' }: { lang?: string }) {
  const isBn = lang === 'bn';

  const [activeTab, setActiveTab] = useState<'AGREEMENTS' | 'CAMPAIGNS'>('AGREEMENTS');

  // Queries
  const { data: agreements = [], isLoading: loadingAgreements, refetch: refetchAgreements } =
    useGetBuyerContractAgreementsQuery();
  const { data: campaignsData, isLoading: loadingCampaigns, refetch: refetchCampaigns } =
    useGetContractCampaignsQuery();
  const campaigns = campaignsData?.items || [];

  // Mutations
  const [createCampaign, { isLoading: isCreatingCampaign }] = useCreateContractCampaignMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateContractAgreementStatusMutation();
  const [submitInspection, { isLoading: isSubmittingInspection }] =
    useSubmitContractMilestoneInspectionMutation();
  const [recordDelivery, { isLoading: isRecordingDelivery }] =
    useRecordContractHarvestDeliveryMutation();
  const [settleAgreement, { isLoading: isSettling }] = useSettleContractAgreementMutation();

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedAgreementForAction, setSelectedAgreementForAction] =
    useState<ContractFarmingAgreement | null>(null);
  const [actionModalType, setActionModalType] = useState<
    'INSPECTION' | 'DELIVERY' | 'SETTLE' | null
  >(null);

  // New Campaign Form
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newTitleBn, setNewTitleBn] = useState('');
  const [newDescEn, setNewDescEn] = useState('');
  const [newDescBn, setNewDescBn] = useState('');
  const [newBuyerName, setNewBuyerName] = useState('PRAN Agro Business Ltd.');
  const [newCropType, setNewCropType] = useState<ContractCropType>('POTATO_PROCESSING');
  const [newSeason, setNewSeason] = useState('Rabi 2026');
  const [newDistrict, setNewDistrict] = useState('Bogura');
  const [newUpazila, setNewUpazila] = useState('Shibganj');
  const [newTargetAcres, setNewTargetAcres] = useState(300);
  const [newFloorPrice, setNewFloorPrice] = useState(28.5);
  const [newAdvancePct, setNewAdvancePct] = useState(25);
  const [newYieldPerBigha, setNewYieldPerBigha] = useState(3000);
  const [newQualitySpecs, setNewQualitySpecs] = useState('Diameter > 45mm, moisture < 18%');
  const [newWarehouse, setNewWarehouse] = useState('PRAN Central Intake Weighbridge, Bogura');

  // Inspection Form
  const [milestoneStage, setMilestoneStage] = useState<MilestoneStage>('SEEDING_GERMINATION');
  const [inspectionPassed, setInspectionPassed] = useState(true);
  const [healthScore, setHealthScore] = useState(90);
  const [germinationPct, setGerminationPct] = useState(95);
  const [observations, setObservations] = useState('Normal uniform germination observed across the plot.');
  const [recommendations, setRecommendations] = useState('Apply micronutrients at 25 days interval.');

  // Delivery Form
  const [grossWeight, setGrossWeight] = useState<number>(5400);
  const [tareWeight, setTareWeight] = useState<number>(2100);
  const [deliveryGrade, setDeliveryGrade] = useState<DeliveryGrade>('GRADE_A');
  const [moisturePct, setMoisturePct] = useState<number>(14.5);
  const [operatorName, setOperatorName] = useState<string>('Station Officer Tariq');

  const handleCreateCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCampaign({
        buyerCompanyName: newBuyerName,
        titleEn: newTitleEn,
        titleBn: newTitleBn,
        descriptionEn: newDescEn,
        descriptionBn: newDescBn,
        cropType: newCropType,
        targetSeason: newSeason,
        targetDistrict: newDistrict,
        targetUpazila: newUpazila,
        targetTotalAcres: Number(newTargetAcres),
        guaranteedFloorPricePerKg: Number(newFloorPrice),
        advanceInputCashPct: Number(newAdvancePct),
        estimatedYieldPerBighaKg: Number(newYieldPerBigha),
        qualityStandardSpecs: newQualitySpecs,
        intakeDropWarehouseName: newWarehouse,
      }).unwrap();

      setShowCreateModal(false);
      refetchCampaigns();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to create campaign');
    }
  };

  const handleApproveAgreement = async (agreement: ContractFarmingAgreement) => {
    try {
      await updateStatus({
        id: agreement.id,
        body: { status: 'ACTIVE_PLANTED' },
      }).unwrap();
      refetchAgreements();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to approve agreement');
    }
  };

  const handleInspectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgreementForAction) return;

    try {
      await submitInspection({
        agreementId: selectedAgreementForAction.id,
        body: {
          milestoneStage,
          isPassed: inspectionPassed,
          cropHealthScore: Number(healthScore),
          germinationRatePct: Number(germinationPct),
          growthObservations: observations,
          recommendations,
        },
      }).unwrap();

      setActionModalType(null);
      setSelectedAgreementForAction(null);
      refetchAgreements();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to submit inspection');
    }
  };

  const handleDeliverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgreementForAction) return;

    try {
      await recordDelivery({
        agreementId: selectedAgreementForAction.id,
        body: {
          grossWeightKg: Number(grossWeight),
          tareWeightKg: Number(tareWeight),
          acceptedGrade: deliveryGrade,
          qualityMoisturePct: Number(moisturePct),
          weighbridgeOperatorName: operatorName,
        },
      }).unwrap();

      setActionModalType(null);
      setSelectedAgreementForAction(null);
      refetchAgreements();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to record delivery');
    }
  };

  const handleSettleSubmit = async () => {
    if (!selectedAgreementForAction) return;
    try {
      await settleAgreement({
        id: selectedAgreementForAction.id,
        settlementNotes: 'Final weighbridge balance wired to farmer payout account.',
      }).unwrap();

      setActionModalType(null);
      setSelectedAgreementForAction(null);
      refetchAgreements();
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to settle agreement');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800">
                {isBn ? 'কর্পোরেট বায়ার কন্ট্রোল সেন্টার' : 'Corporate Buyer Control Center'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
              {isBn ? 'চুক্তিভিত্তিক চাষাবাদ ও সংগ্রহবহর পরিচালনা' : 'Contract Farming & Procurement Fleet'}
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              {isBn
                ? 'বাইব্যাক ক্যাম্পেইন চালু করুন, কৃষকদের চুক্তি অনুমোদন দিন, মাঠ পরিদর্শন অডিট ও ডিজিটাল ওয়েইব্রিজ পরিচালনা করুন।'
                : 'Manage procurement campaigns, disburse advance capital, conduct agronomy milestone inspections, and record weighbridge vouchers.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition"
            >
              <PlusCircle className="w-4 h-4" />
              {isBn ? 'নতুন বাইব্যাক ক্যাম্পেইন খুলুন' : 'Launch New Campaign'}
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('AGREEMENTS')}
            className={`px-5 py-3 text-xs md:text-sm font-semibold border-b-2 transition ${
              activeTab === 'AGREEMENTS'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {isBn ? 'চুক্তিভুক্ত কৃষক ও আবেদনসমূহ' : 'Enrolled Farmer Fleet'} ({agreements.length})
          </button>
          <button
            onClick={() => setActiveTab('CAMPAIGNS')}
            className={`px-5 py-3 text-xs md:text-sm font-semibold border-b-2 transition ${
              activeTab === 'CAMPAIGNS'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {isBn ? 'আমার বাইব্যাক ক্যাম্পেইনসমূহ' : 'My Procurement Campaigns'} ({campaigns.length})
          </button>
        </div>

        {/* Tab 1: Agreements Fleet */}
        {activeTab === 'AGREEMENTS' && (
          <div className="space-y-4">
            {loadingAgreements ? (
              <div className="py-20 text-center">
                <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500">
                  {isBn ? 'কৃষকদের চুক্তি লোড হচ্ছে...' : 'Loading fleet agreements...'}
                </p>
              </div>
            ) : agreements.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8">
                <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isBn ? 'এখনো কোনো কৃষক আবেদন জমা পড়েনি' : 'No Farmer Agreements Enrolled Yet'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  {isBn
                    ? 'কৃষকদের আবেদন শুরু হলে এখানে তাদের তালিকা ও অগ্রিম ইনপুট মূলধন ছাড়ের অপশন দেখতে পাবেন।'
                    : 'When farmers enroll into your campaigns, applications and intake tools will appear here.'}
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-4">{isBn ? 'চুক্তি নং' : 'Agreement #'}</th>
                        <th className="p-4">{isBn ? 'কৃষক ও ফোন' : 'Farmer & Phone'}</th>
                        <th className="p-4">{isBn ? 'জমি ও ফলন' : 'Area & Yield'}</th>
                        <th className="p-4">{isBn ? 'চুক্তি মূল্য' : 'Agreement Value'}</th>
                        <th className="p-4">{isBn ? 'অগ্রিম ক্যাশ' : 'Advance Paid'}</th>
                        <th className="p-4">{isBn ? 'সরবরাহকৃত' : 'Delivered'}</th>
                        <th className="p-4">{isBn ? 'অবস্থা' : 'Status'}</th>
                        <th className="p-4 text-right">{isBn ? 'ব্যবস্থা গ্রহণ' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {agreements.map((agr) => (
                        <tr key={agr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                          <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                            {agr.agreementNumber}
                          </td>
                          <td className="p-4">
                            <p className="font-semibold text-slate-900 dark:text-white">{agr.farmerName}</p>
                            <p className="text-[11px] text-slate-500">{agr.farmerPhone}</p>
                            <p className="text-[10px] text-slate-400">
                              {agr.plotDistrict}, {agr.plotUpazila}
                            </p>
                          </td>
                          <td className="p-4">
                            <span className="font-bold">{agr.landAreaBighas} Bighas</span>
                            <p className="text-[11px] text-slate-500">
                              {Number(agr.committedEstProductionKg).toLocaleString()} kg
                            </p>
                          </td>
                          <td className="p-4 font-bold text-emerald-600">
                            ৳{Number(agr.totalEstAgreementValue).toLocaleString()}
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-amber-500">
                              ৳{Number(agr.advanceWorkingCapitalDisbursed).toLocaleString()}
                            </span>
                            <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                              {agr.farmerPayoutMfsOrBank}
                            </p>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {Number(agr.deliveredTotalKg).toLocaleString()} kg
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800">
                              {agr.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-1">
                            {agr.status === 'APPLIED' && (
                              <button
                                onClick={() => handleApproveAgreement(agr)}
                                disabled={isUpdatingStatus}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold"
                              >
                                {isBn ? 'অনুমোদন ও ২৫% অগ্রিম' : 'Approve & 25% Advance'}
                              </button>
                            )}

                            {['APPROVED', 'ACTIVE_PLANTED', 'MILESTONES_VERIFIED'].includes(
                              agr.status
                            ) && (
                              <button
                                onClick={() => {
                                  setSelectedAgreementForAction(agr);
                                  setActionModalType('INSPECTION');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-semibold"
                              >
                                {isBn ? 'মাঠ পরিদর্শন' : 'Audit'}
                              </button>
                            )}

                            {['ACTIVE_PLANTED', 'MILESTONES_VERIFIED', 'DELIVERING'].includes(
                              agr.status
                            ) && (
                              <button
                                onClick={() => {
                                  setSelectedAgreementForAction(agr);
                                  setActionModalType('DELIVERY');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold"
                              >
                                {isBn ? 'ওয়েইব্রিজ ভাউচার' : 'Weighbridge Slip'}
                              </button>
                            )}

                            {agr.status === 'DELIVERING' && (
                              <button
                                onClick={() => {
                                  setSelectedAgreementForAction(agr);
                                  setActionModalType('SETTLE');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold"
                              >
                                {isBn ? 'চূড়ান্ত নিষ্পত্তি' : 'Final Settle'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Campaigns List */}
        {activeTab === 'CAMPAIGNS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="font-mono text-xs text-slate-400">{camp.campaignCode}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {camp.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {isBn ? camp.titleBn : camp.titleEn}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 mb-3">
                  <div>
                    <span className="text-slate-400">{isBn ? 'ফ্লোর প্রাইস' : 'Floor Price'}:</span>
                    <p className="font-bold">৳{camp.guaranteedFloorPricePerKg}/kg</p>
                  </div>
                  <div>
                    <span className="text-slate-400">{isBn ? 'অগ্রিম ইনপুট' : 'Advance'}:</span>
                    <p className="font-bold text-emerald-600">{camp.advanceInputCashPct}%</p>
                  </div>
                  <div>
                    <span className="text-slate-400">{isBn ? 'নির্ধারিত এলাকা' : 'District'}:</span>
                    <p className="font-medium">{camp.targetDistrict}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">{isBn ? 'চুক্তিভুক্ত একর' : 'Enrolled'}:</span>
                    <p className="font-bold">
                      {camp.currentEnrolledAcres} / {camp.targetTotalAcres} Acres
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {isBn ? 'ওয়্যারহাউস: ' : 'Hub: '}
                  {camp.intakeDropWarehouseName}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Create Campaign */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                {isBn ? 'নতুন চুক্তিভিত্তিক চাষাবাদ ক্যাম্পেইন খুলুন' : 'Launch New Contract Farming Campaign'}
              </h3>
              <form onSubmit={handleCreateCampaignSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">
                    {isBn ? 'বায়ার প্রতিষ্ঠানের নাম *' : 'Buyer Company Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newBuyerName}
                    onChange={(e) => setNewBuyerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Title (English) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Export Potato Buyback Campaign 2026"
                      value={newTitleEn}
                      onChange={(e) => setNewTitleEn(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">শিরোনাম (বাংলা) *</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: লেডি রোসেটা আলু ক্রয় চুক্তি ২০২৬"
                      value={newTitleBn}
                      onChange={(e) => setNewTitleBn(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Crop Type</label>
                    <select
                      value={newCropType}
                      onChange={(e) => setNewCropType(e.target.value as ContractCropType)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="POTATO_PROCESSING">Processing Potato</option>
                      <option value="CHINIGURA_AROMATIC_RICE">Chinigura Rice</option>
                      <option value="TOMATO_PROCESSING">Roma Tomato</option>
                      <option value="MAIZE_POULTRY_FEED">Feed Maize</option>
                      <option value="CHILI_SPICE_PROCESSING">Chili Spice</option>
                      <option value="MUSTARD_OIL_SEED">Mustard Seed</option>
                      <option value="ORGANIC_VEGETABLES">Organic Vegetables</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Target Season</label>
                    <input
                      type="text"
                      value={newSeason}
                      onChange={(e) => setNewSeason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Target District</label>
                    <input
                      type="text"
                      value={newDistrict}
                      onChange={(e) => setNewDistrict(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Floor Price (৳/kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newFloorPrice}
                      onChange={(e) => setNewFloorPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Advance (%)</label>
                    <input
                      type="number"
                      value={newAdvancePct}
                      onChange={(e) => setNewAdvancePct(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Target Acres</label>
                    <input
                      type="number"
                      value={newTargetAcres}
                      onChange={(e) => setNewTargetAcres(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Yield/Bigha (kg)</label>
                    <input
                      type="number"
                      value={newYieldPerBigha}
                      onChange={(e) => setNewYieldPerBigha(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Intake Weighbridge Hub Name *</label>
                  <input
                    type="text"
                    required
                    value={newWarehouse}
                    onChange={(e) => setNewWarehouse(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Quality Specifications *</label>
                  <input
                    type="text"
                    required
                    value={newQualitySpecs}
                    onChange={(e) => setNewQualitySpecs(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingCampaign}
                    className="px-6 py-2 rounded-xl bg-emerald-600 text-white font-semibold"
                  >
                    {isCreatingCampaign ? 'Publishing...' : 'Launch Campaign'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Field Milestone Inspection */}
        {actionModalType === 'INSPECTION' && selectedAgreementForAction && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {isBn ? 'মাঠ পরিদর্শন অডিট সাবমিট করুন' : 'Submit Agronomy Milestone Audit'}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Agreement #{selectedAgreementForAction.agreementNumber} ({selectedAgreementForAction.farmerName})
              </p>

              <form onSubmit={handleInspectionSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Milestone Stage</label>
                  <select
                    value={milestoneStage}
                    onChange={(e) => setMilestoneStage(e.target.value as MilestoneStage)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="SEEDING_GERMINATION">Seeding & Germination</option>
                    <option value="FLOWERING_VEGETATIVE">Flowering & Vegetative Growth</option>
                    <option value="PRE_HARVEST_MATURITY">Pre-Harvest Maturity & Moisture</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Crop Health Score (1-100)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={healthScore}
                      onChange={(e) => setHealthScore(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Germination Rate (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={germinationPct}
                      onChange={(e) => setGerminationPct(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Observations</label>
                  <textarea
                    rows={2}
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setActionModalType(null);
                      setSelectedAgreementForAction(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingInspection}
                    className="px-6 py-2 rounded-xl bg-teal-600 text-white font-semibold"
                  >
                    {isSubmittingInspection ? 'Submitting...' : 'Save Audit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Weighbridge Delivery Voucher */}
        {actionModalType === 'DELIVERY' && selectedAgreementForAction && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {isBn ? 'ডিজিটাল ওয়েইব্রিজ চালান রেকর্ড করুন' : 'Generate Weighbridge Intake Slip'}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Agreement #{selectedAgreementForAction.agreementNumber} (Floor ৳
                {selectedAgreementForAction.floorPricePerKg}/kg)
              </p>

              <form onSubmit={handleDeliverySubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Gross Weight (kg) *</label>
                    <input
                      type="number"
                      required
                      value={grossWeight}
                      onChange={(e) => setGrossWeight(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Tare Weight (kg) *</label>
                    <input
                      type="number"
                      required
                      value={tareWeight}
                      onChange={(e) => setTareWeight(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                </div>

                {/* Net weight preview */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex justify-between font-bold">
                  <span>Calculated Net Cargo:</span>
                  <span className="text-emerald-600">{Math.max(0, grossWeight - tareWeight)} kg</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Quality Grade</label>
                    <select
                      value={deliveryGrade}
                      onChange={(e) => setDeliveryGrade(e.target.value as DeliveryGrade)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    >
                      <option value="GRADE_A">Grade A (+10% Bonus)</option>
                      <option value="GRADE_B">Grade B (Standard 100%)</option>
                      <option value="GRADE_C">Grade C (-15% Deduction)</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Moisture (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={moisturePct}
                      onChange={(e) => setMoisturePct(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Weighbridge Operator Name</label>
                  <input
                    type="text"
                    required
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setActionModalType(null);
                      setSelectedAgreementForAction(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isRecordingDelivery}
                    className="px-6 py-2 rounded-xl bg-amber-600 text-white font-semibold"
                  >
                    {isRecordingDelivery ? 'Generating...' : 'Record Voucher'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Final Escrow Settlement */}
        {actionModalType === 'SETTLE' && selectedAgreementForAction && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-center">
              <Coins className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {isBn ? 'চূড়ান্ত এসক্রো নিষ্পত্তি' : 'Final Escrow Settlement'}
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Are you sure you want to finalize settlement for Agreement #
                {selectedAgreementForAction.agreementNumber}? Remaining balance of ৳
                {Number(selectedAgreementForAction.balancePayable).toLocaleString()} will be marked paid to{' '}
                {selectedAgreementForAction.farmerPayoutMfsOrBank}.
              </p>

              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActionModalType(null);
                    setSelectedAgreementForAction(null);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSettleSubmit}
                  disabled={isSettling}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  {isSettling ? 'Settling...' : 'Confirm Final Settlement'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
