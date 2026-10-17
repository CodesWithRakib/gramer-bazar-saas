'use client';

import React, { useState } from 'react';
import {
  Gavel,
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Award,
  Layers,
  PlusCircle,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import {
  useGetTeaOverviewStatsQuery,
  useGetAllAuctionLotsQuery,
  useGetAllGreenLeafIntakesQuery,
  useCreateAuctionLotMutation,
  AuctionCenter,
  TeaProcessingType,
  TeaLeafGrade,
} from '../teaEstateApi';

interface AdminTeaBoardAuctionHubViewProps {
  lang: string;
}

export const AdminTeaBoardAuctionHubView: React.FC<AdminTeaBoardAuctionHubViewProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  const { data: statsData, isLoading: statsLoading } = useGetTeaOverviewStatsQuery();
  const { data: auctionData, isLoading: auctionLoading } = useGetAllAuctionLotsQuery();
  const { data: intakesData, isLoading: intakesLoading } = useGetAllGreenLeafIntakesQuery();

  const [createLot, { isLoading: isCreatingLot }] = useCreateAuctionLotMutation();

  const [showLotModal, setShowLotModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New Lot Form State
  const [lotNumber, setLotNumber] = useState(`AUC-LOT-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [gardenMark, setGardenMark] = useState('Finlay Balisera Estate');
  const [auctionCenter, setAuctionCenter] = useState<AuctionCenter>('CHITTAGONG_TEA_AUCTION');
  const [saleNumber, setSaleNumber] = useState<number>(24);
  const [processingType, setProcessingType] = useState<TeaProcessingType>('CTC_BLACK_TEA');
  const [grade, setGrade] = useState<TeaLeafGrade>('BOP');
  const [packageCount, setPackageCount] = useState<number>(40);
  const [netWeightKg, setNetWeightKg] = useState<number>(2000);
  const [reservePricePerKg, setReservePricePerKg] = useState<number>(280);
  const [brightnessScore, setBrightnessScore] = useState<number>(8.8);
  const [brisknessScore, setBrisknessScore] = useState<number>(9.0);
  const [tasterFlavorNotes, setTasterFlavorNotes] = useState('Rich malty body with bright amber infusion, brisk finish');

  const stats = statsData?.data;
  const auctionLots = auctionData?.data || [];
  const intakes = intakesData?.data || [];

  const handleCreateLot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLot({
        lotNumber,
        gardenMark,
        auctionCenter,
        saleNumber: Number(saleNumber),
        processingType,
        grade,
        packageCountBagsOrChests: Number(packageCount),
        netWeightKg: Number(netWeightKg),
        reservePricePerKgBdt: Number(reservePricePerKg),
        tasterScoreBrightness: Number(brightnessScore),
        tasterScoreBriskness: Number(brisknessScore),
        tasterFlavorNotes,
      }).unwrap();

      setSuccessMessage(
        isBn
          ? `নিলাম লট ${lotNumber} সফলভাবে ক্যাটালগভুক্ত হয়েছে!`
          : `Auction Lot ${lotNumber} catalogued successfully!`
      );
      setShowLotModal(false);
      setLotNumber(`AUC-LOT-2026-${Math.floor(100 + Math.random() * 900)}`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Failed to create auction lot', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                {isBn
                  ? 'বাংলাদেশ চা বোর্ড ও ডিজিটাল নিলাম গভর্ন্যান্স ডেস্ক'
                  : 'Bangladesh Tea Board & Digital Auction Governance'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              {isBn
                ? 'চা বাগান নিলাম ক্যাটালগ ও ক্ষুদ্র চাষি ন্যায্যমূল্য অডিট'
                : 'National Tea Auction Desk & Smallholder Price Audit'}
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              {isBn
                ? 'চট্টগ্রাম ও শ্রীমঙ্গল নিলাম কেন্দ্রের লট ক্যাটালগিং, ব্রোকার বিডিং তদারকি এবং ক্ষুদ্র চা চাষিদের ন্যায্যমূল্য নিশ্চিতকরণ।'
                : 'Supervise Chittagong & Sreemangal auction sales, monitor tea taster organoleptic scores, and audit smallholder leaf price compliance.'}
            </p>
          </div>

          <div>
            <button
              onClick={() => setShowLotModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isBn ? 'নতুন নিলাম লট ক্যাটালগ' : 'Catalogue Auction Lot'}</span>
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

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
              <Gavel className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">
                {isBn ? 'সক্রিয় নিলাম লট' : 'Active Auction Lots'}
              </span>
              <span className="text-xl font-extrabold text-slate-900">
                {statsLoading ? '...' : `${stats?.activeLotsCount || 2} টি`}
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">
                {isBn ? 'মোট নিলাম ওজন' : 'Total Auction Tea'}
              </span>
              <span className="text-xl font-extrabold text-amber-700">
                {statsLoading ? '...' : `${stats?.totalAuctionKg?.toLocaleString() || '5,500'} kg`}
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-teal-100 text-teal-800 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">
                {isBn ? 'গড় কাপ কোয়ালিটি' : 'Avg Cup Score'}
              </span>
              <span className="text-xl font-extrabold text-teal-700">
                {statsLoading ? '...' : `${stats?.averageCupScore || 9.1} / 10`}
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-800 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">
                {isBn ? 'চা বোর্ড বেঞ্চমার্ক রেট' : 'BTB Benchmark Price'}
              </span>
              <span className="text-xl font-extrabold text-indigo-700">৳34.0 / kg</span>
            </div>
          </div>
        </div>

        {/* SECTION 1: DIGITAL AUCTION LOTS MONITOR */}
        <div className="mt-10 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isBn ? 'জাতীয় চা নিলাম লট ও ব্রোকার বিডিং রেজিস্টার' : 'National Tea Auction Lots & Bidding Register'}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn
                  ? 'চট্টগ্রাম ও শ্রীমঙ্গলের সক্রিয় লট, সর্বোচ্চ বিড ও টেস্টার স্কোর পর্যবেক্ষণ'
                  : 'Real-time broker bidding desk across Chittagong and Sreemangal tea auctions'}
              </p>
            </div>
            <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full">
              {auctionLots.length} {isBn ? 'টি লট' : 'Lots'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Lot Number</th>
                  <th className="py-3 px-4">Garden Mark</th>
                  <th className="py-3 px-4">Center & Sale</th>
                  <th className="py-3 px-4">Grade</th>
                  <th className="py-3 px-4">Net Weight</th>
                  <th className="py-3 px-4">Reserve / High Bid</th>
                  <th className="py-3 px-4">Winning Broker</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {auctionLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Loading lots...
                    </td>
                  </tr>
                ) : (
                  auctionLots.map((lot) => (
                    <tr key={lot.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-slate-900">
                        {lot.lotNumber}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {lot.gardenMark}
                        <span className="block text-[11px] text-slate-400">{lot.tasterFlavorNotes}</span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {lot.auctionCenter}
                        <span className="block text-slate-400">Sale {lot.saleNumber}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {lot.grade}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {lot.netWeightKg} kg
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {lot.packageCountBagsOrChests} chests
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-amber-700">৳{lot.currentHighBidBdt}/kg</span>
                        <span className="block text-[10px] text-slate-400">Res: ৳{lot.reservePricePerKgBdt}</span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-800">
                        {lot.winningBrokerName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                            lot.auctionStatus === 'ACTIVE_BIDDING'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {lot.auctionStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 2: SMALLHOLDER LEAF INTAKE AUDIT DESK */}
        <div className="mt-10 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isBn ? 'ক্ষুদ্র চা চাষি মূল্য ও মান অডিট রেজিস্টার' : 'Smallholder Leaf Price & Quality Audit Desk'}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn
                  ? 'কারখানা কর্তৃক চাষিদের যথাযথ মূল্য পরিশোধ ও অতিরিক্ত কর্তন রোধে চা বোর্ডের নজরদারি'
                  : 'Monitoring factory leaf intake tickets to prevent unauthorized water weight deductions'}
              </p>
            </div>
            <span className="text-xs px-3 py-1 bg-amber-100 text-amber-800 font-bold rounded-full">
              {intakes.length} {isBn ? 'টি অডিট টিকিট' : 'Audit Tickets'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Farmer & Reg</th>
                  <th className="py-3 px-4">Cluster / Region</th>
                  <th className="py-3 px-4">Fine Pluck %</th>
                  <th className="py-3 px-4">Net Billable Leaf</th>
                  <th className="py-3 px-4">Rate & Payout</th>
                  <th className="py-3 px-4">Inspector</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {intakesLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Loading audit tickets...
                    </td>
                  </tr>
                ) : (
                  intakes.map((intake) => (
                    <tr key={intake.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-slate-900">
                        {intake.intakeTicketNumber}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-800">
                        {intake.smallholderFarmerName}
                        <span className="block font-mono text-[10px] text-slate-400">
                          {intake.farmerRegNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {intake.gardenNameOrCluster}
                        <span className="block text-[11px] text-slate-400">{intake.region}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">
                        {intake.finePluckingPercentage}%
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {intake.netBillableLeafWeightKg} kg
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-amber-700">৳{intake.totalPayoutBdt}</span>
                        <span className="block text-[10px] text-slate-400">৳{intake.ratePerKgBdt}/kg</span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {intake.btbInspectorName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
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
      </div>

      {/* CATALOG AUCTION LOT MODAL */}
      {showLotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">
                {isBn ? 'নতুন চা নিলাম লট ক্যাটালগ করুন' : 'Catalogue New Tea Auction Lot'}
              </h3>
              <button
                onClick={() => setShowLotModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLot} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lot Number</label>
                  <input
                    type="text"
                    value={lotNumber}
                    onChange={(e) => setLotNumber(e.target.value)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'চা বাগানের মার্ক' : 'Garden Mark'}
                  </label>
                  <input
                    type="text"
                    value={gardenMark}
                    onChange={(e) => setGardenMark(e.target.value)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'নিলাম কেন্দ্র' : 'Auction Center'}
                  </label>
                  <select
                    value={auctionCenter}
                    onChange={(e) => setAuctionCenter(e.target.value as AuctionCenter)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2"
                  >
                    <option value="CHITTAGONG_TEA_AUCTION">চট্টগ্রাম নিলাম কেন্দ্র</option>
                    <option value="SREEMANGAL_TEA_AUCTION">শ্রীমঙ্গল আঞ্চলিক নিলাম</option>
                    <option value="PANCHAGARH_AUCTION_DESK">পঞ্চগড় সমতল নিলাম ডেস্ক</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'প্রক্রিয়া' : 'Processing'}
                  </label>
                  <select
                    value={processingType}
                    onChange={(e) => setProcessingType(e.target.value as TeaProcessingType)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2"
                  >
                    <option value="CTC_BLACK_TEA">CTC Black Tea</option>
                    <option value="ARTISANAL_ORTHODOX_BLACK">Artisanal Orthodox</option>
                    <option value="GREEN_TEA_STEAMED_PANFIRED">Green Tea</option>
                    <option value="SILVER_NEEDLE_WHITE_TEA">Silver Needle White</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'গ্রেড' : 'Grade'}
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value as TeaLeafGrade)}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2"
                  >
                    <option value="BOP">BOP</option>
                    <option value="OF">OF</option>
                    <option value="FTGFOP1">FTGFOP1</option>
                    <option value="TGFOP">TGFOP</option>
                    <option value="SPECIALTY_SILVER_TIPS">Specialty Silver Tips</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'প্যাকেজ সংখ্যা' : 'Packages (Chests/Bags)'}
                  </label>
                  <input
                    type="number"
                    value={packageCount}
                    onChange={(e) => setPackageCount(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'নেট ওজন (কেজি)' : 'Net Weight (kg)'}
                  </label>
                  <input
                    type="number"
                    value={netWeightKg}
                    onChange={(e) => setNetWeightKg(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'রিজার্ভ দর (টাকা/কেজি)' : 'Reserve (BDT/kg)'}
                  </label>
                  <input
                    type="number"
                    value={reservePricePerKg}
                    onChange={(e) => setReservePricePerKg(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border-slate-300 border p-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isBn ? 'টেস্টার ফ্লেভার নোটস' : 'Taster Flavor Notes'}
                </label>
                <input
                  type="text"
                  value={tasterFlavorNotes}
                  onChange={(e) => setTasterFlavorNotes(e.target.value)}
                  className="w-full text-sm rounded-lg border-slate-300 border p-2"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLotModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isCreatingLot}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all"
                >
                  {isCreatingLot
                    ? (isBn ? 'ক্যাটালগ হচ্ছে...' : 'Saving...')
                    : (isBn ? 'নিলাম লট প্রকাশ করুন' : 'Publish Auction Lot')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
