'use client';

import React, { use } from 'react';
import { useGetDemandAnalyticsQuery } from '@/features/analytics/analyticsApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Eye, AlertTriangle, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function DemandAnalyticsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const isBn = lang === 'bn';
  const { data, isLoading } = useGetDemandAnalyticsQuery();

  if (isLoading) return <div className="p-8">{isBn ? 'চাহিদা বিশ্লেষণ লোড হচ্ছে...' : 'Loading demand analytics...'}</div>;

  const popularSearches = data?.popularSearches || [];
  const frequentlyUnavailable = data?.frequentlyUnavailable || [];
  const requestedProducts = data?.requestedProducts || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{isBn ? 'চাহিদা বিশ্লেষণ' : 'Demand Analytics'}</h1>
        <p className="text-muted-foreground mt-2">
          {isBn 
            ? 'কীওয়ার্ড অনুসন্ধান এবং অনুপলব্ধ পণ্যগুলোর উপর ভিত্তি করে গ্রাহকের চাহিদা বিশ্লেষণ করুন।' 
            : 'Analyze customer demand based on search keywords and unavailable products.'}
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2 text-primary" />
              {isBn ? 'জনপ্রিয় অনুসন্ধান' : 'Top Searches'}
            </CardTitle>
            <CardDescription>{isBn ? 'গ্রাহকরা যা খুঁজছেন' : 'What your customers are actively looking for'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isBn ? 'কীওয়ার্ড' : 'Search Query'}</TableHead>
                  <TableHead className="text-right">{isBn ? 'পরিমাণ' : 'Volume'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {popularSearches.length > 0 ? (
                  popularSearches.map((search, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{search.query}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{search.count}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
                      {isBn ? 'কোন তথ্য পাওয়া যায়নি' : 'No search data available'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="w-5 h-5 mr-2" />
              {isBn ? 'অনুপলব্ধ পণ্যের চাহিদা' : 'Missed Opportunities'}
            </CardTitle>
            <CardDescription>{isBn ? 'যে পণ্যগুলো স্টকে নেই কিন্তু দেখা হয়েছে' : 'Out of stock items with high views'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isBn ? 'পণ্যের নাম' : 'Product'}</TableHead>
                  <TableHead className="text-right">{isBn ? 'দেখা হয়েছে' : 'Missed Views'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {frequentlyUnavailable.length > 0 ? (
                  frequentlyUnavailable.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="text-right text-destructive font-semibold">
                        {item.views}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
                      {isBn ? 'কোন তথ্য পাওয়া যায়নি' : 'No missed opportunities detected'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary" />
            {isBn ? 'পণ্য অনুরোধের প্রতিবেদন' : 'Product Requests Conversions'}
          </CardTitle>
          <CardDescription>{isBn ? 'অনুরোধকৃত পণ্যের রূপান্তর হার' : 'Conversion rates for products requested by customers'}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isBn ? 'অনুরোধ আইডি' : 'Request ID'}</TableHead>
                <TableHead className="text-right">{isBn ? 'অনুরোধের সংখ্যা' : 'Total Requests'}</TableHead>
                <TableHead className="text-right">{isBn ? 'ক্রয়' : 'Resulting Purchases'}</TableHead>
                <TableHead className="text-right">{isBn ? 'রূপান্তর হার' : 'Conversion Rate'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requestedProducts.length > 0 ? (
                requestedProducts.map((req, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">#{req.productRequestId.substring(0, 8)}</TableCell>
                    <TableCell className="text-right">{req.requests}</TableCell>
                    <TableCell className="text-right text-green-600 font-semibold">{req.purchases}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={req.conversionRate > 20 ? 'default' : 'secondary'} className={req.conversionRate > 20 ? 'bg-green-500' : ''}>
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
        </CardContent>
      </Card>
    </div>
  );
}
