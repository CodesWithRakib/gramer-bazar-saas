'use client';

import React, { useState } from 'react';
import {
  Coins,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { customToast as toast } from '@/components/ui/custom-toast';
import { formatNumber, formatDate } from '@/lib/format';
import {
  useGetFarmerCreditScoreQuery,
  useGetMyLoansQuery,
  useApplyForMicroLoanMutation,
  MicroLoanApplication,
} from '../agriFintechApi';

const PURPOSES = [
  { key: 'HIGH_YIELD_SEEDS', labelEn: 'High-Yield Seeds (উচ্চ ফলনশীল বীজ)', labelBn: 'উচ্চ ফলনশীল বীজ' },
  { key: 'FERTILIZER_PESTICIDES', labelEn: 'Fertilizer & Organic Nutrients (সার ও কীটনাশক)', labelBn: 'সার ও অনুখাদ্য' },
  { key: 'IRRIGATION_EQUIPMENT', labelEn: 'Solar/Fuel Irrigation Pump (সেচ পাম্প ও মোটর)', labelBn: 'সেচ পাম্প ও ড্রিপ সরঞ্জাম' },
  { key: 'COLD_STORAGE_SOLAR', labelEn: 'Farm Solar / Cold Silo (সৌর বিদ্যুৎ ও মিনি সংরক্ষণাগার)', labelBn: 'সৌর বিদ্যুৎ ও মিনি সংরক্ষণাগার' },
  { key: 'SEASONAL_WORKING_CAPITAL', labelEn: 'Seasonal Harvest Working Capital (মৌসুমি চলতি মূলধন)', labelBn: 'মৌসুমি চলতি মূলধন' },
];

const MFIS = [
  { key: 'BRAC_MICROFINANCE', name: 'BRAC Microfinance Agri Wing' },
  { key: 'GRAMEEN_AGRI', name: 'Grameen Agricultural Trust' },
  { key: 'ASA_FINANCE', name: 'ASA Special Rural Loan' },
  { key: 'BANK_ASIA_AGENT', name: 'Bank Asia Agri Agent Banking' },
];

export function SellerMicroLoansView({ lang = 'bn' }: { lang?: string }) {
  const isBn = lang === 'bn';

  // Dialog State
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [requestedAmount, setRequestedAmount] = useState<number>(50000);
  const [purpose, setPurpose] = useState<string>('HIGH_YIELD_SEEDS');
  const [tenureMonths, setTenureMonths] = useState<number>(6);
  const [partnerMfi, setPartnerMfi] = useState<string>('BRAC_MICROFINANCE');

  // Queries & Mutations
  const { data: credit, isLoading: isCreditLoading } = useGetFarmerCreditScoreQuery();
  const { data: loans = [], isLoading: isLoansLoading } = useGetMyLoansQuery();
  const [applyForLoan, { isLoading: isApplying }] = useApplyForMicroLoanMutation();

  // Calculated EMI: 4.5% subsidized annual rate
  const annualRate = 4.5;
  const totalInterest = requestedAmount * (annualRate / 100) * (tenureMonths / 12);
  const monthlyEmi = Math.round((requestedAmount + totalInterest) / tenureMonths);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credit) return;

    if (requestedAmount > credit.maxEligibleAmount) {
      toast.error(
        isBn
          ? `অনুরোধকৃত পরিমাণ আপনার প্রাক-অনুমোদিত সীমা (৳${formatNumber(credit.maxEligibleAmount, lang)})-এর বেশি হতে পারবে না`
          : `Requested amount cannot exceed your pre-approved limit of ৳${formatNumber(credit.maxEligibleAmount, lang)}`
      );
      return;
    }

    try {
      await applyForLoan({
        requestedAmount: Number(requestedAmount),
        purpose,
        tenureMonths: Number(tenureMonths),
        partnerMfi,
      }).unwrap();

      toast.success(
        isBn
          ? 'ক্ষুদ্রঋণ আবেদন সফলভাবে জমা দেওয়া হয়েছে!'
          : 'Micro-loan application submitted successfully!'
      );
      setIsApplyOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || (isBn ? 'আবেদন ব্যর্থ হয়েছে' : 'Application failed'));
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'DISBURSED':
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs">
            {isBn ? 'বিতরণকৃত' : 'Disbursed'}
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge className="bg-blue-600 hover:bg-blue-500 text-white text-xs">
            {isBn ? 'অনুমোদিত' : 'Approved'}
          </Badge>
        );
      case 'REPAID':
        return (
          <Badge className="bg-purple-600 hover:bg-purple-500 text-white text-xs">
            {isBn ? 'পরিশোধিত' : 'Repaid'}
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="destructive" className="text-xs">
            {isBn ? 'বাতিল' : 'Rejected'}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            {isBn ? 'যাচাই চলছে' : 'Pending Review'}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-700/50 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-200 mb-4 border border-emerald-500/30">
            <Coins className="w-4 h-4 text-emerald-300" />
            {isBn ? 'অ্যাগ্রি-ফিনটেক চলতি মূলধন' : 'Agri-Fintech Working Capital'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {isBn ? 'কৃষক ক্ষুদ্রঋণ ও মৌসুমী পুঁজি সহায়তা' : 'Farmer Micro-Credit & Seasonal Capital'}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            {isBn
              ? 'আপনার শপ ও ডেলিভারি পারফরম্যান্সের ওপর ভিত্তি করে কোনো জামানত ছাড়াই সহজ শর্তে ৪.৫% ভর্তুকিযুক্ত কৃষি ঋণ গ্রহণ করুন।'
              : 'Zero-collateral institutional agricultural capital subsidized at 4.5% annual rate, pre-approved based on your sales track record.'}
          </p>
        </div>
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <CreditCard className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* Credit Score & Eligibility Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Credit Score Dial Card */}
        <Card className="border border-border/80 shadow-sm relative overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {isBn ? 'আপনার কৃষক ক্রেডিট স্কোর' : 'Rural Credit Score'}
              </span>
              <Badge
                className={`text-xs font-bold ${
                  credit?.tier === 'PLATINUM'
                    ? 'bg-purple-100 text-purple-800'
                    : credit?.tier === 'GOLD'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {credit?.tier || 'GOLD'} TIER
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {isCreditLoading ? (
              <Skeleton className="h-32 w-full rounded-2xl" />
            ) : (
              <div className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-slate-900 dark:text-white">
                    {credit?.score || 715}
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">/ 850</span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${((credit?.score || 715) / 850) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
                  <div>
                    <span className="block font-medium">{isBn ? 'ডেলিভারি সফলতার হার' : 'Fulfillment Rate'}</span>
                    <span className="text-emerald-700 font-bold text-sm">
                      {credit?.fulfillmentRate || 98.5}%
                    </span>
                  </div>
                  <div>
                    <span className="block font-medium">{isBn ? 'ডিসপুট অনুপাত' : 'Dispute Ratio'}</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold text-sm">
                      {credit?.disputeRate || 0.8}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pre-Approved Limit Card */}
        <Card className="border border-border/80 shadow-sm relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200/80">
          <CardHeader className="pb-2">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              {isBn ? 'প্রাক-অনুমোদিত ঋণের সর্বোচ্চ সীমা' : 'Pre-Approved Credit Limit'}
            </span>
          </CardHeader>
          <CardContent className="pt-2 space-y-4">
            <div>
              <span className="text-4xl font-black text-emerald-900 dark:text-emerald-100">
                ৳{formatNumber(credit?.maxEligibleAmount || 150000, lang)}
              </span>
              <p className="text-xs text-emerald-700/80 mt-1">
                {isBn
                  ? 'কোনো জমি বা স্থায়ী জামানত ছাড়াই অবিলম্বে উত্তোলনযোগ্য'
                  : 'Zero-collateral immediate disbursement to digital wallet'}
              </p>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-emerald-200/60 text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <div className="flex items-center justify-between">
                <span>{isBn ? 'ভর্তুকিযুক্ত সুদের হার:' : 'Subsidized Interest:'}</span>
                <span className="font-bold text-emerald-700">৪.৫% (Annual)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{isBn ? 'পরিশোধের মেয়াদ:' : 'Available Tenures:'}</span>
                <span className="font-bold">৩ - ১২ মাস</span>
              </div>
            </div>

            <Button
              onClick={() => setIsApplyOpen(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{isBn ? 'পুঁজির জন্য আবেদন করুন' : 'Apply for Working Capital'}</span>
            </Button>
          </CardContent>
        </Card>

        {/* Institutional Partners Card */}
        <Card className="border border-border/80 shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="pb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {isBn ? 'অংশীদার অর্থায়ন প্রতিষ্ঠান' : 'Institutional Funding Partners'}
            </span>
          </CardHeader>
          <CardContent className="pt-2 space-y-3">
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">BRAC Microfinance</div>
                  <div className="text-[11px] text-muted-foreground">{isBn ? 'কৃষি ও ক্ষুদ্র উদ্যোক্তা ঋণ' : 'Agri & Micro Enterprise'}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Grameen Agricultural Trust</div>
                  <div className="text-[11px] text-muted-foreground">{isBn ? 'শস্য উৎপাদন মৌসুমি স্কিম' : 'Seasonal Crop Production Scheme'}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Bank Asia Agent Banking</div>
                  <div className="text-[11px] text-muted-foreground">{isBn ? 'বাংলাদেশ ব্যাংক রিফাইন্যান্স' : 'Central Bank Refinance Line'}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loan Applications & EMI Schedule Table */}
      <Card className="border border-border/80 shadow-sm overflow-hidden">
        <CardHeader className="p-6 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold">
                {isBn ? 'ঋণ আবেদন ও কিস্তি বিবরণী' : 'Loan Applications & Repayment Ledger'}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {isBn
                  ? 'আপনার সক্রিয় ও পূর্ববর্তী সকল কৃষি ক্ষুদ্রঋণের তথ্য'
                  : 'Track your current working capital disbursements, monthly EMIs, and settlements'}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsApplyOpen(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{isBn ? 'নতুন ঋণ আবেদন' : 'New Loan Request'}</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase">
                <tr>
                  <th className="py-3 px-6">{isBn ? 'আবেদন নম্বর' : 'Application #'}</th>
                  <th className="py-3 px-6">{isBn ? 'ঋণের উদ্দেশ্য' : 'Purpose'}</th>
                  <th className="py-3 px-6">{isBn ? 'পরিমাণ' : 'Amount'}</th>
                  <th className="py-3 px-6">{isBn ? 'মাসিক কিস্তি (EMI)' : 'Monthly EMI'}</th>
                  <th className="py-3 px-6">{isBn ? 'অর্থায়নকারী' : 'Partner MFI'}</th>
                  <th className="py-3 px-6 text-center">{isBn ? 'অবস্থা' : 'Status'}</th>
                  <th className="py-3 px-6">{isBn ? 'তারিখ' : 'Date'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {isLoansLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      {isBn ? 'তথ্য লোড হচ্ছে...' : 'Loading loan records...'}
                    </td>
                  </tr>
                ) : loans.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      <div className="max-w-sm mx-auto space-y-3">
                        <Coins className="w-10 h-10 mx-auto text-muted-foreground/60" />
                        <div className="font-semibold text-foreground">
                          {isBn ? 'কোনো ঋণ আবেদন নেই' : 'No Loan Applications Yet'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {isBn
                            ? 'মৌসুমী সার, বীজ বা সেচ সরঞ্জামের জন্য সহজে চলতি পুঁজি নিন।'
                            : 'Access pre-approved zero-collateral capital for seasonal agricultural inputs.'}
                        </p>
                        <Button
                          size="sm"
                          onClick={() => setIsApplyOpen(true)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          {isBn ? 'প্রথম আবেদন করুন' : 'Apply Now'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  loans.map((item: MicroLoanApplication) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-slate-900 dark:text-white">
                        {item.applicationNumber}
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                          {item.purpose.replace(/_/g, ' ')}
                        </span>
                        <div className="text-[11px] text-muted-foreground">
                          {item.tenureMonths} {isBn ? 'মাস মেয়াদ' : 'Months Tenure'}
                        </div>
                      </td>
                      <td className="py-3.5 px-6 font-extrabold text-emerald-700">
                        ৳{formatNumber(item.requestedAmount, lang)}
                      </td>
                      <td className="py-3.5 px-6 font-bold text-slate-900 dark:text-white">
                        ৳{formatNumber(item.monthlyEmi, lang)}
                        <span className="text-[10px] text-muted-foreground block font-normal">
                          @ {item.interestRate}% {isBn ? 'সুদ' : 'Interest'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-xs text-muted-foreground">
                        {item.partnerMfi.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        {renderStatusBadge(item.status)}
                      </td>
                      <td className="py-3.5 px-6 text-xs text-muted-foreground">
                        {formatDate(item.createdAt, lang)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog: Apply for Micro-Loan */}
      <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleApply}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-600" />
                <span>{isBn ? 'মৌসুমী কৃষি ক্ষুদ্রঋণের আবেদন' : 'Apply for Seasonal Agri Capital'}</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                {isBn
                  ? 'আপনার প্রাক-অনুমোদিত ঋণের পরিধি থেকে প্রয়োজনীয় চলতি মূলধন নির্বাচন করুন।'
                  : 'Select your seasonal loan requirements backed by your platform credit profile.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-sm">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>{isBn ? 'ঋণের পরিমাণ (৳ BDT)' : 'Loan Amount (BDT)'} *</Label>
                  <span className="text-xs text-muted-foreground font-semibold">
                    {isBn ? 'সর্বোচ্চ সীমা:' : 'Max Ceiling:'} ৳
                    {formatNumber(credit?.maxEligibleAmount || 150000, lang)}
                  </span>
                </div>
                <Input
                  type="number"
                  min={5000}
                  max={credit?.maxEligibleAmount || 150000}
                  step={5000}
                  required
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(Number(e.target.value))}
                  className="font-bold text-base"
                />
              </div>

              <div className="space-y-1.5">
                <Label>{isBn ? 'ঋণের উদ্দেশ্য' : 'Agricultural Purpose'} *</Label>
                <Select value={purpose} onValueChange={(val) => setPurpose(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PURPOSES.map((p) => (
                      <SelectItem key={p.key} value={p.key}>
                        {isBn ? p.labelBn : p.labelEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{isBn ? 'পরিশোধের মেয়াদ' : 'Tenure (Months)'} *</Label>
                  <Select
                    value={String(tenureMonths)}
                    onValueChange={(val) => setTenureMonths(Number(val))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">{isBn ? '৩ মাস' : '3 Months'}</SelectItem>
                      <SelectItem value="6">{isBn ? '৬ মাস' : '6 Months'}</SelectItem>
                      <SelectItem value="9">{isBn ? '৯ মাস' : '9 Months'}</SelectItem>
                      <SelectItem value="12">{isBn ? '১২ মাস' : '12 Months'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>{isBn ? 'অর্থায়নকারী সংস্থা' : 'Partner MFI'} *</Label>
                  <Select value={partnerMfi} onValueChange={(val) => setPartnerMfi(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MFIS.map((m) => (
                        <SelectItem key={m.key} value={m.key}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Calculated EMI Preview */}
              <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
                  <span>{isBn ? 'আনুমানিক মাসিক কিস্তি (EMI):' : 'Estimated Monthly EMI:'}</span>
                  <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-300">
                    ৳{formatNumber(monthlyEmi, lang)} / {isBn ? 'মাস' : 'month'}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                  {isBn
                    ? 'কিস্তির টাকা প্রতি মাসে স্বয়ংক্রিয়ভাবে আপনার শপ সেলস সেটেলমেন্ট ও ডিজিটাল ওয়ালেট থেকে সমন্বয় করা হবে।'
                    : 'Repayment installments will be smoothly reconciled from your monthly shop order disbursements.'}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsApplyOpen(false)}>
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                disabled={isApplying}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                {isApplying
                  ? isBn
                    ? 'আবেদন জমা হচ্ছে...'
                    : 'Submitting...'
                  : isBn
                    ? 'আবেদন জমা দিন'
                    : 'Submit Application'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
