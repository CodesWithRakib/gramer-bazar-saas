'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useQuickCheckoutMutation } from '@/features/orders/ordersApi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CustomImage } from '@/components/ui/CustomImage';
import { customToast as toast } from '@/components/ui/custom-toast';
import { formatCurrency } from '@/lib/format';
import { getApiErrorMessage } from '@/lib/apiError';
import {
  Zap,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Loader2,
  PackageCheck,
  User,
  Phone,
  MapPin,
  Tag,
} from 'lucide-react';

export interface QuickOrderProduct {
  id: string;
  sellerProductId: string;
  nameEn: string;
  nameBn: string;
  price: number;
  discountPrice?: number | null;
  image?: string | null;
  variantNameEn?: string;
  variantNameBn?: string;
  shopNameEn?: string;
  shopNameBn?: string;
}

export interface QuickOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: QuickOrderProduct;
  lang: string;
}

export function QuickOrderModal({
  isOpen,
  onClose,
  product,
  lang,
}: QuickOrderModalProps) {
  const router = useRouter();
  const isBn = lang === 'bn';
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState(
    user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : ''
  );
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState('');
  const [agentCode, setAgentCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BKASH'>('COD');
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  const [quickCheckout, { isLoading: isSubmitting }] = useQuickCheckoutMutation();

  const unitPrice =
    product.discountPrice && Number(product.discountPrice) > 0
      ? Number(product.discountPrice)
      : Number(product.price);

  const subtotal = unitPrice * quantity;
  const deliveryFee = 50; // Standard flat delivery fee
  const total = subtotal + deliveryFee;

  const handleClose = () => {
    onClose();
    // Reset after closing animation
    setTimeout(() => {
      setPlacedOrderId(null);
      setQuantity(1);
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error(isBn ? 'আপনার নাম লিখুন' : 'Please enter your name');
      return;
    }

    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 11) {
      toast.error(
        isBn
          ? 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712345678)'
          : 'Please enter a valid 11-digit mobile number'
      );
      return;
    }

    if (!address.trim()) {
      toast.error(
        isBn
          ? 'ডেলিভারি ঠিকানা বা গ্রামের নাম লিখুন'
          : 'Please enter your delivery address'
      );
      return;
    }

    try {
      const res = await quickCheckout({
        name: name.trim(),
        phone: cleanPhone,
        address: address.trim(),
        sellerProductId: product.sellerProductId,
        quantity,
        paymentMethod,
        agentCode: agentCode.trim() || undefined,
        lang,
      }).unwrap();

      if (res.paymentUrl) {
        toast.success(
          isBn ? 'বিকাশ পেমেন্টে নিয়ে যাওয়া হচ্ছে...' : 'Redirecting to bKash...'
        );
        window.location.href = res.paymentUrl;
        return;
      }

      setPlacedOrderId(res.order.id);
      toast.success(
        isBn
          ? 'অভিনন্দন! আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে।'
          : 'Success! Your order has been placed.'
      );
    } catch (err) {
      toast.error(
        getApiErrorMessage(
          err,
          isBn ? 'অর্ডার তৈরি করা যায়নি' : 'Failed to place quick order'
        )
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border-primary/20 shadow-2xl">
        {placedOrderId ? (
          /* Order Placement Success View */
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <PackageCheck className="h-9 w-9" />
            </div>

            <div>
              <h3 className="text-xl font-bold tracking-tight text-foreground">
                {isBn ? 'অর্ডার সফলভাবে নিশ্চিত হয়েছে!' : 'Order Placed Successfully!'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1.5">
                {isBn
                  ? `আপনার অর্ডার #${placedOrderId.slice(0, 8).toUpperCase()} গ্রহণ করা হয়েছে। মোবাইলে এসএমএস নিশ্চিতকরণ পাঠানো হয়েছে।`
                  : `Order #${placedOrderId.slice(0, 8).toUpperCase()} has been confirmed. SMS confirmation sent to your phone.`}
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-muted/40 p-4 text-start space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isBn ? 'পণ্য' : 'Item'}:</span>
                <span className="font-semibold text-foreground">
                  {isBn ? product.nameBn : product.nameEn} (x{quantity})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isBn ? 'পরিশোধ পদ্ধতি' : 'Payment'}:</span>
                <span className="font-semibold">
                  {paymentMethod === 'COD'
                    ? isBn
                      ? 'ক্যাশ অন ডেলিভারি (পণ্য পেয়ে পরিশোধ)'
                      : 'Cash on Delivery'
                    : 'bKash'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isBn ? 'মোট মূল্য' : 'Total'}:</span>
                <span className="font-bold text-primary text-sm">
                  {formatCurrency(total, lang)}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={handleClose}
              >
                {isBn ? 'আরও কেনাকাটা করুন' : 'Continue Shopping'}
              </Button>
              <Button
                className="flex-1 rounded-xl"
                onClick={() => {
                  handleClose();
                  router.push(`/${lang}/customer/orders/${placedOrderId}`);
                }}
              >
                {isBn ? 'অর্ডার ট্র্যাক করুন' : 'Track Order'}
              </Button>
            </div>
          </div>
        ) : (
          /* Order Form View */
          <div>
            <DialogHeader className="p-5 pb-3 border-b border-border/60 bg-primary/5">
              <div className="flex items-center gap-2">
                <span className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Zap className="h-4 w-4 fill-primary" />
                </span>
                <div>
                  <DialogTitle className="text-base sm:text-lg font-bold">
                    {isBn ? '১-ক্লিকে দ্রুত অর্ডার' : '1-Click Quick Order'}
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    {isBn
                      ? 'কোন ঝামেলা ছাড়া শুধু নাম, মোবাইল ও ঠিকানা দিয়ে অর্ডার করুন'
                      : 'Fast checkout: Just enter your name, phone, and delivery address'}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Product Preview & Quantity Card */}
              <div className="flex items-center gap-3 rounded-xl border border-border/70 p-3 bg-muted/20">
                <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border bg-background">
                  <CustomImage
                    src={product.image || '/images/placeholder.svg'}
                    alt={isBn ? product.nameBn : product.nameEn}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-semibold truncate text-foreground">
                    {isBn ? product.nameBn : product.nameEn}
                  </h4>
                  {product.variantNameEn && (
                    <span className="text-[11px] text-muted-foreground block truncate">
                      {isBn ? product.variantNameBn || product.variantNameEn : product.variantNameEn}
                    </span>
                  )}
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs font-bold text-primary tabular-nums">
                      {formatCurrency(unitPrice, lang)}
                    </span>

                    {/* Quantity Stepper */}
                    <div className="flex items-center border rounded-lg bg-background">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="px-2.5 py-0.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-semibold tabular-nums">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-2.5 py-0.5 text-xs text-muted-foreground hover:text-foreground"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Information Fields */}
              <div className="space-y-3 pt-1">
                <div className="space-y-1.5">
                  <Label htmlFor="quick-name" className="text-xs flex items-center gap-1.5 font-medium">
                    <User className="h-3.5 w-3.5 text-primary" />
                    {isBn ? 'আপনার নাম' : 'Full Name'} *
                  </Label>
                  <Input
                    id="quick-name"
                    required
                    placeholder={isBn ? 'যেমন: মোহাম্মদ রহিম' : 'e.g. Mohammad Rahim'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="quick-phone" className="text-xs flex items-center gap-1.5 font-medium">
                    <Phone className="h-3.5 w-3.5 text-primary" />
                    {isBn ? 'মোবাইল নম্বর' : 'Phone Number'} *
                  </Label>
                  <Input
                    id="quick-phone"
                    required
                    type="tel"
                    placeholder="017XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-9 text-xs rounded-xl font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="quick-address" className="text-xs flex items-center gap-1.5 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {isBn ? 'ডেলিভারি ঠিকানা (গ্রাম / ইউনিয়ন / উপজেলা)' : 'Delivery Address (Village / Union / Area)'} *
                  </Label>
                  <Input
                    id="quick-address"
                    required
                    placeholder={
                      isBn
                        ? 'যেমন: গ্রাম: চকবালু, ডাকঘর: উল্লাপাড়া, সিরাজগঞ্জ'
                        : 'e.g. Village: Chokbalu, Ullapara, Sirajganj'
                    }
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>

                {/* Optional Agent Referral Code */}
                <div className="space-y-1.5">
                  <Label htmlFor="quick-agent" className="text-xs flex items-center gap-1.5 font-medium text-muted-foreground">
                    <Tag className="h-3.5 w-3.5" />
                    {isBn ? 'ইউনিয়ন এজেন্ট / উদ্যোক্তা কোড (যদি থাকে)' : 'Village Agent / UDC Code (Optional)'}
                  </Label>
                  <Input
                    id="quick-agent"
                    placeholder="UDC-001"
                    value={agentCode}
                    onChange={(e) => setAgentCode(e.target.value)}
                    className="h-9 text-xs rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2 pt-1">
                <Label className="text-xs font-medium">
                  {isBn ? 'পেমেন্ট পদ্ধতি' : 'Payment Method'}
                </Label>
                <div className="grid grid-cols-2 gap-2.5">
                  <label
                    className={`flex items-center justify-between p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-input hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="quickPaymentMethod"
                        value="COD"
                        checked={paymentMethod === 'COD'}
                        onChange={() => setPaymentMethod('COD')}
                        className="sr-only"
                      />
                      <Truck className="h-4 w-4" />
                      <span className="text-xs font-semibold">
                        {isBn ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}
                      </span>
                    </div>
                    {paymentMethod === 'COD' && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                  </label>

                  <label
                    className={`flex items-center justify-between p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'BKASH'
                        ? 'border-[#E2136E] bg-[#E2136E]/5 text-[#E2136E]'
                        : 'border-input hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="quickPaymentMethod"
                        value="BKASH"
                        checked={paymentMethod === 'BKASH'}
                        onChange={() => setPaymentMethod('BKASH')}
                        className="sr-only"
                      />
                      <span className="inline-flex rounded bg-[#E2136E] px-1 py-0.5 text-[9px] font-bold text-white">
                        bKash
                      </span>
                      <span className="text-xs font-semibold">
                        {isBn ? 'বিকাশ সরাসরি' : 'bKash Direct'}
                      </span>
                    </div>
                    {paymentMethod === 'BKASH' && (
                      <CheckCircle2 className="h-4 w-4 text-[#E2136E]" />
                    )}
                  </label>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="rounded-xl border border-border/80 bg-muted/40 p-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>{isBn ? 'পণ্যের মূল্য' : 'Subtotal'}:</span>
                  <span className="tabular-nums">{formatCurrency(subtotal, lang)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{isBn ? 'ডেলিভারি চার্জ' : 'Delivery Fee'}:</span>
                  <span className="tabular-nums">{formatCurrency(deliveryFee, lang)}</span>
                </div>
                <div className="border-t border-border/80 pt-1.5 flex justify-between font-bold text-sm text-foreground">
                  <span>{isBn ? 'সর্বমোট প্রদেয়' : 'Total Amount'}:</span>
                  <span className="text-primary tabular-nums">
                    {formatCurrency(total, lang)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full h-11 text-sm font-bold rounded-xl shadow-md gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{isBn ? 'অর্ডার প্রক্রিয়াধীন...' : 'Processing...'}</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 fill-current" />
                      <span>
                        {isBn
                          ? `অর্ডার নিশ্চিত করুন (${formatCurrency(total, lang)})`
                          : `Confirm Order (${formatCurrency(total, lang)})`}
                      </span>
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground text-center pt-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>
                  {isBn
                    ? '১০০% নিরাপদ ডেলিভারি ও যাচাইকৃত গ্রামীণ পণ্য'
                    : '100% verified rural products & secure delivery'}
                </span>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
