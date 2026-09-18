'use client';

import React from 'react';
import Link from 'next/link';
import { useGetOrdersQuery } from '@/features/orders/ordersApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function OrdersPage({ params: { lang } }: { params: { lang: string } }) {
  const isBn = lang === 'bn';
  const { data: orders, isLoading, isError } = useGetOrdersQuery();

  if (isLoading) {
    return <div className="container py-8 text-center">{isBn ? 'লোড হচ্ছে...' : 'Loading...'}</div>;
  }

  if (isError) {
    return <div className="container py-8 text-center text-red-500">{isBn ? 'অর্ডার লোড করতে ত্রুটি হয়েছে' : 'Error loading orders'}</div>;
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold">{isBn ? 'কোনো অর্ডার পাওয়া যায়নি' : 'No orders found'}</h2>
        <p className="text-muted-foreground">{isBn ? 'আপনি এখনও কোনো অর্ডার করেননি।' : 'You have not placed any orders yet.'}</p>
        <Link href={`/${lang}`}>
          <Button>{isBn ? 'কেনাকাটা শুরু করুন' : 'Start Shopping'}</Button>
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'CONFIRMED': return 'bg-blue-500 hover:bg-blue-600';
      case 'PROCESSING': return 'bg-purple-500 hover:bg-purple-600';
      case 'READY_FOR_PICKUP':
      case 'OUT_FOR_DELIVERY': return 'bg-orange-500 hover:bg-orange-600';
      case 'DELIVERED':
      case 'PICKED_UP': return 'bg-green-500 hover:bg-green-600';
      case 'CANCELLED':
      case 'FAILED': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <h1 className="text-3xl font-bold">{isBn ? 'আমার অর্ডারসমূহ' : 'My Orders'}</h1>
      
      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isBn ? 'অর্ডার আইডি:' : 'Order ID:'} {order.id.slice(0, 8).toUpperCase()}
              </CardTitle>
              <Badge className={getStatusColor(order.status)}>
                {order.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {new Intl.DateTimeFormat(isBn ? 'bn-BD' : 'en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(order.createdAt))}
                  </p>
                  <p className="font-bold text-lg">৳ {Number(order.total).toFixed(2)}</p>
                </div>
                <Link href={`/${lang}/orders/${order.id}`}>
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
