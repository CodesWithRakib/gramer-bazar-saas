'use client';

import React from 'react';
import {
  useGetDemandAnalyticsQuery,
  useGetSeasonalDemandForecastQuery,
  useGetRegionalDemandBreakdownQuery,
} from '@/features/analytics/analyticsApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, AlertTriangle, TrendingUp, Sprout, MapPin, Calendar, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/format';

export interface DemandAnalyticsViewProps {
  lang?: string;
  namespace?: 'admin' | 'super-admin';
}

export function DemandAnalyticsView({ lang = 'en' }: DemandAnalyticsViewProps) {
  const isBn = lang === 'bn';
  const { data, isLoading } = useGetDemandAnalyticsQuery();
  const { data: seasonalData, isLoading: isSeasonalLoading } = useGetSeasonalDemandForecastQuery();
  const { data: regionalData, isLoading: isRegionalLoading } = useGetRegionalDemandBreakdownQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isBn ? 'চাহিদা বিশ্লেষণ' : 'Demand Analytics'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isBn ? 'চাহিদা বিশ্লেষণ লোড হচ্ছে...' : 'Loading demand analytics...'}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-64 rounded-xl border border-gray-100 bg-white p-6 shadow-sm animate-pulse dark:border-border dark:bg-card"></div>
          <div className="h-64 rounded-xl border border-gray-100 bg-white p-6 shadow-sm animate-pulse dark:border-border dark:bg-card"></div>
        </div>
      </div>
    );
  }

  const popularSearches = data?.popularSearches || [];
  const frequentlyUnavailable = data?.frequentlyUnavailable || [];
  const requestedProducts = data?.requestedProducts || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isBn ? 'চাহিদা বিশ্লেষণ' : 'Demand Analytics'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isBn
            ? 'কীওয়ার্ড অনুসন্ধান এবং অনুপলব্ধ পণ্যগুলোর উপর ভিত্তি করে গ্রাহকের চাহিদা বিশ্লেষণ করুন।'
            : 'Analyze customer demand based on search keywords and unavailable products.'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Searches Card */}
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 dark:border-border dark:bg-card">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              <span>{isBn ? 'জনপ্রিয় অনুসন্ধান' : 'Top Searches'}</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isBn ? 'গ্রাহকরা যা খুঁজছেন' : 'What your customers are actively looking for'}
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xs dark:border-border dark:bg-card">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-200 bg-gray-50 uppercase text-xs font-semibold text-gray-900 tracking-wider dark:border-border dark:bg-muted/40 dark:text-foreground">
                  <TableRow>
                    <TableHead className="py-3 px-4">
                      {isBn ? 'কীওয়ার্ড' : 'Search Query'}
                    </TableHead>
                    <TableHead className="py-3 px-4 text-end">
                      {isBn ? 'পরিমাণ' : 'Volume'}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200 dark:divide-border text-sm">
                  {popularSearches.length > 0 ? (
                    popularSearches.map((search, idx) => (
                      <TableRow
                        key={idx}
                        className="hover:bg-gray-50/70 transition-colors dark:hover:bg-muted/30"
                      >
                        <TableCell className="py-3 px-4 font-medium text-foreground">
                          {search.query}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-end">
                          <Badge variant="secondary">{search.count}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                        {isBn ? 'কোনো অনুসন্ধানের তথ্য পাওয়া যায়নি' : 'No search data available'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Missed Opportunities Card */}
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 dark:border-border dark:bg-card">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>{isBn ? 'অনুপলব্ধ পণ্যের চাহিদা' : 'Missed Opportunities'}</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isBn
                ? 'যে পণ্যগুলো স্টকে নেই কিন্তু দেখা হয়েছে'
                : 'Out of stock items with high views'}
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xs dark:border-border dark:bg-card">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-200 bg-gray-50 uppercase text-xs font-semibold text-gray-900 tracking-wider dark:border-border dark:bg-muted/40 dark:text-foreground">
                  <TableRow>
                    <TableHead className="py-3 px-4">{isBn ? 'পণ্যের নাম' : 'Product'}</TableHead>
                    <TableHead className="py-3 px-4 text-end">
                      {isBn ? 'দেখা হয়েছে' : 'Missed Views'}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200 dark:divide-border text-sm">
                  {frequentlyUnavailable.length > 0 ? (
                    frequentlyUnavailable.map((item, idx) => (
                      <TableRow
                        key={idx}
                        className="hover:bg-gray-50/70 transition-colors dark:hover:bg-muted/30"
                      >
                        <TableCell className="py-3 px-4 font-medium text-foreground">
                          {item.productName}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-end text-destructive font-semibold">
                          {item.views}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                        {isBn
                          ? 'কোনো অনুপলব্ধ পণ্য শনাক্ত হয়নি'
                          : 'No missed opportunities detected'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* Product Requests Conversions Card */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 dark:border-border dark:bg-card">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>{isBn ? 'পণ্য অনুরোধের প্রতিবেদন' : 'Product Requests Conversions'}</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isBn
              ? 'অনুরোধকৃত পণ্যের রূপান্তর হার'
              : 'Conversion rates for products requested by customers'}
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xs dark:border-border dark:bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-200 bg-gray-50 uppercase text-xs font-semibold text-gray-900 tracking-wider dark:border-border dark:bg-muted/40 dark:text-foreground">
                <TableRow>
                  <TableHead className="py-3.5 px-4">
                    {isBn ? 'অনুরোধ আইডি' : 'Request ID'}
                  </TableHead>
                  <TableHead className="py-3.5 px-4 text-end">
                    {isBn ? 'অনুরোধের সংখ্যা' : 'Total Requests'}
                  </TableHead>
                  <TableHead className="py-3.5 px-4 text-end">
                    {isBn ? 'ক্রয়' : 'Resulting Purchases'}
                  </TableHead>
                  <TableHead className="py-3.5 px-4 text-end">
                    {isBn ? 'রূপান্তর হার' : 'Conversion Rate'}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200 dark:divide-border text-sm">
                {requestedProducts.length > 0 ? (
                  requestedProducts.map((req, idx) => (
                    <TableRow
                      key={idx}
                      className="hover:bg-gray-50/70 transition-colors dark:hover:bg-muted/30"
                    >
                      <TableCell className="py-3.5 px-4 font-mono font-medium text-foreground">
                        #{req.productRequestId.substring(0, 8)}
                      </TableCell>
                      <TableCell className="py-3.5 px-4 text-end text-muted-foreground">
                        {req.requests}
                      </TableCell>
                      <TableCell className="py-3.5 px-4 text-end text-emerald-600 font-semibold">
                        {req.purchases}
                      </TableCell>
                      <TableCell className="py-3.5 px-4 text-end">
                        <Badge
                          variant={req.conversionRate > 20 ? 'default' : 'secondary'}
                          className={req.conversionRate > 20 ? 'bg-emerald-600' : ''}
                        >
                          {req.conversionRate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      {isBn ? 'কোন পণ্য অনুরোধের তথ্য নেই' : 'No product request data available'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Seasonal Commodity Demand Forecasting (BI) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-600" />
            <span>{isBn ? 'মৌসুমী কৃষি পণ্য চাহিদা পূর্বাভাস' : 'Seasonal Commodity Demand Forecast'}</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isBn
              ? 'বাংলাদেশের ঋতুভিত্তিক ফসলের চক্র এবং সার্চ ভেলোসিটির উপর ভিত্তি করে ভবিষ্যৎ চাহিদা প্রক্ষেপণ।'
              : 'Forward-looking demand projections based on Bangladesh crop cycles and search velocity.'}
          </p>
        </div>

        {seasonalData && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-500/20 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-xs">
                    {isBn ? seasonalData.seasonBn : seasonalData.seasonEn}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {seasonalData.periodMonths}
                  </span>
                </div>
                <p className="text-xs text-foreground font-medium mt-2">
                  {isBn ? seasonalData.insightsBn : seasonalData.insightsEn}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">{isBn ? 'প্রত্যাশিত বৃদ্ধি' : 'Projected Surge'}</div>
                  <div className="text-lg font-bold text-emerald-600">+{seasonalData.projectedSurgePercent}%</div>
                </div>
                <div className="text-right border-s border-emerald-500/20 ps-4">
                  <div className="text-xs text-muted-foreground">{isBn ? 'প্রস্তাবিত বাফার' : 'Safety Buffer'}</div>
                  <div className="text-lg font-bold text-foreground">{seasonalData.recommendedSafetyBufferPercent}%</div>
                </div>
              </div>
            </div>

            {/* Commodities Table */}
            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-emerald-500/10">
                    <TableHead className="text-xs font-semibold">{isBn ? 'পণ্য' : 'Commodity'}</TableHead>
                    <TableHead className="text-xs font-semibold text-center">{isBn ? 'পূর্বাভাস (কেজি)' : 'Forecasted Volume'}</TableHead>
                    <TableHead className="text-xs font-semibold text-center">{isBn ? 'বৃদ্ধির হার' : 'Growth'}</TableHead>
                    <TableHead className="text-xs font-semibold text-end">{isBn ? 'ঝুঁকি স্তর' : 'Risk Tier'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seasonalData.commodities?.map((item, i) => (
                    <TableRow key={i} className="border-emerald-500/10 text-xs">
                      <TableCell className="font-medium text-foreground">
                        {isBn ? item.nameBn : item.nameEn}
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {item.forecastDemandKg.toLocaleString()} KG
                      </TableCell>
                      <TableCell className="text-center text-emerald-600 font-bold">
                        {item.growthRate}
                      </TableCell>
                      <TableCell className="text-end">
                        <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-700 bg-emerald-500/10">
                          {item.riskLevel}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Regional Rural Demand Breakdown */}
      {regionalData && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span>{isBn ? 'আঞ্চলিক গ্রামীণ চাহিদা ঘনত্ব' : 'Regional Demand Density Breakdown'}</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isBn
                ? 'বিভাগ ও জেলাভিত্তিক অর্ডারের ঘনত্ব এবং গড় ভ্যালু বিশ্লেষণ।'
                : 'Order volume, gross merchandise value, and delivery density grouped across regions.'}
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden dark:border-border dark:bg-card">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-muted/40 text-xs font-semibold">
                  <TableRow>
                    <TableHead>{isBn ? 'বিভাগ' : 'Division'}</TableHead>
                    <TableHead>{isBn ? 'জেলা' : 'District'}</TableHead>
                    <TableHead className="text-center">{isBn ? 'অর্ডার সংখ্যা' : 'Orders'}</TableHead>
                    <TableHead className="text-center">{isBn ? 'মোট জিএমভি' : 'Total GMV'}</TableHead>
                    <TableHead className="text-center">{isBn ? 'গড় অর্ডার মান' : 'Avg Order'}</TableHead>
                    <TableHead className="text-end">{isBn ? 'ঘনত্ব স্তর' : 'Density Tier'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  {regionalData.regions?.map((reg, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{reg.division}</TableCell>
                      <TableCell>{reg.district}</TableCell>
                      <TableCell className="text-center font-bold">{reg.orderCount}</TableCell>
                      <TableCell className="text-center font-mono">{formatCurrency(reg.totalGmv, lang)}</TableCell>
                      <TableCell className="text-center font-mono">{formatCurrency(reg.avgOrderValue, lang)}</TableCell>
                      <TableCell className="text-end">
                        <Badge
                          variant="secondary"
                          className={
                            reg.densityTier === 'HIGH_DENSITY'
                              ? 'bg-primary/10 text-primary border-primary/20'
                              : ''
                          }
                        >
                          {reg.densityTier}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
