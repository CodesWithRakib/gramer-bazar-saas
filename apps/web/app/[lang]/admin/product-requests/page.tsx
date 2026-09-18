'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useGetAdminProductRequestsQuery } from '@/features/product-requests/productRequestsApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

export default function AdminProductRequestsPage({ params: { lang } }: { params: { lang: string } }) {
  const isBn = lang === 'bn';
  const [status, setStatus] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const { data: requests, isLoading } = useGetAdminProductRequestsQuery({
    status: status === 'ALL' ? undefined : status,
    search: search || undefined,
  });

  const getStatusColor = (s: string) => {
    switch (s) {
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{isBn ? 'পণ্য অনুরোধ ব্যবস্থাপনা' : 'Product Requests Management'}</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isBn ? 'অনুসন্ধান করুন (পণ্য বা গ্রাহক)...' : 'Search (Product or Customer)...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={isBn ? 'স্থিতি নির্বাচন করুন' : 'Select Status'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{isBn ? 'সব স্থিতি' : 'All Statuses'}</SelectItem>
            <SelectItem value="PENDING">PENDING</SelectItem>
            <SelectItem value="REVIEWING">REVIEWING</SelectItem>
            <SelectItem value="SEARCHING">SEARCHING</SelectItem>
            <SelectItem value="FOUND">FOUND</SelectItem>
            <SelectItem value="PRODUCT_ADDED">PRODUCT_ADDED</SelectItem>
            <SelectItem value="CUSTOMER_NOTIFIED">CUSTOMER_NOTIFIED</SelectItem>
            <SelectItem value="CLOSED">CLOSED</SelectItem>
            <SelectItem value="REJECTED">REJECTED</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{isBn ? 'তারিখ' : 'Date'}</TableHead>
              <TableHead>{isBn ? 'গ্রাহক' : 'Customer'}</TableHead>
              <TableHead>{isBn ? 'পণ্যের নাম' : 'Requested Product'}</TableHead>
              <TableHead>{isBn ? 'স্থিতি' : 'Status'}</TableHead>
              <TableHead className="text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">{isBn ? 'লোড হচ্ছে...' : 'Loading...'}</TableCell>
              </TableRow>
            ) : !requests || requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">{isBn ? 'কোনো অনুরোধ পাওয়া যায়নি' : 'No requests found'}</TableCell>
              </TableRow>
            ) : (
              requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>
                    {new Intl.DateTimeFormat(isBn ? 'bn-BD' : 'en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(req.createdAt))}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{req.user?.name || 'Unknown'}</div>
                    <div className="text-sm text-muted-foreground">{req.user?.phone || ''}</div>
                  </TableCell>
                  <TableCell className="font-medium">{req.requestedProductName}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(req.status)} text-white hover:${getStatusColor(req.status)}`}>
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/${lang}/admin/product-requests/${req.id}`}>
                      <Button variant="outline" size="sm">{isBn ? 'পরিচালনা করুন' : 'Manage'}</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
