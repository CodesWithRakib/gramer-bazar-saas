'use client';

import React, { useState } from 'react';
import {
  Flower2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Building2,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Droplets,
  Microscope,
  Leaf,
  Layers,
  MapPin,
  FileCheck2,
  Tag,
  Phone,
} from 'lucide-react';
import {
  useGetHerbalOverviewStatsQuery,
  useGetHerbalBatchesQuery,
  useGetBiomassCalculationQuery,
  HerbalBatch,
  HerbalSpecies,
  PlantPartUsed,
  GACPStandardGrade,
} from '../herbalSupplyApi';

export const HerbalMarketplaceHubView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'MARKETPLACE' | 'BIOMASS_CALC' | 'GACP_GUIDE'>('MARKETPLACE');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('ALL');
  const [searchDistrict, setSearchDistrict] = useState<string>('');
  const [pharmaGradeOnly, setPharmaGradeOnly] = useState<boolean>(false);

  // Biomass Calculator state
  const [calcSpecies, setCalcSpecies] = useState<HerbalSpecies>('VASAKA');
  const [calcPlantPart, setCalcPlantPart] = useState<PlantPartUsed>('LEAF_DRIED');
  const [calcFreshKg, setCalcFreshKg] = useState<number>(1000);

  // Sourcing Quote Modal state
  const [selectedBatch, setSelectedBatch] = useState<HerbalBatch | null>(null);
  const [orderQuantityKg, setOrderQuantityKg] = useState<number>(100);
  const [buyerCompany, setBuyerCompany] = useState<string>('Square Herbal & Nutraceuticals Ltd.');
  const [buyerContact, setBuyerContact] = useState<string>('01713009988');
  const [deliveryWarehouse, setDeliveryWarehouse] = useState<string>('Gazipur Factory Hub');
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);

  const { data: statsData } = useGetHerbalOverviewStatsQuery();
  const { data: batchesData, isLoading: isBatchesLoading } = useGetHerbalBatchesQuery({
    species: selectedSpecies !== 'ALL' ? (selectedSpecies as HerbalSpecies) : undefined,
    district: searchDistrict.trim() ? searchDistrict : undefined,
    pharmaGradeOnly: pharmaGradeOnly ? true : undefined,
  });

  const { data: biomassCalcData } = useGetBiomassCalculationQuery({
    species: calcSpecies,
    plantPart: calcPlantPart,
    freshHarvestKg: calcFreshKg,
  });

  const stats = statsData?.data;
  const batches = batchesData?.data || [];
  const biomassCalc = biomassCalcData?.data;

  const handleOpenQuoteModal = (batch: HerbalBatch) => {
    setSelectedBatch(batch);
    setOrderQuantityKg(batch.minOrderKg || 50);
    setOrderSuccessMsg(null);
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;
    setOrderSuccessMsg(
      `Sourcing requisition for ${orderQuantityKg} kg of ${selectedBatch.species} successfully dispatched to ${selectedBatch.cooperativeName}!`,
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-green-950 text-white shadow-2xl p-8 lg:p-12 border border-emerald-500/30">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <Flower2 className="w-4 h-4 text-emerald-400" />
            <span>ভেষজ চাষাবাদ, আয়ুর্বেদিক ফার্মাকোপিয়া ও কাঁচামাল হাব (Organic Herbal &amp; Ayush Sourcing)</span>
          </div>

          <h1 className="text-3xl lg:text-5xl font-black tracking-tight leading-tight">
            Certified Medicinal Flora &amp; Pharmacopoeia Sourcing Hub
          </h1>

          <p className="text-emerald-100/90 text-sm lg:text-base leading-relaxed">
            Direct institutional sourcing connecting rural herbal grower cooperatives in Natore (ঔষধি গ্রাম), Tangail,
            Rangpur, and the Hill Tracts with licensed Ayurvedic, Unani, and herbal pharmaceutical manufacturers.
            DGDA GACP quality audited with verified phytochemical purity markers.
          </p>

          <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-emerald-200">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Moisture Strictly &lt; 10% (Pharma Grade A)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Microscope className="w-4 h-4 text-teal-400" />
              <span>HPLC Verified Active Phytochemicals</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Institutional Escrow Contracts</span>
            </div>
          </div>
        </div>

        {/* Overview Stats Badges */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-emerald-700/40 pt-6">
          <div>
            <div className="text-xs text-emerald-300/80 uppercase font-semibold">BOTANICAL BATCHES</div>
            <div className="text-2xl lg:text-3xl font-black text-white mt-1">
              {stats?.totalBatchesAvailable ?? 4} <span className="text-xs font-medium text-emerald-400">Available</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-emerald-300/80 uppercase font-semibold">ACTIVE INVENTORY</div>
            <div className="text-2xl lg:text-3xl font-black text-emerald-300 mt-1">
              {(stats?.totalActiveWeightKg ?? 3250).toLocaleString()}{' '}
              <span className="text-xs font-medium text-white">Kg</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-emerald-300/80 uppercase font-semibold">AVERAGE MOISTURE</div>
            <div className="text-2xl lg:text-3xl font-black text-teal-300 mt-1">
              {stats?.averageMoisturePercentage ?? 8.6}%
            </div>
          </div>
          <div>
            <div className="text-xs text-emerald-300/80 uppercase font-semibold">HERBAL TRADE VOLUME</div>
            <div className="text-2xl lg:text-3xl font-black text-amber-300 mt-1">
              ৳{(stats?.totalHerbalTradeVolumeBdt ?? 1075000).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 space-x-2">
        <button
          onClick={() => setActiveTab('MARKETPLACE')}
          className={`pb-3 px-5 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'MARKETPLACE'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Leaf className="w-4 h-4" />
          <span>Botanical Marketplace ({batches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('BIOMASS_CALC')}
          className={`pb-3 px-5 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'BIOMASS_CALC'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Fresh-to-Dry Biomass Calculator</span>
        </button>

        <button
          onClick={() => setActiveTab('GACP_GUIDE')}
          className={`pb-3 px-5 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'GACP_GUIDE'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Microscope className="w-4 h-4" />
          <span>Pharmacopoeia &amp; Moisture Standards</span>
        </button>
      </div>

      {/* TAB 1: BOTANICAL MARKETPLACE */}
      {activeTab === 'MARKETPLACE' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search district (e.g. Natore, Tangail, Rangpur)..."
                value={searchDistrict}
                onChange={(e) => setSearchDistrict(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1">
              <Filter className="w-4 h-4 text-gray-400 shrink-0" />
              {[
                { label: 'All Species', value: 'ALL' },
                { label: 'কালমেঘ (Kalomegh)', value: 'KALOMEGH' },
                { label: 'অশ্বগন্ধা (Ashwagandha)', value: 'ASHWAGANDHA' },
                { label: 'বাসক পাতা (Vasaka)', value: 'VASAKA' },
                { label: 'তুলসী পাতা (Tulsi)', value: 'TULSI_KRISHNA_RAMA' },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedSpecies(filter.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedSpecies === filter.value
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {filter.label}
                </button>
              ))}

              <label className="flex items-center gap-1.5 ml-2 cursor-pointer text-xs font-semibold text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={pharmaGradeOnly}
                  onChange={(e) => setPharmaGradeOnly(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span>Pharma Grade A Only</span>
              </label>
            </div>
          </div>

          {/* Batches Grid */}
          {isBatchesLoading ? (
            <div className="p-16 text-center text-gray-500">Loading medicinal botanical batches...</div>
          ) : batches.length === 0 ? (
            <div className="p-16 text-center text-gray-500 space-y-2">
              <Flower2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
              <div className="text-base font-bold text-gray-700 dark:text-gray-300">No medicinal batches found</div>
              <p className="text-xs text-gray-500">Try broadening your search or clear filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                        {batch.gacpGrade.replace(/_/g, ' ')}
                      </span>
                      <div className="text-right">
                        <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                          ৳{Number(batch.pricePerKgBdt).toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500 font-medium"> / kg</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-gray-900 dark:text-white leading-snug">
                        {batch.species.replace(/_/g, ' ')} ({batch.scientificName})
                      </h3>
                      <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                        {batch.plantPart.replace(/_/g, ' ')} • {batch.processingState.replace(/_/g, ' ')}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{batch.cooperativeName} ({batch.growerDistrict})</span>
                    </div>

                    {/* Scientific Specifications Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/40">
                        <div className="text-gray-400 text-[10px]">Moisture Content</div>
                        <div className="font-extrabold text-teal-600 dark:text-teal-400 mt-0.5">
                          {batch.moistureContentPercentage.toFixed(1)}% (DGDA Standard &lt; 10%)
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/40">
                        <div className="text-gray-400 text-[10px]">Active Phytochemical</div>
                        <div className="font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {batch.activePhytochemicalPercentage
                            ? `${batch.activePhytochemicalPercentage}% ${batch.phytochemicalMarkerName || ''}`
                            : 'HPLC Tested'}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
                      {batch.description}
                    </p>

                    <div className="p-2.5 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-800/40 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                      <span className="flex items-center gap-1 font-semibold">
                        <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Lab: {batch.testingLaboratory || 'BCSIR Analytical Lab'}</span>
                      </span>
                      <span className="font-mono text-[10px]">{batch.labReportNumber}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700/60 mt-4 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">
                        {batch.totalWeightKg.toLocaleString()} kg available
                      </div>
                      <div className="text-[11px] text-gray-400">Min Order: {batch.minOrderKg} kg</div>
                    </div>

                    <button
                      onClick={() => handleOpenQuoteModal(batch)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <span>Sourcing Quote</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BIOMASS CALCULATOR */}
      {activeTab === 'BIOMASS_CALC' && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 lg:p-8 border border-gray-200 dark:border-gray-700 shadow-sm max-w-4xl mx-auto space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Scale className="w-6 h-6 text-emerald-600" />
              <span>Fresh-to-Dry Botanical Biomass &amp; Farmer Profit Calculator</span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Analyze water evaporation ratio, expected pharmacopoeia dried yield, and net economic advantage of solar drying vs selling wet farmgate raw harvest.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Medicinal Plant Species
                </label>
                <select
                  value={calcSpecies}
                  onChange={(e) => setCalcSpecies(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-semibold"
                >
                  <option value="VASAKA">বাসক পাতা (Justicia adhatoda - Vasaka)</option>
                  <option value="KALOMEGH">কালমেঘ (Andrographis paniculata - Kalomegh)</option>
                  <option value="ASHWAGANDHA">অশ্বগন্ধা (Withania somnifera - Ashwagandha)</option>
                  <option value="TULSI_KRISHNA_RAMA">কৃষ্ণ ও রাম তুলসী (Ocimum sanctum - Tulsi)</option>
                  <option value="SHATAVARI">শতমূলী কন্দ (Asparagus racemosus - Shatavari)</option>
                  <option value="ALOE_VERA">ঘৃতকুমারী পাল্প (Aloe barbadensis - Aloe Vera)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Harvested Botanical Plant Part
                </label>
                <select
                  value={calcPlantPart}
                  onChange={(e) => setCalcPlantPart(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-semibold"
                >
                  <option value="LEAF_DRIED">Leaf (পাতা - 5.5:1 Dehydration Ratio)</option>
                  <option value="ROOT_RHIZOME">Root / Rhizome (মূল ও কন্দ - 3.8:1 Ratio)</option>
                  <option value="GEL_EXTRACT">Gel Extract (অ্যালোভেরা জেল - 18.0:1 Ratio)</option>
                  <option value="FRUIT_SEED">Fruit / Berry (ফল - 4.2:1 Ratio)</option>
                  <option value="BARK_STEM">Bark / Stem (ছাল ও কাণ্ড - 3.2:1 Ratio)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Fresh Harvest Weight (Kg)
                </label>
                <input
                  type="number"
                  min="10"
                  step="50"
                  value={calcFreshKg}
                  onChange={(e) => setCalcFreshKg(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold"
                />
              </div>
            </div>

            {/* Calculated Output Card */}
            {biomassCalc && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-xs uppercase font-extrabold text-emerald-800 dark:text-emerald-300">
                    Expected Botanical Dry Yield &amp; Profit
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-emerald-950 dark:text-emerald-100">
                    <div className="flex justify-between">
                      <span>Conversion Ratio:</span>
                      <span className="font-bold">{biomassCalc.conversionRatioText}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Expected Dried Pharma Yield:</span>
                      <span className="font-black text-emerald-700 dark:text-emerald-300 text-sm">
                        {biomassCalc.expectedDryYieldKg} Kg
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Water Evaporation Loss:</span>
                      <span>{biomassCalc.waterLossPercentage}%</span>
                    </div>

                    <div className="flex justify-between pt-2 border-t border-emerald-200 dark:border-emerald-800">
                      <span>Wet Farmgate Revenue:</span>
                      <span>৳{biomassCalc.freshFarmgatePriceEstimateBdt.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Solar Dried Pharma Revenue:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        ৳{biomassCalc.driedPharmaPriceEstimateBdt.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-emerald-300/40 dark:border-emerald-700/60">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-emerald-900 dark:text-emerald-100">
                      Farmer Net Value Advantage:
                    </span>
                    <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                      +৳{biomassCalc.netFarmerAdvantageBdt.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 mt-1">
                    {biomassCalc.recommendationBn}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PHARMACOPOEIA STANDARDS */}
      {activeTab === 'GACP_GUIDE' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
              <span>Pharma Grade A (DGDA Standard)</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Moisture strictly &lt; 10.0%. Total aerobic microbial count &lt; 10⁵ CFU/g. Zero aflatoxin ($B_1 + B_2 + G_1 + G_2 &lt; 4$ ppb). Heavy metal lead ($Pb$) &lt; 0.5 ppm. Eligible for wholesale contracts with licensed pharmaceutical companies.
            </p>
            <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
              Premium Rate: +20% Price Bonus
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-teal-600 font-bold text-sm">
              <Droplets className="w-5 h-5" />
              <span>Commercial Grade B</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Moisture between 10.1% and 12.0%. Suitable for local herbal retail, tea blends, and traditional practitioners. Requires dry warehouse pallet storage to avoid seasonal fungus.
            </p>
            <div className="text-[11px] font-bold text-teal-700 dark:text-teal-300">
              Standard Commercial Farmgate Pricing
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Raw Unsorted / Rejection Risk</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Moisture &gt; 12.0% or mold detected. Unacceptable for drug formulation due to rapid mycotoxin and aflatoxin development. Must undergo immediate secondary solar dehydration.
            </p>
            <div className="text-[11px] font-bold text-red-600">
              Mandatory Solar Dehydration Protocol
            </div>
          </div>
        </div>
      )}

      {/* SOURCING ORDER MODAL */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full p-6 lg:p-8 shadow-2xl border border-gray-100 dark:border-gray-700 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Pharma Wholesale Requisition: {selectedBatch.species}
                </h3>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Supplier: {selectedBatch.cooperativeName} ({selectedBatch.growerDistrict})
                </p>
              </div>
              <button
                onClick={() => setSelectedBatch(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                &times;
              </button>
            </div>

            {orderSuccessMsg ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="font-bold text-sm text-gray-900 dark:text-white">Requisition Dispatched</div>
                <p className="text-gray-500 text-[11px]">{orderSuccessMsg}</p>
                <button
                  onClick={() => setSelectedBatch(null)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmOrder} className="mt-4 space-y-4">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Purchasing Pharmaceutical Company
                  </label>
                  <input
                    type="text"
                    required
                    value={buyerCompany}
                    onChange={(e) => setBuyerCompany(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Required Quantity (Kg)
                    </label>
                    <input
                      type="number"
                      required
                      min={selectedBatch.minOrderKg}
                      max={selectedBatch.totalWeightKg}
                      value={orderQuantityKg}
                      onChange={(e) => setOrderQuantityKg(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Procurement Contact
                    </label>
                    <input
                      type="text"
                      required
                      value={buyerContact}
                      onChange={(e) => setBuyerContact(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Destination Factory / Warehouse
                  </label>
                  <input
                    type="text"
                    required
                    value={deliveryWarehouse}
                    onChange={(e) => setDeliveryWarehouse(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-1">
                  <div className="flex justify-between">
                    <span>Rate per Kg:</span>
                    <span className="font-bold">৳{selectedBatch.pricePerKgBdt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal ({orderQuantityKg} kg):</span>
                    <span className="font-bold">
                      ৳{(orderQuantityKg * selectedBatch.pricePerKgBdt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-700 dark:text-emerald-300 font-bold pt-1 border-t border-emerald-200 dark:border-emerald-800">
                    <span>30% Advance Escrow Commitment:</span>
                    <span>
                      ৳{Math.round(orderQuantityKg * selectedBatch.pricePerKgBdt * 0.3).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setSelectedBatch(null)}
                    className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md transition-all"
                  >
                    Submit Sourcing Requisition
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default HerbalMarketplaceHubView;
