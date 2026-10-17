'use client';

import React, { useState } from 'react';
import {
  Scale,
  PlusCircle,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Droplets,
  Layers,
  MapPin,
  Calendar,
  Sparkles,
  Award,
  Factory,
} from 'lucide-react';
import {
  useGetAllGreenLeafIntakesQuery,
  useGetAllFactoryBatchesQuery,
  useCreateGreenLeafIntakeMutation,
  useCreateFactoryBatchMutation,
  TeaGardenRegion,
  TeaProcessingType,
  TeaLeafGrade,
} from '../teaEstateApi';

interface SmallholderTeaGrowerHubViewProps {
  lang: string;
}

export const SmallholderTeaGrowerHubView: React.FC<SmallholderTeaGrowerHubViewProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  const { data: intakesData, isLoading: intakesLoading } = useGetAllGreenLeafIntakesQuery();
  const { data: batchesData, isLoading: batchesLoading } = useGetAllFactoryBatchesQuery();

  const [createIntake, { isLoading: isCreatingIntake }] = useCreateGreenLeafIntakeMutation();
  const [createBatch, { isLoading: isCreatingBatch }] = useCreateFactoryBatchMutation();

  const [activeTab, setActiveTab] = useState<'INTAKES' | 'NEW_INTAKE' | 'NEW_FACTORY_BATCH'>('INTAKES');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New Intake Form State
  const [intakeTicketNumber, setIntakeTicketNumber] = useState(`GLI-${Math.floor(1000 + Math.random() * 9000)}`);
  const [smallholderFarmerName, setSmallholderFarmerName] = useState('Md. Mizanur Rahman');
  const [farmerPhone, setFarmerPhone] = useState('+8801711223399');
  const [gardenNameOrCluster, setGardenNameOrCluster] = useState('Panchagarh Tetulia Smallholder Cooperative');
  const [region, setRegion] = useState<TeaGardenRegion>('PANCHAGARH_TERAI_FLATLAND');
  const [pluckingDate, setPluckingDate] = useState('2026-07-22');
  const [grossWeightKg, setGrossWeightKg] = useState<number>(185);
  const [tareBagWeightKg, setTareBagWeightKg] = useState<number>(5);
  const [finePluckingPercentage, setFinePluckingPercentage] = useState<number>(88);
  const [surfaceWaterDeductionKg, setSurfaceWaterDeductionKg] = useState<number>(3.5);
  const [ratePerKgBdt, setRatePerKgBdt] = useState<number>(34);

  // New Factory Batch Form State
  const [batchNumber, setBatchNumber] = useState(`MFG-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [factoryName, setFactoryName] = useState('Finlay Balisera Central Tea Factory');
  const [factoryRegion, setFactoryRegion] = useState<TeaGardenRegion>('SREEMANGAL_MOULVIBAZAR');
  const [processingType, setProcessingType] = useState<TeaProcessingType>('CTC_BLACK_TEA');
  const [greenLeafIntakeKg, setGreenLeafIntakeKg] = useState<number>(4000);
  const [witheringTroughHours, setWitheringTroughHours] = useState<number>(14.5);
  const [witheringMoistureLossPercentage, setWitheringMoistureLossPercentage] = useState<number>(11.5);
  const [rollingFrictionTempCelsius, setRollingFrictionTempCelsius] = useState<number>(28.5);
  const [fermentationTimeMinutes, setFermentationTimeMinutes] = useState<number>(75);
  const [dryerDischargeMoisturePercentage, setDryerDischargeMoisturePercentage] = useState<number>(2.8);
  const [finishedTeaYieldKg, setFinishedTeaYieldKg] = useState<number>(920);
  const [primaryGrade, setPrimaryGrade] = useState<TeaLeafGrade>('BOP');

  const intakes = intakesData?.data || [];
  const batches = batchesData?.data || [];

  const handleCreateIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createIntake({
        intakeTicketNumber,
        smallholderFarmerName,
        farmerPhone,
        farmerRegNumber: `BTB-SHT-2026-${Math.floor(100 + Math.random() * 900)}`,
        gardenNameOrCluster,
        region,
        pluckingDate,
        grossWeightKg: Number(grossWeightKg),
        tareBagWeightKg: Number(tareBagWeightKg),
        finePluckingPercentage: Number(finePluckingPercentage),
        surfaceWaterMoistureDeductionKg: Number(surfaceWaterDeductionKg),
        ratePerKgBdt: Number(ratePerKgBdt),
      }).unwrap();

      setSuccessMessage(
        isBn
          ? `কাঁচা পাতা স্লিপ ${intakeTicketNumber} সফলভাবে এন্ট্রি হয়েছে ও bKash-এ পরিশোধ অনুমোদিত হয়েছে!`
          : `Intake Ticket ${intakeTicketNumber} registered and bKash payout approved!`
      );
      setIntakeTicketNumber(`GLI-${Math.floor(1000 + Math.random() * 9000)}`);
      setActiveTab('INTAKES');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Failed to create intake ticket', err);
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBatch({
        batchNumber,
        factoryName,
        region: factoryRegion,
        processingType,
        greenLeafIntakeKg: Number(greenLeafIntakeKg),
        witheringTroughHours: Number(witheringTroughHours),
        witheringMoistureLossPercentage: Number(witheringMoistureLossPercentage),
        rollingFrictionTempCelsius: Number(rollingFrictionTempCelsius),
        fermentationTimeMinutes: Number(fermentationTimeMinutes),
        dryerDischargeMoisturePercentage: Number(dryerDischargeMoisturePercentage),
        finishedTeaYieldKg: Number(finishedTeaYieldKg),
        primaryGrade,
      }).unwrap();

      setSuccessMessage(
        isBn
          ? `কারখানা ব্যাচ ${batchNumber} সফলভাবে নিবন্ধিত হয়েছে!`
          : `Factory Batch ${batchNumber} registered successfully!`
      );
      setBatchNumber(`MFG-2026-${Math.floor(100 + Math.random() * 900)}`);
      setActiveTab('INTAKES');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Failed to create factory batch', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-emerald-900 to-amber-950 text-white py-10 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold mb-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>{isBn ? 'ক্ষুদ্র চা চাষি ও কারখানা কন্ট্রোল সেন্টার' : 'Smallholder Grower & Factory Hub'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              {isBn ? 'কাঁচা পাতা ওজন ও চা কারখানা উৎপাদন ব্যবস্থাপনা' : 'Green Leaf Intake & Factory Production Desk'}
            </h1>
            <p className="text-emerald-100/80 text-sm mt-1 max-w-2xl">
              {isBn
                ? 'ডিজিটাল হ্যাং-স্কেলে দুটি পাতা একটি কুঁড়ি অনুপাত যাচাই, পানির ওজন কর্তন এবং চা কারখানার উইদারিং/ফার্মেন্টেশন আইওটি টেলিমেট্রি লগিং।'
                : 'Log digital hang-scale weights, assess fine plucking ratios, and sync factory withering/fermentation telemetry.'}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('NEW_INTAKE')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isBn ? 'নতুন পাতা ইন্টেক' : 'New Leaf Intake'}</span>
            </button>
            <button
              onClick={() => setActiveTab('NEW_FACTORY_BATCH')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-sm"
            >
              <Factory className="w-4 h-4" />
              <span>{isBn ? 'কারখানা ব্যাচ লগ' : 'Factory Batch'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="max-w-7xl mx-auto px-4 mt-6">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex border-b border-slate-200 gap-4">
          <button
            onClick={() => setActiveTab('INTAKES')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'INTAKES'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {isBn ? 'চলমান পাতা ইন্টেক ও কারখানা ব্যাচ' : 'Active Intakes & Factory Batches'}
          </button>
          <button
            onClick={() => setActiveTab('NEW_INTAKE')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'NEW_INTAKE'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {isBn ? 'কাঁচা পাতা ওজন এন্ট্রি' : 'Green Leaf Intake Entry'}
          </button>
          <button
            onClick={() => setActiveTab('NEW_FACTORY_BATCH')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'NEW_FACTORY_BATCH'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {isBn ? 'কারখানা উৎপাদন ব্যাচ' : 'Factory Production Batch'}
          </button>
        </div>

        {/* TAB 1: INTAKES LIST & BATCHES */}
        {activeTab === 'INTAKES' && (
          <div className="mt-6 space-y-8">
            {/* GREEN LEAF TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isBn ? 'কাঁচা পাতা সরবরাহ স্লিপ ও চাষি খতিয়ান' : 'Smallholder Leaf Delivery Vouchers'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isBn
                      ? '৮৫% এর বেশি দুটি পাতা একটি কুঁড়ি সরবরাহের জন্য ৫% বোনাসসহ নিট এমএফএস পরিশোধ'
                      : 'Net payments disbursed via bKash/Nagad after surface water deductions and plucking bonuses'}
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full">
                  {intakes.length} {isBn ? 'টি স্লিপ' : 'Vouchers'}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Ticket & Date</th>
                      <th className="py-3 px-4">Farmer & Cluster</th>
                      <th className="py-3 px-4">Plucking Tier</th>
                      <th className="py-3 px-4">Gross / Net Weight</th>
                      <th className="py-3 px-4">Deductions</th>
                      <th className="py-3 px-4">Total Payout</th>
                      <th className="py-3 px-4">MFS Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {intakesLoading ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          Loading intakes...
                        </td>
                      </tr>
                    ) : (
                      intakes.map((intake) => (
                        <tr key={intake.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-xs text-slate-900">
                            {intake.intakeTicketNumber}
                            <span className="block text-[11px] font-sans font-normal text-slate-400">
                              {intake.pluckingDate}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-800">{intake.smallholderFarmerName}</span>
                            <span className="block text-xs text-slate-500 truncate max-w-[160px]">
                              {intake.gardenNameOrCluster}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-xs px-2 py-0.5 rounded font-bold ${
                                intake.pluckingStandard === 'SUPERFINE_TWO_LEAVES_AND_BUD'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {intake.finePluckingPercentage}% Two & Bud
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs">
                            <span className="font-bold text-emerald-700">{intake.netBillableLeafWeightKg} kg</span>
                            <span className="block text-slate-400">Gross: {intake.grossWeightKg} kg</span>
                          </td>
                          <td className="py-3.5 px-4 text-xs">
                            <span className="text-rose-600 font-medium">
                              -{Number(intake.surfaceWaterMoistureDeductionKg) + Number(intake.coarseLeafDeductionKg)} kg
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-amber-700">
                            ৳{intake.totalPayoutBdt.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-xs px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {intake.payoutStatus}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FACTORY BATCHES TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isBn ? 'কারখানা প্রক্রিয়াজাতকরণ ও উৎপাদন ব্যাচ' : 'Factory Manufacturing Batches'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isBn
                      ? 'উইদারিং, সিটিসি ও ড্রায়ার ডিসচার্জ মান নিয়ন্ত্রণ'
                      : 'Withering, rolling and moisture discharge tracking'}
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 bg-amber-100 text-amber-800 font-bold rounded-full">
                  {batches.length} {isBn ? 'টি ব্যাচ' : 'Batches'}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Batch & Factory</th>
                      <th className="py-3 px-4">Process & Grade</th>
                      <th className="py-3 px-4">Withering</th>
                      <th className="py-3 px-4">Rolling Heat</th>
                      <th className="py-3 px-4">Yield / Output</th>
                      <th className="py-3 px-4">Dryer Moisture</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {batchesLoading ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          Loading factory batches...
                        </td>
                      </tr>
                    ) : (
                      batches.map((batch) => (
                        <tr key={batch.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-xs text-slate-900">
                            {batch.batchNumber}
                            <span className="block text-[11px] font-sans font-normal text-slate-400">
                              {batch.factoryName}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-emerald-800 text-xs px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                              {batch.primaryGrade}
                            </span>
                            <span className="block text-xs text-slate-500 mt-1">{batch.processingType}</span>
                          </td>
                          <td className="py-3.5 px-4 text-xs">
                            <span>{batch.witheringTroughHours}h trough</span>
                            <span className="block text-slate-400">-{batch.witheringMoistureLossPercentage}% moisture</span>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-semibold text-amber-700">
                            {batch.rollingFrictionTempCelsius}°C
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {batch.finishedTeaYieldKg} kg
                            <span className="block text-[10px] text-slate-400 font-normal">
                              From {batch.greenLeafIntakeKg} kg leaf
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-xs px-2 py-0.5 rounded font-bold ${
                                batch.dryerDischargeMoisturePercentage <= 3.0
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {batch.dryerDischargeMoisturePercentage}%
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
        )}

        {/* TAB 2: NEW INTAKE FORM */}
        {activeTab === 'NEW_INTAKE' && (
          <div className="mt-6 max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {isBn ? 'নতুন কাঁচা পাতা ডেলিভারি ও হ্যাং-স্কেল এন্ট্রি' : 'Green Leaf Intake Ticket Entry'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isBn
                    ? 'দুটি পাতা একটি কুঁড়ি মান যাচাই করে তাৎক্ষণিক পেমেন্ট স্লিপ ইস্যু করুন'
                    : 'Log smallholder tea plucking tickets with automated quality calibration'}
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateIntake} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ticket Number</label>
                  <input
                    type="text"
                    value={intakeTicketNumber}
                    onChange={(e) => setIntakeTicketNumber(e.target.value)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'চাষির নাম' : 'Farmer Name'}
                  </label>
                  <input
                    type="text"
                    value={smallholderFarmerName}
                    onChange={(e) => setSmallholderFarmerName(e.target.value)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'মোবাইল' : 'Phone'}
                  </label>
                  <input
                    type="text"
                    value={farmerPhone}
                    onChange={(e) => setFarmerPhone(e.target.value)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'বাগান ক্লাস্টার / সমবায়' : 'Garden Cluster'}
                  </label>
                  <input
                    type="text"
                    value={gardenNameOrCluster}
                    onChange={(e) => setGardenNameOrCluster(e.target.value)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'অঞ্চল' : 'Region'}
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value as TeaGardenRegion)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
                  >
                    <option value="PANCHAGARH_TERAI_FLATLAND">পঞ্চগড় সমতল চা বাগান</option>
                    <option value="SREEMANGAL_MOULVIBAZAR">শ্রীমঙ্গল মৌলভীবাজার</option>
                    <option value="SYLHET_SURMA_VALLEY">সিলেট সুরমা ভ্যালি</option>
                    <option value="THAKURGAON_TERAI_FLATLAND">ঠাকুরগাঁও সমতল চা</option>
                    <option value="BANDARBAN_HILL_TRACTS">বান্দরবান পাহাড়ি চা</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'গ্রস ওজন (কেজি)' : 'Gross (kg)'}
                  </label>
                  <input
                    type="number"
                    value={grossWeightKg}
                    onChange={(e) => setGrossWeightKg(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'ব্যাগ ট্যার (কেজি)' : 'Tare Bag (kg)'}
                  </label>
                  <input
                    type="number"
                    value={tareBagWeightKg}
                    onChange={(e) => setTareBagWeightKg(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'দুটি পাতা কুঁড়ি %' : 'Two & Bud %'}
                  </label>
                  <input
                    type="number"
                    value={finePluckingPercentage}
                    onChange={(e) => setFinePluckingPercentage(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'দর (টাকা/কেজি)' : 'Rate (BDT/kg)'}
                  </label>
                  <input
                    type="number"
                    value={ratePerKgBdt}
                    onChange={(e) => setRatePerKgBdt(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('INTAKES')}
                  className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isCreatingIntake}
                  className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md transition-all"
                >
                  {isCreatingIntake
                    ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
                    : (isBn ? 'পাতা ইন্টেক নিশ্চিত করুন' : 'Confirm Intake Ticket')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: NEW FACTORY BATCH FORM */}
        {activeTab === 'NEW_FACTORY_BATCH' && (
          <div className="mt-6 max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
              <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
                <Factory className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {isBn ? 'চা কারখানা নতুন উৎপাদন ব্যাচ লগ' : 'New Tea Factory Manufacturing Batch'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isBn
                    ? 'উইদারিং, রোলিং, ফার্মেন্টেশন এবং ড্রায়ার আর্দ্রতা রেকর্ড করুন'
                    : 'Log manufacturing parameters across withering, CTC rolling, and drying'}
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateBatch} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'কারখানার নাম' : 'Factory Name'}
                  </label>
                  <input
                    type="text"
                    value={factoryName}
                    onChange={(e) => setFactoryName(e.target.value)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'প্রক্রিয়াজাতকরণ' : 'Processing Type'}
                  </label>
                  <select
                    value={processingType}
                    onChange={(e) => setProcessingType(e.target.value as TeaProcessingType)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
                  >
                    <option value="CTC_BLACK_TEA">সিটিসি ব্ল্যাক টি (CTC)</option>
                    <option value="ARTISANAL_ORTHODOX_BLACK">আর্টিসানাল অর্থোডক্স (Orthodox)</option>
                    <option value="GREEN_TEA_STEAMED_PANFIRED">গ্রিন টি (Green Tea)</option>
                    <option value="SILVER_NEEDLE_WHITE_TEA">সিলভার নিডল (White Tea)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'কাঁচা পাতা ইন্টেক (কেজি)' : 'Leaf Intake (kg)'}
                  </label>
                  <input
                    type="number"
                    value={greenLeafIntakeKg}
                    onChange={(e) => setGreenLeafIntakeKg(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'তৈরি চা ফলন (কেজি)' : 'Tea Yield (kg)'}
                  </label>
                  <input
                    type="number"
                    value={finishedTeaYieldKg}
                    onChange={(e) => setFinishedTeaYieldKg(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'উইদারিং (ঘন্টা)' : 'Withering (h)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={witheringTroughHours}
                    onChange={(e) => setWitheringTroughHours(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'রোলিং হিট (°C)' : 'Rolling (°C)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={rollingFrictionTempCelsius}
                    onChange={(e) => setRollingFrictionTempCelsius(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'ফার্মেন্টেশন (মি.)' : 'Ferment (min)'}
                  </label>
                  <input
                    type="number"
                    value={fermentationTimeMinutes}
                    onChange={(e) => setFermentationTimeMinutes(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'ড্রায়ার আর্দ্রতা %' : 'Dryer Moisture %'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={dryerDischargeMoisturePercentage}
                    onChange={(e) => setDryerDischargeMoisturePercentage(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2.5"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('INTAKES')}
                  className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isCreatingBatch}
                  className="px-6 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold shadow-md transition-all"
                >
                  {isCreatingBatch
                    ? (isBn ? 'লগ হচ্ছে...' : 'Logging...')
                    : (isBn ? 'কারখানা ব্যাচ সংরক্ষণ করুন' : 'Save Factory Batch')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
