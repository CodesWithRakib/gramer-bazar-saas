'use client';

import React, { useState } from 'react';
import {
  Trees,
  PlusCircle,
  Scale,
  Coins,
  ShieldCheck,
  Calendar,
  Layers,
  MapPin,
  Truck,
  CheckCircle2,
  AlertCircle,
  Award,
} from 'lucide-react';
import {
  useGetOrchardAuctionLotsQuery,
  useCreateOrchardAuctionLotMutation,
  useCreateOrchardDispatchMutation,
  FruitType,
  OrchardRegion,
  FruitCultivar,
  FruitBaggingStatus,
  PackagingType,
  DispatchGradingQuality,
} from '../orchardAuctionApi';

export const GrowerOrchardHarvestHubView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'lots' | 'create_lot' | 'create_dispatch'>('lots');

  const { data: lots = [], isLoading: lotsLoading } = useGetOrchardAuctionLotsQuery();

  // Create Lot State
  const [orchardName, setOrchardName] = useState('');
  const [growerName, setGrowerName] = useState('Haji Shamsul Alam');
  const [growerPhone, setGrowerPhone] = useState('+8801711223344');
  const [region, setRegion] = useState<OrchardRegion>('CHAPAINAWABGANJ_SHIBGANJ');
  const [mouzaPlotNumber, setMouzaPlotNumber] = useState('');
  const [fruitType, setFruitType] = useState<FruitType>('MANGO');
  const [cultivar, setCultivar] = useState<FruitCultivar>('KHIRSAPAT_HIMSAGAR');
  const [isGiCertified, setIsGiCertified] = useState(true);
  const [giRegistrationNumber, setGiRegistrationNumber] = useState('BD-GI-003-KHIRSAPAT');
  const [totalTrees, setTotalTrees] = useState(80);
  const [estimatedYieldKg, setEstimatedYieldKg] = useState(9600);
  const [treeAgeYears, setTreeAgeYears] = useState(18);
  const [floweringFruitSetPct, setFloweringFruitSetPct] = useState(85);
  const [fruitBaggingStatus, setFruitBaggingStatus] =
    useState<FruitBaggingStatus>('BAG_PROTECTED');
  const [baggedFruitsCount, setBaggedFruitsCount] = useState(25000);
  const [baseReservePriceBdt, setBaseReservePriceBdt] = useState(1150000);
  const [expectedHarvestStartDate, setExpectedHarvestStartDate] = useState('2026-06-10');
  const [createLotMessage, setCreateLotMessage] = useState('');

  const [createLot, { isLoading: isCreatingLot }] = useCreateOrchardAuctionLotMutation();

  // Create Dispatch State
  const [dispOrchardLotId, setDispOrchardLotId] = useState('');
  const [dispFruitType, setDispFruitType] = useState<FruitType>('MANGO');
  const [dispCultivar, setDispCultivar] = useState<FruitCultivar>('KHIRSAPAT_HIMSAGAR');
  const [dispWeightKg, setDispWeightKg] = useState(1500);
  const [dispCratesCount, setDispCratesCount] = useState(300);
  const [dispPackaging, setDispPackaging] = useState<PackagingType>('CORRUGATED_5KG_VENTILATED');
  const [dispBrix, setDispBrix] = useState(18.5);
  const [dispGrading, setDispGrading] = useState<DispatchGradingQuality>('EXPORT_GRADE_SUPERIOR');
  const [dispPlate, setDispPlate] = useState('DHAKA-METRO-TA-14-9912');
  const [dispSetpoint, setDispSetpoint] = useState(11.0);
  const [dispCurrentTemp, setDispCurrentTemp] = useState(11.2);
  const [dispCurrentHumidity, setDispCurrentHumidity] = useState(88.0);
  const [dispOrigin, setDispOrigin] = useState('Shibganj Chilling Point, Chapainawabganj');
  const [dispDestination, setDispDestination] = useState('Central Packing House, Shyampur, Dhaka');
  const [dispatchMessage, setDispatchMessage] = useState('');

  const [createDispatch, { isLoading: isCreatingDispatch }] = useCreateOrchardDispatchMutation();

  const handleCreateLotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreateLotMessage('');
      await createLot({
        orchardName,
        growerName,
        growerPhone,
        region,
        mouzaPlotNumber,
        fruitType,
        cultivar,
        isGiCertified,
        giRegistrationNumber: isGiCertified ? giRegistrationNumber : undefined,
        totalTrees: Number(totalTrees),
        estimatedYieldKg: Number(estimatedYieldKg),
        treeAgeYears: Number(treeAgeYears),
        floweringFruitSetPct: Number(floweringFruitSetPct),
        fruitBaggingStatus,
        baggedFruitsCount: Number(baggedFruitsCount),
        baseReservePriceBdt: Number(baseReservePriceBdt),
        expectedHarvestStartDate: new Date(expectedHarvestStartDate).toISOString(),
      }).unwrap();

      setCreateLotMessage('Orchard pre-harvest auction lot created successfully!');
      setTimeout(() => {
        setCreateLotMessage('');
        setActiveTab('lots');
      }, 1500);
    } catch (err: any) {
      setCreateLotMessage(err?.data?.message || 'Failed to create auction lot.');
    }
  };

  const handleCreateDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setDispatchMessage('');
      await createDispatch({
        orchardLotId: dispOrchardLotId || undefined,
        fruitType: dispFruitType,
        cultivar: dispCultivar,
        dispatchWeightKg: Number(dispWeightKg),
        cratesCount: Number(dispCratesCount),
        packagingType: dispPackaging,
        brixSugarDegree: Number(dispBrix),
        gradingQuality: dispGrading,
        reeferVanPlateNumber: dispPlate,
        reeferSetpointCelsius: Number(dispSetpoint),
        currentTransitTempCelsius: Number(dispCurrentTemp),
        currentTransitHumidityPct: Number(dispCurrentHumidity),
        originHub: dispOrigin,
        destinationMarket: dispDestination,
      }).unwrap();

      setDispatchMessage('Refrigerated harvest dispatch initiated successfully!');
      setTimeout(() => {
        setDispatchMessage('');
        setActiveTab('lots');
      }, 1500);
    } catch (err: any) {
      setDispatchMessage(err?.data?.message || 'Failed to create dispatch.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Header */}
      <div className="bg-emerald-900 text-white py-10 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold mb-2">
              <Trees className="w-3.5 h-3.5" /> Grower Orchardist Cockpit
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              চাষি ও বাগান মালিক পোর্টাল (প্রি-হার্ভেস্ট এগ্রিমেন্ট)
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
              List tree-count blocks for pre-harvest bidding, log double-layer fruit bagging, and track 3-tranche forward escrow disbursements.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('create_lot')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-xs rounded-lg transition shadow-sm inline-flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              List New Tree Block
            </button>
            <button
              onClick={() => setActiveTab('create_dispatch')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-lg transition border border-white/20 inline-flex items-center gap-2"
            >
              <Truck className="w-4 h-4" />
              Dispatch Harvest Reefer
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('lots')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'lots'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            My Orchard Tree Contracts ({lots.length})
          </button>
          <button
            onClick={() => setActiveTab('create_lot')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'create_lot'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            List New Tree Block (গাছ নিলাম অন্তর্ভুক্তি)
          </button>
          <button
            onClick={() => setActiveTab('create_dispatch')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'create_dispatch'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            Harvest Reefer Dispatch (ফ্রিজিং পরিবহন চালান)
          </button>
        </div>

        {/* Tab 1: Lots List */}
        {activeTab === 'lots' && (
          <div className="mt-6 space-y-4">
            {lotsLoading ? (
              <div className="text-center py-12 text-slate-500 text-sm">Loading orchard lots...</div>
            ) : lots.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                No orchard tree blocks listed yet. Click "List New Tree Block" to start pre-harvest forward auctions.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {lots.map((lot) => (
                  <div
                    key={lot.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {lot.lotNumber}
                          </span>
                          {lot.isGiCertified && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <Award className="w-3 h-3 text-amber-600" />
                              {lot.giRegistrationNumber || 'GI Certified'}
                            </span>
                          )}
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {lot.status}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-1.5">
                          {lot.orchardName}
                        </h3>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {lot.region.replace(/_/g, ' ')} • {lot.mouzaPlotNumber || 'Mouza Plot'}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <div className="text-right">
                          <span className="text-slate-400 block">Current High Bid</span>
                          <strong className="text-base font-extrabold text-emerald-700">
                            ৳{lot.currentHighestBidBdt.toLocaleString()}
                          </strong>
                          <span className="text-[10px] text-slate-500 block">
                            {lot.highestBidderBrokerName || 'No bids yet'}
                          </span>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-right">
                          <span className="text-slate-400 block">Advance Escrow (30%)</span>
                          <strong className="text-sm font-bold text-slate-800">
                            ৳{Math.round(lot.currentHighestBidBdt * 0.3).toLocaleString()}
                          </strong>
                          <span className="text-[10px] text-emerald-600 block">
                            {lot.advanceEscrowPaidBdt > 0 ? 'Disbursed to Grower' : 'Awaiting Bidding Closure'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Escrow Progress Steps */}
                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <strong>Tranche 1: Signing (30%)</strong>
                          <div className="text-[10px] text-slate-500">Advance working capital</div>
                        </div>
                      </div>
                      <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-100 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-amber-600 shrink-0" />
                        <div>
                          <strong>Tranche 2: Bagging (40%)</strong>
                          <div className="text-[10px] text-slate-500">
                            {lot.baggedFruitsCount} fruits bagged
                          </div>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center gap-2">
                        <Scale className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <strong>Tranche 3: Harvest (30%)</strong>
                          <div className="text-[10px] text-slate-500">
                            Est. {lot.estimatedYieldKg} kg intake
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Create Lot */}
        {activeTab === 'create_lot' && (
          <div className="mt-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-3xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Trees className="w-5 h-5 text-emerald-600" />
              List New Tree Block for Pre-Harvest Forward Auction
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Enter orchard coordinates, tree census, blossom-to-pea fruit-set rate, and fruit bagging protection details.
            </p>

            {createLotMessage && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold mb-4 ${
                  createLotMessage.includes('successfully')
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {createLotMessage}
              </div>
            )}

            <form onSubmit={handleCreateLotSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Orchard Name (বাগানের নাম)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shibganj Padma Riverside Heritage Grove"
                    value={orchardName}
                    onChange={(e) => setOrchardName(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Region (উপজেলা ও জেলা)
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value as OrchardRegion)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  >
                    <option value="CHAPAINAWABGANJ_SHIBGANJ">Chapainawabganj (Shibganj)</option>
                    <option value="RAJSHAHI_BAGHA_CHARGHAT">Rajshahi (Bagha/Charghat)</option>
                    <option value="DINAJPUR_BIROL_SADAR">Dinajpur (Birol/Sadar)</option>
                    <option value="RANGPUR_MITHAPUKUR">Rangpur (Mithapukur)</option>
                    <option value="MEHERPUR_MUJIBNAGAR">Meherpur (Mujibnagar)</option>
                    <option value="CHUADANGA_DAMURHUDA">Chuadanga (Damurhuda)</option>
                    <option value="PABNA_ISHWARDI">Pabna (Ishwardi)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fruit Type (ফল)
                  </label>
                  <select
                    value={fruitType}
                    onChange={(e) => {
                      const ft = e.target.value as FruitType;
                      setFruitType(ft);
                      setCultivar(ft === 'MANGO' ? 'KHIRSAPAT_HIMSAGAR' : 'DINAJPUR_BEDANA_LITCHI');
                    }}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  >
                    <option value="MANGO">Mango (আম)</option>
                    <option value="LITCHI">Litchi (লিচু)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cultivar (জাত)
                  </label>
                  <select
                    value={cultivar}
                    onChange={(e) => setCultivar(e.target.value as FruitCultivar)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  >
                    {fruitType === 'MANGO' ? (
                      <>
                        <option value="KHIRSAPAT_HIMSAGAR">Khirsapat / Himsagar (ক্ষীরশাপাত/হিমসাগর)</option>
                        <option value="LANGRA">Langra (ল্যাংড়া)</option>
                        <option value="AMRAPALI">Amrapali (আম্রপালি)</option>
                        <option value="FAZLI">Fazli (ফজলি)</option>
                        <option value="HARIBHANGA">Haribhanga (হাড়িভাঙা)</option>
                        <option value="GOURMATI">Gourmati (গৌড়মতি)</option>
                        <option value="ASHWINA">Ashwina (আশ্বিনা)</option>
                      </>
                    ) : (
                      <>
                        <option value="DINAJPUR_BEDANA_LITCHI">Dinajpur Bedana (দিনাজপুর বেদানা লিচু)</option>
                        <option value="CHINA_3_LITCHI">China-3 (চায়না-৩)</option>
                        <option value="BOMBAY_LITCHI">Bombay (বোম্বাই লিচু)</option>
                        <option value="MADRAJI_LITCHI">Madraji (মাদ্রাজি)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Trees (গাছের সংখ্যা)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={totalTrees}
                    onChange={(e) => setTotalTrees(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Est. Yield (কেজি)
                  </label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={estimatedYieldKg}
                    onChange={(e) => setEstimatedYieldKg(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tree Age (বছর)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={treeAgeYears}
                    onChange={(e) => setTreeAgeYears(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fruit-Set % (গুটি বাঁধা)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={floweringFruitSetPct}
                    onChange={(e) => setFloweringFruitSetPct(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fruit Bagging Status
                  </label>
                  <select
                    value={fruitBaggingStatus}
                    onChange={(e) => setFruitBaggingStatus(e.target.value as FruitBaggingStatus)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  >
                    <option value="BAG_PROTECTED">Double-Layer Bagged</option>
                    <option value="PARTIALLY_BAGGED">Partially Bagged</option>
                    <option value="CONVENTIONAL_UNBAGGED">Conventional Unbagged</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bagged Count
                  </label>
                  <input
                    type="number"
                    value={baggedFruitsCount}
                    onChange={(e) => setBaggedFruitsCount(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Base Reserve Price (৳ টাকা)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={baseReservePriceBdt}
                    onChange={(e) => setBaseReservePriceBdt(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expected Harvest Date
                  </label>
                  <input
                    type="date"
                    required
                    value={expectedHarvestStartDate}
                    onChange={(e) => setExpectedHarvestStartDate(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="createGiCheck"
                  checked={isGiCertified}
                  onChange={(e) => setIsGiCertified(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="createGiCheck" className="text-xs font-semibold text-slate-700">
                  Geographical Indication (GI) Authenticated Lot
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isCreatingLot}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-3 rounded-lg transition shadow-sm"
                >
                  {isCreatingLot ? 'Submitting Lot...' : 'Publish Orchard Tree Block to Auction'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Create Dispatch */}
        {activeTab === 'create_dispatch' && (
          <div className="mt-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-3xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Truck className="w-5 h-5 text-sky-600" />
              Dispatch Refrigerated Harvest Reefer
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Handover harvested fruit to cold-chain reefer vans, log Brix refractometer degree, set chilling setpoints, and route to air cargo or central wholesale mandis.
            </p>

            {dispatchMessage && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold mb-4 ${
                  dispatchMessage.includes('successfully')
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {dispatchMessage}
              </div>
            )}

            <form onSubmit={handleCreateDispatchSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fruit Type
                  </label>
                  <select
                    value={dispFruitType}
                    onChange={(e) => {
                      const ft = e.target.value as FruitType;
                      setDispFruitType(ft);
                      setDispCultivar(ft === 'MANGO' ? 'KHIRSAPAT_HIMSAGAR' : 'DINAJPUR_BEDANA_LITCHI');
                      setDispSetpoint(ft === 'MANGO' ? 11.0 : 3.0);
                    }}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  >
                    <option value="MANGO">Mango (আম - Setpoint: 10-12°C)</option>
                    <option value="LITCHI">Litchi (লিচু - Setpoint: 2-4°C)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cultivar
                  </label>
                  <select
                    value={dispCultivar}
                    onChange={(e) => setDispCultivar(e.target.value as FruitCultivar)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  >
                    {dispFruitType === 'MANGO' ? (
                      <>
                        <option value="KHIRSAPAT_HIMSAGAR">Khirsapat / Himsagar</option>
                        <option value="LANGRA">Langra</option>
                        <option value="AMRAPALI">Amrapali</option>
                        <option value="HARIBHANGA">Haribhanga</option>
                      </>
                    ) : (
                      <>
                        <option value="DINAJPUR_BEDANA_LITCHI">Dinajpur Bedana</option>
                        <option value="CHINA_3_LITCHI">China-3</option>
                        <option value="BOMBAY_LITCHI">Bombay</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dispatch Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={dispWeightKg}
                    onChange={(e) => setDispWeightKg(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Crates Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={dispCratesCount}
                    onChange={(e) => setDispCratesCount(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Refractometer Brix (°)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="10"
                    max="28"
                    required
                    value={dispBrix}
                    onChange={(e) => setDispBrix(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reefer Van License Plate
                  </label>
                  <input
                    type="text"
                    required
                    value={dispPlate}
                    onChange={(e) => setDispPlate(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reefer Setpoint (°C)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={dispSetpoint}
                    onChange={(e) => setDispSetpoint(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Origin Hub
                  </label>
                  <input
                    type="text"
                    required
                    value={dispOrigin}
                    onChange={(e) => setDispOrigin(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Destination Market / Airport Cargo
                  </label>
                  <input
                    type="text"
                    required
                    value={dispDestination}
                    onChange={(e) => setDispDestination(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isCreatingDispatch}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs py-3 rounded-lg transition shadow-sm"
                >
                  {isCreatingDispatch ? 'Initiating Dispatch...' : 'Authorize Reefer Van Dispatch'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
