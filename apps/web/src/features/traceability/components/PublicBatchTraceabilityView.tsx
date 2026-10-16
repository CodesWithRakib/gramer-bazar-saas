'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  Leaf,
  Scale,
  Building2,
  Clock,
  Sparkles,
  QrCode,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import {
  useGetPublicBatchPassportQuery,
  ProduceGrade,
  CheckpointStage,
} from '../traceabilityApi';

export interface PublicBatchTraceabilityViewProps {
  batchNumber: string;
  lang?: string;
}

export function PublicBatchTraceabilityView({
  batchNumber,
  lang = 'en',
}: PublicBatchTraceabilityViewProps) {
  const isBn = lang === 'bn';

  const { data: passport, isLoading, isError } = useGetPublicBatchPassportQuery(batchNumber);

  if (isLoading) {
    return (
      <div className="container max-w-3xl mx-auto py-10 px-4 space-y-6">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !passport) {
    return (
      <div className="container max-w-lg mx-auto py-16 px-4">
        <EmptyState
          title={isBn ? 'ব্যাচ পাসপোর্ট খুঁজে পাওয়া যায়নি' : 'Produce Passport Not Found'}
          description={
            isBn
              ? `ব্যাচ নম্বর '${batchNumber}' এর জন্য কোনো শস্যের রেকর্ড পাওয়া যায়নি। অনুগ্রহ করে প্যাকেজিংয়ের কিউআর কোডটি পুনরায় পরীক্ষা করুন।`
              : `No verified harvest record was found for batch '${batchNumber}'. Please verify the packaging QR code.`
          }
          icon={<QrCode className="w-8 h-8 text-muted-foreground" />}
          action={{
            label: isBn ? 'হোমপেজে ফিরে যান' : 'Back to Home',
            onClick: () => {
              if (typeof window !== 'undefined') window.location.href = `/${lang}`;
            },
          }}
        />
      </div>
    );
  }

  const isGradeA = passport.quality.grade === ProduceGrade.GRADE_A;
  const isGradeB = passport.quality.grade === ProduceGrade.GRADE_B;
  const isGradeC = passport.quality.grade === ProduceGrade.GRADE_C;

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4 space-y-6">
      {/* Top Authenticity Banner */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-200">
              {isBn ? 'যাচাইকৃত গ্রামীণ কৃষি পণ্য' : 'Verified Authentic Rural Farm Produce'}
            </h4>
            <p className="text-xs text-emerald-800 dark:text-emerald-300">
              {isBn
                ? 'গ্রামের বাজার ট্রায়াসিবিলিটি ইঞ্জিন দ্বারা শতভাগ নিশ্চিত ও প্রত্যয়িত।'
                : '100% verified directly from local producer to your table via Gramer Bazar.'}
            </p>
          </div>
        </div>

        <Badge variant="outline" className="font-mono text-xs bg-white dark:bg-card shrink-0">
          {passport.batchNumber}
        </Badge>
      </div>

      {/* Hero Produce Card */}
      <Card className="rounded-3xl border shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-primary/10 via-emerald-500/5 to-transparent p-6 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {passport.cropType}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">
                {passport.variety} {passport.cropType}
              </h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>
                  {passport.farmLocation}, {passport.region}
                </span>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <Badge
                className={`text-sm px-3 py-1 font-bold shadow-sm ${
                  isGradeA
                    ? 'bg-emerald-500 text-white'
                    : isGradeB
                    ? 'bg-blue-500 text-white'
                    : isGradeC
                    ? 'bg-amber-500 text-white'
                    : 'bg-rose-500 text-white'
                }`}
              >
                {passport.quality.grade.replace('_', ' ')}
              </Badge>
              <span className="text-xs text-muted-foreground block mt-1">
                Score: {passport.quality.score}/100 • Defects: {passport.quality.defectPercentage}%
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* 3 Pillars: Producer, Safety, Yield */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/40 p-4 rounded-2xl space-y-1">
              <span className="text-[11px] font-semibold uppercase text-muted-foreground block">
                {isBn ? 'উৎপাদনকারী কৃষক' : 'Producer / Farmer'}
              </span>
              <h4 className="font-bold text-sm text-foreground">{passport.producer.name}</h4>
              <p className="text-xs text-muted-foreground">{passport.producer.contactPhone}</p>
            </div>

            <div className="bg-muted/40 p-4 rounded-2xl space-y-1">
              <span className="text-[11px] font-semibold uppercase text-muted-foreground block">
                {isBn ? 'কীটনাশক ও জৈব মান' : 'Safety Profile'}
              </span>
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
                <Leaf className="w-4 h-4" />
                <span>
                  {passport.quality.organicCertified
                    ? 'ORGANIC'
                    : passport.quality.pesticideProfile.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {isBn ? 'নিরাপদ খাদ্য মান নিয়ন্ত্রিত' : 'Chemical safety compliant'}
              </p>
            </div>

            <div className="bg-muted/40 p-4 rounded-2xl space-y-1">
              <span className="text-[11px] font-semibold uppercase text-muted-foreground block">
                {isBn ? 'কাটার তারিখ' : 'Harvest Date'}
              </span>
              <h4 className="font-bold text-sm text-foreground">
                {new Date(passport.harvestDate).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h4>
              <p className="text-xs text-muted-foreground">
                {Number(passport.yieldKg).toLocaleString()} kg recorded
              </p>
            </div>
          </div>

          {/* Quality Assessment Summary */}
          {passport.quality.assessmentDetails && (
            <div className="border border-border/80 rounded-2xl p-4 bg-card shadow-sm space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                {isBn ? 'কোয়ালিটি মূল্যায়ন মন্তব্য' : 'Expert Quality Evaluation'}
              </h4>
              <p className="text-sm font-medium text-foreground">
                {isBn
                  ? passport.quality.assessmentDetails.recommendationBn
                  : passport.quality.assessmentDetails.recommendationEn}
              </p>
            </div>
          )}

          {/* Cold-Storage Info */}
          {passport.storage && (
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-3">
              <Building2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <h4 className="font-bold text-sm text-blue-900 dark:text-blue-200">
                  {passport.storage.hubName}
                </h4>
                <p className="text-muted-foreground">
                  {passport.storage.address}, {passport.storage.district}
                </p>
                <p className="text-blue-700 dark:text-blue-300 font-medium pt-1">
                  {isBn
                    ? 'কোল্ড স্টোরেজে বৈজ্ঞানিক আর্দ্রতা ও তাপমাত্রায় সংরক্ষিত।'
                    : 'Stored under climate-controlled cold storage preservation.'}
                </p>
              </div>
            </div>
          )}

          {/* Farm-to-Fork Chronological Timeline */}
          <div className="space-y-4 pt-2">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              {isBn ? 'ফার্ম-টু-ফর্ক যাত্রা ও রূপরেখা' : 'Farm-to-Fork Verified Journey'}
            </h3>

            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-border">
              {passport.timeline.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-4 pl-1">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold z-10 shrink-0 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 rounded-xl p-3 border bg-muted/20 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-primary">
                        {step.stage.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(step.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-medium text-foreground">{step.location}</p>
                    <p className="text-muted-foreground">{step.notes || step.handlerName}</p>
                    {step.temperatureC !== undefined && (
                      <span className="inline-block mt-1 font-mono text-[10px] bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded">
                        Temp: {step.temperatureC}°C • Humidity: {step.humidity}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Footer */}
          <div className="pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-muted-foreground">
              {isBn
                ? 'সরাসরি কৃষকের কাছ থেকে খাঁটি গ্রামীণ পণ্য কিনুন।'
                : 'Empowering village farmers through fair digital agriculture.'}
            </span>
            <Button asChild size="sm" className="gap-1.5 text-xs bg-primary text-primary-foreground">
              <Link href={`/${lang}/products`}>
                <ShoppingBag className="w-3.5 h-3.5" />
                {isBn ? 'বাজারের পণ্য দেখুন' : 'Explore Gramer Bazar'}
                <ArrowRight className="w-3 h-3 ml-0.5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
