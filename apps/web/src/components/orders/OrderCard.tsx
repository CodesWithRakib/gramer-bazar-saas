import React from 'react';
import Link from 'next/link';
import { Order } from '@/features/orders/ordersApi';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomImage } from '@/components/ui/CustomImage';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ChevronRight, Package } from 'lucide-react';
import { getOrderStatusMeta, getPaymentStatusMeta } from '@/lib/order-status';
import { formatCurrency, formatDateTime } from '@/lib/format';

interface OrderCardProps {
  order: Order;
  lang: string;
}

export function OrderCard({ order, lang }: OrderCardProps) {
  const isBn = lang === 'bn';
  const formattedDate = formatDateTime(order.createdAt, lang);
  const statusMeta = getOrderStatusMeta(order.status);
  const paymentMeta = getPaymentStatusMeta(order.paymentStatus);

  const items = Array.isArray(order?.items) ? order.items : [];

  // Show first 4 items maximum as thumbnails
  const displayItems = items.slice(0, 4);
  const remainingCount = Math.max(0, items.length - 4);

  return (
    <Card className="w-full overflow-hidden rounded-2xl border-border transition-colors hover:border-primary/40">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b bg-muted/30 px-4 py-3 md:px-6">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold md:text-base">
              {isBn ? 'অর্ডার নম্বর:' : 'Order ID:'} #{order.id.slice(0, 8).toUpperCase()}
            </span>
            <StatusBadge tone={statusMeta.tone} label={isBn ? statusMeta.bn : statusMeta.en} />
            <StatusBadge tone={paymentMeta.tone} label={isBn ? paymentMeta.bn : paymentMeta.en} />
          </div>
          <span className="text-xs text-muted-foreground md:text-sm">{formattedDate}</span>
        </div>
        <div className="text-end">
          <p className="text-sm font-bold text-primary md:text-base">
            {formatCurrency(order.total)}
          </p>
          <p className="text-xs text-muted-foreground">
            {items.length} {isBn ? 'টি পণ্য' : 'items'}
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col items-start justify-between gap-4 p-4 md:flex-row md:items-center md:px-6 md:py-5">
        <div className="hide-scrollbar flex w-full items-center gap-3 overflow-x-auto">
          {displayItems.map((item, idx) => {
            const variant = item.sellerProduct?.productVariant;
            const name = variant
              ? isBn
                ? variant.nameBn || variant.product.nameBn
                : variant.nameEn || variant.product.nameEn
              : isBn
                ? 'অজানা পণ্য'
                : 'Unknown product';
            const image = variant?.images?.[0] || '/placeholder.jpg';

            return (
              <div
                key={item.id || idx}
                className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-muted/20 md:h-20 md:w-20"
                title={name}
              >
                <CustomImage src={image} alt={name} fill sizes="80px" className="object-cover" />
                <div className="absolute bottom-0 end-0 rounded-ss-md bg-background/85 px-1 text-[10px] font-bold backdrop-blur-sm">
                  x{item.quantity}
                </div>
              </div>
            );
          })}

          {remainingCount > 0 && (
            <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg border bg-muted/30 text-muted-foreground md:h-20 md:w-20">
              <Package className="mb-1 h-5 w-5 opacity-50" />
              <span className="text-xs font-semibold">+{remainingCount}</span>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          className="mt-2 w-full transition-colors group-hover:bg-primary/10 group-hover:text-primary md:mt-0 md:w-auto"
          asChild
        >
          <Link href={`/${lang}/customer/orders/${order.id}`}>
            {isBn ? 'বিস্তারিত দেখুন' : 'View details'}
            <ChevronRight className="ms-1 h-4 w-4 rtl:rotate-180" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
