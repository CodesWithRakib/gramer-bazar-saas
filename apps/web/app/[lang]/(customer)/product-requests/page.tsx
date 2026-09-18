'use client';

import React from 'react';
import Link from 'next/link';
import { useGetCustomerProductRequestsQuery } from '@/features/product-requests/productRequestsApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ProductRequestsPage({ params: { lang } }: { params: { lang: string } }) {
  const isBn = lang === 'bn';
  const { data: requests, isLoading, isError } = useGetCustomerProductRequestsQuery();

  if (isLoading) {
    return <div className="container py-8 text-center">{isBn ? 'লোড হচ্ছে...' : 'Loading...'}</div>;
  }

  if (isError) {
    return <div className="container py-8 text-center text-red-500">{isBn ? 'তথ্য লোড করতে ত্রুটি হয়েছে' : 'Error loading requests'}</div>;
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="container py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold">{isBn ? 'কোনো অনুরোধ পাওয়া যায়নি' : 'No requests found'}</h2>
        <p className="text-muted-foreground">{isBn ? 'আপনি এখনও কোনো পণ্যের জন্য অনুরোধ করেননি।' : 'You have not requested any products yet.'}</p>
        <Link href={`/${lang}/search`}>
          <Button>{isBn ? 'পণ্য খুঁজুন ও অনুরোধ করুন' : 'Search and Request Products'}</Button>
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500';
      case 'REVIEWING': return 'bg-blue-500';
      case 'SEARCHING': return 'bg-purple-500';
      case 'FOUND': return 'bg-orange-500';
      case 'PRODUCT_ADDED':
      case 'CUSTOMER_NOTIFIED': return 'bg-green-500';
      case 'CLOSED':
      case 'REJECTED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{isBn ? 'আমার পণ্যের অনুরোধ' : 'My Product Requests'}</h1>
      </div>
      
      <div className="grid gap-4">
        {requests.map((req) => (
          <Card key={req.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold">
                {req.requestedProductName}
              </CardTitle>
              <Badge className={`${getStatusColor(req.status)} text-white hover:${getStatusColor(req.status)}`}>
                {req.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end mt-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {new Intl.DateTimeFormat(isBn ? 'bn-BD' : 'en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(req.createdAt))}
                  </p>
                  {req.description && <p className="text-sm">{req.description}</p>}
                </div>
                <Link href={`/${lang}/product-requests/${req.id}`}>
                  <Button variant="outline" size="sm">
                    {isBn ? 'বিস্তারিত দেখুন' : 'View Details'}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
