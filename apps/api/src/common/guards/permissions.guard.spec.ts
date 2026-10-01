import { describe, it, expect } from 'vitest';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard.js';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';

/**
 * Critical permission boundary matrix.
 *
 * These assertions validate backend authorization (not UI visibility): a caller
 * that lacks a permission must be rejected even if it reaches the API directly.
 */

interface TestUser {
  id: string;
  roles?: Array<string | { name: string; permissions?: Array<{ name: string }> }>;
  directPermissions?: Array<{ name: string }>;
}

const contextFor = (user?: TestUser): ExecutionContext =>
  ({
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => undefined,
    getClass: () => undefined,
  }) as unknown as ExecutionContext;

const guardWith = (required: string[] | undefined): PermissionsGuard => {
  const reflector = {
    getAllAndOverride: (key: string) => (key === PERMISSIONS_KEY ? required : undefined),
  } as unknown as Reflector;
  return new PermissionsGuard(reflector);
};

const adminUser = (permissions: string[]): TestUser => ({
  id: 'admin-1',
  roles: [{ name: 'ADMIN', permissions: permissions.map((name) => ({ name })) }],
});

describe('PermissionsGuard', () => {
  it('allows requests when no permission metadata is declared', () => {
    expect(guardWith(undefined).canActivate(contextFor(adminUser([])))).toBe(true);
  });

  it('allows an admin that holds the required permission through a role', () => {
    expect(guardWith(['users.read']).canActivate(contextFor(adminUser(['users.read'])))).toBe(true);
  });

  it('allows an admin that holds the required permission through a direct grant', () => {
    const user: TestUser = {
      id: 'admin-2',
      roles: ['ADMIN'],
      directPermissions: [{ name: 'payouts.approve' }],
    };
    expect(guardWith(['payouts.approve']).canActivate(contextFor(user))).toBe(true);
  });

  it('rejects an admin without the required permission', () => {
    expect(() =>
      guardWith(['payouts.approve']).canActivate(contextFor(adminUser(['payouts.read']))),
    ).toThrow(ForbiddenException);
  });

  it('rejects an admin trying to delete users without users.delete', () => {
    expect(() =>
      guardWith(['users.delete']).canActivate(contextFor(adminUser(['users.read', 'users.update']))),
    ).toThrow(ForbiddenException);
  });

  it('grants a Super Admin full authority over every permission', () => {
    const superAdmin: TestUser = { id: 'root', roles: [{ name: 'SUPER_ADMIN' }] };
    expect(guardWith(['settings.update']).canActivate(contextFor(superAdmin))).toBe(true);
    expect(guardWith(['admins.create', 'roles.manage']).canActivate(contextFor(superAdmin))).toBe(
      true,
    );
  });

  it('rejects unauthenticated callers', () => {
    expect(() => guardWith(['users.read']).canActivate(contextFor(undefined))).toThrow(
      ForbiddenException,
    );
  });

  it('rejects customers, sellers and riders from admin-only permissions', () => {
    const customer: TestUser = {
      id: 'c1',
      roles: [{ name: 'CUSTOMER', permissions: [{ name: 'orders.read' }] }],
    };
    const seller: TestUser = { id: 's1', roles: [{ name: 'SELLER', permissions: [] }] };
    const rider: TestUser = { id: 'r1', roles: [{ name: 'RIDER', permissions: [] }] };

    for (const user of [customer, seller, rider]) {
      expect(() => guardWith(['users.read']).canActivate(contextFor(user))).toThrow(
        ForbiddenException,
      );
    }
  });
});
