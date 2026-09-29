/**
 * Shared checkout maths.
 *
 * The flat delivery fee mirrors `apps/api/src/orders/orders.service.ts`
 * (`const deliveryFee = 50`). The UI estimate and the amount the server
 * finally writes on the order must not drift apart, otherwise the summary
 * shown before placing an order will not match the order the customer sees
 * afterwards. If the backend fee model ever becomes dynamic, replace this
 * constant with the value returned by the API.
 */
export const FLAT_DELIVERY_FEE_BDT = 50;

export interface CheckoutTotals {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
}

export function getCheckoutTotals(
  subtotal: number,
  discount = 0,
  deliveryFee = FLAT_DELIVERY_FEE_BDT
): CheckoutTotals {
  const safeSubtotal = Number.isFinite(subtotal) ? subtotal : 0;
  const safeDiscount = Number.isFinite(discount) ? discount : 0;
  return {
    subtotal: safeSubtotal,
    discount: safeDiscount,
    deliveryFee,
    total: Math.max(0, safeSubtotal - safeDiscount + deliveryFee),
  };
}
