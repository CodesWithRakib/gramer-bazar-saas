import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity.js';
import { RoleEntity } from '../roles/entities/role.entity.js';
import { Role } from '../roles/enums/role.enum.js';
import { UserStatus } from './enums/user-status.enum.js';
import { CreateUserDto } from './dto/create-user.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

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
    return phone;
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { phone: this.normalizeBdPhone(phone) },
      relations: ['roles'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email }, relations: ['roles'] });
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

  async updateRoles(id: string, roleNames: string[]): Promise<User> {
    const user = await this.findById(id);
    if (!roleNames || roleNames.length === 0) {
      user.roles = [];
    } else {
      const roles = await this.roleRepository.createQueryBuilder('role')
        .where('role.name IN (:...roleNames)', { roleNames })
        .getMany();
      user.roles = roles;
    }
    return this.userRepository.save(user);
  }
}
