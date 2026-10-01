import { describe, it, expect, beforeEach } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AdminsService } from './admins.service.js';
import { User } from '../users/entities/user.entity.js';
import { RoleEntity } from '../roles/entities/role.entity.js';
import { PermissionEntity } from '../permissions/entities/permission.entity.js';
import { Role } from '../roles/enums/role.enum.js';

describe('AdminsService privilege protections', () => {
  let service: AdminsService;
  let users: Partial<Record<string, User>>;

  const superAdminTarget = {
    id: 'sa-1',
    roles: [{ name: Role.SUPER_ADMIN }],
    directPermissions: [],
  } as unknown as User;

  const normalAdminTarget = {
    id: 'ad-1',
    roles: [{ name: Role.ADMIN, permissions: [{ name: 'users.read' }] }],
    directPermissions: [],
  } as unknown as User;

  beforeEach(() => {
    users = { 'sa-1': superAdminTarget, 'ad-1': normalAdminTarget };

    const userRepository = {
      findOne: async ({ where }: { where: { id: string } }) => users[where.id] ?? null,
    } as unknown as Repository<User>;

    const roleRepository = {
      findOne: async () => ({ id: 'r1', name: Role.ADMIN }) as unknown as RoleEntity,
    } as unknown as Repository<RoleEntity>;

    const permissionRepository = {
      find: async ({ where }: { where: { name: { _value?: string[] } } }) => {
        const names = where?.name?._value ?? [];
        return names.map((name) => ({ name }) as PermissionEntity);
      },
    } as unknown as Repository<PermissionEntity>;

    service = new AdminsService(userRepository, roleRepository, permissionRepository);
  });

  const adminCaller = {
    id: 'caller',
    roles: [{ name: Role.ADMIN, permissions: [{ name: 'users.read' }] }],
  };

  it('blocks a non Super Admin from creating a Super Admin account', async () => {
    await expect(
      service.createAdmin(adminCaller, {
        firstName: 'A',
        lastName: 'B',
        phone: '01711111111',
        password: 'password123',
        role: Role.SUPER_ADMIN,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('blocks a non Super Admin from editing a Super Admin account', async () => {
    await expect(
      service.setPermissions(adminCaller, 'sa-1', { permissions: ['users.read'] }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('blocks an admin from granting permissions it does not hold', async () => {
    await expect(
      service.setPermissions(adminCaller, 'ad-1', { permissions: ['payouts.approve'] }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('refuses to modify the system-defined Super Admin permissions', async () => {
    const superAdminCaller = { id: 'root', roles: [{ name: Role.SUPER_ADMIN }] };
    await expect(
      service.setPermissions(superAdminCaller, 'sa-1', { permissions: ['users.read'] }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('only a Super Admin can manage role permission sets', async () => {
    await expect(
      service.updateRolePermissions(adminCaller, Role.ADMIN, ['users.read']),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
