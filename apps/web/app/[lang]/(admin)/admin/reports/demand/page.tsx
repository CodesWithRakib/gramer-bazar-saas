'use client';

import React, { use } from 'react';
import { useGetDemandAnalyticsQuery } from '@/features/analytics/analyticsApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, AlertTriangle, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function DemandAnalyticsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const { data, isLoading } = useGetDemandAnalyticsQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{isBn ? 'চাহিদা বিশ্লেষণ' : 'Demand Analytics'}</h1>
          <p className="text-muted-foreground mt-2">{isBn ? 'চাহিদা বিশ্লেষণ লোড হচ্ছে...' : 'Loading demand analytics...'}</p>
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
        <h1 className="text-3xl font-bold tracking-tight">{isBn ? 'চাহিদা বিশ্লেষণ' : 'Demand Analytics'}</h1>
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
                    <TableHead className="py-3 px-4">{isBn ? 'কীওয়ার্ড' : 'Search Query'}</TableHead>
                    <TableHead className="py-3 px-4 text-right">{isBn ? 'পরিমাণ' : 'Volume'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200 dark:divide-border text-sm">
                  {popularSearches.length > 0 ? (
                    popularSearches.map((search, idx) => (
                      <TableRow key={idx} className="hover:bg-gray-50/70 transition-colors dark:hover:bg-muted/30">
                        <TableCell className="py-3 px-4 font-medium text-foreground">{search.query}</TableCell>
                        <TableCell className="py-3 px-4 text-right">
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
              {isBn ? 'যে পণ্যগুলো স্টকে নেই কিন্তু দেখা হয়েছে' : 'Out of stock items with high views'}
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xs dark:border-border dark:bg-card">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-200 bg-gray-50 uppercase text-xs font-semibold text-gray-900 tracking-wider dark:border-border dark:bg-muted/40 dark:text-foreground">
                  <TableRow>
                    <TableHead className="py-3 px-4">{isBn ? 'পণ্যের নাম' : 'Product'}</TableHead>
                    <TableHead className="py-3 px-4 text-right">{isBn ? 'দেখা হয়েছে' : 'Missed Views'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200 dark:divide-border text-sm">
                  {frequentlyUnavailable.length > 0 ? (
                    frequentlyUnavailable.map((item, idx) => (
                      <TableRow key={idx} className="hover:bg-gray-50/70 transition-colors dark:hover:bg-muted/30">
                        <TableCell className="py-3 px-4 font-medium text-foreground">{item.productName}</TableCell>
                        <TableCell className="py-3 px-4 text-right text-destructive font-semibold">
                          {item.views}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                        {isBn ? 'কোনো অনুপলব্ধ পণ্য শনাক্ত হয়নি' : 'No missed opportunities detected'}
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
            {isBn ? 'অনুরোধকৃত পণ্যের রূপান্তর হার' : 'Conversion rates for products requested by customers'}
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xs dark:border-border dark:bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-200 bg-gray-50 uppercase text-xs font-semibold text-gray-900 tracking-wider dark:border-border dark:bg-muted/40 dark:text-foreground">
                <TableRow>
                  <TableHead className="py-3.5 px-4">{isBn ? 'অনুরোধ আইডি' : 'Request ID'}</TableHead>
                  <TableHead className="py-3.5 px-4 text-right">{isBn ? 'অনুরোধের সংখ্যা' : 'Total Requests'}</TableHead>
                  <TableHead className="py-3.5 px-4 text-right">{isBn ? 'ক্রয়' : 'Resulting Purchases'}</TableHead>
                  <TableHead className="py-3.5 px-4 text-right">{isBn ? 'রূপান্তর হার' : 'Conversion Rate'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200 dark:divide-border text-sm">
                {requestedProducts.length > 0 ? (
                  requestedProducts.map((req, idx) => (
                    <TableRow key={idx} className="hover:bg-gray-50/70 transition-colors dark:hover:bg-muted/30">
                      <TableCell className="py-3.5 px-4 font-mono font-medium text-foreground">#{req.productRequestId.substring(0, 8)}</TableCell>
                      <TableCell className="py-3.5 px-4 text-right text-muted-foreground">{req.requests}</TableCell>
                      <TableCell className="py-3.5 px-4 text-right text-emerald-600 font-semibold">{req.purchases}</TableCell>
                      <TableCell className="py-3.5 px-4 text-right">
                        <Badge variant={req.conversionRate > 20 ? 'default' : 'secondary'} className={req.conversionRate > 20 ? 'bg-emerald-600' : ''}>
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
    </div>
  );
}
