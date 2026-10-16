'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Plus,
  RotateCw,
  Building2,
  Calendar,
  MapPin,
  ExternalLink,
  Printer,
  ChevronRight,
  TrendingUp,
  Leaf,
  Scale,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import {
  useGetMyProduceBatchesQuery,
  useCreateProduceBatchMutation,
  useAddCheckpointEventMutation,
  ProduceBatch,
  CropType,
  ProduceGrade,
  PesticideUsage,
  BatchStatus,
  CheckpointStage,
} from '../traceabilityApi';

export interface SellerProduceGradingViewProps {
  lang?: string;
}

export function SellerProduceGradingView({ lang = 'en' }: SellerProduceGradingViewProps) {
  const isBn = lang === 'bn';
  const [selectedCrop, setSelectedCrop] = useState<string>('ALL');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [qrModalBatch, setQrModalBatch] = useState<ProduceBatch | null>(null);
  const [checkpointModalBatch, setCheckpointModalBatch] = useState<ProduceBatch | null>(null);

  // Creation Form State
  const [cropType, setCropType] = useState<CropType>(CropType.POTATO);
  const [variety, setVariety] = useState('');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().slice(0, 10));
  const [farmLocation, setFarmLocation] = useState('');
  const [division, setDivision] = useState('Rangpur');
  const [district, setDistrict] = useState('Dinajpur');
  const [upazila, setUpazila] = useState('Birganj');
  const [harvestYieldKg, setHarvestYieldKg] = useState(1000);
  const [organicCertified, setOrganicCertified] = useState(false);
  const [pesticideProfile, setPesticideProfile] = useState<PesticideUsage>(
    PesticideUsage.INTEGRATED_PEST_MANAGEMENT,
  );

  // Visual Inspection Sliders
  const [uniformityScore, setUniformityScore] = useState(88);
  const [surfaceDefectScore, setSurfaceDefectScore] = useState(90);
  const [colorScore, setColorScore] = useState(85);
  const [moistureScore, setMoistureScore] = useState(85);

  // Checkpoint Form State
  const [checkpointStage, setCheckpointStage] = useState<CheckpointStage>(
    CheckpointStage.COLD_STORAGE_DEPOSIT,
  );
  const [checkpointLocation, setCheckpointLocation] = useState('');
  const [checkpointHandler, setCheckpointHandler] = useState('');
  const [temperatureC, setTemperatureC] = useState<number | undefined>(undefined);
  const [humidity, setHumidity] = useState<number | undefined>(undefined);
  const [checkpointNotes, setCheckpointNotes] = useState('');

  const cropFilter = selectedCrop === 'ALL' ? undefined : (selectedCrop as CropType);

  const {
    data: batchesData,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetMyProduceBatchesQuery(cropFilter ? { cropType: cropFilter } : undefined);

  const [createProduceBatch, { isLoading: isCreating }] = useCreateProduceBatchMutation();
  const [addCheckpointEvent, { isLoading: isAddingCheckpoint }] = useAddCheckpointEventMutation();

  // Instant grading preview calculation
  const livePreview = useMemo(() => {
    let score =
      0.3 * uniformityScore + 0.35 * surfaceDefectScore + 0.2 * colorScore + 0.15 * moistureScore;
    if (organicCertified) score = Math.min(100, score + 5);
    if (pesticideProfile === PesticideUsage.THRESHOLD_EXCEEDED) score = Math.min(48, score - 30);

    const finalScore = Math.round(score);
    const defectPct = Math.max(
      0.5,
      Math.min(100, Math.round((100 - surfaceDefectScore) * 0.45 * 10) / 10),
    );

    let grade: ProduceGrade;
    let premiumPercent: number;

    if (finalScore >= 85) {
      grade = ProduceGrade.GRADE_A;
      premiumPercent = 18;
    } else if (finalScore >= 70) {
      grade = ProduceGrade.GRADE_B;
      premiumPercent = 5;
    } else if (finalScore >= 50) {
      grade = ProduceGrade.GRADE_C;
      premiumPercent = -10;
    } else {
      grade = ProduceGrade.REJECTED;
      premiumPercent = -35;
    }

    return { score: finalScore, defectPct, grade, premiumPercent };
  }, [
    uniformityScore,
    surfaceDefectScore,
    colorScore,
    moistureScore,
    organicCertified,
    pesticideProfile,
  ]);

  const handleCreateBatch = async () => {
    try {
      await createProduceBatch({
        cropType,
        variety: variety || 'Deshi Local',
        harvestDate,
        farmLocation: farmLocation || 'Village Farm Ground',
        division,
        district,
        upazila,
        harvestYieldKg: Number(harvestYieldKg) || 500,
        organicCertified,
        pesticideProfile,
        uniformityScore,
        surfaceDefectScore,
        colorScore,
        moistureScore,
      }).unwrap();

      setCreateModalOpen(false);
      refetch();
    } catch (err) {
      console.error('Failed to create produce batch', err);
    }
  };

  const handleAddCheckpoint = async () => {
    if (!checkpointModalBatch) return;
    try {
      await addCheckpointEvent({
        id: checkpointModalBatch.id,
        stage: checkpointStage,
        location: checkpointLocation || `${checkpointModalBatch.district} Facility`,
        handlerName: checkpointHandler || 'Warehouse Officer',
        temperatureC: temperatureC !== undefined ? Number(temperatureC) : undefined,
        humidity: humidity !== undefined ? Number(humidity) : undefined,
        notes: checkpointNotes || undefined,
      }).unwrap();

      setCheckpointModalBatch(null);
      refetch();
    } catch (err) {
      console.error('Failed to add checkpoint', err);
    }
  };

  const batches = batchesData?.data || [];

  return (
    <div className="space-y-6 pt-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <PageHeader
            title={
              isBn
                ? 'শস্য কোয়ালিটি গ্রেডিং ও ফার্ম-টু-ফর্ক ব্যাচ ট্র্যাকিং'
                : 'Produce Quality Grading & Farm-to-Fork Traceability'
            }
            description={
              isBn
                ? 'কম্পিউটার ভিশন কোয়ালিটি গ্রেডিং, কিউআর কোড পাসপোর্ট এবং কোল্ড-স্টোরেজ ট্র্যাকিং।'
                : 'Automated produce grade assessment, verifiable QR batch passports, and cold-chain transparency.'
            }
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-1.5 text-xs h-9"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            {isBn ? 'রিফ্রেশ' : 'Refresh'}
          </Button>

          <Button
            onClick={() => setCreateModalOpen(true)}
            size="sm"
            className="gap-1.5 text-xs h-9 bg-primary text-primary-foreground shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {isBn ? 'নতুন শস্য ব্যাচ যোগ করুন' : 'Register Harvest Batch'}
          </Button>
        </div>
      </div>

      {/* Filter and Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-xl border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {isBn ? 'গ্রেড এ ব্যাচ' : 'Grade A Batches'}
              </p>
              <h3 className="text-lg font-bold">
                {batches.filter((b) => b.qualityGrade === ProduceGrade.GRADE_A).length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {isBn ? 'মোট নিবন্ধিত শস্য' : 'Total Harvest Recorded'}
              </p>
              <h3 className="text-lg font-bold">
                {batches
                  .reduce((sum, b) => sum + Number(b.harvestYieldKg || 0), 0)
                  .toLocaleString()}{' '}
                <span className="text-xs font-normal text-muted-foreground">kg</span>
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {isBn ? 'কোল্ড স্টোরেজে সংরক্ষিত' : 'In Cold Storage'}
              </p>
              <h3 className="text-lg font-bold">
                {batches.filter((b) => b.status === BatchStatus.IN_COLD_STORAGE).length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {isBn ? 'অর্গানিক ও আইপিএম' : 'Organic & IPM Certified'}
              </p>
              <h3 className="text-lg font-bold">
                {
                  batches.filter(
                    (b) =>
                      b.organicCertified ||
                      b.pesticideProfile === PesticideUsage.ZERO_PESTICIDE_ORGANIC,
                  ).length
                }
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'POTATO', 'RICE', 'TOMATO', 'ONION', 'MANGO'].map((c) => (
          <Button
            key={c}
            size="sm"
            variant={selectedCrop === c ? 'default' : 'outline'}
            onClick={() => setSelectedCrop(c)}
            className="text-xs h-8"
          >
            {c === 'ALL'
              ? isBn
                ? 'সকল ফসল'
                : 'All Crops'
              : c}
          </Button>
        ))}
      </div>

      {/* Batches List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      ) : batches.length === 0 ? (
        <EmptyState
          title={isBn ? 'কোনো শস্য ব্যাচ পাওয়া যায়নি' : 'No Produce Batches Found'}
          description={
            isBn
              ? 'আপনার খামারের ফসল নিবন্ধন করে স্বয়ংক্রিয় গ্রেডিং ও কিউআর কোড পাসপোর্ট তৈরি করুন।'
              : 'Register your harvest to receive algorithmic quality grading and printable QR passports.'
          }
          icon={<ShieldCheck className="w-8 h-8 text-muted-foreground" />}
          action={{
            label: isBn ? 'নতুন ব্যাচ নিবন্ধন করুন' : 'Register Harvest Batch',
            onClick: () => setCreateModalOpen(true),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((batch) => {
            const isGradeA = batch.qualityGrade === ProduceGrade.GRADE_A;
            const isGradeB = batch.qualityGrade === ProduceGrade.GRADE_B;
            const isGradeC = batch.qualityGrade === ProduceGrade.GRADE_C;

            return (
              <Card
                key={batch.id}
                className="rounded-2xl border shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <Badge variant="outline" className="font-mono text-xs">
                      {batch.batchNumber}
                    </Badge>
                    <Badge
                      className={`text-xs ${
                        isGradeA
                          ? 'bg-emerald-500 text-white'
                          : isGradeB
                          ? 'bg-blue-500 text-white'
                          : isGradeC
                          ? 'bg-amber-500 text-white'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {batch.qualityGrade.replace('_', ' ')}
                    </Badge>
                  </div>

                  <CardTitle className="text-base flex items-center justify-between">
                    <span>
                      {batch.variety} {batch.cropType}
                    </span>
                    <span className="text-sm font-semibold text-primary">
                      {Number(batch.harvestYieldKg).toLocaleString()} kg
                    </span>
                  </CardTitle>

                  <CardDescription className="text-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span>
                      {batch.upazila}, {batch.district}
                    </span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 pt-2 space-y-3">
                  {/* Quality & Defect Bar */}
                  <div className="bg-muted/40 p-3 rounded-xl space-y-1.5 text-xs">
                    <div className="flex justify-between items-center font-medium">
                      <span>{isBn ? 'কোয়ালিটি স্কোর:' : 'Quality Score:'}</span>
                      <span className="font-bold text-primary">{batch.qualityScore}/100</span>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>{isBn ? 'দাগের শতকরা হার:' : 'Defect Ratio:'}</span>
                      <span>{batch.defectPercentage}%</span>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>{isBn ? 'কীটনাশক মান:' : 'Pesticide Status:'}</span>
                      <span className="font-semibold text-emerald-600">
                        {batch.organicCertified
                          ? 'ORGANIC'
                          : batch.pesticideProfile?.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setQrModalBatch(batch)}
                      className="text-xs h-8 gap-1"
                    >
                      <QrCode className="w-3.5 h-3.5 text-primary" />
                      {isBn ? 'কিউআর পাসপোর্ট' : 'QR Passport'}
                    </Button>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setCheckpointModalBatch(batch);
                        setCheckpointLocation(`${batch.district} Storage Hub`);
                        setCheckpointHandler('Warehouse Supervisor');
                      }}
                      className="text-xs h-8 gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {isBn ? 'চেকপয়েন্ট যোগ' : 'Add Handover'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal: Create Harvest Batch */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {isBn ? 'নতুন শস্য ব্যাচ ও গ্রেডিং মূল্যায়ন' : 'Register Harvest & Quality Grading'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {isBn
                ? 'ফসলের বিবরণ ও সতেজতার প্যারামিটার প্রদান করুন। সিস্টেম স্বয়ংক্রিয়ভাবে গ্রেড নির্ধারণ করবে।'
                : 'Enter harvest details and visual inspection indicators for algorithmic grade determination.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* General Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{isBn ? 'ফসলের ধরন' : 'Crop Type'}</Label>
                <Select value={cropType} onValueChange={(v) => setCropType(v as CropType)}>
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CropType).map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">{isBn ? 'জাত / ভ্যারাইটি' : 'Variety'}</Label>
                <Input
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="e.g. Diamond, Miniket, Deshi"
                  className="text-xs h-8"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{isBn ? 'ফলনের পরিমাণ (কেজি)' : 'Harvest Yield (Kg)'}</Label>
                <Input
                  type="number"
                  value={harvestYieldKg}
                  onChange={(e) => setHarvestYieldKg(Number(e.target.value))}
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">{isBn ? 'কাটার তারিখ' : 'Harvest Date'}</Label>
                <Input
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{isBn ? 'বিভাগ' : 'Division'}</Label>
                <Input
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isBn ? 'জেলা' : 'District'}</Label>
                <Input
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isBn ? 'উপজেলা' : 'Upazila'}</Label>
                <Input
                  value={upazila}
                  onChange={(e) => setUpazila(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{isBn ? 'খামারের অবস্থান / ঠিকানা' : 'Farm Location'}</Label>
              <Input
                value={farmLocation}
                onChange={(e) => setFarmLocation(e.target.value)}
                placeholder="e.g. Ward 4, Purba Birganj"
                className="text-xs h-8"
              />
            </div>

            {/* Visual Quality Grading Sliders */}
            <div className="border rounded-xl p-3 space-y-3 bg-muted/20">
              <h4 className="font-semibold text-xs flex items-center gap-1.5 text-primary">
                <Sparkles className="w-3.5 h-3.5" />
                {isBn ? 'কোয়ালিটি পরিমাপক (Visual Parameters)' : 'Visual Inspection Parameters'}
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>{isBn ? 'আকার ও সমরূপতা' : 'Size Uniformity'}</span>
                    <span className="font-bold">{uniformityScore}/100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={uniformityScore}
                    onChange={(e) => setUniformityScore(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>{isBn ? 'দাগহীনতা ও সতেজতা' : 'Surface Defect Freedom'}</span>
                    <span className="font-bold">{surfaceDefectScore}/100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={surfaceDefectScore}
                    onChange={(e) => setSurfaceDefectScore(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>{isBn ? 'রং ও পরিপক্কতা' : 'Color Maturity'}</span>
                    <span className="font-bold">{colorScore}/100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={colorScore}
                    onChange={(e) => setColorScore(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>{isBn ? 'আর্দ্রতা ও দৃঢ়তা' : 'Firmness & Moisture'}</span>
                    <span className="font-bold">{moistureScore}/100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={moistureScore}
                    onChange={(e) => setMoistureScore(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              </div>
            </div>

            {/* Live AI Grading Result Preview Box */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  {isBn ? 'আনুমানিক গ্রেড মূল্যায়ন' : 'Projected Quality Grade'}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge
                    className={`text-xs ${
                      livePreview.grade === ProduceGrade.GRADE_A
                        ? 'bg-emerald-500 text-white'
                        : livePreview.grade === ProduceGrade.GRADE_B
                        ? 'bg-blue-500 text-white'
                        : livePreview.grade === ProduceGrade.GRADE_C
                        ? 'bg-amber-500 text-white'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {livePreview.grade.replace('_', ' ')}
                  </Badge>
                  <span className="font-bold text-sm">Score: {livePreview.score}/100</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-muted-foreground block">
                  {isBn ? 'প্রস্তাবিত মূল্য প্রভাব' : 'Price Premium Impact'}
                </span>
                <span
                  className={`font-bold text-sm ${
                    livePreview.premiumPercent >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {livePreview.premiumPercent >= 0 ? `+${livePreview.premiumPercent}%` : `${livePreview.premiumPercent}%`}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateModalOpen(false)}
              className="text-xs"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button
              size="sm"
              onClick={handleCreateBatch}
              disabled={isCreating}
              className="text-xs gap-1.5 bg-primary text-primary-foreground"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isCreating
                ? isBn
                  ? 'নিবন্ধন হচ্ছে...'
                  : 'Registering...'
                : isBn
                ? 'ব্যাচ ও গ্রেড নিশ্চিত করুন'
                : 'Confirm & Grade Batch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Printable QR Passport */}
      <Dialog open={!!qrModalBatch} onOpenChange={(open) => !open && setQrModalBatch(null)}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5 text-primary" />
              {isBn ? 'ডিজিটাল ব্যাচ পাসপোর্ট' : 'Digital Batch Passport'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {isBn
                ? 'এই কিউআর কোড বস্তা বা কার্টনের গায়ে প্রিন্ট করে লাগিয়ে দিন।'
                : 'Print and attach this QR passport to crop packaging for buyer verification.'}
            </DialogDescription>
          </DialogHeader>

          {qrModalBatch && (
            <div className="space-y-4 py-3">
              {/* Printable Packaging Tag Card */}
              <div className="p-4 border-2 border-dashed border-primary/40 rounded-2xl bg-card space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-bold text-xs uppercase text-primary">
                    Gramer Bazar Verified
                  </span>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {qrModalBatch.batchNumber}
                  </Badge>
                </div>

                <div className="flex justify-center py-2">
                  <div className="w-32 h-32 border-4 border-slate-900 rounded-xl p-2 flex flex-col items-center justify-center bg-white shadow-sm">
                    <QrCode className="w-24 h-24 text-slate-900" />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-sm">
                    {qrModalBatch.variety} {qrModalBatch.cropType}
                  </h4>
                  <p className="text-muted-foreground text-[11px]">
                    {qrModalBatch.upazila}, {qrModalBatch.district} • {qrModalBatch.harvestYieldKg} kg
                  </p>
                  <div className="flex justify-center gap-2 pt-1">
                    <Badge className="bg-emerald-500 text-white text-[10px]">
                      {qrModalBatch.qualityGrade}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {qrModalBatch.organicCertified ? 'ORGANIC' : 'IPM VERIFIED'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Public URL verification preview */}
              <div className="text-xs text-muted-foreground">
                <p>{isBn ? 'পাবলিক যাচাইকরণ লিংক:' : 'Public consumer verification link:'}</p>
                <Link
                  href={`/trace/${qrModalBatch.batchNumber}`}
                  target="_blank"
                  className="font-mono text-primary font-medium hover:underline inline-flex items-center gap-1 mt-0.5"
                >
                  <span>/trace/{qrModalBatch.batchNumber}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQrModalBatch(null)}
              className="text-xs"
            >
              {isBn ? 'বন্ধ করুন' : 'Close'}
            </Button>
            <Button
              size="sm"
              onClick={() => window.print()}
              className="text-xs gap-1.5 bg-primary text-primary-foreground"
            >
              <Printer className="w-3.5 h-3.5" />
              {isBn ? 'লেবেল প্রিন্ট করুন' : 'Print Label'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Add Handover Checkpoint Event */}
      <Dialog
        open={!!checkpointModalBatch}
        onOpenChange={(open) => !open && setCheckpointModalBatch(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              {isBn ? 'হ্যান্ডওভার চেকপয়েন্ট রেকর্ড করুন' : 'Record Handover Checkpoint'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {isBn
                ? 'কোল্ড স্টোরেজ জমা, প্যাকেজিং বা পরিবহন সংক্রান্ত তথ্য লগ করুন।'
                : 'Log cold-storage deposit, packaging, or transit dispatch milestone.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">{isBn ? 'ধাপ / স্টেজ' : 'Milestone Stage'}</Label>
              <Select
                value={checkpointStage}
                onValueChange={(v) => setCheckpointStage(v as CheckpointStage)}
              >
                <SelectTrigger className="text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CheckpointStage.COLD_STORAGE_DEPOSIT} className="text-xs">
                    Cold Storage Deposit (কোল্ড স্টোরেজ জমা)
                  </SelectItem>
                  <SelectItem value={CheckpointStage.PACKAGING_QR_STAMP} className="text-xs">
                    Packaging & QR Stamped (প্যাকেজিং)
                  </SelectItem>
                  <SelectItem value={CheckpointStage.DISPATCH_IN_TRANSIT} className="text-xs">
                    Dispatch In Transit (পরিবহনে প্রেরণ)
                  </SelectItem>
                  <SelectItem value={CheckpointStage.DELIVERED_TO_BUYER} className="text-xs">
                    Delivered To Buyer (ক্রেতার কাছে হস্তান্তর)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{isBn ? 'অবস্থান' : 'Location'}</Label>
              <Input
                value={checkpointLocation}
                onChange={(e) => setCheckpointLocation(e.target.value)}
                placeholder="e.g. Dinajpur Central Cold Storage"
                className="text-xs h-8"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{isBn ? 'দায়িত্বপ্রাপ্ত কর্মকর্তা / হ্যান্ডলার' : 'Handler Name'}</Label>
              <Input
                value={checkpointHandler}
                onChange={(e) => setCheckpointHandler(e.target.value)}
                placeholder="e.g. Shahidul Islam"
                className="text-xs h-8"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{isBn ? 'তাপমাত্রা (°C)' : 'Temperature (°C)'}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={temperatureC ?? ''}
                  onChange={(e) => setTemperatureC(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="e.g. 4.5"
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">{isBn ? 'আর্দ্রতা (%)' : 'Humidity (%)'}</Label>
                <Input
                  type="number"
                  value={humidity ?? ''}
                  onChange={(e) => setHumidity(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="e.g. 85"
                  className="text-xs h-8"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{isBn ? 'মন্তব্য' : 'Notes'}</Label>
              <Input
                value={checkpointNotes}
                onChange={(e) => setCheckpointNotes(e.target.value)}
                placeholder="e.g. Kept in Chamber 2, Rack 12"
                className="text-xs h-8"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCheckpointModalBatch(null)}
              className="text-xs"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button
              size="sm"
              onClick={handleAddCheckpoint}
              disabled={isAddingCheckpoint}
              className="text-xs bg-primary text-primary-foreground"
            >
              {isAddingCheckpoint
                ? isBn
                  ? 'সংরক্ষণ হচ্ছে...'
                  : 'Saving...'
                : isBn
                ? 'চেকপয়েন্ট সংরক্ষণ করুন'
                : 'Save Checkpoint'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
