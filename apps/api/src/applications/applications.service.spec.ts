import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ApplicationsService } from './applications.service.js';
import { SellerApplication } from './entities/seller-application.entity.js';
import { RiderApplication } from './entities/rider-application.entity.js';
import { Shop } from '../shops/entities/shop.entity.js';
import { RoleEntity } from '../roles/entities/role.entity.js';
import { UsersService } from '../users/users.service.js';
import { Role } from '../roles/enums/role.enum.js';
import { ApplicationStatus } from './enums/application-status.enum.js';
import { BadRequestException } from '@nestjs/common';

const makeRepo = () => ({
  findOne: vi.fn(),
  find: vi.fn(),
  create: vi.fn((x: unknown) => x),
  save: vi.fn(async (x: unknown) => ({ id: 'app-1', ...(x as object) })),
  createQueryBuilder: vi.fn(),
});

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  const sellerAppRepo = makeRepo();
  const riderAppRepo = makeRepo();
  const shopRepo = makeRepo();
  const roleRepo = makeRepo();
  const usersService = {
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };

  const mockQueryRunner = {
    connect: vi.fn(),
    startTransaction: vi.fn(),
    commitTransaction: vi.fn(),
    rollbackTransaction: vi.fn(),
    release: vi.fn(),
    manager: {
      save: vi.fn(async (x) => x),
    },
  };

  const mockDataSource = {
    createQueryRunner: vi.fn(() => mockQueryRunner),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: getRepositoryToken(SellerApplication), useValue: sellerAppRepo },
        { provide: getRepositoryToken(RiderApplication), useValue: riderAppRepo },
        { provide: getRepositoryToken(Shop), useValue: shopRepo },
        { provide: getRepositoryToken(RoleEntity), useValue: roleRepo },
        { provide: UsersService, useValue: usersService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('submitSellerApplication', () => {
    it('creates a pending seller application for a customer', async () => {
      usersService.findById.mockResolvedValue({ id: 'u1', roles: [{ name: Role.CUSTOMER }] });
      sellerAppRepo.findOne.mockResolvedValue(null);
      shopRepo.findOne.mockResolvedValue(null);

      const res = await service.submitSellerApplication('u1', {
        shopNameEn: 'Green Grocers',
        shopNameBn: 'গ্রিন গ্রোসার্স',
        shopSlug: 'green-grocers',
        phone: '01700000000',
      });

      expect(res.status).toBe(ApplicationStatus.PENDING);
      expect(sellerAppRepo.save).toHaveBeenCalled();
    });

    it('rejects if user is already a seller', async () => {
      usersService.findById.mockResolvedValue({ id: 'u1', roles: [{ name: Role.SELLER }] });
      await expect(
        service.submitSellerApplication('u1', {
          shopNameEn: 'Shop',
          shopNameBn: 'দোকান',
          shopSlug: 'shop',
          phone: '01700000000',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects if a pending application already exists', async () => {
      usersService.findById.mockResolvedValue({ id: 'u1', roles: [{ name: Role.CUSTOMER }] });
      sellerAppRepo.findOne.mockResolvedValue({ id: 'existing-app', status: ApplicationStatus.PENDING });
      await expect(
        service.submitSellerApplication('u1', {
          shopNameEn: 'Shop',
          shopNameBn: 'দোকান',
          shopSlug: 'shop',
          phone: '01700000000',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('approveSellerApplication', () => {
    it('approves application, promotes user to SELLER, and provisions a Shop', async () => {
      const app = {
        id: 'app-1',
        userId: 'u1',
        shopNameEn: 'Green Grocers',
        shopNameBn: 'গ্রিন গ্রোসার্স',
        shopSlug: 'green-grocers',
        status: ApplicationStatus.PENDING,
      };
      sellerAppRepo.findOne.mockResolvedValue(app);
      usersService.findById.mockResolvedValue({ id: 'u1', roles: [{ name: Role.CUSTOMER }] });
      roleRepo.findOne.mockResolvedValue({ id: 'r-seller', name: Role.SELLER });
      shopRepo.findOne.mockResolvedValue(null);

      const approved = await service.approveSellerApplication('app-1', 'admin-1', 'Looks good');
      expect(approved.status).toBe(ApplicationStatus.APPROVED);
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });
  });

  describe('submitRiderApplication and approve', () => {
    it('submits a rider application and approves it', async () => {
      usersService.findById.mockResolvedValue({ id: 'u2', roles: [{ name: Role.CUSTOMER }] });
      riderAppRepo.findOne.mockResolvedValueOnce(null);

      const submitted = await service.submitRiderApplication('u2', {
        fullName: 'Babul Mia',
        phone: '01700000002',
        nidNumber: '1234567890',
        vehicleType: 'BIKE',
      });
      expect(submitted.status).toBe(ApplicationStatus.PENDING);

      riderAppRepo.findOne.mockResolvedValueOnce({
        id: 'r-app-1',
        userId: 'u2',
        status: ApplicationStatus.PENDING,
      });
      roleRepo.findOne.mockResolvedValue({ id: 'r-rider', name: Role.RIDER });

      const approved = await service.approveRiderApplication('r-app-1', 'admin-1');
      expect(approved.status).toBe(ApplicationStatus.APPROVED);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });
  });
});
