'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Thermometer,
  Layers,
  Scale,
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  MapPin,
  Clock,
  Gauge,
  X,
  Send,
  Droplets,
  Share2,
  Snowflake,
  ShoppingBag,
} from 'lucide-react';
import {
  useGetProductionBatchesQuery,
  useCreateProductionBatchMutation,
  useUpdateBatchCookingMutation,
  useCreateArtisanalLotMutation,
  ChhanaProductionBatch,
  SweetmeatType,
  SweetmeatRegion,
  MilkSourceType,
  ChhanaCoagulantType,
  SweetmeatPackagingType,
} from '../artisanalSweetmeatsApi';

export const MoiraConfectionerHubView: React.FC = () => {
  const { data: batches = [], isLoading } = useGetProductionBatchesQuery();

  // Create Batch Modal State
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  const [moiraGuildName, setMoiraGuildName] = useState('Bogura Shahi Moira Samity (মহাস্থান দই ভাণ্ডার)');
  const [contactPhone, setContactPhone] = useState('+8801712998877');
  const [region, setRegion] = useState<SweetmeatRegion>('BOGURA_SADAR');
  const [sweetmeatType, setSweetmeatType] = useState<SweetmeatType>('BOGURA_SPECIAL_CURD_DOI');
  const [milkSource, setMilkSource] = useState<MilkSourceType>('INDIGENOUS_COW_DESHI');
  const [inputMilkVolumeLiters, setInputMilkVolumeLiters] = useState<number>(450);
  const [milkFatPct, setMilkFatPct] = useState<number>(5.4);
  const [milkSnfPct, setMilkSnfPct] = useState<number>(8.8);
  const [coagulantType, setCoagulantType] = useState<ChhanaCoagulantType>('NATURAL_WHEY_CULTURE');
  const [coagulationTempCelsius, setCoagulationTempCelsius] = useState<number>(83.5);
  const [notes, setNotes] = useState('Deshi cow milk concentrated in woodfire iron karai before setting in porous clay sra.');

  const [createBatchMutation, { isLoading: isCreatingBatch }] = useCreateProductionBatchMutation();

  // Update Cooking & Yield State
  const [selectedBatchForUpdate, setSelectedBatchForUpdate] = useState<ChhanaProductionBatch | null>(null);
  const [updateProducedChhanaKg, setUpdateProducedChhanaKg] = useState<number>(76.5);
  const [updateChhanaMoisturePct, setUpdateChhanaMoisturePct] = useState<number>(52.5);
  const [updateStatus, setUpdateStatus] = useState<string>('COOKING_COMPLETED');
  const [updateNotes, setUpdateNotes] = useState('');

  const [updateCookingMutation, { isLoading: isUpdatingCooking }] = useUpdateBatchCookingMutation();

  // Publish Lot Modal State
  const [selectedBatchForPublish, setSelectedBatchForPublish] = useState<ChhanaProductionBatch | null>(null);
  const [lotTitle, setLotTitle] = useState('');
  const [packagingType, setPackagingType] = useState<SweetmeatPackagingType>('POROUS_CLAY_SRA_1KG');
  const [lotTotalWeightKg, setLotTotalWeightKg] = useState<number>(75);
  const [pricePerKgBdt, setPricePerKgBdt] = useState<number>(480);
  const [minOrderKg, setMinOrderKg] = useState<number>(2);
  const [textureRating, setTextureRating] = useState<number>(5);
  const [isGiTagged, setIsGiTagged] = useState<boolean>(true);
  const [isRefrigeratedColdChain, setIsRefrigeratedColdChain] = useState<boolean>(true);

  const [createLotMutation, { isLoading: isPublishingLot }] = useCreateArtisanalLotMutation();

  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Filters
  const [filterRegion, setFilterRegion] = useState<SweetmeatRegion | 'ALL'>('ALL');
  const [filterSweetmeatType, setFilterSweetmeatType] = useState<SweetmeatType | 'ALL'>('ALL');

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    try {
      await createBatchMutation({
        moiraGuildName,
        contactPhone,
        region,
        sweetmeatType,
        milkSource,
        inputMilkVolumeLiters,
        milkFatPct,
        milkSnfPct,
        coagulantType,
        coagulationTempCelsius,
        notes,
      }).unwrap();

      setStatusMessage({ text: 'Milk curdling & Chhana production batch logged successfully!', isError: false });
      setIsCreateBatchOpen(false);
    } catch (err: any) {
      setStatusMessage({ text: err?.data?.message || 'Failed to create production batch', isError: true });
    }
  };

  const handleUpdateCooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchForUpdate) return;
    setStatusMessage(null);

    try {
      await updateCookingMutation({
        id: selectedBatchForUpdate.id,
        body: {
          producedChhanaKg: updateProducedChhanaKg,
          chhanaMoisturePct: updateChhanaMoisturePct,
          status: updateStatus,
          notes: updateNotes,
        },
      }).unwrap();

      setStatusMessage({ text: 'Chhana output weight & moisture telemetry updated!', isError: false });
      setSelectedBatchForUpdate(null);
    } catch (err: any) {
      setStatusMessage({ text: err?.data?.message || 'Failed to update cooking telemetry', isError: true });
    }
  };

  const handleOpenPublishModal = (batch: ChhanaProductionBatch) => {
    setSelectedBatchForPublish(batch);
    setLotTitle(`${batch.moiraGuildName} - Authentic ${batch.sweetmeatType.replace(/_/g, ' ')}`);
    setLotTotalWeightKg(batch.producedChhanaKg > 0 ? batch.producedChhanaKg : 50);
    if (batch.sweetmeatType === 'BOGURA_SPECIAL_CURD_DOI') {
      setPackagingType('POROUS_CLAY_SRA_1KG');
      setPricePerKgBdt(480);
      setIsGiTagged(true);
      setIsRefrigeratedColdChain(true);
    } else if (batch.sweetmeatType === 'NATORE_AUTHENTIC_KACHAGOLLA') {
      setPackagingType('HERMETIC_SWEET_BOX_1KG');
      setPricePerKgBdt(620);
      setIsGiTagged(true);
      setIsRefrigeratedColdChain(true);
    } else if (batch.sweetmeatType === 'TRADITIONAL_GAWA_GHEE') {
      setPackagingType('GLASS_JAR_GAWA_GHEE_500G');
      setPricePerKgBdt(1400);
      setIsGiTagged(false);
      setIsRefrigeratedColdChain(false);
    } else {
      setPackagingType('HERMETIC_SWEET_BOX_1KG');
      setPricePerKgBdt(550);
      setIsGiTagged(true);
      setIsRefrigeratedColdChain(true);
    }
  };

  const handlePublishLot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchForPublish) return;
    setStatusMessage(null);

    try {
      await createLotMutation({
        batchId: selectedBatchForPublish.id,
        lotTitle,
        moiraProducerName: selectedBatchForPublish.moiraGuildName,
        originRegion: selectedBatchForPublish.region,
        sweetmeatType: selectedBatchForPublish.sweetmeatType,
        packagingType,
        totalWeightKg: lotTotalWeightKg,
        pricePerKgBdt,
        minimumOrderKg: minOrderKg,
        textureSoftnessRating: textureRating,
        isGiTagged,
        isRefrigeratedColdChain,
      }).unwrap();

      setStatusMessage({
        text: `Artisanal sweetmeat lot published to live marketplace with QR provenance!`,
        isError: false,
      });
      setSelectedBatchForPublish(null);
    } catch (err: any) {
      setStatusMessage({ text: err?.data?.message || 'Failed to publish artisanal lot', isError: true });
    }
  };

  // Summary Metrics
  const totalBatches = batches.length;
  const totalMilkVolume = batches.reduce((acc, b) => acc + (b.inputMilkVolumeLiters || 0), 0);
  const totalOutputKg = batches.reduce((acc, b) => acc + (b.producedChhanaKg || 0), 0);
  const avgFatPct =
    batches.length > 0
      ? (batches.reduce((acc, b) => acc + (b.milkFatPct || 0), 0) / batches.length).toFixed(2)
      : '0.00';

  const filteredBatches = batches.filter((b) => {
    if (filterRegion !== 'ALL' && b.region !== filterRegion) return false;
    if (filterSweetmeatType !== 'ALL' && b.sweetmeatType !== filterSweetmeatType) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-stone-900 text-stone-100 py-10 px-4 sm:px-6 lg:px-8 border-b-4 border-amber-500 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Artisanal Moira Guild Terminal
              </span>
              <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                GI Provenance Protected
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Moira Confectioner & Dairy Boiling Hub
            </h1>
            <p className="mt-2 text-stone-300 text-sm sm:text-base max-w-2xl">
              Traditional curdling & sweetmeat craft cockpit: track milk acidity, woodfire simmering,
              whey precipitation (ছানা), porous clay sra fermentation (দই), and publish authentic GI lots.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCreateBatchOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-5 h-5" />
              Log Milk Curdling Batch
            </button>
            <Link
              href="/artisanal-sweetmeats"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-sm font-semibold rounded-xl border border-stone-600 shadow-sm"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              Public Marketplace
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Status Message */}
        {statusMessage && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center justify-between border ${
              statusMessage.isError
                ? 'bg-rose-50 border-rose-300 text-rose-800'
                : 'bg-emerald-50 border-emerald-300 text-emerald-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {statusMessage.isError ? (
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
              ) : (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
              )}
              <span className="text-sm font-medium">{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-stone-400 hover:text-stone-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Moira Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Total Production Batches
              </span>
              <Layers className="w-5 h-5 text-amber-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-stone-900">{totalBatches}</span>
              <span className="text-xs text-stone-500">Active Guild Batches</span>
            </div>
            <p className="mt-2 text-xs text-stone-400">Curdling & confectionery runs</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Raw Milk Processed
              </span>
              <Droplets className="w-5 h-5 text-blue-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-stone-900">{totalMilkVolume.toLocaleString()}</span>
              <span className="text-xs text-stone-500">Liters</span>
            </div>
            <p className="mt-2 text-xs text-stone-400">Pure Cow & Buffalo dairy</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Produced Chhana / Sweets
              </span>
              <Scale className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-stone-900">{totalOutputKg.toFixed(1)}</span>
              <span className="text-xs text-stone-500">Kg Output</span>
            </div>
            <p className="mt-2 text-xs text-stone-400">Average yield: ~17.5% - 22%</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Avg Milk Fat Content
              </span>
              <Gauge className="w-5 h-5 text-amber-500" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-stone-900">{avgFatPct}%</span>
              <span className="text-xs text-emerald-600 font-semibold">Premium Richness</span>
            </div>
            <p className="mt-2 text-xs text-stone-400">Solid-not-fat average &gt;8.5%</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div>
              <label className="text-xs font-semibold text-stone-600 mr-2">Region:</label>
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value as SweetmeatRegion | 'ALL')}
                className="text-xs font-medium bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="ALL">All Heritage Regions</option>
                <option value="BOGURA_SADAR">Bogura Sadar (বগুড়া)</option>
                <option value="NATORE_SADAR">Natore Sadar (নাটোর)</option>
                <option value="TANGAIL_PORABARI">Tangail Porabari (পোড়াবাড়ী)</option>
                <option value="COMILLA_MANOHARPUR">Comilla Manoharpur (কুমিল্লা)</option>
                <option value="NETROKONA_SADAR">Netrokona Sadar (নেত্রকোণা)</option>
                <option value="PABNA_SANTHIA">Pabna Santhia (পাবনা)</option>
                <option value="SIRAJGANJ_BELKUCHI">Sirajganj Belkuchi (সিরাজগঞ্জ)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-600 mr-2">Sweetmeat:</label>
              <select
                value={filterSweetmeatType}
                onChange={(e) => setFilterSweetmeatType(e.target.value as SweetmeatType | 'ALL')}
                className="text-xs font-medium bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="ALL">All Confectionery Types</option>
                <option value="BOGURA_SPECIAL_CURD_DOI">Bogura Special Curd (বগুড়ার দই)</option>
                <option value="NATORE_AUTHENTIC_KACHAGOLLA">Natore Kachagolla (কাঁচাগোল্লা)</option>
                <option value="PORABARI_CHAMCHAM">Porabari Chamcham (পোড়াবাড়ীর চমচম)</option>
                <option value="COMILLA_RASMALAI_MATRI_BHANDAR">Comilla Rasmalai (রসমালাই)</option>
                <option value="NETROKONA_BALISH_MISTI">Netrokona Balish Misti (বালিশ মিষ্টি)</option>
                <option value="PURE_COW_MILK_CHHANA">Pure Cow Milk Chhana (খাঁটি ছানা)</option>
                <option value="TRADITIONAL_GAWA_GHEE">Traditional Gawa Ghee (গাওয়া ঘি)</option>
              </select>
            </div>
          </div>

          <span className="text-xs text-stone-500 font-medium">
            Showing <strong className="text-stone-800">{filteredBatches.length}</strong> guild batches
          </span>
        </div>

        {/* Production Batches List */}
        {isLoading ? (
          <div className="py-20 text-center text-stone-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent mb-3"></div>
            <p>Loading artisanal curdling & sweetmeat batches...</p>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-sm">
            <Flame className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-800">No Production Batches Found</h3>
            <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
              No milk curdling or sweetmeat boiling runs match your filter. Log a new batch to start tracking.
            </p>
            <button
              onClick={() => setIsCreateBatchOpen(true)}
              className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold text-sm rounded-xl"
            >
              Log First Batch
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBatches.map((batch) => (
              <div
                key={batch.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="bg-stone-50 p-4 border-b border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                        {batch.batchNumber}
                      </span>
                      <div className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        {new Date(batch.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        batch.status === 'COOKING_COMPLETED' || batch.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {batch.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h4 className="text-base font-bold text-stone-900 leading-snug">
                        {batch.sweetmeatType.replace(/_/g, ' ')}
                      </h4>
                      <p className="text-xs text-stone-600 mt-0.5 font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        {batch.moiraGuildName} ({batch.region.replace(/_/g, ' ')})
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 p-3 rounded-xl border border-stone-100">
                      <div>
                        <span className="text-stone-400 block">Milk Input:</span>
                        <strong className="text-stone-800">{batch.inputMilkVolumeLiters} Liters</strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Milk Source:</span>
                        <strong className="text-stone-800 capitalize">
                          {batch.milkSource.toLowerCase().replace(/_/g, ' ')}
                        </strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Fat & SNF:</span>
                        <strong className="text-stone-800">
                          {batch.milkFatPct}% / {batch.milkSnfPct}%
                        </strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Curdling Temp:</span>
                        <strong className="text-amber-700">{batch.coagulationTempCelsius}°C</strong>
                      </div>
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-stone-500">Coagulant Culture:</span>
                        <span className="font-semibold text-stone-800">
                          {batch.coagulantType.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Produced Yield:</span>
                        <span className="font-bold text-emerald-700">
                          {batch.producedChhanaKg > 0 ? `${batch.producedChhanaKg} Kg` : 'Pending weigh-in'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Moisture Content:</span>
                        <span className="font-semibold text-stone-800">
                          {batch.chhanaMoisturePct > 0 ? `${batch.chhanaMoisturePct}%` : 'Pending moisture test'}
                        </span>
                      </div>
                    </div>

                    {batch.notes && (
                      <p className="text-xs text-stone-500 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                        &quot;{batch.notes}&quot;
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setSelectedBatchForUpdate(batch);
                      setUpdateProducedChhanaKg(batch.producedChhanaKg || 65);
                      setUpdateChhanaMoisturePct(batch.chhanaMoisturePct || 52);
                      setUpdateStatus(batch.status || 'COOKING_COMPLETED');
                    }}
                    className="flex-1 py-2 px-3 bg-white hover:bg-stone-100 active:bg-stone-200 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 transition-colors"
                  >
                    Update Yield & Moisture
                  </button>

                  <button
                    onClick={() => handleOpenPublishModal(batch)}
                    className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Publish Lot
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal 1: Create Production Batch */}
      {isCreateBatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-bold text-stone-900">
                  Log Milk Curdling & Boiling Batch
                </h3>
              </div>
              <button
                onClick={() => setIsCreateBatchOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="mt-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Moira Guild / Dairy Name
                </label>
                <input
                  type="text"
                  required
                  value={moiraGuildName}
                  onChange={(e) => setMoiraGuildName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Heritage Region</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value as SweetmeatRegion)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="BOGURA_SADAR">Bogura Sadar (বগুড়া)</option>
                    <option value="NATORE_SADAR">Natore Sadar (নাটোর)</option>
                    <option value="TANGAIL_PORABARI">Tangail Porabari (পোড়াবাড়ী)</option>
                    <option value="COMILLA_MANOHARPUR">Comilla Manoharpur (কুমিল্লা)</option>
                    <option value="NETROKONA_SADAR">Netrokona Sadar (নেত্রকোণা)</option>
                    <option value="PABNA_SANTHIA">Pabna Santhia (পাবনা)</option>
                    <option value="SIRAJGANJ_BELKUCHI">Sirajganj Belkuchi (সিরাজগঞ্জ)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Confectionery Product
                  </label>
                  <select
                    value={sweetmeatType}
                    onChange={(e) => setSweetmeatType(e.target.value as SweetmeatType)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="BOGURA_SPECIAL_CURD_DOI">Bogura Special Curd (বগুড়ার দই)</option>
                    <option value="NATORE_AUTHENTIC_KACHAGOLLA">Natore Kachagolla (কাঁচাগোল্লা)</option>
                    <option value="PORABARI_CHAMCHAM">Porabari Chamcham (পোড়াবাড়ীর চমচম)</option>
                    <option value="COMILLA_RASMALAI_MATRI_BHANDAR">Comilla Rasmalai (রসমালাই)</option>
                    <option value="NETROKONA_BALISH_MISTI">Netrokona Balish Misti (বালিশ মিষ্টি)</option>
                    <option value="PURE_COW_MILK_CHHANA">Pure Cow Milk Chhana (খাঁটি ছানা)</option>
                    <option value="TRADITIONAL_GAWA_GHEE">Traditional Gawa Ghee (গাওয়া ঘি)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Milk Source</label>
                  <select
                    value={milkSource}
                    onChange={(e) => setMilkSource(e.target.value as MilkSourceType)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="INDIGENOUS_COW_DESHI">Indigenous Cow (দেশি গাভীর দুধ)</option>
                    <option value="CROSSBRED_DAIRY_COW">Crossbred Dairy Cow (উন্নত সংকর গাভী)</option>
                    <option value="RIVERINE_BUFFALO_MILK">Riverine Buffalo Milk (মহিষের দুধ)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Milk Vol (Liters)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="10"
                    required
                    value={inputMilkVolumeLiters}
                    onChange={(e) => setInputMilkVolumeLiters(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Milk Fat %</label>
                  <input
                    type="number"
                    step="0.1"
                    min="2"
                    max="15"
                    required
                    value={milkFatPct}
                    onChange={(e) => setMilkFatPct(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Milk SNF %</label>
                  <input
                    type="number"
                    step="0.1"
                    min="5"
                    max="15"
                    required
                    value={milkSnfPct}
                    onChange={(e) => setMilkSnfPct(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Coagulant Culture
                  </label>
                  <select
                    value={coagulantType}
                    onChange={(e) => setCoagulantType(e.target.value as ChhanaCoagulantType)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  >
                    <option value="NATURAL_WHEY_CULTURE">Natural Whey Ferment (ঘোল / টক জল)</option>
                    <option value="FOOD_GRADE_CITRIC_ACID">Food Grade Citric Acid (সাইট্রিক)</option>
                    <option value="YOGURT_WHEY_FERMENT">Yogurt Whey Starter (দই বীজ ঘোল)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Curdling Temp (°C)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="60"
                    max="100"
                    required
                    value={coagulationTempCelsius}
                    onChange={(e) => setCoagulationTempCelsius(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Crafting Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  placeholder="Woodfire boiling intensity, cooling before whey addition..."
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCreateBatchOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingBatch}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {isCreatingBatch ? 'Saving Batch...' : 'Register Production Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Update Cooking & Yield */}
      {selectedBatchForUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-stone-900">
                  Update Chhana Yield & Moisture
                </h3>
              </div>
              <button
                onClick={() => setSelectedBatchForUpdate(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCooking} className="mt-5 space-y-4 text-xs sm:text-sm">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-xs text-stone-500">Batch Number:</span>
                <p className="font-mono font-bold text-stone-900">{selectedBatchForUpdate.batchNumber}</p>
                <p className="text-xs text-amber-700 font-semibold mt-0.5">
                  {selectedBatchForUpdate.sweetmeatType.replace(/_/g, ' ')} ({selectedBatchForUpdate.inputMilkVolumeLiters}L milk)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Produced Chhana / Sweets (Kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={updateProducedChhanaKg}
                    onChange={(e) => setUpdateProducedChhanaKg(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Moisture Content (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="90"
                    required
                    value={updateChhanaMoisturePct}
                    onChange={(e) => setUpdateChhanaMoisturePct(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Batch Status</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                >
                  <option value="CURDLING_IN_PROGRESS">Curdling in Progress (ছানা ফোটানো হচ্ছে)</option>
                  <option value="WHEY_DRAINING">Whey Draining in Muslin Cloth (জল ঝরানো)</option>
                  <option value="COOKING_COMPLETED">Cooking Completed (মিষ্টি তৈরির উপযোগী)</option>
                  <option value="MATURING_CLAY_SRA">Incubating in Porous Clay Sra (দই জমানো)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Moira Observation Notes</label>
                <textarea
                  rows={2}
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  placeholder="Firmness texture, whey clarity, pleasant caramel aroma..."
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setSelectedBatchForUpdate(null)}
                  className="px-4 py-2 border border-stone-300 rounded-xl font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingCooking}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {isUpdatingCooking ? 'Saving...' : 'Update Telemetry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Publish Lot to Live Marketplace */}
      {selectedBatchForPublish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-bold text-stone-900">
                  Publish Artisanal Lot to Marketplace
                </h3>
              </div>
              <button
                onClick={() => setSelectedBatchForPublish(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishLot} className="mt-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Commercial Lot Listing Title
                </label>
                <input
                  type="text"
                  required
                  value={lotTitle}
                  onChange={(e) => setLotTitle(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Authentic Packaging Container
                  </label>
                  <select
                    value={packagingType}
                    onChange={(e) => setPackagingType(e.target.value as SweetmeatPackagingType)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  >
                    <option value="POROUS_CLAY_SRA_1KG">Porous Clay Sra 1kg (মাটির সরা)</option>
                    <option value="POROUS_CLAY_SRA_500G">Porous Clay Sra 500g (মাটির ভাঁড়)</option>
                    <option value="HERMETIC_SWEET_BOX_1KG">Hermetic Sweet Box 1kg (এয়ারটাইট বক্স)</option>
                    <option value="FOOD_GRADE_TIN_CAN_2KG">Food Grade Tin Can 2kg (টিনের পাত্র)</option>
                    <option value="GLASS_JAR_GAWA_GHEE_500G">Glass Jar 500g (কাঁচের বৈয়াম)</option>
                    <option value="INSULATED_COLD_BOX_5KG">Insulated Cold Box 5kg (কোল্ড চেইন বাক্স)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Total Lot Weight (Kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={lotTotalWeightKg}
                    onChange={(e) => setLotTotalWeightKg(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Price/Kg (BDT)
                  </label>
                  <input
                    type="number"
                    step="10"
                    min="100"
                    required
                    value={pricePerKgBdt}
                    onChange={(e) => setPricePerKgBdt(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Min Order (Kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={minOrderKg}
                    onChange={(e) => setMinOrderKg(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Texture Rating (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    required
                    value={textureRating}
                    onChange={(e) => setTextureRating(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isGiTagged}
                    onChange={(e) => setIsGiTagged(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                  />
                  <div>
                    <span className="font-semibold text-stone-800 text-xs sm:text-sm block">
                      GI Heritage Certified
                    </span>
                    <span className="text-xs text-stone-500">
                      Tag with Geographical Indication authenticity
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRefrigeratedColdChain}
                    onChange={(e) => setIsRefrigeratedColdChain(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-semibold text-stone-800 text-xs sm:text-sm block">
                      Refrigerated Cold-Chain
                    </span>
                    <span className="text-xs text-stone-500">
                      Dispatch in 4°C insulated cold-pack logistics
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setSelectedBatchForPublish(null)}
                  className="px-4 py-2 border border-stone-300 rounded-xl font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishingLot}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {isPublishingLot ? 'Publishing...' : 'Publish to Marketplace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
