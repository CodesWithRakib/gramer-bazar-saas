'use client';

import React, { useState } from 'react';
import { Printer, X, Check, Copy } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { getOrderStatusMeta, getPaymentMethodMeta, getPaymentStatusMeta } from '@/lib/order-status';

export interface ThermalReceiptOrder {
  id: string;
  reference?: string;
  createdAt: string;
  status: string;
  paymentMethod?: string;
  paymentStatus?: string;
  subtotal?: number;
  sellerSubtotal?: number;
  deliveryFee?: number;
  discount?: number;
  discountAmount?: number;
  total?: number;
  isQuickOrder?: boolean;
  user?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
  customer?: {
    name?: string;
    phone?: string;
  };
  address?: {
    contactName?: string;
    contactPhone?: string;
    streetAddress?: string;
    street?: string;
    upazila?: { nameEn?: string; nameBn?: string } | null;
    district?: { nameEn?: string; nameBn?: string } | null;
    division?: { nameEn?: string; nameBn?: string } | null;
  };
  shippingAddress?: {
    recipientName?: string;
    phone?: string;
    street?: string;
    upazila?: string;
    district?: string;
  };
  items: Array<{
    id: string;
    nameEn?: string;
    nameBn?: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    sellerProduct?: {
      productVariant?: {
        nameEn?: string;
        nameBn?: string;
      };
      shop?: {
        nameEn?: string;
        nameBn?: string;
      };
    };
  }>;
}

export interface ThermalReceiptModalProps {
  order: ThermalReceiptOrder;
  lang?: string;
  trigger?: React.ReactNode;
}

export function ThermalReceiptModal({
  order,
  lang = 'en',
  trigger,
}: ThermalReceiptModalProps) {
  const isBn = lang === 'bn';
  const [open, setOpen] = useState(false);
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>('80mm');
  const [copied, setCopied] = useState(false);

  const orderRef =
    order.reference || (order.id ? `#GB-${order.id.slice(0, 8).toUpperCase()}` : '#GB-ORDER');

  const customerName =
    order.customer?.name ||
    order.address?.contactName ||
    order.shippingAddress?.recipientName ||
    [order.user?.firstName, order.user?.lastName].filter(Boolean).join(' ') ||
    (isBn ? 'সম্মানিত গ্রাহক' : 'Valued Customer');

  const customerPhone =
    order.customer?.phone ||
    order.address?.contactPhone ||
    order.shippingAddress?.phone ||
    order.user?.phone ||
    '—';

  const fullAddress =
    [
      order.shippingAddress?.street,
      order.address?.streetAddress,
      order.address?.street,
      order.shippingAddress?.upazila ||
        (order.address?.upazila ? (isBn ? order.address.upazila.nameBn : order.address.upazila.nameEn) : null),
      order.shippingAddress?.district ||
        (order.address?.district ? (isBn ? order.address.district.nameBn : order.address.district.nameEn) : null),
    ]
      .filter(Boolean)
      .join(', ') || (isBn ? 'হোম ডেলিভারি' : 'Standard Delivery');

  const statusMeta = getOrderStatusMeta(order.status);
  const paymentMeta = getPaymentStatusMeta(order.paymentStatus || 'PENDING');
  const paymentMethodMeta = getPaymentMethodMeta(order.paymentMethod || 'COD');

  const subtotal = order.subtotal ?? order.sellerSubtotal ?? 0;
  const deliveryFee = order.deliveryFee ?? 0;
  const discount = order.discount ?? order.discountAmount ?? 0;
  const grandTotal = order.total ?? subtotal + deliveryFee - discount;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(orderRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Thermal Print Optimization Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #thermal-printable-slip,
          #thermal-printable-slip * {
            visibility: visible !important;
          }
          #thermal-printable-slip {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: ${paperWidth === '58mm' ? '54mm' : '76mm'} !important;
            margin: 0 !important;
            padding: 4mm !important;
            color: #000000 !important;
            background: #ffffff !important;
            font-family: 'Courier New', Courier, monospace !important;
            font-size: ${paperWidth === '58mm' ? '10px' : '12px'} !important;
            line-height: 1.25 !important;
          }
          @page {
            size: ${paperWidth === '58mm' ? '58mm' : '80mm'} auto;
            margin: 0;
          }
        }
      `}</style>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" className="gap-2 rounded-xl">
              <Printer className="h-4 w-4" />
              <span>{isBn ? 'থার্মাল স্লিপ' : 'Print Slip'}</span>
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-2xl max-h-[90vh] flex flex-col">
          <DialogHeader className="p-4 sm:p-5 border-b border-border shrink-0 bg-muted/40">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-base font-semibold">
                  {isBn ? 'থার্মাল রসিদ ও প্যাকিং স্লিপ' : 'Thermal Receipt & Packing Slip'}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {isBn
                    ? '৫৮মিমি বা ৮০মিমি পিওএস রোল প্রিন্টারের জন্য অপ্টিমাইজড'
                    : 'Standard 58mm / 80mm POS Roll Printer Output'}
                </DialogDescription>
              </div>
            </div>

            {/* Paper Width Selector & Copy Action */}
            <div className="flex items-center justify-between gap-2 pt-3">
              <div className="flex items-center gap-1.5 bg-background p-1 rounded-lg border border-border text-xs">
                <button
                  type="button"
                  onClick={() => setPaperWidth('58mm')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    paperWidth === '58mm'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  58mm (Small)
                </button>
                <button
                  type="button"
                  onClick={() => setPaperWidth('80mm')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    paperWidth === '80mm'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  80mm (Standard POS)
                </button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyRef}
                className="h-8 text-xs gap-1.5 rounded-lg"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? (isBn ? 'কপি হয়েছে' : 'Copied') : orderRef}</span>
              </Button>
            </div>
          </DialogHeader>

          {/* Printable Thermal Receipt Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/20 flex justify-center">
            <div
              id="thermal-printable-slip"
              style={{
                width: paperWidth === '58mm' ? '280px' : '360px',
              }}
              className="bg-white text-black font-mono border border-dashed border-neutral-300 p-4 shadow-sm text-xs select-text leading-tight"
            >
              {/* Receipt Header */}
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-black">
                <h2 className="text-base font-bold tracking-wider uppercase">GRAMER BAZAR</h2>
                <p className="text-[11px] font-semibold">গ্রামের বাজার - গ্রামীণ ই-কমার্স</p>
                <p className="text-[10px] text-neutral-600">
                  {isBn ? 'সরাসরি কৃষক ও স্থানীয় উদ্যোক্তা হাব' : 'Direct Village Farmer Marketplace'}
                </p>
                <p className="text-[10px]">Hotline: +880 9612-345678</p>
                <p className="text-[10px]">www.gramerbazar.com</p>
              </div>

              {/* Order Meta */}
              <div className="py-2.5 space-y-1 border-b border-dashed border-black text-[11px]">
                <div className="flex justify-between">
                  <span className="font-bold">ORDER REF:</span>
                  <span className="font-bold">{orderRef}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE:</span>
                  <span>{formatDateTime(order.createdAt, 'en')}</span>
                </div>
                <div className="flex justify-between">
                  <span>STATUS:</span>
                  <span className="font-semibold">{statusMeta.en}</span>
                </div>
                {order.isQuickOrder && (
                  <div className="text-center font-bold bg-neutral-100 py-0.5 mt-1 border border-neutral-300">
                    ⚡ 1-CLICK RURAL FAST ORDER
                  </div>
                )}
              </div>

              {/* Customer / Shipping Info */}
              <div className="py-2.5 space-y-1 border-b border-dashed border-black text-[11px]">
                <p className="font-bold">DELIVER TO:</p>
                <p className="font-semibold">{customerName}</p>
                <p>Phone: {customerPhone}</p>
                <p className="break-words leading-tight">{fullAddress}</p>
              </div>

              {/* Items Table */}
              <div className="py-2.5 border-b border-dashed border-black">
                <div className="flex justify-between font-bold pb-1 text-[11px] border-b border-neutral-300 mb-1.5">
                  <span className="w-1/2">ITEM</span>
                  <span className="w-1/4 text-center">QTY</span>
                  <span className="w-1/4 text-right">TOTAL</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  {order.items.map((item, idx) => {
                    const title =
                      item.nameBn ||
                      item.nameEn ||
                      item.sellerProduct?.productVariant?.nameBn ||
                      item.sellerProduct?.productVariant?.nameEn ||
                      `Item #${idx + 1}`;
                    return (
                      <div key={item.id || idx}>
                        <div className="font-medium line-clamp-1">{title}</div>
                        <div className="flex justify-between text-neutral-600 text-[10px]">
                          <span>
                            {item.quantity} × ৳{item.unitPrice}
                          </span>
                          <span className="font-semibold text-black">৳{item.subtotal}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Financial Calculation */}
              <div className="py-2.5 space-y-1 border-b border-dashed border-black text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>৳{subtotal}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span>Delivery Fee:</span>
                    <span>+ ৳{deliveryFee}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-neutral-700">
                    <span>Discount:</span>
                    <span>- ৳{discount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-black">
                  <span>TOTAL BDT:</span>
                  <span>৳{grandTotal}</span>
                </div>
              </div>

              {/* Payment Status Summary */}
              <div className="py-2.5 space-y-1 border-b border-dashed border-black text-[11px]">
                <div className="flex justify-between">
                  <span>Payment Mode:</span>
                  <span className="font-bold">{paymentMethodMeta.en}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Payment Status:</span>
                  <span className="font-bold border border-black px-1.5 py-0.5 rounded text-[10px]">
                    {paymentMeta.en}
                  </span>
                </div>
              </div>

              {/* Barcode Mock Visual */}
              <div className="pt-3 pb-1 text-center flex flex-col items-center">
                <div className="flex items-center justify-center gap-0.5 h-8">
                  {/* Procedural Barcode Lines */}
                  {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 2].map((w, i) => (
                    <div
                      key={i}
                      style={{ width: `${w * 1.5}px` }}
                      className="bg-black h-8"
                    />
                  ))}
                </div>
                <span className="text-[10px] tracking-widest mt-1 font-bold">{orderRef}</span>
              </div>

              {/* Footer Note */}
              <div className="text-center pt-3 text-[10px] space-y-0.5 border-t border-dashed border-neutral-300 text-neutral-600">
                <p className="font-bold text-black">
                  {isBn ? 'ধন্যবাদ! আবার কেনাকাটা করুন।' : 'Thank you for shopping with Gramer Bazar!'}
                </p>
                <p>{isBn ? 'গ্রামীণ উৎপাদকদের পাশে থাকার জন্য কৃতজ্ঞ।' : 'Supporting rural farmers & communities.'}</p>
                <p className="text-[9px] pt-1 font-mono">PRINTED FROM GRAMER BAZAR POS</p>
              </div>
            </div>
          </div>

          {/* Modal Bottom Actions */}
          <div className="p-4 border-t border-border bg-background flex items-center justify-end gap-3 shrink-0">
            <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl">
              {isBn ? 'বন্ধ করুন' : 'Close'}
            </Button>
            <Button onClick={handlePrint} className="gap-2 rounded-xl">
              <Printer className="h-4 w-4" />
              <span>{isBn ? 'এখনই প্রিন্ট করুন' : 'Print Receipt'}</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
