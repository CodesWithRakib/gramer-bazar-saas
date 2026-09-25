import { Injectable, NotFoundException, BadRequestException, ForbiddenException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity.js';
import { RoleEntity } from '../roles/entities/role.entity.js';
import { Role } from '../roles/enums/role.enum.js';
import { UserStatus } from './enums/user-status.enum.js';
import { CreateUserDto } from './dto/create-user.dto.js';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async onModuleInit() {
    await this.ensureInitialAdmins();
  }

  async ensureInitialAdmins() {
    try {
      if (!this.roleRepository || !this.userRepository) return;

      let superAdminRole = await this.roleRepository.findOne({ where: { name: Role.SUPER_ADMIN } });
      if (!superAdminRole) {
        superAdminRole = await this.roleRepository.save(
          this.roleRepository.create({ name: Role.SUPER_ADMIN, description: 'Super Administrator' }),
        );
      }
      let adminRole = await this.roleRepository.findOne({ where: { name: Role.ADMIN } });
      if (!adminRole) {
        adminRole = await this.roleRepository.save(
          this.roleRepository.create({ name: Role.ADMIN, description: 'Administrator' }),
        );
      }

      const defaultHash = await bcrypt.hash('password123', 10);

      // 1. Ensure Super Admin (+8801767476724 / codeswithrakib@gmail.com)
      let superAdmin = await this.findByPhone('01767476724');
      if (!superAdmin) {
        superAdmin = await this.findByEmail('codeswithrakib@gmail.com');
      }

      if (!superAdmin) {
        this.logger.log('Initializing Super Admin account (+8801767476724 / codeswithrakib@gmail.com)...');
        superAdmin = this.userRepository.create({
          phone: '+8801767476724',
          email: 'codeswithrakib@gmail.com',
          firstName: 'Rakib',
          lastName: 'SuperAdmin',
          passwordHash: defaultHash,
          status: UserStatus.ACTIVE,
          isPhoneVerified: true,
          isEmailVerified: true,
          roles: [superAdminRole],
        });
        await this.userRepository.save(superAdmin);
        this.logger.log('Super Admin account created successfully.');
      } else {
        let changed = false;
        if (!superAdmin.roles?.some((r) => r.name === Role.SUPER_ADMIN)) {
          superAdmin.roles = [...(superAdmin.roles || []), superAdminRole];
          changed = true;
        }
        if (superAdmin.status !== UserStatus.ACTIVE) {
          superAdmin.status = UserStatus.ACTIVE;
          changed = true;
        }
        if (superAdmin.phone !== '+8801767476724') {
          const phoneInUse = await this.userRepository.findOne({ where: { phone: '+8801767476724' } });
          if (!phoneInUse) {
            superAdmin.phone = '+8801767476724';
            changed = true;
          }
        }
        if (superAdmin.email !== 'codeswithrakib@gmail.com') {
          const emailInUse = await this.userRepository.findOne({ where: { email: 'codeswithrakib@gmail.com' } });
          if (!emailInUse) {
            superAdmin.email = 'codeswithrakib@gmail.com';
            changed = true;
          }
        }
        if (!superAdmin.passwordHash) {
          superAdmin.passwordHash = defaultHash;
          changed = true;
        } else {
          const isMatching = await bcrypt.compare('password123', superAdmin.passwordHash);
          if (!isMatching) {
            superAdmin.passwordHash = defaultHash;
            changed = true;
          }
        }
        if (changed) {
          await this.userRepository.save(superAdmin);
          this.logger.log('Super Admin account updated to active with valid credentials.');
        }
      }

      // 2. Ensure Admin (+8801952879249 / admin@gramerbazar.com)
      let admin = await this.findByPhone('01952879249');
      if (!admin) {
        admin = await this.findByEmail('admin@gramerbazar.com');
      }

      if (!admin) {
        this.logger.log('Initializing Admin account (+8801952879249 / admin@gramerbazar.com)...');
        admin = this.userRepository.create({
          phone: '+8801952879249',
          email: 'admin@gramerbazar.com',
          firstName: 'System',
          lastName: 'Admin',
          passwordHash: defaultHash,
          status: UserStatus.ACTIVE,
          isPhoneVerified: true,
          isEmailVerified: true,
          roles: [adminRole],
        });
        await this.userRepository.save(admin);
        this.logger.log('Admin account created successfully.');
      } else {
        let changed = false;
        if (!admin.roles?.some((r) => r.name === Role.ADMIN || r.name === Role.SUPER_ADMIN)) {
          admin.roles = [...(admin.roles || []), adminRole];
          changed = true;
        }
        if (admin.status !== UserStatus.ACTIVE) {
          admin.status = UserStatus.ACTIVE;
          changed = true;
        }
        if (admin.phone !== '+8801952879249') {
          const phoneInUse = await this.userRepository.findOne({ where: { phone: '+8801952879249' } });
          if (!phoneInUse) {
            admin.phone = '+8801952879249';
            changed = true;
          }
        }
        if (!admin.passwordHash) {
          admin.passwordHash = defaultHash;
          changed = true;
        } else {
          const isMatching = await bcrypt.compare('password123', admin.passwordHash);
          if (!isMatching) {
            admin.passwordHash = defaultHash;
            changed = true;
          }
        }
        if (changed) {
          await this.userRepository.save(admin);
          this.logger.log('Admin account updated to active with valid credentials.');
        }
      }
    } catch (err: any) {
      this.logger.warn(`Could not ensure initial admins: ${err?.message}`);
    }
  }

  /**
   * Normalize a Bangladeshi phone to the canonical E.164 storage form.
   * OTP login accepts local `01XXXXXXXXX` input while users are stored as
   * `+8801XXXXXXXXX`; without this, OTP login would silently create a
   * shadow account instead of matching the existing user.
   */
  normalizeBdPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('01')) return `+88${digits}`;
    if (digits.length === 13 && digits.startsWith('880')) return `+${digits}`;
    if (digits.length === 10 && digits.startsWith('1')) return `+880${digits}`;
    return phone;
  }

  async findByPhone(phone: string): Promise<User | null> {
    const normalized = this.normalizeBdPhone(phone);
    let user = await this.userRepository.findOne({
      where: { phone: normalized },
      relations: ['roles'],
    });

    if (!user && normalized !== phone) {
      user = await this.userRepository.findOne({
        where: { phone },
        relations: ['roles'],
      });
    }

    if (!user) {
      const digits = phone.replace(/\D/g, '');
      const candidates = new Set<string>();
      if (digits.length === 11 && digits.startsWith('01')) {
        candidates.add(`+88${digits}`);
        candidates.add(`88${digits}`);
        candidates.add(digits);
      } else if (digits.length === 13 && digits.startsWith('880')) {
        candidates.add(`+${digits}`);
        candidates.add(digits);
        candidates.add(`0${digits.slice(3)}`);
      }
      for (const candidate of candidates) {
        if (candidate !== normalized && candidate !== phone) {
          user = await this.userRepository.findOne({
            where: { phone: candidate },
            relations: ['roles'],
          });
          if (user) break;
        }
      }
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const trimmed = email.trim();
    let user = await this.userRepository.findOne({ where: { email: trimmed }, relations: ['roles'] });
    if (!user && trimmed !== trimmed.toLowerCase()) {
      user = await this.userRepository.findOne({ where: { email: trimmed.toLowerCase() }, relations: ['roles'] });
    }
    return user;
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id }, relations: ['roles'] });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findAdmin(): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.roles', 'role')
      .where('role.name IN (:...roles)', { roles: ['ADMIN', 'SUPER_ADMIN'] })
      .getOne();
  }

  async create(userData: Partial<User> & { roleNames?: string[] }): Promise<User> {
    const { roleNames, ...rest } = userData;
    const user = this.userRepository.create(rest);
    
    if (roleNames && roleNames.length > 0) {
      const roles = await this.roleRepository.createQueryBuilder('role')
        .where('role.name IN (:...roleNames)', { roleNames })
        .getMany();
      user.roles = roles;
    }

    return this.userRepository.save(user);
  }

  async createByAdmin(caller: any, dto: CreateUserDto): Promise<User> {
    const isSuperAdmin = caller.roles?.some((r: any) => (r.name || r) === Role.SUPER_ADMIN);
    if (!isSuperAdmin && (dto.role === Role.ADMIN || dto.role === Role.SUPER_ADMIN)) {
      throw new ForbiddenException('Only Super Admins can create Admin or Super Admin accounts');
    }

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

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    return this.create({
      phone: normalizedPhone,
      email: dto.email || null,
      firstName: dto.firstName,
      lastName: dto.lastName,
      passwordHash,
      status: UserStatus.ACTIVE,
      isPhoneVerified: true,
      isEmailVerified: !!dto.email,
      roleNames: [dto.role],
    });
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  async findAll(page = 1, limit = 10, search?: string, roleName?: string) {
    const query = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .orderBy('user.createdAt', 'DESC');

    if (search) {
      query.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.phone ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (roleName) {
      query.andWhere('role.name = :roleName', { roleName });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateRoles(
    caller: { id: string; roles?: Array<{ name: string } | string> },
    id: string,
    roleNames: string[]
  ): Promise<User> {
    const isSuperAdmin = caller.roles?.some(
      (r) => (typeof r === 'string' ? r : r.name) === Role.SUPER_ADMIN
    );

    const targetUser = await this.findById(id);
    const targetHasPrivilege = targetUser.roles?.some(
      (r) => r.name === Role.ADMIN || r.name === Role.SUPER_ADMIN
    );
    const attemptingPrivilege = roleNames.some(
      (r) => r === Role.ADMIN || r === Role.SUPER_ADMIN
    );

    if (!isSuperAdmin && (targetHasPrivilege || attemptingPrivilege)) {
      throw new ForbiddenException(
        'Only Super Admins can manage Admin or Super Admin roles'
      );
    }

    if (!roleNames || roleNames.length === 0) {
      targetUser.roles = [];
    } else {
      const roles = await this.roleRepository
        .createQueryBuilder('role')
        .where('role.name IN (:...roleNames)', { roleNames })
        .getMany();
      targetUser.roles = roles;
    }
    return this.userRepository.save(targetUser);
  }
}
