import { describe, it, expect } from 'vitest';
import {
  VALID_ORDER_TRANSITIONS,
  isValidTransition,
  validateRoleTransition,
} from './order-state-machine.js';
import { OrderStatus } from '../enums/order-status.enum.js';
import { Role } from '../../roles/enums/role.enum.js';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

describe('OrderStateMachine', () => {
  describe('isValidTransition', () => {
    it('allows valid lifecycle progression', () => {
      expect(isValidTransition(OrderStatus.PENDING, OrderStatus.CONFIRMED)).toBe(true);
      expect(isValidTransition(OrderStatus.CONFIRMED, OrderStatus.PROCESSING)).toBe(true);
      expect(isValidTransition(OrderStatus.PROCESSING, OrderStatus.READY_FOR_PICKUP)).toBe(true);
      expect(isValidTransition(OrderStatus.READY_FOR_PICKUP, OrderStatus.PICKED_UP)).toBe(true);
      expect(isValidTransition(OrderStatus.PICKED_UP, OrderStatus.OUT_FOR_DELIVERY)).toBe(true);
      expect(isValidTransition(OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED)).toBe(true);
    });

    it('rejects invalid arbitrary jumps', () => {
      expect(isValidTransition(OrderStatus.PENDING, OrderStatus.DELIVERED)).toBe(false);
      expect(isValidTransition(OrderStatus.PROCESSING, OrderStatus.PENDING)).toBe(false);
      expect(isValidTransition(OrderStatus.DELIVERED, OrderStatus.PROCESSING)).toBe(false);
      expect(isValidTransition(OrderStatus.CANCELLED, OrderStatus.DELIVERED)).toBe(false);
    });
  });

  describe('validateRoleTransition', () => {
    it('allows customer to cancel own pending or confirmed order', () => {
      expect(() =>
        validateRoleTransition(OrderStatus.PENDING, OrderStatus.CANCELLED, [Role.CUSTOMER], {
          isCustomerOwner: true,
          isSellerOwner: false,
          isAssignedRider: false,
        }),
      ).not.toThrow();

      expect(() =>
        validateRoleTransition(OrderStatus.CONFIRMED, OrderStatus.CANCELLED, [Role.CUSTOMER], {
          isCustomerOwner: true,
          isSellerOwner: false,
          isAssignedRider: false,
        }),
      ).not.toThrow();
    });

    it('prevents customer from cancelling orders already in processing or beyond', () => {
      expect(() =>
        validateRoleTransition(OrderStatus.PROCESSING, OrderStatus.CANCELLED, [Role.CUSTOMER], {
          isCustomerOwner: true,
          isSellerOwner: false,
          isAssignedRider: false,
        }),
      ).toThrow(BadRequestException);
    });

    it('prevents customer from modifying other statuses', () => {
      expect(() =>
        validateRoleTransition(OrderStatus.PENDING, OrderStatus.CONFIRMED, [Role.CUSTOMER], {
          isCustomerOwner: true,
          isSellerOwner: false,
          isAssignedRider: false,
        }),
      ).toThrow(ForbiddenException);
    });

    it('allows seller to confirm, process, and prepare pickup for their shop', () => {
      expect(() =>
        validateRoleTransition(OrderStatus.PENDING, OrderStatus.CONFIRMED, [Role.SELLER], {
          isCustomerOwner: false,
          isSellerOwner: true,
          isAssignedRider: false,
        }),
      ).not.toThrow();

      expect(() =>
        validateRoleTransition(OrderStatus.CONFIRMED, OrderStatus.PROCESSING, [Role.SELLER], {
          isCustomerOwner: false,
          isSellerOwner: true,
          isAssignedRider: false,
        }),
      ).not.toThrow();

      expect(() =>
        validateRoleTransition(OrderStatus.PROCESSING, OrderStatus.READY_FOR_PICKUP, [Role.SELLER], {
          isCustomerOwner: false,
          isSellerOwner: true,
          isAssignedRider: false,
        }),
      ).not.toThrow();
    });

    it('allows assigned rider to handle pickup, transit, and delivery', () => {
      expect(() =>
        validateRoleTransition(OrderStatus.READY_FOR_PICKUP, OrderStatus.PICKED_UP, [Role.RIDER], {
          isCustomerOwner: false,
          isSellerOwner: false,
          isAssignedRider: true,
        }),
      ).not.toThrow();

      expect(() =>
        validateRoleTransition(OrderStatus.PICKED_UP, OrderStatus.OUT_FOR_DELIVERY, [Role.RIDER], {
          isCustomerOwner: false,
          isSellerOwner: false,
          isAssignedRider: true,
        }),
      ).not.toThrow();

      expect(() =>
        validateRoleTransition(OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED, [Role.RIDER], {
          isCustomerOwner: false,
          isSellerOwner: false,
          isAssignedRider: true,
        }),
      ).not.toThrow();
    });

    it('prevents unassigned rider from transitioning orders', () => {
      expect(() =>
        validateRoleTransition(OrderStatus.READY_FOR_PICKUP, OrderStatus.PICKED_UP, [Role.RIDER], {
          isCustomerOwner: false,
          isSellerOwner: false,
          isAssignedRider: false,
        }),
      ).toThrow(ForbiddenException);
    });

    it('allows Admin and Super Admin to execute structurally valid transitions', () => {
      expect(() =>
        validateRoleTransition(OrderStatus.PENDING, OrderStatus.CONFIRMED, [Role.ADMIN], {
          isCustomerOwner: false,
          isSellerOwner: false,
          isAssignedRider: false,
        }),
      ).not.toThrow();

      expect(() =>
        validateRoleTransition(OrderStatus.PENDING, OrderStatus.CONFIRMED, [Role.SUPER_ADMIN], {
          isCustomerOwner: false,
          isSellerOwner: false,
          isAssignedRider: false,
        }),
      ).not.toThrow();
    });

    it('prevents Admin from executing structurally invalid transitions', () => {
      expect(() =>
        validateRoleTransition(OrderStatus.PENDING, OrderStatus.DELIVERED, [Role.ADMIN], {
          isCustomerOwner: false,
          isSellerOwner: false,
          isAssignedRider: false,
        }),
      ).toThrow(BadRequestException);
    });
  });
});
