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

      <CardContent className="p-4 md:px-6 md:py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Thumbnails or item fallback */}
          <div className="flex-1 min-w-0">
            {displayItems.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2.5">
                {displayItems.map((item, idx) => {
                  const variant = item.sellerProduct?.productVariant;
                  const name = variant
                    ? isBn
                      ? variant.nameBn || variant.product.nameBn
                      : variant.nameEn || variant.product.nameEn
                    : isBn
                      ? 'অর্ডারকৃত পণ্য'
                      : 'Ordered product';
                  const image = variant?.images?.[0] || '/placeholder.jpg';

                  return (
                    <div
                      key={item.id || idx}
                      className="group/thumb relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border/70 bg-muted/20 transition-all hover:scale-105 sm:h-18 sm:w-18"
                      title={name}
                    >
                      <CustomImage
                        src={image}
                        alt={name}
                        fill
                        sizes="72px"
                        className="object-cover"
                      />
                      <div className="absolute bottom-0 end-0 rounded-ss-md bg-background/90 px-1.5 py-0.5 text-[10px] font-bold text-foreground backdrop-blur-xs shadow-xs">
                        x{item.quantity}
                      </div>
                    </div>
                  );
                })}

                {remainingCount > 0 && (
                  <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-muted-foreground sm:h-18 sm:w-18">
                    <Package className="mb-0.5 h-4 w-4 opacity-60" />
                    <span className="text-xs font-bold">+{remainingCount}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground py-1">
                <div className="p-2 rounded-lg bg-muted/50">
                  <Package className="h-4 w-4 text-muted-foreground/70" />
                </div>
                <div>
                  <p className="font-medium text-foreground/80">
                    {isBn ? 'পণ্য বিবরণ প্রস্তুত হচ্ছে' : 'Order details available'}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {isBn ? 'বিস্তারিত দেখতে ডানপাশের বাটনে ক্লিক করুন' : 'Click view details to see the full breakdown'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action button */}
          <div className="shrink-0 pt-2 sm:pt-0">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto h-9 gap-1.5 text-xs font-semibold hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
              asChild
            >
              <Link href={`/${lang}/customer/orders/${order.id}`}>
                <span>{isBn ? 'বিস্তারিত দেখুন' : 'View details'}</span>
                <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
