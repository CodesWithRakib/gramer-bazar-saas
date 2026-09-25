'use client';
import { use } from 'react';

import React from 'react';
import Link from 'next/link';
import { useGetCustomerProductRequestByIdQuery } from '@/features/product-requests/productRequestsApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, PackageSearch } from 'lucide-react';

export interface CustomerProductRequestDetailsViewProps {
  lang?: string;
  id: string;
}

export function CustomerProductRequestDetailsView({ lang = 'en', id }: CustomerProductRequestDetailsViewProps) {
  const isBn = lang === 'bn';
  const { data: request, isLoading, isError } = useGetCustomerProductRequestByIdQuery(id);

  if (isLoading) {
    return <div className="container py-8 text-center">{isBn ? 'লোড হচ্ছে...' : 'Loading...'}</div>;
  }

  if (isError || !request) {
    return <div className="container py-8 text-center text-red-500">{isBn ? 'অনুরোধ খুঁজে পাওয়া যায়নি' : 'Request not found'}</div>;
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
    <div className="w-full space-y-6">
      <Link href={`/${lang}/customer/product-requests`} className="flex items-center text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4 mr-1" />
        {isBn ? 'অনুরোধ তালিকায় ফিরে যান' : 'Back to Requests'}
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{request.requestedProductName}</h1>
          <p className="text-sm text-muted-foreground">ID: {request.id}</p>
        </div>
        <Badge className={`${getStatusColor(request.status)} text-white hover:${getStatusColor(request.status)}`}>
          {request.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Timeline */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isBn ? 'অনুরোধের স্থিতি' : 'Request Status'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {request.statusHistory?.map((history, index) => (
                  <div key={history.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${index === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {index === 0 ? <CheckCircle2 className="h-5 w-5" /> : <div className="h-2 w-2 rounded-full bg-current" />}
                      </div>
                      {index !== (request.statusHistory?.length || 1) - 1 && (
                        <div className="w-0.5 h-full bg-border my-1" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="font-semibold">{history.status}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Intl.DateTimeFormat(isBn ? 'bn-BD' : 'en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        }).format(new Date(history.createdAt))}
                      </p>
                      {history.remark && <p className="text-sm mt-1">{history.remark}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isBn ? 'বিস্তারিত তথ্য' : 'Details'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground">{isBn ? 'বিবরণ' : 'Description'}</p>
                <p className="font-medium">{request.description || (isBn ? 'কোনো বিবরণ নেই' : 'No description provided')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{isBn ? 'অন্যান্য তথ্য' : 'Preferred Information'}</p>
                <p className="font-medium">{request.preferredInformation || (isBn ? 'কোনো তথ্য নেই' : 'No preferred information')}</p>
              </div>
            </CardContent>
            {request.linkedProductId && (
              <CardFooter>
                <Link href={`/${lang}/products/${request.linkedProductId}`} className="w-full">
                  <Button className="w-full flex items-center gap-2" variant="default">
                    <PackageSearch className="w-4 h-4" />
                    {isBn ? 'পণ্যটি দেখুন' : 'View Product'}
                  </Button>
                </Link>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
