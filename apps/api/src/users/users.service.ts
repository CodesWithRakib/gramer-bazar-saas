import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import { RoleEntity } from '../roles/entities/role.entity.js';
import { UserStatus } from './enums/user-status.enum.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { phone }, relations: ['roles'] });
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
}
