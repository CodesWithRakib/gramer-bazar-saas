import { OrderStatus } from '../enums/order-status.enum.js';
import { Role } from '../../roles/enums/role.enum.js';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

/**
 * Authoritative lifecycle state machine for Orders.
 * 
 * Rules:
 * - PENDING: Initial state when order is placed.
 * - CONFIRMED: Order confirmed (payment verified or COD accepted).
 * - PROCESSING: Seller preparing/packaging order items.
 * - READY_FOR_PICKUP: Items packed, waiting for rider pickup.
 * - PICKED_UP: Rider collected parcel from shop/hub.
 * - OUT_FOR_DELIVERY: Rider is on the way to customer delivery address.
 * - DELIVERED: Successfully handed over to customer (terminal).
 * - CANCELLED: Order cancelled before delivery (terminal; triggers restock).
 * - FAILED: Delivery or payment failed (terminal).
 */
export const VALID_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED, OrderStatus.FAILED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.READY_FOR_PICKUP, OrderStatus.CANCELLED],
  [OrderStatus.READY_FOR_PICKUP]: [OrderStatus.PICKED_UP, OrderStatus.CANCELLED],
  [OrderStatus.PICKED_UP]: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.FAILED],
  [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED, OrderStatus.FAILED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.FAILED]: [],
};

/**
 * Checks if a direct transition between two statuses is structurally permitted by the state machine.
 */
export function isValidTransition(fromStatus: OrderStatus, toStatus: OrderStatus): boolean {
  if (fromStatus === toStatus) return true;
  const allowed = VALID_ORDER_TRANSITIONS[fromStatus] || [];
  return allowed.includes(toStatus);
}

/**
 * Validates role-based transition authorization.
 *
 * @param fromStatus Current order status
 * @param toStatus Desired target status
 * @param userRoles Roles of the authenticated user
 * @param context Ownership context (isCustomerOwner, isSellerOwner, isAssignedRider)
 */
export function validateRoleTransition(
  fromStatus: OrderStatus,
  toStatus: OrderStatus,
  userRoles: string[],
  context: {
    isCustomerOwner: boolean;
    isSellerOwner: boolean;
    isAssignedRider: boolean;
  },
): void {
  // If no change, allowed
  if (fromStatus === toStatus) return;

  // 1. Verify global state machine validity first
  if (!isValidTransition(fromStatus, toStatus)) {
    if (toStatus === OrderStatus.CANCELLED) {
      throw new BadRequestException(
        `Order cannot be cancelled because it is already ${fromStatus}.`,
      );
    }
    throw new BadRequestException(
      `Invalid order state transition from ${fromStatus} to ${toStatus}. Allowed transitions: [${(VALID_ORDER_TRANSITIONS[fromStatus] || []).join(', ')}]`,
    );
  }

  // 2. Super Admin can execute any structurally valid transition
  if (userRoles.includes(Role.SUPER_ADMIN)) {
    return;
  }

  // 3. Admin can execute any structurally valid operational transition
  if (userRoles.includes(Role.ADMIN)) {
    return;
  }

  // 4. Customer: Can only cancel their own order from PENDING or CONFIRMED
  if (context.isCustomerOwner) {
    if (toStatus === OrderStatus.CANCELLED) {
      if (fromStatus === OrderStatus.PENDING || fromStatus === OrderStatus.CONFIRMED) {
        return;
      }
      throw new BadRequestException(
        `Order cannot be cancelled because it is already in ${fromStatus} state. Customers can only cancel orders while in PENDING or CONFIRMED state.`,
      );
    }
    throw new ForbiddenException(
      `Customers cannot transition orders to ${toStatus}.`,
    );
  }

  // 5. Seller: Can confirm, process, mark ready for pickup, or cancel
  if (context.isSellerOwner && userRoles.includes(Role.SELLER)) {
    const allowedSellerTransitions: { from: OrderStatus; to: OrderStatus }[] = [
      { from: OrderStatus.PENDING, to: OrderStatus.CONFIRMED },
      { from: OrderStatus.CONFIRMED, to: OrderStatus.PROCESSING },
      { from: OrderStatus.PROCESSING, to: OrderStatus.READY_FOR_PICKUP },
      { from: OrderStatus.PENDING, to: OrderStatus.CANCELLED },
      { from: OrderStatus.CONFIRMED, to: OrderStatus.CANCELLED },
      { from: OrderStatus.PROCESSING, to: OrderStatus.CANCELLED },
    ];

    const isPermitted = allowedSellerTransitions.some(
      (t) => t.from === fromStatus && t.to === toStatus,
    );

    if (isPermitted) return;

    throw new ForbiddenException(
      `Sellers are not authorized to transition order from ${fromStatus} to ${toStatus}.`,
    );
  }

  // 6. Rider: Must be assigned to this order, can handle pickup, out for delivery, delivered, failed
  if (context.isAssignedRider && userRoles.includes(Role.RIDER)) {
    const allowedRiderTransitions: { from: OrderStatus; to: OrderStatus }[] = [
      { from: OrderStatus.READY_FOR_PICKUP, to: OrderStatus.PICKED_UP },
      { from: OrderStatus.PICKED_UP, to: OrderStatus.OUT_FOR_DELIVERY },
      { from: OrderStatus.OUT_FOR_DELIVERY, to: OrderStatus.DELIVERED },
      { from: OrderStatus.PICKED_UP, to: OrderStatus.FAILED },
      { from: OrderStatus.OUT_FOR_DELIVERY, to: OrderStatus.FAILED },
    ];

    const isPermitted = allowedRiderTransitions.some(
      (t) => t.from === fromStatus && t.to === toStatus,
    );

    if (isPermitted) return;

    throw new ForbiddenException(
      `Riders are not authorized to transition order from ${fromStatus} to ${toStatus}.`,
    );
  }

  throw new ForbiddenException(
    'You are not authorized to perform this order status transition.',
  );
}
