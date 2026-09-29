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
import { NotificationsService } from '../notifications/notifications.service.js';
import { RidersService } from '../riders/riders.service.js';
import {
  NotificationType,
  NotificationPriority,
} from '../notifications/entities/notification.entity.js';

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
    private readonly notificationsService: NotificationsService,
    private readonly ridersService: RidersService,
  ) {}

  // ==================== SELLER APPLICATION ====================

  async submitSellerApplication(
    userId: string,
    dto: CreateSellerApplicationDto,
  ): Promise<SellerApplication> {
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
      throw new BadRequestException(
        `Shop slug "${dto.shopSlug}" is already taken. Please choose another.`,
      );
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

    const saved = await this.sellerAppRepo.save(application);

    // Notify applicant
    const shopName = dto.shopNameEn || dto.shopNameBn || 'Shop';
    void this.notificationsService.notifyUser(userId, {
      type: NotificationType.SELLER_APPLICATION_SUBMITTED,
      title: 'Application Submitted',
      message: `Your seller application for "${shopName}" has been submitted and is under review.`,
      titleKey: 'notifications.seller_application_submitted.title',
      messageKey: 'notifications.seller_application_submitted.message',
      priority: NotificationPriority.NORMAL,
      data: { applicationId: saved.id, shopName },
    });

    // Notify admins
    void this.notificationsService.notifyRole(Role.ADMIN, {
      type: NotificationType.SELLER_APPLICATION_SUBMITTED,
      title: 'New Seller Application',
      message: `New seller application submitted for "${shopName}".`,
      titleKey: 'notifications.seller_application_admin.title',
      messageKey: 'notifications.seller_application_admin.message',
      priority: NotificationPriority.HIGH,
      data: { applicationId: saved.id, shopName, userId },
    });

    return saved;
  }

  async getSellerApplicationStatus(userId: string): Promise<SellerApplication | null> {
    return this.sellerAppRepo.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllSellerApplications(status?: ApplicationStatus, page = 1, limit = 10) {
    const query = this.sellerAppRepo
      .createQueryBuilder('app')
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

  async approveSellerApplication(
    id: string,
    reviewerId: string,
    notes?: string,
  ): Promise<SellerApplication> {
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

      // Notify applicant
      void this.notificationsService.notifyUser(app.userId, {
        type: NotificationType.SELLER_APPLICATION_APPROVED,
        title: 'Application Approved',
        message: `Congratulations! Your seller application for "${app.shopNameEn || 'Shop'}" has been approved.`,
        titleKey: 'notifications.seller_application_approved.title',
        messageKey: 'notifications.seller_application_approved.message',
        priority: NotificationPriority.HIGH,
        data: { applicationId: app.id, shopName: app.shopNameEn },
      });

      return app;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async rejectSellerApplication(
    id: string,
    reviewerId: string,
    notes?: string,
  ): Promise<SellerApplication> {
    const app = await this.getSellerApplicationById(id);
    if (app.status === ApplicationStatus.APPROVED) {
      throw new BadRequestException('Cannot reject an already approved application.');
    }

    app.status = ApplicationStatus.REJECTED;
    app.adminNotes = notes || 'Application did not meet requirements.';
    app.reviewerId = reviewerId;
    app.reviewedAt = new Date();

    const saved = await this.sellerAppRepo.save(app);

    // Notify applicant
    void this.notificationsService.notifyUser(app.userId, {
      type: NotificationType.SELLER_APPLICATION_REJECTED,
      title: 'Application Rejected',
      message: `Your seller application for "${app.shopNameEn || 'Shop'}" was not approved.`,
      titleKey: 'notifications.seller_application_rejected.title',
      messageKey: 'notifications.seller_application_rejected.message',
      priority: NotificationPriority.HIGH,
      data: { applicationId: app.id, shopName: app.shopNameEn, reason: app.adminNotes },
    });

    return saved;
  }

  // ==================== RIDER APPLICATION ====================

  async submitRiderApplication(
    userId: string,
    dto: CreateRiderApplicationDto,
  ): Promise<RiderApplication> {
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

    const saved = await this.riderAppRepo.save(application);

    // Notify applicant
    void this.notificationsService.notifyUser(userId, {
      type: NotificationType.RIDER_APPLICATION_SUBMITTED,
      title: 'Application Submitted',
      message: 'Your rider application has been submitted and is under review.',
      titleKey: 'notifications.rider_application_submitted.title',
      messageKey: 'notifications.rider_application_submitted.message',
      priority: NotificationPriority.NORMAL,
      data: { applicationId: saved.id },
    });

    // Notify admins
    const riderName =
      dto.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Applicant';
    void this.notificationsService.notifyRole(Role.ADMIN, {
      type: NotificationType.RIDER_APPLICATION_SUBMITTED,
      title: 'New Rider Application',
      message: `New rider application received from ${riderName}.`,
      titleKey: 'notifications.rider_application_admin.title',
      messageKey: 'notifications.rider_application_admin.message',
      priority: NotificationPriority.HIGH,
      data: { applicationId: saved.id, riderName, userId },
    });

    return saved;
  }

  async getRiderApplicationStatus(userId: string): Promise<RiderApplication | null> {
    return this.riderAppRepo.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllRiderApplications(status?: ApplicationStatus, page = 1, limit = 10) {
    const query = this.riderAppRepo
      .createQueryBuilder('app')
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

  async approveRiderApplication(
    id: string,
    reviewerId: string,
    notes?: string,
  ): Promise<RiderApplication> {
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

      // 3. Provision the operational rider profile from the approved dossier.
      await this.ridersService.syncFromApplication(app.userId, {
        fullName: app.fullName,
        nidNumber: app.nidNumber,
        vehicleType: app.vehicleType,
        vehiclePlateNumber: app.vehiclePlateNumber,
        drivingLicenseNumber: app.drivingLicenseNumber,
        preferredZone: app.preferredZone,
        emergencyContact: app.emergencyContact,
      });

      // Notify applicant
      void this.notificationsService.notifyUser(app.userId, {
        type: NotificationType.RIDER_APPLICATION_APPROVED,
        title: 'Application Approved',
        message:
          'Congratulations! Your rider application has been approved. You can now accept deliveries.',
        titleKey: 'notifications.rider_application_approved.title',
        messageKey: 'notifications.rider_application_approved.message',
        priority: NotificationPriority.HIGH,
        data: { applicationId: app.id },
      });

      return app;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async rejectRiderApplication(
    id: string,
    reviewerId: string,
    notes?: string,
  ): Promise<RiderApplication> {
    const app = await this.getRiderApplicationById(id);
    if (app.status === ApplicationStatus.APPROVED) {
      throw new BadRequestException('Cannot reject an already approved application.');
    }

    app.status = ApplicationStatus.REJECTED;
    app.adminNotes = notes || 'Application did not meet requirements.';
    app.reviewerId = reviewerId;
    app.reviewedAt = new Date();

    const saved = await this.riderAppRepo.save(app);

    // Notify applicant
    void this.notificationsService.notifyUser(app.userId, {
      type: NotificationType.RIDER_APPLICATION_REJECTED,
      title: 'Application Rejected',
      message: 'Your rider application was not approved.',
      titleKey: 'notifications.rider_application_rejected.title',
      messageKey: 'notifications.rider_application_rejected.message',
      priority: NotificationPriority.HIGH,
      data: { applicationId: app.id, reason: app.adminNotes },
    });

    return saved;
  }
}
