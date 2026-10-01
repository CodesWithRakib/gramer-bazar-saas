import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User } from '../users/entities/user.entity.js';
import { RoleEntity } from '../roles/entities/role.entity.js';
import { Role } from '../roles/enums/role.enum.js';
import { UserStatus } from '../users/enums/user-status.enum.js';
import { PermissionEntity } from '../permissions/entities/permission.entity.js';
import {
  getEffectivePermissions,
  getRoleNames,
  isSuperAdmin,
  type PermissionBearingUser,
} from '../common/utils/permission.js';
import {
  SENSITIVE_PERMISSION_NAMES,
  SEED_PERMISSIONS,
} from '../seeder/data/seed-permissions.data.js';
import {
  AssignAdminPermissionsDto,
  CreateAdminDto,
  ResetAdminPasswordDto,
  UpdateAdminDto,
} from './dto/admin.dto.js';
import { AdminAccountDto } from './dto/admin-response.dto.js';

const ADMIN_ROLE_NAMES = [Role.ADMIN, Role.SUPER_ADMIN];
const GROUP_BY_NAME = new Map(SEED_PERMISSIONS.map((p) => [p.name, p.group]));

/**
 * Super-Admin-facing administration of administrative accounts, their explicit
 * permission grants, and role permission sets.
 *
 * All privilege checks happen here on the server. Sensitive operations (creating
 * or mutating a Super Admin, granting sensitive permissions, editing role
 * permission sets) require a genuine Super Admin regardless of permissions
 * delegated to an Admin.
 */
@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
  ) {}

  // ---------------------------------------------------------------------------
  // Reads
  // ---------------------------------------------------------------------------

  async listAdmins(page = 1, limit = 10, search?: string, roleName?: Role) {
    const query = this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('user.directPermissions', 'directPermission')
      .where('role.name IN (:...adminRoles)', { adminRoles: ADMIN_ROLE_NAMES })
      .orderBy('user.createdAt', 'DESC');

    if (roleName && ADMIN_ROLE_NAMES.includes(roleName)) {
      query.andWhere('role.name = :roleName', { roleName });
    }

    if (search) {
      query.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.phone ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: data.map((user) => this.toAdminAccount(user)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAdmin(id: string): Promise<AdminAccountDto> {
    const user = await this.findAdminOrFail(id);
    return this.toAdminAccount(user);
  }

  async listPermissions() {
    const permissions = await this.permissionRepository.find({ order: { name: 'ASC' } });
    const catalog = permissions.map((permission) => ({
      name: permission.name,
      description: permission.description,
      group: GROUP_BY_NAME.get(permission.name) ?? 'Other',
      sensitive: SENSITIVE_PERMISSION_NAMES.includes(permission.name),
    }));

    const groups = Array.from(new Set(catalog.map((p) => p.group)));
    return { permissions: catalog, groups };
  }

  async listRoles() {
    const roles = await this.roleRepository.find({ relations: ['permissions'] });
    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions?.map((p) => p.name) ?? [],
      isSystem: role.name === Role.SUPER_ADMIN,
    }));
  }

  async getMyProfile(user: PermissionBearingUser & { id: string }) {
    const account = await this.findAdminOrFail(user.id);
    return account;
  }

  // ---------------------------------------------------------------------------
  // Writes
  // ---------------------------------------------------------------------------

  async createAdmin(caller: PermissionBearingUser, dto: CreateAdminDto): Promise<AdminAccountDto> {
    if (dto.role === Role.SUPER_ADMIN && !isSuperAdmin(caller)) {
      throw new ForbiddenException('Only a Super Admin can create Super Admin accounts');
    }

    const granted = dto.permissions ?? [];
    this.assertCanGrantPermissions(caller, granted);

    const normalizedPhone = this.normalizeBdPhone(dto.phone);
    const existingPhone = await this.userRepository.findOne({ where: { phone: normalizedPhone } });
    if (existingPhone) {
      throw new BadRequestException('A user with this phone number already exists');
    }
    if (dto.email) {
      const existingEmail = await this.userRepository.findOne({ where: { email: dto.email } });
      if (existingEmail) {
        throw new BadRequestException('A user with this email address already exists');
      }
    }

    const role = await this.requireRole(dto.role);
    const permissions = await this.resolvePermissions(granted);
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const admin = this.userRepository.create({
      phone: normalizedPhone,
      email: dto.email ?? null,
      firstName: dto.firstName,
      lastName: dto.lastName,
      passwordHash,
      status: UserStatus.ACTIVE,
      isPhoneVerified: true,
      isEmailVerified: Boolean(dto.email),
      roles: [role],
      directPermissions: permissions,
    });

    const saved = await this.userRepository.save(admin);
    return this.toAdminAccount(await this.findAdminOrFail(saved.id));
  }

  async updateAdmin(
    caller: PermissionBearingUser & { id: string },
    id: string,
    dto: UpdateAdminDto,
  ): Promise<AdminAccountDto> {
    const target = await this.findAdminOrFail(id);
    this.assertCanManageTarget(caller, target);

    if (dto.phone && dto.phone !== target.phone) {
      const normalizedPhone = this.normalizeBdPhone(dto.phone);
      const existing = await this.userRepository.findOne({ where: { phone: normalizedPhone } });
      if (existing && existing.id !== target.id) {
        throw new BadRequestException('A user with this phone number already exists');
      }
      target.phone = normalizedPhone;
    }

    if (dto.email && dto.email !== target.email) {
      const existing = await this.userRepository.findOne({ where: { email: dto.email } });
      if (existing && existing.id !== target.id) {
        throw new BadRequestException('A user with this email address already exists');
      }
      target.email = dto.email;
    }

    if (dto.firstName !== undefined) target.firstName = dto.firstName;
    if (dto.lastName !== undefined) target.lastName = dto.lastName;

    if (dto.status !== undefined && dto.status !== target.status) {
      if (dto.status !== UserStatus.ACTIVE) {
        this.assertNotSelf(caller, target, 'You cannot deactivate your own account');
        await this.assertNotLastSuperAdmin(target);
      }
      target.status = dto.status;
    }

    await this.userRepository.save(target);
    return this.toAdminAccount(await this.findAdminOrFail(id));
  }

  async setPermissions(
    caller: PermissionBearingUser & { id: string },
    id: string,
    dto: AssignAdminPermissionsDto,
  ): Promise<AdminAccountDto> {
    const target = await this.findAdminOrFail(id);
    this.assertCanManageTarget(caller, target);

    if (isSuperAdmin(target)) {
      throw new ForbiddenException('Super Admin permissions are system-defined and cannot be edited');
    }

    this.assertCanGrantPermissions(caller, dto.permissions);

    const permissions = await this.resolvePermissions(dto.permissions);
    target.directPermissions = permissions;
    await this.userRepository.save(target);
    return this.toAdminAccount(await this.findAdminOrFail(id));
  }

  async resetPassword(
    caller: PermissionBearingUser,
    id: string,
    dto: ResetAdminPasswordDto,
  ): Promise<{ message: string }> {
    const target = await this.findAdminOrFail(id);
    this.assertCanManageTarget(caller, target);

    target.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    // Force re-authentication everywhere for the target account.
    target.refreshTokenHash = null;
    await this.userRepository.save(target);
    return { message: 'Password reset successfully' };
  }

  async deactivateAdmin(
    caller: PermissionBearingUser & { id: string },
    id: string,
  ): Promise<{ message: string }> {
    const target = await this.findAdminOrFail(id);
    this.assertCanManageTarget(caller, target);
    this.assertNotSelf(caller, target, 'You cannot deactivate your own account');
    await this.assertNotLastSuperAdmin(target);

    target.status = UserStatus.INACTIVE;
    target.refreshTokenHash = null;
    await this.userRepository.save(target);
    return { message: 'Administrative account deactivated' };
  }

  async updateRolePermissions(
    caller: PermissionBearingUser,
    roleName: Role,
    permissionNames: string[],
  ) {
    if (!isSuperAdmin(caller)) {
      throw new ForbiddenException('Only a Super Admin can manage role permissions');
    }
    if (roleName === Role.SUPER_ADMIN) {
      throw new ForbiddenException('Super Admin role permissions are system-defined');
    }

    const role = await this.roleRepository.findOne({
      where: { name: roleName },
      relations: ['permissions'],
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    role.permissions = await this.resolvePermissions(permissionNames);
    await this.roleRepository.save(role);
    return {
      id: role.id,
      name: role.name,
      permissions: role.permissions.map((p) => p.name),
    };
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private async findAdminOrFail(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions', 'directPermissions'],
    });
    if (!user) {
      throw new NotFoundException('Administrative account not found');
    }
    if (!getRoleNames(user).some((name) => ADMIN_ROLE_NAMES.includes(name as Role))) {
      throw new NotFoundException('Administrative account not found');
    }
    return user;
  }

  private async requireRole(name: Role): Promise<RoleEntity> {
    const role = await this.roleRepository.findOne({ where: { name } });
    if (!role) {
      throw new NotFoundException(`Role ${name} is not configured`);
    }
    return role;
  }

  private async resolvePermissions(names: string[]): Promise<PermissionEntity[]> {
    const unique = Array.from(new Set(names));
    if (unique.length === 0) return [];

    const permissions = await this.permissionRepository.find({ where: { name: In(unique) } });
    if (permissions.length !== unique.length) {
      const found = new Set(permissions.map((p) => p.name));
      const missing = unique.filter((name) => !found.has(name));
      throw new BadRequestException(`Unknown permissions: ${missing.join(', ')}`);
    }
    return permissions;
  }

  /** Non-Super-Admins may only grant permissions they themselves hold. */
  private assertCanGrantPermissions(caller: PermissionBearingUser, names: string[]): void {
    if (names.length === 0) return;

    if (isSuperAdmin(caller)) return;

    const callerPermissions = getEffectivePermissions(caller);
    const forbidden = names.filter((name) => !callerPermissions.has(name));
    if (forbidden.length > 0) {
      throw new ForbiddenException(
        `You cannot grant permissions you do not hold: ${forbidden.join(', ')}`,
      );
    }
  }

  private assertCanManageTarget(caller: PermissionBearingUser, target: User): void {
    if (isSuperAdmin(target) && !isSuperAdmin(caller)) {
      throw new ForbiddenException('Only a Super Admin can manage a Super Admin account');
    }
  }

  private assertNotSelf(
    caller: { id: string },
    target: User,
    message: string,
  ): void {
    if (caller.id === target.id) {
      throw new ForbiddenException(message);
    }
  }

  private async assertNotLastSuperAdmin(target: User): Promise<void> {
    if (!isSuperAdmin(target)) return;
    const activeSuperAdmins = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.roles', 'role')
      .where('role.name = :role', { role: Role.SUPER_ADMIN })
      .andWhere('user.status = :status', { status: UserStatus.ACTIVE })
      .andWhere('user.id != :id', { id: target.id })
      .getCount();
    if (activeSuperAdmins === 0) {
      throw new ForbiddenException('At least one active Super Admin must remain');
    }
  }

  private normalizeBdPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('01')) return `+88${digits}`;
    if (digits.length === 13 && digits.startsWith('880')) return `+${digits}`;
    if (digits.length === 10 && digits.startsWith('1')) return `+880${digits}`;
    return phone;
  }

  private toAdminAccount(user: User): AdminAccountDto {
    const roles = getRoleNames(user);
    return {
      id: user.id,
      phone: user.phone,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      roles,
      directPermissions: (user.directPermissions ?? []).map((p) => p.name),
      effectivePermissions: Array.from(getEffectivePermissions(user)).sort(),
      isSuperAdmin: roles.includes(Role.SUPER_ADMIN),
    };
  }
}
