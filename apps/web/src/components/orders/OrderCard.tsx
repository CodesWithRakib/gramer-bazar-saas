import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { enUS, bn } from 'date-fns/locale';
import { Order } from '@/features/orders/ordersApi';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CustomImage } from '@/components/ui/CustomImage';
import { ChevronRight, Package } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  lang: string;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500';
    case 'confirmed':
    case 'processing':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500';
    case 'shipped':
    case 'out_for_delivery':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500';
    case 'delivered':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500';
    case 'cancelled':
    case 'returned':
      return 'bg-destructive/10 text-destructive dark:bg-destructive/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getStatusLabel = (status: string, lang: string) => {
  const isBn = lang === 'bn';
  const statusMap: Record<string, { en: string; bn: string }> = {
    pending: { en: 'Pending', bn: 'অপেক্ষমাণ' },
    confirmed: { en: 'Confirmed', bn: 'নিশ্চিত করা হয়েছে' },
    processing: { en: 'Processing', bn: 'প্রক্রিয়াধীন' },
    shipped: { en: 'Shipped', bn: 'শিপ করা হয়েছে' },
    out_for_delivery: { en: 'Out for Delivery', bn: 'ডেলিভারির জন্য বের হয়েছে' },
    delivered: { en: 'Delivered', bn: 'ডেলিভারি সম্পন্ন' },
    cancelled: { en: 'Cancelled', bn: 'বাতিল' },
    returned: { en: 'Returned', bn: 'ফেরত' },
  };

  const lowerStatus = status.toLowerCase();
  return statusMap[lowerStatus] ? (isBn ? statusMap[lowerStatus].bn : statusMap[lowerStatus].en) : status;
};

export function OrderCard({ order, lang }: OrderCardProps) {
  const isBn = lang === 'bn';
  const dateLocale = isBn ? bn : enUS;
  const formattedDate = format(new Date(order.createdAt), 'MMM dd, yyyy - hh:mm a', { locale: dateLocale });
  
  // Show first 4 items maximum as thumbnails
  const displayItems = order.items.slice(0, 4);
  const remainingCount = Math.max(0, order.items.length - 4);

  return (
    <Card className="w-full overflow-hidden hover:shadow-md transition-all duration-200 border-border group">
      <CardHeader className="bg-muted/30 border-b px-4 py-3 md:px-6 flex flex-row items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm md:text-base">
              {isBn ? 'অর্ডার আইডি:' : 'Order ID:'} #{order.id.slice(0, 8).toUpperCase()}
            </span>
            <Badge variant="outline" className={`border-0 ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status, lang)}
            </Badge>
          </div>
          <span className="text-xs md:text-sm text-muted-foreground">{formattedDate}</span>
        </div>
        <div className="text-right">
          <p className="text-sm md:text-base font-bold text-primary">৳{order.total}</p>
          <p className="text-xs text-muted-foreground">{order.items.length} {isBn ? 'পণ্য' : 'Items'}</p>
        </div>
      </CardHeader>

      <CardContent className="p-4 md:px-6 md:py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full overflow-x-auto hide-scrollbar">
          {displayItems.map((item, idx) => {
            const variant = item.sellerProduct?.productVariant;
            const name = variant ? (isBn ? variant.nameBn || variant.product.nameBn : variant.nameEn || variant.product.nameEn) : 'Unknown Product';
            const image = variant?.images?.[0] || '/placeholder.jpg';
            
            return (
              <div key={item.id || idx} className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-md border overflow-hidden bg-muted/20" title={name}>
                <CustomImage src={image} alt={name} fill className="object-cover" />
                <div className="absolute bottom-0 right-0 bg-background/80 backdrop-blur-sm text-[10px] font-bold px-1 rounded-tl-md">
                  x{item.quantity}
                </div>
              </div>
            );
          })}
          
          {remainingCount > 0 && (
            <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-md border flex flex-col items-center justify-center bg-muted/30 text-muted-foreground">
              <Package className="w-5 h-5 mb-1 opacity-50" />
              <span className="text-xs font-semibold">+{remainingCount}</span>
            </div>
          )}
        </div>
        
        <Button variant="ghost" className="w-full md:w-auto mt-2 md:mt-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors" asChild>
          <Link href={`/${lang}/orders/${order.id}`}>
            {isBn ? 'বিস্তারিত দেখুন' : 'View Details'}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
