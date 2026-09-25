import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SellerApplication } from './entities/seller-application.entity.js';
import { RiderApplication } from './entities/rider-application.entity.js';
import { ApplicationStatus } from './enums/application-status.enum.js';
import { CreateSellerApplicationDto } from './dto/create-seller-application.dto.js';
import { CreateRiderApplicationDto } from './dto/create-rider-application.dto.js';
import { UsersService } from '../users/users.service.js';
import { Role } from '../roles/enums/role.enum.js';
import { RoleEntity } from '../roles/entities/role.entity.js';
import { Shop } from '../shops/entities/shop.entity.js';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(SellerApplication)
    private readonly sellerAppRepo: Repository<SellerApplication>,
    @InjectRepository(RiderApplication)
    private readonly riderAppRepo: Repository<RiderApplication>,
    @InjectRepository(Shop)
    private readonly shopRepo: Repository<Shop>,
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
  ) {}

  // ==================== SELLER APPLICATION ====================

  async submitSellerApplication(userId: string, dto: CreateSellerApplicationDto): Promise<SellerApplication> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isAlreadySeller = user.roles?.some((r) => r.name === Role.SELLER);
    if (isAlreadySeller) {
      throw new BadRequestException('You are already registered as a seller.');
    }

    const pendingApp = await this.sellerAppRepo.findOne({
      where: { userId, status: ApplicationStatus.PENDING },
    });
    if (pendingApp) {
      throw new BadRequestException('You already have a pending seller application under review.');
    }

    // Check slug collision
    const existingShop = await this.shopRepo.findOne({ where: { slug: dto.shopSlug } });
    if (existingShop) {
      throw new BadRequestException(`Shop slug "${dto.shopSlug}" is already taken. Please choose another.`);
    }

    const application = this.sellerAppRepo.create({
      userId,
      shopNameEn: dto.shopNameEn,
      shopNameBn: dto.shopNameBn,
      shopSlug: dto.shopSlug.toLowerCase().trim().replace(/\s+/g, '-'),
      phone: dto.phone,
      email: dto.email || user.email || null,
      description: dto.description || null,
      address: dto.address || null,
      tradeLicenseNumber: dto.tradeLicenseNumber || null,
      nidNumber: dto.nidNumber || null,
      status: ApplicationStatus.PENDING,
    });

    return this.sellerAppRepo.save(application);
  }

  async getSellerApplicationStatus(userId: string): Promise<SellerApplication | null> {
    return this.sellerAppRepo.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllSellerApplications(status?: ApplicationStatus, page = 1, limit = 10) {
    const query = this.sellerAppRepo.createQueryBuilder('app')
      .leftJoinAndSelect('app.user', 'user')
      .leftJoinAndSelect('app.reviewer', 'reviewer')
      .orderBy('app.createdAt', 'DESC');

    if (status) {
      query.andWhere('app.status = :status', { status });
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

  async getSellerApplicationById(id: string): Promise<SellerApplication> {
    const app = await this.sellerAppRepo.findOne({
      where: { id },
      relations: ['user', 'reviewer'],
    });
    if (!app) {
      throw new NotFoundException('Seller application not found');
    }
    return app;
  }

  async approveSellerApplication(id: string, reviewerId: string, notes?: string): Promise<SellerApplication> {
    const app = await this.getSellerApplicationById(id);
    if (app.status === ApplicationStatus.APPROVED) {
      throw new BadRequestException('Application is already approved.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Mark application approved
      app.status = ApplicationStatus.APPROVED;
      app.adminNotes = notes || app.adminNotes || 'Approved by administrator';
      app.reviewerId = reviewerId;
      app.reviewedAt = new Date();
      await queryRunner.manager.save(app);

      // 2. Add SELLER role to user
      const user = await this.usersService.findById(app.userId);
      const existingRoles = user.roles ? user.roles.map((r) => r.name) : [];
      if (!existingRoles.includes(Role.SELLER)) {
        const sellerRole = await this.roleRepo.findOne({ where: { name: Role.SELLER } });
        if (sellerRole) {
          user.roles = [...(user.roles || []), sellerRole];
          await queryRunner.manager.save(user);
        }
      }

      // 3. Create or activate Shop
      let shop = await this.shopRepo.findOne({ where: { sellerId: app.userId } });
      if (!shop) {
        shop = this.shopRepo.create({
          sellerId: app.userId,
          nameEn: app.shopNameEn,
          nameBn: app.shopNameBn,
          slug: app.shopSlug,
          description: app.description,
          isVerified: true,
          isActive: true,
        });
        await queryRunner.manager.save(shop);
      } else {
        shop.isActive = true;
        shop.isVerified = true;
        await queryRunner.manager.save(shop);
      }

      await queryRunner.commitTransaction();
      return app;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async rejectSellerApplication(id: string, reviewerId: string, notes?: string): Promise<SellerApplication> {
    const app = await this.getSellerApplicationById(id);
    if (app.status === ApplicationStatus.APPROVED) {
      throw new BadRequestException('Cannot reject an already approved application.');
    }

    app.status = ApplicationStatus.REJECTED;
    app.adminNotes = notes || 'Application did not meet requirements.';
    app.reviewerId = reviewerId;
    app.reviewedAt = new Date();

    return this.sellerAppRepo.save(app);
  }

  // ==================== RIDER APPLICATION ====================

  async submitRiderApplication(userId: string, dto: CreateRiderApplicationDto): Promise<RiderApplication> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isAlreadyRider = user.roles?.some((r) => r.name === Role.RIDER);
    if (isAlreadyRider) {
      throw new BadRequestException('You are already registered as a rider.');
    }

    const pendingApp = await this.riderAppRepo.findOne({
      where: { userId, status: ApplicationStatus.PENDING },
    });
    if (pendingApp) {
      throw new BadRequestException('You already have a pending rider application under review.');
    }

    const application = this.riderAppRepo.create({
      userId,
      fullName: dto.fullName,
      phone: dto.phone,
      email: dto.email || user.email || null,
      nidNumber: dto.nidNumber,
      vehicleType: dto.vehicleType,
      vehiclePlateNumber: dto.vehiclePlateNumber || null,
      drivingLicenseNumber: dto.drivingLicenseNumber || null,
      preferredZone: dto.preferredZone || null,
      emergencyContact: dto.emergencyContact || null,
      status: ApplicationStatus.PENDING,
    });

    return this.riderAppRepo.save(application);
  }

  async getRiderApplicationStatus(userId: string): Promise<RiderApplication | null> {
    return this.riderAppRepo.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllRiderApplications(status?: ApplicationStatus, page = 1, limit = 10) {
    const query = this.riderAppRepo.createQueryBuilder('app')
      .leftJoinAndSelect('app.user', 'user')
      .leftJoinAndSelect('app.reviewer', 'reviewer')
      .orderBy('app.createdAt', 'DESC');

    if (status) {
      query.andWhere('app.status = :status', { status });
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

  async getRiderApplicationById(id: string): Promise<RiderApplication> {
    const app = await this.riderAppRepo.findOne({
      where: { id },
      relations: ['user', 'reviewer'],
    });
    if (!app) {
      throw new NotFoundException('Rider application not found');
    }
    return app;
  }

  async approveRiderApplication(id: string, reviewerId: string, notes?: string): Promise<RiderApplication> {
    const app = await this.getRiderApplicationById(id);
    if (app.status === ApplicationStatus.APPROVED) {
      throw new BadRequestException('Application is already approved.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Mark application approved
      app.status = ApplicationStatus.APPROVED;
      app.adminNotes = notes || app.adminNotes || 'Approved by administrator';
      app.reviewerId = reviewerId;
      app.reviewedAt = new Date();
      await queryRunner.manager.save(app);

      // 2. Add RIDER role to user
      const user = await this.usersService.findById(app.userId);
      const existingRoles = user.roles ? user.roles.map((r) => r.name) : [];
      if (!existingRoles.includes(Role.RIDER)) {
        const riderRole = await this.roleRepo.findOne({ where: { name: Role.RIDER } });
        if (riderRole) {
          user.roles = [...(user.roles || []), riderRole];
          await queryRunner.manager.save(user);
        }
      }

      await queryRunner.commitTransaction();
      return app;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async rejectRiderApplication(id: string, reviewerId: string, notes?: string): Promise<RiderApplication> {
    const app = await this.getRiderApplicationById(id);
    if (app.status === ApplicationStatus.APPROVED) {
      throw new BadRequestException('Cannot reject an already approved application.');
    }

    app.status = ApplicationStatus.REJECTED;
    app.adminNotes = notes || 'Application did not meet requirements.';
    app.reviewerId = reviewerId;
    app.reviewedAt = new Date();

    return this.riderAppRepo.save(app);
  }
}
