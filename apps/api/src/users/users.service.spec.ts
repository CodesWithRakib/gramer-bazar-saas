import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { RoleEntity } from '../roles/entities/role.entity.js';
import { UserStatus } from './enums/user-status.enum.js';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  let service: UsersService;

  const userRepository = {
    findOne: vi.fn(),
    create: vi.fn((x) => x),
    save: vi.fn(),
    createQueryBuilder: vi.fn(),
  };
  const roleQueryBuilder = {
    where: vi.fn().mockReturnThis(),
    getMany: vi.fn(),
  };
  const roleRepository = {
    createQueryBuilder: vi.fn(() => roleQueryBuilder),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(RoleEntity), useValue: roleRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('lookup', () => {
    it('finds users by phone with roles', async () => {
      userRepository.findOne.mockResolvedValue({ id: 'u1', phone: '+8801' });

      await expect(service.findByPhone('+8801')).resolves.toEqual({ id: 'u1', phone: '+8801' });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { phone: '+8801' },
        relations: ['roles'],
      });
    });

    it('throws NotFound for an unknown id', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('attaches roles when roleNames are provided', async () => {
      const roles = [{ id: 'r1', name: 'SELLER' }];
      roleQueryBuilder.getMany.mockResolvedValue(roles);
      userRepository.save.mockImplementation(async (u) => ({ ...u, id: 'u1' }));

      const result = await service.create({
        phone: '+8801',
        status: UserStatus.ACTIVE,
        roleNames: ['SELLER'],
      });

      expect(result.roles).toEqual(roles);
      expect(roleQueryBuilder.where).toHaveBeenCalledWith('role.name IN (:...roleNames)', {
        roleNames: ['SELLER'],
      });
    });

    it('creates a user without roles when roleNames are omitted', async () => {
      userRepository.save.mockImplementation(async (u) => ({ ...u, id: 'u1' }));

      const result = await service.create({ phone: '+8802', status: UserStatus.ACTIVE });

      expect(result.roles).toBeUndefined();
      expect(roleQueryBuilder.getMany).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('merges the update into the stored user', async () => {
      const stored = { id: 'u1', firstName: 'Old', status: UserStatus.ACTIVE };
      userRepository.findOne.mockResolvedValue(stored);
      userRepository.save.mockImplementation(async (u) => u);

      const result = await service.update('u1', { firstName: 'New' });

      expect(result.firstName).toBe('New');
      expect(userRepository.save).toHaveBeenCalledWith(stored);
    });

    it('throws when updating a missing user', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.update('ghost', { firstName: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('returns a {data, meta} envelope with computed totalPages', async () => {
      const query = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[{ id: 'u1' }], 11]),
      };
      userRepository.createQueryBuilder.mockReturnValue(query);

      const result = await service.findAll(2, 10);

      expect(query.skip).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        data: [{ id: 'u1' }],
        meta: { total: 11, page: 2, limit: 10, totalPages: 2 },
      });
    });

    it('filters by role when provided', async () => {
      const query = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
      };
      userRepository.createQueryBuilder.mockReturnValue(query);

      const result = await service.findAll(1, 10, undefined, 'RIDER');

      expect(query.andWhere).toHaveBeenCalledWith('role.name = :roleName', {
        roleName: 'RIDER',
      });
      expect(result.data).toEqual([]);
    });
  });
});
