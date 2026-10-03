import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User } from '../users/entities/user.entity.js';
import { RoleEntity } from '../roles/entities/role.entity.js';
import { Role } from '../roles/enums/role.enum.js';
import { UserStatus } from '../users/enums/user-status.enum.js';
import { Shop } from '../shops/entities/shop.entity.js';
import { Category } from '../catalog/entities/category.entity.js';
import { Brand } from '../catalog/entities/brand.entity.js';
import { Product } from '../catalog/entities/product.entity.js';
import { ProductVariant } from '../catalog/entities/product-variant.entity.js';
import { ProductImage } from '../catalog/entities/product-image.entity.js';
import { ProductType } from '../catalog/entities/product-type.entity.js';
import { Attribute } from '../catalog/entities/attribute.entity.js';
import { AttributeOption } from '../catalog/entities/attribute-option.entity.js';
import { ProductTypeAttribute } from '../catalog/entities/product-type-attribute.entity.js';
import { ProductAttributeValue } from '../catalog/entities/product-attribute-value.entity.js';
import { Manufacturer } from '../catalog/entities/manufacturer.entity.js';
import { Ingredient } from '../catalog/entities/ingredient.entity.js';
import { ProductIngredient } from '../catalog/entities/product-ingredient.entity.js';
import { MedicineBatch } from '../catalog/entities/medicine-batch.entity.js';
import { BatchStatus } from '../catalog/enums/medicine-batch-status.enum.js';
import { AttributeDataType } from '../catalog/enums/attribute-data-type.enum.js';
import {
  ELECTRONICS_ATTRIBUTES,
  ELECTRONICS_BRANDS,
  ELECTRONICS_PRODUCTS,
  ELECTRONICS_TAXONOMY,
} from './data/electronics-taxonomy.data.js';
import type {
  SeedAttribute,
  SeedBrand,
  SeedManufacturer,
  SeedProductIngredient,
  SeedProductBatch,
  SeedTaxonomyNode,
  SeedVertical,
  SeedVerticalProduct,
  SeedVerticalVariant,
} from './data/catalog-vertical.types.js';
import { MEDICINE_VERTICAL } from './data/medicine-taxonomy.data.js';
import { slugify } from '../common/utils/slug.js';
import { ProductStatus } from '../catalog/enums/product-status.enum.js';
import { SellerProduct } from '../inventory/entities/seller-product.entity.js';
import { Inventory } from '../inventory/entities/inventory.entity.js';
import { Review } from '../reviews/entities/review.entity.js';
import { Country } from '../locations/entities/country.entity.js';
import { Division } from '../locations/entities/division.entity.js';
import { District } from '../locations/entities/district.entity.js';
import { Upazila } from '../locations/entities/upazila.entity.js';
import { Union } from '../locations/entities/union.entity.js';
import { Area } from '../locations/entities/area.entity.js';
import { Banner } from '../banners/entities/banner.entity.js';
import { FlashSale } from '../flash-sales/entities/flash-sale.entity.js';
import { FlashSaleItem } from '../flash-sales/entities/flash-sale-item.entity.js';
import { Address } from '../addresses/entities/address.entity.js';
import { Order } from '../orders/entities/order.entity.js';
import { OrderItem } from '../orders/entities/order-item.entity.js';
import { OrderStatusHistory } from '../orders/entities/order-status-history.entity.js';
import { OrderStatus, PaymentMethod, PaymentStatus } from '../orders/enums/order-status.enum.js';
import { Payment } from '../payments/entities/payment.entity.js';
import { PaymentProvider } from '../payments/enums/payment-status.enum.js';
import { Delivery } from '../deliveries/entities/delivery.entity.js';
import { DeliveryHistory } from '../deliveries/entities/delivery-history.entity.js';
import { DeliveryStatus } from '../deliveries/enums/delivery-status.enum.js';
import { WishlistItem } from '../wishlists/entities/wishlist-item.entity.js';
import { Coupon } from '../coupons/entities/coupon.entity.js';
import { CouponUsage } from '../coupons/entities/coupon-usage.entity.js';
import { DiscountType } from '../coupons/enums/discount-type.enum.js';
import { Notification, NotificationType } from '../notifications/entities/notification.entity.js';
import { Conversation } from '../chat/entities/conversation.entity.js';
import { Message } from '../chat/entities/message.entity.js';
import { Wallet } from '../wallets/entities/wallet.entity.js';
import {
  WalletTransaction,
  TransactionType,
} from '../wallets/entities/wallet-transaction.entity.js';
import { DemandEvent } from '../analytics/entities/demand-event.entity.js';
import { DemandEventType } from '../analytics/enums/demand-event.enum.js';
import { PermissionEntity } from '../permissions/entities/permission.entity.js';
import { SellerApplication } from '../applications/entities/seller-application.entity.js';
import { RiderApplication } from '../applications/entities/rider-application.entity.js';
import { ApplicationStatus } from '../applications/enums/application-status.enum.js';
import { ProductRequest } from '../product-requests/entities/product-request.entity.js';
import { BroadcastTemplate } from '../broadcast/entities/broadcast-template.entity.js';
import { Broadcast } from '../broadcast/entities/broadcast.entity.js';
import { BroadcastRecipient } from '../broadcast/entities/broadcast-recipient.entity.js';
import {
  BroadcastAudienceType,
  BroadcastProviderName,
  BroadcastRecipientStatus,
  BroadcastStatus,
} from '../broadcast/enums/broadcast.enums.js';
import { SEED_BROADCAST_CAMPAIGNS } from './data/seed-broadcasts.data.js';
import {
  ConversationType,
  MessageStatus,
  MessageType,
} from '../chat/enums/chat.enum.js';
import {
  BROADCAST_DEMO_TEMPLATES,
  BROADCAST_DEMO_TEMPLATE_DEFAULTS,
} from '../broadcast/seed/broadcast-demo-templates.data.js';
import { ProductRequestHistory } from '../product-requests/entities/product-request-history.entity.js';
import { ProductRequestStatus } from '../product-requests/enums/product-request-status.enum.js';
import { Dispute } from '../disputes/entities/dispute.entity.js';
import { DisputeMessage } from '../disputes/entities/dispute-message.entity.js';
import {
  PayoutRequest,
  PayoutStatus,
  PayoutMethod,
} from '../payouts/entities/payout-request.entity.js';
import { RiderProfile } from '../riders/entities/rider-profile.entity.js';
import { RiderEarning } from '../riders/entities/rider-earning.entity.js';
import { RiderAvailability } from '../riders/enums/rider-availability.enum.js';
import { RiderEarningStatus } from '../riders/enums/rider-earning-status.enum.js';
import { Otp } from '../otp/entities/otp.entity.js';
import { AuditLog } from '../audit-logs/entities/audit-log.entity.js';

import {
  SEED_ADMINS,
  SEED_SELLERS,
  SEED_CUSTOMERS,
  SEED_RIDERS,
  SeedUserData,
} from './data/seed-users.data.js';
import { SEED_SHOPS } from './data/seed-shops.data.js';
import { SEED_PRODUCTS, SeedProductItem } from './data/seed-products.data.js';
import { SEED_ADDRESSES } from './data/seed-addresses.data.js';
import { SEED_PERMISSIONS, ROLE_PERMISSION_NAMES } from './data/seed-permissions.data.js';
import { BRAND_CATEGORY_SLUG_MAP } from './data/seed-category-brands.data.js';
import {
  SEED_SELLER_APPLICATIONS,
  SEED_RIDER_APPLICATIONS,
} from './data/seed-applications.data.js';
import { SEED_PRODUCT_REQUESTS } from './data/seed-product-requests.data.js';
import { SEED_DISPUTES } from './data/seed-disputes.data.js';
import { SEED_PAYOUT_REQUESTS } from './data/seed-payouts.data.js';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    private dataSource: DataSource,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(RoleEntity) private roleRepo: Repository<RoleEntity>,
    @InjectRepository(Shop) private shopRepo: Repository<Shop>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Brand) private brandRepo: Repository<Brand>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(ProductVariant) private variantRepo: Repository<ProductVariant>,
    @InjectRepository(ProductImage) private imageRepo: Repository<ProductImage>,
    @InjectRepository(ProductType) private productTypeRepo: Repository<ProductType>,
    @InjectRepository(Attribute) private attributeRepo: Repository<Attribute>,
    @InjectRepository(AttributeOption) private attributeOptionRepo: Repository<AttributeOption>,
    @InjectRepository(ProductTypeAttribute)
    private productTypeAttributeRepo: Repository<ProductTypeAttribute>,
    @InjectRepository(ProductAttributeValue)
    private productAttributeValueRepo: Repository<ProductAttributeValue>,
    @InjectRepository(Manufacturer) private manufacturerRepo: Repository<Manufacturer>,
    @InjectRepository(Ingredient) private ingredientRepo: Repository<Ingredient>,
    @InjectRepository(ProductIngredient)
    private productIngredientRepo: Repository<ProductIngredient>,
    @InjectRepository(MedicineBatch) private medicineBatchRepo: Repository<MedicineBatch>,
    @InjectRepository(SellerProduct) private sellerProductRepo: Repository<SellerProduct>,
    @InjectRepository(Inventory) private inventoryRepo: Repository<Inventory>,
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(Country) private countryRepo: Repository<Country>,
    @InjectRepository(Division) private divisionRepo: Repository<Division>,
    @InjectRepository(District) private districtRepo: Repository<District>,
    @InjectRepository(Upazila) private upazilaRepo: Repository<Upazila>,
    @InjectRepository(Union) private unionRepo: Repository<Union>,
    @InjectRepository(Area) private areaRepo: Repository<Area>,
    @InjectRepository(Banner) private bannerRepo: Repository<Banner>,
    @InjectRepository(FlashSale) private flashSaleRepo: Repository<FlashSale>,
    @InjectRepository(FlashSaleItem) private flashSaleItemRepo: Repository<FlashSaleItem>,
    @InjectRepository(Address) private addressRepo: Repository<Address>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemRepo: Repository<OrderItem>,
    @InjectRepository(OrderStatusHistory)
    private orderStatusHistoryRepo: Repository<OrderStatusHistory>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Delivery) private deliveryRepo: Repository<Delivery>,
    @InjectRepository(DeliveryHistory) private deliveryHistoryRepo: Repository<DeliveryHistory>,
    @InjectRepository(WishlistItem) private wishlistRepo: Repository<WishlistItem>,
    @InjectRepository(Coupon) private couponRepo: Repository<Coupon>,
    @InjectRepository(CouponUsage) private couponUsageRepo: Repository<CouponUsage>,
    @InjectRepository(Notification) private notificationRepo: Repository<Notification>,
    @InjectRepository(Conversation) private conversationRepo: Repository<Conversation>,
    @InjectRepository(Message) private messageRepo: Repository<Message>,
    @InjectRepository(Wallet) private walletRepo: Repository<Wallet>,
    @InjectRepository(WalletTransaction) private walletTxRepo: Repository<WalletTransaction>,
    @InjectRepository(DemandEvent) private demandEventRepo: Repository<DemandEvent>,
    @InjectRepository(PermissionEntity) private permissionRepo: Repository<PermissionEntity>,
    @InjectRepository(SellerApplication) private sellerAppRepo: Repository<SellerApplication>,
    @InjectRepository(RiderApplication) private riderAppRepo: Repository<RiderApplication>,
    @InjectRepository(ProductRequest) private productRequestRepo: Repository<ProductRequest>,
    @InjectRepository(ProductRequestHistory)
    private productRequestHistoryRepo: Repository<ProductRequestHistory>,
    @InjectRepository(Dispute) private disputeRepo: Repository<Dispute>,
    @InjectRepository(DisputeMessage) private disputeMessageRepo: Repository<DisputeMessage>,
    @InjectRepository(PayoutRequest) private payoutRequestRepo: Repository<PayoutRequest>,
    @InjectRepository(RiderProfile) private riderProfileRepo: Repository<RiderProfile>,
    @InjectRepository(RiderEarning) private riderEarningRepo: Repository<RiderEarning>,
    @InjectRepository(Otp) private otpRepo: Repository<Otp>,
    @InjectRepository(BroadcastTemplate)
    private broadcastTemplateRepo: Repository<BroadcastTemplate>,
    @InjectRepository(Broadcast)
    private broadcastRepo: Repository<Broadcast>,
    @InjectRepository(BroadcastRecipient)
    private broadcastRecipientRepo: Repository<BroadcastRecipient>,
  ) {}

  async seed() {
    this.logger.log('--- Production-Ready Gramer Bazar Seed Starting (Preserving All Data) ---');

    await this.seedPermissionsAndRolePermissions();
    await this.seedLocations();
    const users = await this.seedUsers();
    await this.seedAdminPermissions();
    await this.seedAddresses(users.customers);
    const shops = await this.seedShops(users.sellers);
    const catalog = await this.seedCatalog();
    await this.seedCategoryBrands(catalog.categories);
    await this.seedCatalogVerticals();
    const sellerProducts = await this.seedInventory(
      shops,
      catalog.products,
      catalog.productVariants,
    );
    const coupons = await this.seedCoupons();
    const orders = await this.seedOrdersAndDeliveries(
      users.customers,
      users.riders,
      shops,
      sellerProducts,
    );
    await this.seedCouponUsages(coupons, users.customers, orders);
    await this.seedReviews(users.customers, orders);
    await this.seedWishlists(users.customers, catalog.products);
    await this.seedWallets(users.customers, users.sellers);
    await this.seedPayoutRequests(users.sellers);
    await this.seedRiderProfilesAndEarnings(users.riders);
    await this.seedApplications(
      users.superAdmin,
      users.admin,
      users.sellers,
      users.riders,
      users.customers,
    );
    await this.seedProductRequests(users.customers, users.admin, catalog.products);
    await this.seedDisputes(orders, users.admin);
    await this.seedNotifications(users.customers, users.sellers, orders);
    await this.seedConversations(users.customers, users.sellers);
    await this.seedDemandEvents(users.customers, catalog.products);
    await this.seedMarketing(sellerProducts);
    await this.seedOtps();
    await this.seedBroadcastDemoTemplates();
    await this.seedBroadcastCampaigns(users);

    this.logger.log('--- Production-Ready Gramer Bazar Seed Completed Successfully ---');
    return {
      message: 'Successfully seeded database without modifying existing development records.',
      stats: {
        users: await this.userRepo.count(),
        shops: await this.shopRepo.count(),
        categories: await this.categoryRepo.count(),
        brands: await this.brandRepo.count(),
        products: await this.productRepo.count(),
        sellerProducts: await this.sellerProductRepo.count(),
        addresses: await this.addressRepo.count(),
        orders: await this.orderRepo.count(),
        reviews: await this.reviewRepo.count(),
        notifications: await this.notificationRepo.count(),
        permissions: await this.permissionRepo.count(),
        sellerApplications: await this.sellerAppRepo.count(),
        riderApplications: await this.riderAppRepo.count(),
        productRequests: await this.productRequestRepo.count(),
        disputes: await this.disputeRepo.count(),
        payoutRequests: await this.payoutRequestRepo.count(),
        couponUsages: await this.couponUsageRepo.count(),
      },
    };
  }

  /**
   * Essential production seeder.
   * Only seeds required system data:
   * 1. RBAC Roles & Permissions
   * 2. Bangladesh Geo-Locations (Divisions, Districts, Upazilas, Unions)
   * 3. Root Super Admin account (if not already present, reading credentials from env)
   * 4. Catalog Categories, Brands, Attributes, and Vertical Taxonomies
   * 5. Standard Broadcast Message Templates (WhatsApp / Chat)
   *
   * Completely excludes mock users, fake orders, fake payments, fake reviews, and test campaigns.
   */
  async seedEssential() {
    this.logger.log('--- Production Essential System Data Seed Starting (Idempotent) ---');

    await this.seedPermissionsAndRolePermissions();
    await this.seedLocations();
    const roles = await this.seedRoles();

    // 1. Initial Root Super Admin (from ENV or secure defaults)
    const adminEmail =
      process.env.INITIAL_SUPERADMIN_EMAIL ||
      process.env.ADMIN_EMAIL ||
      'admin@gramerbazar.com';
    const adminPassword =
      process.env.INITIAL_SUPERADMIN_PASSWORD ||
      process.env.ADMIN_PASSWORD ||
      'Admin@GramerBazar2026!';

    let rootAdmin = await this.userRepo.findOne({ where: { email: adminEmail } });
    if (!rootAdmin) {
      const superAdminRole = roles.get(Role.SUPER_ADMIN);
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      const newAdmin = this.userRepo.create({
        email: adminEmail,
        passwordHash,
        firstName: 'Platform',
        lastName: 'Super Admin',
        phone: process.env.INITIAL_SUPERADMIN_PHONE || '+8801700000000',
        roles: superAdminRole ? [superAdminRole] : [],
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        isPhoneVerified: true,
      });
      rootAdmin = await this.userRepo.save(newAdmin);
      this.logger.log(`Created initial root Super Admin account: ${adminEmail}`);
    } else {
      this.logger.log(`Super Admin account already exists: ${adminEmail}. Skipping user creation.`);
    }

    // 2. Catalog Taxonomy & Verticals
    const catalog = await this.seedCatalog();
    await this.seedCategoryBrands(catalog.categories);
    await this.seedCatalogVerticals();

    // 3. Broadcast Templates (Standard WhatsApp & In-Chat message templates)
    await this.seedBroadcastDemoTemplates();

    this.logger.log('--- Production Essential System Data Seed Completed Successfully ---');
    return {
      message: 'Essential production system data seeded successfully.',
      stats: {
        roles: await this.roleRepo.count(),
        permissions: await this.permissionRepo.count(),
        divisions: await this.divisionRepo.count(),
        districts: await this.districtRepo.count(),
        categories: await this.categoryRepo.count(),
        brands: await this.brandRepo.count(),
        broadcastTemplates: await this.broadcastTemplateRepo.count(),
      },
    };
  }

  async seedRoles(): Promise<Map<Role, RoleEntity>> {
    this.logger.log('Ensuring roles exist...');
    const roleMap = new Map<Role, RoleEntity>();

    for (const name of Object.values(Role)) {
      let role = await this.roleRepo.findOne({ where: { name } });
      if (!role) {
        role = await this.roleRepo.save(
          this.roleRepo.create({
            name,
            description: `${name} role for Gramer Bazar platform`,
          }),
        );
        this.logger.log(`Created role: ${name}`);
      }
      roleMap.set(name, role);
    }

    return roleMap;
  }

  async seedLocations() {
    this.logger.log('Checking location data...');
    const divisionCount = await this.divisionRepo.count();
    if (divisionCount > 0) {
      this.logger.log(
        `Locations already seeded (${divisionCount} divisions found). Skipping to preserve data.`,
      );
      return;
    }

    this.logger.log('Seeding Bangladesh locations...');
    const { bdDivisions, bdDistricts, bdUpazilas, bdUnions } =
      await import('./data/locations.data.js');

    let country = await this.countryRepo.findOne({ where: { nameEn: 'Bangladesh' } });
    if (!country) {
      country = await this.countryRepo.save(
        this.countryRepo.create({ nameEn: 'Bangladesh', nameBn: 'বাংলাদেশ', isActive: true }),
      );
    }

    // Seed Divisions
    this.logger.log(`Seeding ${bdDivisions.length} divisions...`);
    const divisionMap = new Map();
    for (const div of bdDivisions) {
      const division = await this.divisionRepo.save(
        this.divisionRepo.create({
          nameEn: div.name,
          nameBn: div.bn_name,
          country,
        }),
      );
      divisionMap.set(div.id, division);
    }

    // Seed Districts
    this.logger.log(`Seeding ${bdDistricts.length} districts...`);
    const districtMap = new Map();
    for (const dist of bdDistricts) {
      const district = await this.districtRepo.save(
        this.districtRepo.create({
          nameEn: dist.name,
          nameBn: dist.bn_name,
          division: divisionMap.get(dist.division_id),
        }),
      );
      districtMap.set(dist.id, district);
    }

    // Seed Upazilas
    this.logger.log(`Seeding ${bdUpazilas.length} upazilas in chunks...`);
    const upazilaMap = new Map();
    const upazilaEntities = bdUpazilas.map((up) => ({
      id: up.id,
      entity: this.upazilaRepo.create({
        nameEn: up.name,
        nameBn: up.bn_name,
        district: districtMap.get(up.district_id),
      }),
    }));

    const chunkSize = 100;
    for (let i = 0; i < upazilaEntities.length; i += chunkSize) {
      const chunk = upazilaEntities.slice(i, i + chunkSize);
      const savedChunk = await this.upazilaRepo.save(chunk.map((c) => c.entity));
      for (let j = 0; j < chunk.length; j++) {
        upazilaMap.set(chunk[j].id, savedChunk[j]);
      }
    }

    // Seed Unions & Default Areas
    this.logger.log(`Seeding ${bdUnions.length} unions and areas in chunks...`);
    const unionEntities = bdUnions.map((un) => ({
      id: un.id,
      entity: this.unionRepo.create({
        nameEn: un.name,
        nameBn: un.bn_name,
        upazila: upazilaMap.get(un.upazilla_id),
      }),
    }));

    const areaEntities: Area[] = [];
    for (let i = 0; i < unionEntities.length; i += chunkSize) {
      const chunk = unionEntities.slice(i, i + chunkSize);
      const savedChunk = await this.unionRepo.save(chunk.map((c) => c.entity));

      for (const savedUnion of savedChunk) {
        areaEntities.push(
          this.areaRepo.create({
            nameEn: 'All Areas / Villages',
            nameBn: 'সকল এলাকা / গ্রাম',
            union: savedUnion,
            deliveryFee: 60,
          }),
        );
      }
    }

    for (let i = 0; i < areaEntities.length; i += chunkSize) {
      const chunk = areaEntities.slice(i, i + chunkSize);
      await this.areaRepo.save(chunk);
    }

    this.logger.log('Locations successfully seeded.');
  }

  /**
   * Idempotently seed DEVELOPMENT-ONLY broadcast templates. Never overwrites an
   * existing template and clearly names them [DEMO] so they are not mistaken for
   * approved WhatsApp templates.
   */
  async seedBroadcastDemoTemplates() {
    for (const demo of BROADCAST_DEMO_TEMPLATES) {
      const existing = await this.broadcastTemplateRepo.findOne({ where: { name: demo.name } });
      if (existing) continue;
      await this.broadcastTemplateRepo.save(
        this.broadcastTemplateRepo.create({
          name: demo.name,
          description: demo.description,
          language: demo.language,
          category: demo.category,
          body: demo.body,
          variables: demo.variables.map((variable) => ({ ...variable, required: variable.required ?? true })),
          provider: BROADCAST_DEMO_TEMPLATE_DEFAULTS.provider,
          providerStatus: BROADCAST_DEMO_TEMPLATE_DEFAULTS.providerStatus,
          status: demo.status,
        }),
      );
    }
  }

  /**
   * Idempotently seed realistic demo broadcast campaigns and recipients across
   * Customers, Sellers, and Riders. Also creates official in-chat conversation
   * channels so recipients can see broadcasts directly in Chat as a preview
   * for future direct WhatsApp integration.
   */
  async seedBroadcastCampaigns(users: {
    superAdmin: User;
    admin: User;
    customer: User;
    sellers: User[];
    riders: User[];
    customers: User[];
  }) {
    this.logger.log('Seeding demo broadcast campaigns, recipients, and in-chat official messaging...');
    const now = new Date();

    for (const campaignData of SEED_BROADCAST_CAMPAIGNS) {
      let campaign = await this.broadcastRepo.findOne({
        where: { title: campaignData.title },
      });

      const template = await this.broadcastTemplateRepo.findOne({
        where: { name: campaignData.templateName },
      });

      let scheduledAt: Date | null = null;
      if (campaignData.status === BroadcastStatus.SCHEDULED && campaignData.scheduledOffsetHours) {
        scheduledAt = new Date(now.getTime() + campaignData.scheduledOffsetHours * 60 * 60 * 1000);
      }

      if (!campaign) {
        campaign = await this.broadcastRepo.save(
          this.broadcastRepo.create({
            title: campaignData.title,
            templateId: template?.id ?? null,
            templateName: campaignData.templateName,
            provider: campaignData.provider,
            audienceType: campaignData.audienceType,
            status: campaignData.status,
            scheduledAt,
            startedAt:
              campaignData.status === BroadcastStatus.COMPLETED ||
              campaignData.status === BroadcastStatus.PROCESSING
                ? new Date(now.getTime() - 2 * 3600 * 1000)
                : null,
            completedAt:
              campaignData.status === BroadcastStatus.COMPLETED
                ? new Date(now.getTime() - 1 * 3600 * 1000)
                : null,
            totalRecipients: campaignData.totalRecipients,
            sentCount: campaignData.sentCount,
            deliveredCount: campaignData.deliveredCount,
            readCount: campaignData.readCount,
            failedCount: campaignData.failedCount,
            createdBy: users.superAdmin.id,
            createdByName: `${users.superAdmin.firstName || ''} ${users.superAdmin.lastName || ''}`.trim() || 'Super Admin',
          }),
        );
      }

      if (campaignData.totalRecipients === 0) continue;

      let targetUsers: User[] = [];
      if (campaignData.targetRole === 'CUSTOMER') {
        targetUsers = users.customers;
      } else if (campaignData.targetRole === 'SELLER') {
        targetUsers = users.sellers;
      } else if (campaignData.targetRole === 'RIDER') {
        targetUsers = users.riders;
      }

      const assignedRecipients = targetUsers.slice(0, campaignData.totalRecipients);

      for (let idx = 0; idx < assignedRecipients.length; idx++) {
        const targetUser = assignedRecipients[idx];
        const existingRecipient = await this.broadcastRecipientRepo.findOne({
          where: { broadcastId: campaign.id, customerId: targetUser.id },
        });

        const customerName = `${targetUser.firstName || ''} ${targetUser.lastName || ''}`.trim() || targetUser.phone;
        const renderedMessage = campaignData.messageTemplateBn.replace(/\{\{customer_name\}\}/g, customerName);

        let recipientStatus = BroadcastRecipientStatus.SENT;
        if (idx < campaignData.readCount) {
          recipientStatus = BroadcastRecipientStatus.READ;
        } else if (idx < campaignData.deliveredCount) {
          recipientStatus = BroadcastRecipientStatus.DELIVERED;
        }

        if (!existingRecipient) {
          await this.broadcastRecipientRepo.save(
            this.broadcastRecipientRepo.create({
              broadcastId: campaign.id,
              customerId: targetUser.id,
              customerName,
              phone: targetUser.phone,
              personalizedMessage: renderedMessage,
              status: recipientStatus,
              providerMessageId: `mock-seed-${campaign.id.slice(0, 8)}-${targetUser.id.slice(0, 8)}`,
              attemptCount: 1,
              sentAt: new Date(now.getTime() - 90 * 60 * 1000),
              deliveredAt:
                recipientStatus === BroadcastRecipientStatus.DELIVERED ||
                recipientStatus === BroadcastRecipientStatus.READ
                  ? new Date(now.getTime() - 80 * 60 * 1000)
                  : null,
              readAt:
                recipientStatus === BroadcastRecipientStatus.READ
                  ? new Date(now.getTime() - 60 * 60 * 1000)
                  : null,
            }),
          );
        }

        // In-Chat Official Broadcast Channel Integration
        if (
          campaignData.status === BroadcastStatus.COMPLETED ||
          campaignData.status === BroadcastStatus.PROCESSING
        ) {
          const canonicalKey = `broadcast:official:${targetUser.id}`;
          let officialConv = await this.conversationRepo.findOne({
            where: { canonicalKey },
            relations: ['participants'],
          });

          if (!officialConv) {
            officialConv = await this.conversationRepo.save(
              this.conversationRepo.create({
                canonicalKey,
                type: ConversationType.DIRECT,
                referenceType: 'BROADCAST',
                referenceId: campaign.id,
                participants: [users.superAdmin, targetUser],
                lastMessagePreview: renderedMessage,
                lastMessageAt: new Date(now.getTime() - 60 * 60 * 1000),
              }),
            );
          }

          const existingMsg = await this.messageRepo.findOne({
            where: {
              conversationId: officialConv.id,
              metadata: { broadcastId: campaign.id } as any,
            },
          });

          if (!existingMsg) {
            await this.messageRepo.save(
              this.messageRepo.create({
                conversation: officialConv,
                conversationId: officialConv.id,
                sender: users.superAdmin,
                senderId: users.superAdmin.id,
                senderRole: 'SUPER_ADMIN',
                content: `📢 [${campaign.title}]\n\n${renderedMessage}`,
                isRead: recipientStatus === BroadcastRecipientStatus.READ,
                status:
                  recipientStatus === BroadcastRecipientStatus.READ
                    ? MessageStatus.READ
                    : MessageStatus.DELIVERED,
                readAt:
                  recipientStatus === BroadcastRecipientStatus.READ
                    ? new Date(now.getTime() - 60 * 60 * 1000)
                    : null,
                deliveredAt: new Date(now.getTime() - 80 * 60 * 1000),
                metadata: {
                  isBroadcast: true,
                  broadcastId: campaign.id,
                  title: campaign.title,
                  targetRole: campaignData.targetRole,
                },
              }),
            );
          }
        }
      }
    }
  }

  async seedUsers() {
    this.logger.log('Seeding and verifying users across all platform roles...');
    const roles = await this.seedRoles();

    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@GramerBazar2026!';
    const shopPassword = process.env.SEED_SHOP_OWNER_PASSWORD || 'Shop@GramerBazar2026!';
    const customerPassword = process.env.SEED_CUSTOMER_PASSWORD || 'Customer@GramerBazar2026!';
    const deliveryPassword = process.env.SEED_DELIVERY_PASSWORD || 'Rider@GramerBazar2026!';

    const adminHash = await bcrypt.hash(adminPassword, 10);
    const shopHash = await bcrypt.hash(shopPassword, 10);
    const customerHash = await bcrypt.hash(customerPassword, 10);
    const deliveryHash = await bcrypt.hash(deliveryPassword, 10);

    const savedAdmins: User[] = [];
    for (const u of SEED_ADMINS) {
      savedAdmins.push(await this.upsertUser(u, roles.get(u.role)!, adminHash));
    }

    const savedSellers: User[] = [];
    for (const u of SEED_SELLERS) {
      savedSellers.push(await this.upsertUser(u, roles.get(u.role)!, shopHash));
    }

    const savedCustomers: User[] = [];
    for (const u of SEED_CUSTOMERS) {
      savedCustomers.push(await this.upsertUser(u, roles.get(u.role)!, customerHash));
    }

    const savedRiders: User[] = [];
    for (const u of SEED_RIDERS) {
      savedRiders.push(await this.upsertUser(u, roles.get(u.role)!, deliveryHash));
    }

    this.logger.log(
      `Users ready: ${savedAdmins.length} Admins, ${savedSellers.length} Sellers, ${savedCustomers.length} Customers, ${savedRiders.length} Riders`,
    );

    return {
      superAdmin: savedAdmins[0],
      admin: savedAdmins[1] || savedAdmins[0],
      customer: savedCustomers[0],
      sellers: savedSellers,
      riders: savedRiders,
      customers: savedCustomers,
    };
  }

  // Backward compatibility method for unit tests
  async seedUsersAndShops() {
    const usersResult = await this.seedUsers();
    const shops = await this.seedShops(usersResult.sellers);
    return {
      superAdmin: usersResult.superAdmin,
      admin: usersResult.admin,
      customer: usersResult.customer,
      sellers: usersResult.sellers,
      riders: usersResult.riders,
      shops,
    };
  }

  private async upsertUser(
    data: SeedUserData,
    roleEntity: RoleEntity,
    passwordHash: string,
  ): Promise<User> {
    const existing = await this.userRepo.findOne({
      where: [{ email: data.email }, { phone: data.phone }],
      relations: ['roles'],
    });

    if (existing) {
      let needsSave = false;
      // Ensure seed test accounts always have the expected seed password
      if (data.email !== 'codeswithrakib@gmail.com') {
        existing.passwordHash = passwordHash;
        needsSave = true;
      } else if (!existing.passwordHash) {
        existing.passwordHash = passwordHash;
        needsSave = true;
      }
      if (existing.status !== UserStatus.ACTIVE) {
        existing.status = UserStatus.ACTIVE;
        needsSave = true;
      }
      if (!existing.isEmailVerified) {
        existing.isEmailVerified = true;
        needsSave = true;
      }
      if (!existing.isPhoneVerified) {
        existing.isPhoneVerified = true;
        needsSave = true;
      }
      if (!existing.roles || !existing.roles.some((r) => r.name === roleEntity.name)) {
        existing.roles = [...(existing.roles || []), roleEntity];
        needsSave = true;
      }

      if (needsSave) {
        return await this.userRepo.save(existing);
      }
      return existing;
    }

    const newUser = this.userRepo.create({
      email: data.email,
      phone: data.phone,
      firstName: data.firstName,
      lastName: data.lastName,
      passwordHash,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      isPhoneVerified: true,
      roles: [roleEntity],
    });

    return await this.userRepo.save(newUser);
  }

  async seedAddresses(customers: User[]) {
    this.logger.log('Seeding customer addresses...');
    const country = await this.countryRepo.findOne({ where: { nameEn: 'Bangladesh' } });
    const rangpurDiv = await this.divisionRepo.findOne({ where: { nameEn: 'Rangpur' } });
    const panchagarhDist = await this.districtRepo.findOne({ where: { nameEn: 'Panchagarh' } });
    const debiganjUp = await this.upazilaRepo.findOne({ where: { nameEn: 'Debiganj' } });

    let count = 0;
    for (const seedAddr of SEED_ADDRESSES) {
      const customer = customers.find(
        (c) =>
          c.email === seedAddr.customerEmail ||
          (seedAddr.customerEmail === 'customer1@gramerbazar.com' &&
            c.email === 'customer1@gramerbazar.example'),
      );
      if (!customer) continue;

      const existing = await this.addressRepo.findOne({
        where: { userId: customer.id, title: seedAddr.title },
      });

      if (!existing) {
        await this.addressRepo.save(
          this.addressRepo.create({
            userId: customer.id,
            user: customer,
            title: seedAddr.title,
            contactName: seedAddr.contactName,
            contactPhone: seedAddr.contactPhone,
            country: country || undefined,
            division: rangpurDiv || undefined,
            district: panchagarhDist || undefined,
            upazila: debiganjUp || undefined,
            streetAddress: seedAddr.streetAddress,
            lat: seedAddr.lat,
            lng: seedAddr.lng,
            isDefault: seedAddr.isDefault,
          }),
        );
        count++;
      }
    }
    this.logger.log(`Customer addresses ready (${count} new added).`);
  }

  async seedShops(sellers: User[]): Promise<Shop[]> {
    this.logger.log('Seeding authentic Bangladeshi marketplace shops...');
    const shops: Shop[] = [];

    for (let i = 0; i < SEED_SHOPS.length; i++) {
      const shopData = SEED_SHOPS[i];
      let seller = sellers.find((s) => s.email === shopData.sellerEmail);
      if (!seller) {
        seller = sellers[i % sellers.length];
      }

      let shop = await this.shopRepo.findOne({ where: { slug: shopData.slug } });
      if (!shop) {
        shop = await this.shopRepo.save(
          this.shopRepo.create({
            seller,
            sellerId: seller.id,
            nameEn: shopData.nameEn,
            nameBn: shopData.nameBn,
            slug: shopData.slug,
            shortDescription: shopData.shortDescription,
            description: shopData.description,
            phone: shopData.phone,
            whatsapp: shopData.whatsapp || shopData.phone,
            email: shopData.email,
            address: shopData.address,
            district: shopData.district,
            upazila: shopData.upazila,
            union: shopData.union || 'Sadar Union',
            area: shopData.area || 'Bazar Area',
            latitude: shopData.latitude,
            longitude: shopData.longitude,
            openingHours: shopData.openingHours,
            deliveryInfo: shopData.deliveryInfo,
            isVerified: true,
            isActive: true,
            logo: `/uploads/shops/${shopData.slug}-logo.png`,
            banner: `/uploads/shops/${shopData.slug}-banner.jpg`,
          }),
        );
        this.logger.log(`Created shop: ${shop.nameEn} (${shop.slug})`);
      }
      shops.push(shop);
    }

    return shops;
  }

  async seedCatalog() {
    this.logger.log('Seeding catalog categories, subcategories, brands, and products...');
    const fs = await import('fs');
    const path = await import('path');
    const catalogPath = path.resolve(process.cwd(), 'src', 'seeder', 'data', 'catalog_seed.json');
    let catalogData: { categories: any[]; products: any[] } = { categories: [], products: [] };
    if (fs.existsSync(catalogPath)) {
      catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
    }

    // 1. Categories & Subcategories
    const categoryMap = new Map<string, Category>();
    for (const catData of catalogData.categories) {
      let rootCat = await this.categoryRepo.findOne({ where: { slug: catData.slug } });
      if (!rootCat) {
        rootCat = await this.categoryRepo.save(
          this.categoryRepo.create({
            nameEn: catData.nameEn,
            nameBn: catData.nameBn,
            slug: catData.slug,
            icon: catData.icon,
            sortOrder: catData.sortOrder,
            isRegulated: catData.isRegulated ?? false,
            descriptionEn: catData.descriptionEn,
            descriptionBn: catData.descriptionBn,
            isActive: true,
          }),
        );
      }
      categoryMap.set(catData.slug, rootCat);

      for (const subData of catData.subcategories || []) {
        let subCat = await this.categoryRepo.findOne({ where: { slug: subData.slug } });
        if (!subCat) {
          subCat = await this.categoryRepo.save(
            this.categoryRepo.create({
              nameEn: subData.nameEn,
              nameBn: subData.nameBn,
              slug: subData.slug,
              sortOrder: subData.sortOrder,
              parentId: rootCat.id,
              isActive: true,
              isRegulated: catData.isRegulated ?? false,
            }),
          );
        }
        categoryMap.set(`${catData.slug}/${subData.slug}`, subCat);
        categoryMap.set(subData.slug, subCat);
      }
    }

    // 2. Brands
    const brandMap = new Map<string, Brand>();
    const brandNames = [
      'Rashid Agro',
      'Teer',
      'Radhuni',
      'ACI Pure',
      'ACI Healthcare',
      'Hansaplast',
      'Amanat Shah',
      'Walton',
      'Parachute',
      'All Time',
      'Asia Sweetmeat',
      'Local Farmer',
      'Aftab Feed',
      'Khaas Food',
      'Square',
      'Pran',
      'Apex',
      'Bata',
      'Beximco',
      'Ispahani',
    ];

    for (const bName of brandNames) {
      const bSlug = bName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      let brand = await this.brandRepo.findOne({ where: { slug: bSlug } });
      if (!brand) {
        brand = await this.brandRepo.save(
          this.brandRepo.create({
            nameEn: bName,
            nameBn: bName,
            slug: bSlug,
            isActive: true,
          }),
        );
      }
      brandMap.set(bName, brand);
    }

    // 3. Products
    const allProducts: Product[] = [];
    const allVariants: ProductVariant[] = [];

    // Combine products from catalogData and SEED_PRODUCTS
    const productItemsToSeed: SeedProductItem[] = [...SEED_PRODUCTS];
    for (const p of catalogData.products || []) {
      if (!productItemsToSeed.some((item) => item.sku === p.sku)) {
        productItemsToSeed.push({
          shopSlug: 'rahim-traders',
          categorySlug: p.categorySlug,
          subCategorySlug: p.subCategorySlug,
          nameEn: p.nameEn,
          nameBn: p.nameBn,
          shortDescriptionEn: p.shortDescriptionEn,
          shortDescriptionBn: p.shortDescriptionBn,
          descriptionEn: p.descriptionEn,
          descriptionBn: p.descriptionBn,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          unit: p.unit,
          stock: p.stock,
          brand: p.brand,
          sku: p.sku,
          imageFilename: p.imageFilename,
          isFeatured: p.isFeatured,
        });
      }
    }

    const categoriesList = await this.categoryRepo.find();
    const defaultCat = categoryMap.get('grocery') || categoriesList[0];

    for (const p of productItemsToSeed) {
      const pSlug = p.nameEn
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      let prod = await this.productRepo.findOne({ where: [{ slug: pSlug }, { sku: p.sku }] });

      const targetCategory = categoryMap.get(p.categorySlug) || defaultCat;
      const subCat = p.subCategorySlug
        ? categoryMap.get(`${p.categorySlug}/${p.subCategorySlug}`) ||
          categoryMap.get(p.subCategorySlug)
        : undefined;
      const brand =
        brandMap.get(p.brand) || brandMap.get('Local Farmer') || (await this.brandRepo.find())[0];

      if (!prod) {
        prod = await this.productRepo.save(
          this.productRepo.create({
            categoryId: targetCategory.id,
            subCategoryId: subCat?.id,
            brand,
            nameEn: p.nameEn,
            nameBn: p.nameBn,
            slug: pSlug,
            shortDescriptionEn: p.shortDescriptionEn,
            shortDescriptionBn: p.shortDescriptionBn,
            descriptionEn: p.descriptionEn,
            descriptionBn: p.descriptionBn,
            price: p.price,
            compareAtPrice: p.compareAtPrice,
            unit: p.unit,
            stock: p.stock,
            sku: p.sku,
            status: ProductStatus.PUBLISHED,
            isFeatured: p.isFeatured ?? false,
            source: 'seed',
            isActive: true,
          }),
        );

        const imagePath = `products/2026/09/${p.imageFilename}`;
        const imageUrl = `/uploads/${imagePath}`;

        await this.imageRepo.save(
          this.imageRepo.create({
            productId: prod.id,
            url: imageUrl,
            storagePath: imagePath,
            filename: p.imageFilename,
            mimeType: 'image/png',
            sizeBytes: 15000,
            isPrimary: true,
            sortOrder: 0,
            altText: p.nameEn,
          }),
        );

        let variant = await this.variantRepo.findOne({ where: { sku: p.sku } });
        if (!variant) {
          variant = await this.variantRepo.save(
            this.variantRepo.create({
              product: prod,
              nameEn: 'Default',
              nameBn: 'ডিফল্ট',
              sku: p.sku,
              images: [imageUrl],
              isActive: true,
            }),
          );
        }
        allVariants.push(variant);
      } else {
        if (prod.sku) {
          const variant = await this.variantRepo.findOne({ where: { sku: prod.sku } });
          if (variant) allVariants.push(variant);
        }
      }
      allProducts.push(prod);
    }

    this.logger.log(
      `Catalog ready with ${allProducts.length} products and ${allVariants.length} variants.`,
    );
    return {
      categories: Array.from(categoryMap.values()),
      brands: Array.from(brandMap.values()),
      products: allProducts,
      productVariants: allVariants,
    };
  }

  // ==========================================================================
  //  Electronics vertical slice (taxonomy engine demonstration)
  // ==========================================================================

  private async upsertVerticalAttributes(
    defs: SeedAttribute[],
    label: string,
  ): Promise<Map<string, Attribute>> {
    const map = new Map<string, Attribute>();
    for (let i = 0; i < defs.length; i++) {
      const def = defs[i];
      let attribute = await this.attributeRepo.findOne({ where: { slug: def.slug } });
      if (!attribute) {
        attribute = await this.attributeRepo.save(
          this.attributeRepo.create({
            slug: def.slug,
            nameEn: def.nameEn,
            nameBn: def.nameBn,
            dataType: def.dataType,
            unit: def.unit ?? null,
            isFilterable: def.isFilterable ?? true,
            isVariantAxis: def.isVariantAxis ?? false,
            sortOrder: i,
            isActive: true,
          }),
        );
      } else {
        Object.assign(attribute, {
          nameEn: def.nameEn,
          nameBn: def.nameBn,
          dataType: def.dataType,
          unit: def.unit ?? null,
          isFilterable: def.isFilterable ?? true,
          isVariantAxis: def.isVariantAxis ?? false,
          sortOrder: i,
          isActive: true,
        });
        attribute = await this.attributeRepo.save(attribute);
      }

      const options = def.options ?? [];
      for (let j = 0; j < options.length; j++) {
        const option = options[j];
        const optionSlug = slugify(option.value, 'option', 120);
        const existing = await this.attributeOptionRepo.findOne({
          where: { attributeId: attribute.id, slug: optionSlug },
        });
        if (!existing) {
          await this.attributeOptionRepo.save(
            this.attributeOptionRepo.create({
              attributeId: attribute.id,
              value: option.value,
              valueBn: option.valueBn ?? null,
              slug: optionSlug,
              sortOrder: j,
              isActive: true,
            }),
          );
        }
      }
      map.set(def.slug, attribute);
    }
    this.logger.log(`${label} attributes ready (${map.size}).`);
    return map;
  }

  private async upsertVerticalTaxonomy(
    root: SeedTaxonomyNode,
    label: string,
  ): Promise<Map<string, Category>> {
    const byPath = new Map<string, Category>();
    const walk = async (
      node: SeedTaxonomyNode,
      parent: Category | null,
      parentPath: string | null,
    ): Promise<void> => {
      const path = parentPath ? `${parentPath}/${node.slug}` : node.slug;
      let category = await this.categoryRepo.findOne({ where: { slug: node.slug } });
      const payload = {
        parentId: parent?.id ?? null,
        nameEn: node.nameEn,
        nameBn: node.nameBn,
        icon: node.icon ?? category?.icon ?? null,
        descriptionEn: node.descriptionEn ?? category?.descriptionEn ?? null,
        descriptionBn: node.descriptionBn ?? category?.descriptionBn ?? null,
        level: parent ? (parent.level ?? 0) + 1 : 0,
        path,
        isRegulated: node.isRegulated ?? parent?.isRegulated ?? false,
        isActive: true,
      };
      if (!category) {
        category = await this.categoryRepo.save(
          this.categoryRepo.create({ slug: node.slug, ...payload }),
        );
      } else {
        Object.assign(category, payload);
        category = await this.categoryRepo.save(category);
      }
      byPath.set(path, category);
      for (const child of node.children ?? []) {
        await walk(child, category, path);
      }
    };
    await walk(root, null, null);
    this.logger.log(`${label} taxonomy ready (${byPath.size} categories).`);
    return byPath;
  }

  private async upsertVerticalProductTypes(
    root: SeedTaxonomyNode,
    byPath: Map<string, Category>,
    attributes: Map<string, Attribute>,
    label: string,
  ): Promise<Map<string, ProductType>> {
    const map = new Map<string, ProductType>();
    const walk = async (node: SeedTaxonomyNode, path: string): Promise<void> => {
      const category = byPath.get(path);
      const productTypes = node.productTypes ?? [];
      if (category) {
        for (let i = 0; i < productTypes.length; i++) {
          const def = productTypes[i];
          let productType = await this.productTypeRepo.findOne({ where: { slug: def.slug } });
          const payload = {
            categoryId: category.id,
            nameEn: def.nameEn ?? node.nameEn,
            nameBn: def.nameBn ?? node.nameBn,
            sortOrder: i,
            isActive: true,
          };
          if (!productType) {
            productType = await this.productTypeRepo.save(
              this.productTypeRepo.create({ slug: def.slug, ...payload }),
            );
          } else {
            Object.assign(productType, payload);
            productType = await this.productTypeRepo.save(productType);
          }

          await this.productTypeAttributeRepo.delete({ productTypeId: productType.id });
          const rows = def.attributes
            .filter((slug) => attributes.has(slug))
            .map((slug, index) =>
              this.productTypeAttributeRepo.create({
                productTypeId: productType.id,
                attributeId: attributes.get(slug)!.id,
                isRequired: false,
                isFilterable: true,
                sortOrder: index,
              }),
            );
          if (rows.length > 0) {
            await this.productTypeAttributeRepo.save(rows);
          }
          map.set(def.slug, productType);
        }
      }
      for (const child of node.children ?? []) {
        await walk(child, `${path}/${child.slug}`);
      }
    };
    await walk(root, root.slug);
    this.logger.log(`${label} product types ready (${map.size}).`);
    return map;
  }

  private async upsertVerticalBrands(defs: SeedBrand[]): Promise<Map<string, Brand>> {
    const map = new Map<string, Brand>();
    for (const def of defs) {
      const slug = slugify(def.name, 'brand', 120);
      let brand = await this.brandRepo.findOne({ where: { slug } });
      if (!brand) {
        brand = await this.brandRepo.save(
          this.brandRepo.create({ nameEn: def.name, nameBn: def.name, slug, isActive: true }),
        );
      }
      map.set(def.name, brand);
    }
    return map;
  }

  private async upsertVerticalManufacturers(
    defs: SeedManufacturer[],
  ): Promise<Map<string, Manufacturer>> {
    const map = new Map<string, Manufacturer>();
    for (const def of defs) {
      const slug = slugify(def.name, 'manufacturer', 200);
      let manufacturer = await this.manufacturerRepo.findOne({ where: { slug } });
      const payload = {
        nameEn: def.name,
        nameBn: def.nameBn ?? def.name,
        country: def.country ?? null,
        website: def.website ?? null,
        isActive: true,
      };
      if (!manufacturer) {
        manufacturer = await this.manufacturerRepo.save(
          this.manufacturerRepo.create({ slug, ...payload }),
        );
      } else {
        Object.assign(manufacturer, payload);
        manufacturer = await this.manufacturerRepo.save(manufacturer);
      }
      map.set(def.name, manufacturer);
    }
    return map;
  }

  private async upsertIngredient(name: string): Promise<Ingredient> {
    const slug = slugify(name, 'ingredient', 200);
    let ingredient = await this.ingredientRepo.findOne({ where: { slug } });
    if (!ingredient) {
      ingredient = await this.ingredientRepo.save(
        this.ingredientRepo.create({ nameEn: name, nameBn: name, slug, isActive: true }),
      );
    }
    return ingredient;
  }

  private async saveVerticalSpecs(
    productId: string,
    specs: SeedVerticalProduct['specs'],
    attributes: Map<string, Attribute>,
  ): Promise<void> {
    await this.productAttributeValueRepo.delete({ productId });
    if (!specs) return;
    const rows: ProductAttributeValue[] = [];
    for (const [slug, value] of Object.entries(specs)) {
      const attribute = attributes.get(slug);
      if (!attribute) continue;
      const isSelect =
        attribute.dataType === AttributeDataType.SELECT ||
        attribute.dataType === AttributeDataType.MULTI_SELECT ||
        attribute.dataType === AttributeDataType.RANGE;
      let optionId: string | null = null;
      if (isSelect) {
        const optionSlug = slugify(String(value), 'option', 120);
        const option = await this.attributeOptionRepo.findOne({
          where: { attributeId: attribute.id, slug: optionSlug },
        });
        optionId = option?.id ?? null;
      }
      rows.push(
        this.productAttributeValueRepo.create({
          productId,
          attributeId: attribute.id,
          optionId,
          valueText:
            attribute.dataType === AttributeDataType.TEXT && typeof value === 'string'
              ? value
              : null,
          valueNumber:
            (attribute.dataType === AttributeDataType.NUMBER ||
              attribute.dataType === AttributeDataType.RANGE) &&
            typeof value === 'number'
              ? value
              : null,
          valueBoolean: attribute.dataType === AttributeDataType.BOOLEAN ? Boolean(value) : null,
        }),
      );
    }
    if (rows.length > 0) {
      await this.productAttributeValueRepo.save(rows);
    }
  }

  /** Persist structured active-ingredient composition for a product. */
  private async saveVerticalComposition(
    productId: string,
    defs: SeedProductIngredient[] | undefined,
    ingredientNames: Set<string>,
  ): Promise<void> {
    await this.productIngredientRepo.delete({ productId });
    if (!defs || defs.length === 0) return;
    const rows: ProductIngredient[] = [];
    for (let i = 0; i < defs.length; i++) {
      const def = defs[i];
      ingredientNames.add(def.ingredient);
      const ingredient = await this.upsertIngredient(def.ingredient);
      rows.push(
        this.productIngredientRepo.create({
          productId,
          ingredientId: ingredient.id,
          strengthValue: def.strengthValue ?? null,
          strengthUnit: def.strengthUnit ?? null,
          percentage: def.percentage ?? null,
          sortOrder: i,
        }),
      );
    }
    if (rows.length > 0) {
      await this.productIngredientRepo.save(rows);
    }
  }

  /** Persist (or refresh) FEFO batches for a sellable variant. */
  private async saveVerticalBatches(
    variantId: string,
    defs: SeedProductBatch[] | undefined,
  ): Promise<void> {
    if (!defs || defs.length === 0) return;
    for (const def of defs) {
      const payload = {
        productVariantId: variantId,
        batchNumber: def.batchNumber,
        manufacturingDate: def.manufacturingDate ?? null,
        expiryDate: def.expiryDate,
        quantity: def.quantity,
        reservedQuantity: 0,
        supplier: def.supplier ?? null,
        purchaseCost: null,
        status: (def.status ??
          (new Date(def.expiryDate) < new Date() ? BatchStatus.EXPIRED : BatchStatus.ACTIVE)) as BatchStatus,
      };
      const existing = await this.medicineBatchRepo.findOne({
        where: { productVariantId: variantId, batchNumber: def.batchNumber },
      });
      if (!existing) {
        await this.medicineBatchRepo.save(this.medicineBatchRepo.create(payload));
      } else {
        Object.assign(existing, payload);
        await this.medicineBatchRepo.save(existing);
      }
    }
  }

  private async seedCatalogVerticals(): Promise<void> {
    const electronics: SeedVertical = {
      key: 'electronics',
      root: ELECTRONICS_TAXONOMY,
      attributes: ELECTRONICS_ATTRIBUTES,
      brands: ELECTRONICS_BRANDS.map((name) => ({ name })),
      products: ELECTRONICS_PRODUCTS,
    };
    await this.seedVerticalCatalog(electronics);
    await this.seedVerticalCatalog(MEDICINE_VERTICAL);
  }

  private async seedVerticalCatalog(vertical: SeedVertical): Promise<void> {
    this.logger.log(`Seeding ${vertical.key} catalog vertical...`);
    const attributes = await this.upsertVerticalAttributes(vertical.attributes, vertical.key);
    const byPath = await this.upsertVerticalTaxonomy(vertical.root, vertical.key);
    const productTypes = await this.upsertVerticalProductTypes(
      vertical.root,
      byPath,
      attributes,
      vertical.key,
    );
    const brands = await this.upsertVerticalBrands(vertical.brands);
    const manufacturers = vertical.manufacturers
      ? await this.upsertVerticalManufacturers(vertical.manufacturers)
      : new Map<string, Manufacturer>();
    const ingredientNames = new Set<string>();

    const shops = await this.shopRepo.find({ where: { isActive: true }, order: { createdAt: 'ASC' } });
    if (shops.length === 0) {
      this.logger.warn(`No active shops found; skipping ${vertical.key} product seeding.`);
      return;
    }

    let created = 0;
    for (let index = 0; index < vertical.products.length; index++) {
      const def = vertical.products[index];
      const category = byPath.get(def.categoryPath);
      if (!category) {
        this.logger.warn(`Skipping ${def.slug}: category ${def.categoryPath} not found`);
        continue;
      }
      const productType = productTypes.get(def.productTypeSlug) ?? null;
      const brand = brands.get(def.brand) ?? null;
      const manufacturer = def.manufacturer ? (manufacturers.get(def.manufacturer) ?? null) : null;

      let product = await this.productRepo.findOne({ where: { slug: def.slug } });
      const payload = {
        categoryId: category.id,
        subCategoryId: null,
        productTypeId: productType?.id ?? null,
        brandId: brand?.id ?? null,
        manufacturerId: manufacturer?.id ?? null,
        requiresPrescription: def.requiresPrescription ?? false,
        nameEn: def.nameEn,
        nameBn: def.nameBn,
        shortDescriptionEn: def.shortDescriptionEn,
        shortDescriptionBn: def.shortDescriptionBn,
        descriptionEn: def.descriptionEn ?? def.shortDescriptionEn,
        descriptionBn: def.descriptionBn ?? def.shortDescriptionBn,
        sku: def.sku,
        price: def.price,
        compareAtPrice: def.compareAtPrice ?? null,
        stock: def.stock,
        unit: def.unit ?? 'piece',
        status: ProductStatus.PUBLISHED,
        isFeatured: def.isFeatured ?? false,
        isActive: true,
        source: 'seed',
      };
      if (!product) {
        product = await this.productRepo.save(
          this.productRepo.create({ slug: def.slug, ...payload }),
        );
        created++;
      } else {
        Object.assign(product, payload);
        product = await this.productRepo.save(product);
      }

      await this.saveVerticalSpecs(product.id, def.specs, attributes);
      await this.saveVerticalComposition(product.id, def.ingredients, ingredientNames);

      const variantDefs: SeedVerticalVariant[] =
        def.variants && def.variants.length > 0
          ? def.variants
          : [
              {
                nameEn: 'Default',
                nameBn: 'ডিফল্ট',
                sku: def.sku,
                price: def.price,
                compareAtPrice: def.compareAtPrice,
                stock: def.stock,
                batches: def.batches,
              },
            ];

      for (let vIndex = 0; vIndex < variantDefs.length; vIndex++) {
        const variantDef = variantDefs[vIndex];
        let variant = await this.variantRepo.findOne({ where: { sku: variantDef.sku } });
        const variantPayload = {
          productId: product.id,
          nameEn: variantDef.nameEn,
          nameBn: variantDef.nameBn,
          images: [] as string[],
          attributes: variantDef.attributes ?? null,
          isActive: true,
        };
        if (!variant) {
          variant = await this.variantRepo.save(
            this.variantRepo.create({ sku: variantDef.sku, ...variantPayload }),
          );
        } else {
          Object.assign(variant, variantPayload);
          variant = await this.variantRepo.save(variant);
        }

        const variantBatches = variantDef.batches ?? (vIndex === 0 ? def.batches : undefined);
        await this.saveVerticalBatches(variant.id, variantBatches);

        const shop = shops[index % shops.length];
        const price = variantDef.price ?? def.price;
        const compareAtPrice = variantDef.compareAtPrice ?? def.compareAtPrice ?? null;
        const stock = variantDef.stock ?? def.stock;

        let sellerProduct = await this.sellerProductRepo.findOne({
          where: { shopId: shop.id, productVariantId: variant.id },
        });
        if (!sellerProduct) {
          sellerProduct = await this.sellerProductRepo.save(
            this.sellerProductRepo.create({
              shopId: shop.id,
              productVariantId: variant.id,
              price,
              discountPrice: compareAtPrice,
              sellerSku: variant.sku,
              isActive: true,
              isRegulatedApproved: true,
            }),
          );
        } else {
          Object.assign(sellerProduct, { price, discountPrice: compareAtPrice, isActive: true });
          sellerProduct = await this.sellerProductRepo.save(sellerProduct);
        }

        const inventory = await this.inventoryRepo.findOne({
          where: { sellerProductId: sellerProduct.id },
        });
        if (!inventory) {
          await this.inventoryRepo.save(
            this.inventoryRepo.create({
              sellerProductId: sellerProduct.id,
              quantity: stock,
              lowStockThreshold: 5,
            }),
          );
        } else {
          inventory.quantity = stock;
          await this.inventoryRepo.save(inventory);
        }
      }
    }

    this.logger.log(
      `${vertical.key} catalog ready: ${created} new products, ${productTypes.size} product types, ${attributes.size} attributes, ${ingredientNames.size} ingredients.`,
    );
  }

  async seedInventory(
    shops: Shop[],
    products: Product[],
    variants: ProductVariant[],
  ): Promise<SellerProduct[]> {
    this.logger.log('Seeding seller products and live stock inventory across shops...');
    const sellerProducts: SellerProduct[] = [];
    const shopMap = new Map<string, Shop>();
    for (const s of shops) shopMap.set(s.slug, s);

    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      const prod =
        products.find((p) => p.id === variant.product?.id || p.sku === variant.sku) ||
        products[i % products.length];

      // Match product to its authentic shop or distribute
      const seedItem = SEED_PRODUCTS.find((sp) => sp.sku === variant.sku);
      const targetShop = (seedItem && shopMap.get(seedItem.shopSlug)) || shops[i % shops.length];

      let sp = await this.sellerProductRepo.findOne({
        where: { shop: { id: targetShop.id }, productVariant: { id: variant.id } },
      });

      if (!sp) {
        const price = prod.price ?? 100;
        const discountPrice = prod.compareAtPrice ?? null;

        sp = await this.sellerProductRepo.save(
          this.sellerProductRepo.create({
            productVariant: variant,
            shop: targetShop,
            price,
            discountPrice,
            sellerSku: variant.sku,
            isActive: true,
            isRegulatedApproved: true,
          }),
        );

        await this.inventoryRepo.save(
          this.inventoryRepo.create({
            sellerProduct: sp,
            quantity: prod.stock || 50,
            lowStockThreshold: 5,
          }),
        );
      }
      sellerProducts.push(sp);
    }

    this.logger.log(`Inventory seeded: ${sellerProducts.length} seller products mapped to shops.`);
    return sellerProducts;
  }

  async seedCoupons() {
    this.logger.log('Seeding promotional coupons...');
    const couponsData = [
      {
        code: 'WELCOME10',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        minOrderAmount: 300,
        maxDiscountAmount: 100,
        customerUsageLimit: 1,
      },
      {
        code: 'SAVE50',
        discountType: DiscountType.FIXED,
        discountValue: 50,
        minOrderAmount: 500,
        maxDiscountAmount: 50,
        customerUsageLimit: 2,
      },
      {
        code: 'FREESHIP',
        discountType: DiscountType.FIXED,
        discountValue: 60,
        minOrderAmount: 400,
        maxDiscountAmount: 60,
        customerUsageLimit: 3,
      },
      {
        code: 'BOISHAKHI20',
        discountType: DiscountType.PERCENTAGE,
        discountValue: 20,
        minOrderAmount: 1000,
        maxDiscountAmount: 300,
        customerUsageLimit: 1,
      },
      {
        code: 'GRAMERBAZAR',
        discountType: DiscountType.FIXED,
        discountValue: 50,
        minOrderAmount: 350,
        maxDiscountAmount: 50,
        customerUsageLimit: 5,
      },
    ];

    for (const c of couponsData) {
      const existing = await this.couponRepo.findOne({ where: { code: c.code } });
      if (!existing) {
        await this.couponRepo.save(
          this.couponRepo.create({
            code: c.code,
            discountType: c.discountType,
            discountValue: c.discountValue,
            minOrderAmount: c.minOrderAmount,
            maxDiscountAmount: c.maxDiscountAmount,
            customerUsageLimit: c.customerUsageLimit,
            isActive: true,
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          }),
        );
      }
    }
    return await this.couponRepo.find();
  }

  async seedOrdersAndDeliveries(
    customers: User[],
    riders: User[],
    shops: Shop[],
    sellerProducts: SellerProduct[],
  ): Promise<Order[]> {
    this.logger.log('Seeding realistic order history, payments, and delivery assignments...');
    const existingCount = await this.orderRepo.count();
    if (existingCount >= 40) {
      this.logger.log(
        `Orders already populated (${existingCount} orders found). Skipping to preserve data.`,
      );
      return await this.orderRepo.find({ relations: ['user', 'items', 'items.sellerProduct'] });
    }

    const savedOrders: Order[] = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    // We will generate 65 orders distributed over the last 30 days
    const targetOrderCount = 65;
    const statusProgression: OrderStatus[] = [
      OrderStatus.DELIVERED,
      OrderStatus.DELIVERED,
      OrderStatus.DELIVERED,
      OrderStatus.DELIVERED,
      OrderStatus.OUT_FOR_DELIVERY,
      OrderStatus.PROCESSING,
      OrderStatus.CONFIRMED,
      OrderStatus.PENDING,
      OrderStatus.CANCELLED,
    ];

    for (let i = 0; i < targetOrderCount; i++) {
      const customer = customers[i % customers.length];
      const customerAddresses = await this.addressRepo.find({ where: { userId: customer.id } });
      const address = customerAddresses[0] || (await this.addressRepo.find())[0];
      if (!address) continue;

      const shop = shops[i % shops.length];
      const shopProducts = sellerProducts.filter((sp) => sp.shop?.id === shop.id);
      if (shopProducts.length === 0) continue;

      // Select 1 to 3 items
      const itemCount = (i % 3) + 1;
      const selectedSps = shopProducts.slice(0, itemCount);

      let subtotal = 0;
      const orderItemsToCreate: {
        sellerProduct: SellerProduct;
        quantity: number;
        unitPrice: number;
        subtotal: number;
      }[] = [];

      for (let j = 0; j < selectedSps.length; j++) {
        const sp = selectedSps[j];
        const unitPrice = Number(sp.discountPrice || sp.price || 120);
        const quantity = ((i + j) % 2) + 1;
        const itemSubtotal = unitPrice * quantity;
        subtotal += itemSubtotal;

        orderItemsToCreate.push({
          sellerProduct: sp,
          quantity,
          unitPrice,
          subtotal: itemSubtotal,
        });
      }

      const deliveryFee = 60.0;
      const discount = i % 5 === 0 ? 50.0 : 0.0;
      const total = Number((subtotal + deliveryFee - discount).toFixed(2));

      // Order date: spread between 30 days ago and today
      const daysAgo = Math.floor((targetOrderCount - i) * (30 / targetOrderCount));
      const orderDate = new Date(now - daysAgo * dayMs);

      const status = statusProgression[i % statusProgression.length];
      const isPaid =
        status === OrderStatus.DELIVERED ||
        status === OrderStatus.OUT_FOR_DELIVERY ||
        status === OrderStatus.PROCESSING;
      const paymentMethod = i % 3 === 0 ? PaymentMethod.ONLINE : PaymentMethod.COD;
      const paymentStatus = isPaid ? PaymentStatus.PAID : PaymentStatus.PENDING;
      const tranId = `GBZ-TRX-${orderDate.getFullYear()}${String(orderDate.getMonth() + 1).padStart(2, '0')}-${String(i + 1000)}`;

      const order = await this.orderRepo.save(
        this.orderRepo.create({
          userId: customer.id,
          user: customer,
          addressId: address.id,
          address,
          subtotal,
          deliveryFee,
          discount,
          total,
          status,
          paymentMethod,
          paymentStatus,
          transactionId: paymentMethod === PaymentMethod.ONLINE ? tranId : null,
          createdAt: orderDate,
          updatedAt: orderDate,
        }),
      );

      // Save OrderItems
      for (const itemData of orderItemsToCreate) {
        await this.orderItemRepo.save(
          this.orderItemRepo.create({
            order,
            orderId: order.id,
            sellerProduct: itemData.sellerProduct,
            sellerProductId: itemData.sellerProduct.id,
            quantity: itemData.quantity,
            unitPrice: itemData.unitPrice,
            subtotal: itemData.subtotal,
          }),
        );
      }

      // Status History
      await this.orderStatusHistoryRepo.save(
        this.orderStatusHistoryRepo.create({
          order,
          orderId: order.id,
          fromStatus: null,
          status: OrderStatus.PENDING,
          toStatus: OrderStatus.PENDING,
          changedByUserId: customer.id,
          changedByRole: 'CUSTOMER',
        }),
      );

      if (status !== OrderStatus.PENDING) {
        await this.orderStatusHistoryRepo.save(
          this.orderStatusHistoryRepo.create({
            order,
            orderId: order.id,
            fromStatus: OrderStatus.PENDING,
            status,
            toStatus: status,
            changedByUserId: shop.seller?.id || customer.id,
            changedByRole: 'SELLER',
          }),
        );
      }

      // Payment
      await this.paymentRepo.save(
        this.paymentRepo.create({
          order,
          orderId: order.id,
          user: customer,
          userId: customer.id,
          provider:
            paymentMethod === PaymentMethod.ONLINE
              ? PaymentProvider.SSLCOMMERZ
              : PaymentProvider.COD,
          transactionId: tranId,
          amount: total,
          currency: 'BDT',
          status: paymentStatus,
          createdAt: orderDate,
        }),
      );

      // Delivery assignment if confirmed/shipped/delivered
      if (status !== OrderStatus.CANCELLED && status !== OrderStatus.PENDING) {
        const rider = riders[i % riders.length];
        let deliveryStatus = DeliveryStatus.ASSIGNED;
        if (status === OrderStatus.DELIVERED) deliveryStatus = DeliveryStatus.DELIVERED;
        else if (status === OrderStatus.OUT_FOR_DELIVERY)
          deliveryStatus = DeliveryStatus.OUT_FOR_DELIVERY;

        const delivery = await this.deliveryRepo.save(
          this.deliveryRepo.create({
            order,
            orderId: order.id,
            rider,
            riderId: rider.id,
            status: deliveryStatus,
            assignedAt: orderDate,
            pickupTime:
              status === OrderStatus.DELIVERED
                ? new Date(orderDate.getTime() + 2 * 3600 * 1000)
                : null,
            deliveryTime:
              status === OrderStatus.DELIVERED
                ? new Date(orderDate.getTime() + 4 * 3600 * 1000)
                : null,
            notes: 'গ্রামের বাজার দ্রুত হোম ডেলিভারি',
            createdAt: orderDate,
          }),
        );

        await this.deliveryHistoryRepo.save(
          this.deliveryHistoryRepo.create({
            delivery,
            deliveryId: delivery.id,
            status: deliveryStatus,
            changedBy: rider,
            changedById: rider.id,
            notes: `Delivery updated to ${deliveryStatus}`,
            createdAt: orderDate,
          }),
        );
      }

      savedOrders.push(order);
    }

    this.logger.log(`Orders seeded: ${savedOrders.length} realistic orders created.`);
    return savedOrders;
  }

  async seedReviews(customers: User[], orders: Order[]) {
    this.logger.log('Seeding authentic customer reviews and ratings...');
    const deliveredOrders = orders.filter((o) => o.status === OrderStatus.DELIVERED);
    const bengaliReviews = [
      'খুব ভালো কোয়ালিটির পণ্য। প্যাকেজিং ভালো ছিল।',
      'তাজা এবং সতেজ শাকসবজি। সময়মতো ডেলিভারি পেয়েছি।',
      'অরিজিনাল প্রোডাক্ট, ডেলিভারি ম্যানের ব্যবহার খুব ভালো ছিল।',
      'গ্রামের বাজারের পণ্য সবসময়ই খাঁটি। আবারও অর্ডার করব ইনশাআল্লাহ।',
      'পণ্যটি ভালো তবে ডেলিভারি একটু আগে পেলে আরও ভালো হতো।',
      'দাম অনুযায়ী মান বেশ ভালো। ধন্যবাদ সেলারকে।',
      'একদম অরগানিক ও ফ্রেশ। পরিবারের সবাই পছন্দ করেছে।',
      'প্রোডাক্টের কোয়ালিটি ১০০ তে ১০০। সবাইকে নেওয়ার সুপারিশ করছি।',
      'খাঁটি সরিষার তেলের চমৎকার ঝাঁঝ। রান্নায় আলাদা স্বাদ এনে দেয়।',
      'সুন্দর ও ঝরঝরে চাল। কোনো পাথর বা ময়লা ছিল না।',
    ];

    let count = 0;
    for (let i = 0; i < deliveredOrders.length; i++) {
      const order = deliveredOrders[i];
      const items = await this.orderItemRepo.find({
        where: { orderId: order.id },
        relations: [
          'sellerProduct',
          'sellerProduct.productVariant',
          'sellerProduct.productVariant.product',
        ],
      });

      for (const item of items) {
        const prod = item.sellerProduct?.productVariant?.product;
        if (!prod) continue;

        const existing = await this.reviewRepo.findOne({
          where: { userId: order.userId, productId: prod.id },
        });

        if (!existing) {
          const rating = i % 5 === 0 ? 4 : i % 8 === 0 ? 3 : 5;
          const comment = bengaliReviews[(i + count) % bengaliReviews.length];

          await this.reviewRepo.save(
            this.reviewRepo.create({
              productId: prod.id,
              userId: order.userId,
              rating,
              comment,
              isApproved: true,
            }),
          );
          count++;
        }
      }
    }
    this.logger.log(`Reviews ready: ${count} customer reviews created.`);
  }

  async seedWishlists(customers: User[], products: Product[]) {
    this.logger.log('Seeding customer wishlists...');
    let count = 0;
    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
      // Save 3 favorite products for customer
      for (let j = 0; j < 3; j++) {
        const product = products[(i * 3 + j) % products.length];
        const existing = await this.wishlistRepo.findOne({
          where: { userId: customer.id, productId: product.id },
        });
        if (!existing) {
          await this.wishlistRepo.save(
            this.wishlistRepo.create({
              userId: customer.id,
              productId: product.id,
            }),
          );
          count++;
        }
      }
    }
    this.logger.log(`Wishlists ready: ${count} wishlist entries created.`);
  }

  async seedWallets(customers: User[], sellers: User[]) {
    this.logger.log('Seeding realistic wallets and transactions...');
    // Seed seller wallets with realistic balances
    for (let i = 0; i < sellers.length; i++) {
      const seller = sellers[i];
      let wallet = await this.walletRepo.findOne({ where: { userId: seller.id } });
      if (!wallet) {
        const baseEarned = (i + 1) * 3500;
        const withdrawn = (i + 1) * 1200;
        const balance = baseEarned - withdrawn;

        wallet = await this.walletRepo.save(
          this.walletRepo.create({
            userId: seller.id,
            user: seller,
            balance,
            pendingClearance: 600,
            totalEarned: baseEarned,
            totalWithdrawn: withdrawn,
          }),
        );

        // Add Transactions
        await this.walletTxRepo.save([
          this.walletTxRepo.create({
            wallet,
            walletId: wallet.id,
            type: TransactionType.CREDIT,
            amount: baseEarned,
            description: 'বিক্রিত অর্ডারের মোট আয়',
            referenceId: `GBZ-ORD-BATCH-${i + 10}`,
          }),
          this.walletTxRepo.create({
            wallet,
            walletId: wallet.id,
            type: TransactionType.DEBIT,
            amount: withdrawn,
            description: 'ব্যাংক একাউন্টে টাকা উত্তোলন',
            referenceId: `GBZ-WD-${i + 10}`,
          }),
        ]);
      }
    }

    // Seed some customer wallets with cashback
    for (let i = 0; i < 5; i++) {
      const customer = customers[i];
      let wallet = await this.walletRepo.findOne({ where: { userId: customer.id } });
      if (!wallet) {
        wallet = await this.walletRepo.save(
          this.walletRepo.create({
            userId: customer.id,
            user: customer,
            balance: 250,
            totalEarned: 250,
            totalWithdrawn: 0,
          }),
        );

        await this.walletTxRepo.save(
          this.walletTxRepo.create({
            wallet,
            walletId: wallet.id,
            type: TransactionType.CREDIT,
            amount: 250,
            description: 'গ্রামের বাজার সাইনআপ বোনাস ও ক্যাশব্যাক',
            referenceId: 'GBZ-WELCOME-BONUS',
          }),
        );
      }
    }
  }

  async seedNotifications(customers: User[], sellers: User[], _orders: Order[]) {
    this.logger.log('Seeding realistic user notifications...');
    const notifCount = await this.notificationRepo.count();
    if (notifCount >= 20) return;

    for (let i = 0; i < Math.min(10, customers.length); i++) {
      const customer = customers[i];
      await this.notificationRepo.save([
        this.notificationRepo.create({
          userId: customer.id,
          user: customer,
          title: 'অর্ডার সফলভাবে ডেলিভারি হয়েছে',
          message:
            'আপনার অর্ডারটি নিরাপদে আপনার ঠিকানায় পৌঁছে দেওয়া হয়েছে। পণ্যটি ভালো লাগলে রিভিউ দিন।',
          type: NotificationType.ORDER_UPDATE,
          isRead: i % 2 === 0,
        }),
        this.notificationRepo.create({
          userId: customer.id,
          user: customer,
          title: 'বৈশাখী স্পেশাল অফার!',
          message: 'সব ধরণের খাঁটি চাল ও ভোজ্য তেলে পাচ্ছেন ১০% অতিরিক্ত ছাড়। কোড: BOISHAKHI20',
          type: NotificationType.PROMO,
          isRead: false,
        }),
      ]);
    }

    for (let i = 0; i < Math.min(5, sellers.length); i++) {
      const seller = sellers[i];
      await this.notificationRepo.save(
        this.notificationRepo.create({
          userId: seller.id,
          user: seller,
          title: 'নতুন কাস্টমার অর্ডার এসেছে',
          message: 'আপনার শপে নতুন একটি অর্ডার প্লেস করা হয়েছে। দ্রুত পার্সেল প্রস্তুত করুন।',
          type: NotificationType.ORDER_UPDATE,
          isRead: false,
        }),
      );
    }
  }

  async seedConversations(customers: User[], sellers: User[]) {
    this.logger.log('Seeding customer ↔ seller chat messages...');
    const convCount = await this.conversationRepo.count();
    if (convCount >= 5) return;

    for (let i = 0; i < 5; i++) {
      const customer = customers[i];
      const seller = sellers[i % sellers.length];

      const conv = await this.conversationRepo.save(
        this.conversationRepo.create({
          referenceId: `SHOP-CONV-${i + 1}`,
          referenceType: 'SHOP_INQUIRY',
          participants: [customer, seller],
        }),
      );

      await this.messageRepo.save([
        this.messageRepo.create({
          conversation: conv,
          conversationId: conv.id,
          sender: customer,
          senderId: customer.id,
          senderRole: 'CUSTOMER',
          content: 'আসসালামু আলাইকুম, সরিষার তেল কি একদম ঘানি ভাঙা খাঁটি?',
          isRead: true,
        }),
        this.messageRepo.create({
          conversation: conv,
          conversationId: conv.id,
          sender: seller,
          senderId: seller.id,
          senderRole: 'SELLER',
          content:
            'ওয়ালাইকুম আসসালাম। জী ভাই, কাঠের ঘানিতে ভাঙা ১০০% খাঁটি ঝাঁঝালো তেল। নিশ্চিত মনে নিতে পারেন।',
          isRead: true,
        }),
      ]);
    }
  }

  async seedDemandEvents(customers: User[], products: Product[]) {
    this.logger.log('Seeding analytics demand events for admin dashboards...');
    const eventCount = await this.demandEventRepo.count();
    if (eventCount >= 30) return;

    const eventTypes = [
      DemandEventType.VIEW,
      DemandEventType.ADD_TO_CART,
      DemandEventType.PURCHASE,
    ];
    const events: DemandEvent[] = [];

    for (let i = 0; i < 45; i++) {
      const customer = customers[i % customers.length];
      const prod = products[i % products.length];
      events.push(
        this.demandEventRepo.create({
          eventType: eventTypes[i % eventTypes.length],
          userId: customer.id,
          productId: prod.id,
          categoryId: prod.categoryId,
        }),
      );
    }

    await this.demandEventRepo.save(events);
  }

  async seedMarketing(sellerProducts: SellerProduct[]) {
    this.logger.log('Seeding marketing (Banners and Flash Sales)...');

    const bannerCount = await this.bannerRepo.count();
    if (bannerCount === 0) {
      await this.bannerRepo.save([
        this.bannerRepo.create({
          title: 'Organic Food Mega Sale',
          imageUrl:
            'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1920&q=80',
          linkUrl: '/products',
          isActive: true,
          displayOrder: 1,
        }),
        this.bannerRepo.create({
          title: 'Pure Honey & Organic Tea Fest',
          imageUrl:
            'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1920&q=80',
          linkUrl: '/categories/honey',
          isActive: true,
          displayOrder: 2,
        }),
      ]);
    }

    const flashSaleCount = await this.flashSaleRepo.count();
    if (flashSaleCount === 0 && sellerProducts.length > 0) {
      const flashSale = await this.flashSaleRepo.save(
        this.flashSaleRepo.create({
          name: 'Weekend Dhamaka',
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true,
          bannerImage:
            'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1920&q=80',
        }),
      );

      for (let i = 0; i < Math.min(4, sellerProducts.length); i++) {
        const sp = sellerProducts[i];
        await this.flashSaleItemRepo.save(
          this.flashSaleItemRepo.create({
            flashSale,
            sellerProduct: sp,
            discountPrice: Math.floor(Number(sp.price) * 0.8),
            quantityAvailable: 50,
            quantitySold: 5,
          }),
        );
      }
    }
  }

  async seedPermissionsAndRolePermissions() {
    this.logger.log('Seeding fine-grained RBAC permissions and role_permissions...');
    const permMap = new Map<string, PermissionEntity>();
    const catalogNames = new Set(SEED_PERMISSIONS.map((p) => p.name));

    for (const p of SEED_PERMISSIONS) {
      let perm = await this.permissionRepo.findOne({ where: { name: p.name } });
      if (!perm) {
        perm = await this.permissionRepo.save(
          this.permissionRepo.create({
            name: p.name,
            description: p.description,
          }),
        );
      } else if (perm.description !== p.description) {
        perm.description = p.description;
        perm = await this.permissionRepo.save(perm);
      }
      permMap.set(p.name, perm);
    }

    // Retire permissions that are no longer part of the canonical catalog so the
    // platform keeps a single permission system. Join rows cascade away.
    const stale = (await this.permissionRepo.find()).filter((p) => !catalogNames.has(p.name));
    if (stale.length > 0) {
      await this.permissionRepo.remove(stale);
      this.logger.log(`Retired ${stale.length} stale permission definitions.`);
    }

    // Attach the canonical permission set to each role.
    for (const roleEnum of Object.values(Role)) {
      const role = await this.roleRepo.findOne({
        where: { name: roleEnum },
        relations: ['permissions'],
      });
      if (role) {
        const allowedNames = ROLE_PERMISSION_NAMES[roleEnum] || [];
        const permsToAssign: PermissionEntity[] = [];
        for (const name of allowedNames) {
          const entity = permMap.get(name);
          if (entity) permsToAssign.push(entity);
        }
        role.permissions = permsToAssign;
        await this.roleRepo.save(role);
      }
    }
    this.logger.log(
      `Permissions & Role_Permissions ready (${permMap.size} permissions assigned across roles).`,
    );
  }

  /**
   * Grant explicit per-account permissions to the sample admin accounts.
   *
   * Demonstrates the Super-Admin-managed direct grant model: the "broad" admin
   * receives approval powers, while the "limited" admin keeps only the default
   * ADMIN role baseline.
   */
  async seedAdminPermissions() {
    this.logger.log('Seeding explicit admin account permission grants...');
    const grants: Record<string, string[]> = {
      'admin@gramerbazar.com': [
        'sellers.approve',
        'riders.approve',
        'payouts.approve',
        'payouts.reject',
        'settings.update',
        'audit_logs.read',
      ],
      'admin@gramerbazar.example': ['payouts.read', 'reports.read'],
    };

    const allPermissions = await this.permissionRepo.find();
    const byName = new Map(allPermissions.map((p) => [p.name, p]));

    for (const [email, names] of Object.entries(grants)) {
      const user = await this.userRepo.findOne({
        where: { email },
        relations: ['directPermissions'],
      });
      if (!user) continue;

      const perms = names.map((n) => byName.get(n)).filter((p): p is PermissionEntity => !!p);
      user.directPermissions = perms;
      await this.userRepo.save(user);
    }

    // Sample administrative audit trail for the audit-log viewer.
    const auditRepo = this.dataSource.getRepository(AuditLog);
    const existingLogs = await auditRepo.count();
    if (existingLogs === 0) {
      const superAdmin = await this.userRepo.findOne({
        where: { email: 'codeswithrakib@gmail.com' },
      });
      const actorName = superAdmin
        ? `${superAdmin.firstName ?? ''} ${superAdmin.lastName ?? ''}`.trim()
        : 'Super Admin';
      await auditRepo.save([
        auditRepo.create({
          actorId: superAdmin?.id ?? null,
          actorName,
          action: 'SEED_INITIALIZED',
          targetType: 'Platform',
          targetId: null,
          details: 'Platform seed data initialized',
        }),
        auditRepo.create({
          actorId: superAdmin?.id ?? null,
          actorName,
          action: 'PERMISSIONS_UPDATED',
          targetType: 'Role',
          targetId: 'ADMIN',
          details: 'Synchronised canonical permission catalog with ADMIN role',
        }),
      ]);
    }
  }

  async seedCategoryBrands(categories: Category[]) {
    this.logger.log('Seeding category_brands many-to-many associations...');
    const catMap = new Map<string, Category>();
    for (const c of categories) {
      catMap.set(c.slug, c);
    }

    const allBrands = await this.brandRepo.find({ relations: ['categories'] });
    for (const brand of allBrands) {
      const targetCatSlugs = BRAND_CATEGORY_SLUG_MAP[brand.slug];
      if (targetCatSlugs && targetCatSlugs.length > 0) {
        const matchedCats: Category[] = [];
        for (const slug of targetCatSlugs) {
          const cat = catMap.get(slug);
          if (cat && !matchedCats.some((m) => m.id === cat.id)) {
            matchedCats.push(cat);
          }
        }
        if (matchedCats.length > 0) {
          brand.categories = matchedCats;
          await this.brandRepo.save(brand);
        }
      }
    }
    this.logger.log('Category_brands relationships established successfully.');
  }

  async seedApplications(
    superAdmin: User,
    admin: User,
    sellers: User[],
    riders: User[],
    customers: User[],
  ) {
    this.logger.log('Seeding seller and rider KYC applications across all lifecycle states...');
    const userMap = new Map<string, User>();
    for (const u of [...sellers, ...riders, ...customers]) {
      if (u.email) userMap.set(u.email, u);
    }

    // 1. Seller applications
    for (const app of SEED_SELLER_APPLICATIONS) {
      const user = userMap.get(app.userEmail);
      if (!user) continue;

      const existing = await this.sellerAppRepo.findOne({
        where: [{ shopSlug: app.shopSlug }, { userId: user.id, shopNameEn: app.shopNameEn }],
      });

      if (!existing) {
        const reviewer =
          app.status === ApplicationStatus.APPROVED
            ? superAdmin
            : app.status === ApplicationStatus.REJECTED
              ? admin
              : null;
        const reviewedAt = app.reviewedDaysAgo
          ? new Date(Date.now() - app.reviewedDaysAgo * 24 * 60 * 60 * 1000)
          : null;

        await this.sellerAppRepo.save(
          this.sellerAppRepo.create({
            userId: user.id,
            user,
            shopNameEn: app.shopNameEn,
            shopNameBn: app.shopNameBn,
            shopSlug: app.shopSlug,
            phone: app.phone,
            email: app.email,
            description: app.description,
            address: app.address,
            tradeLicenseNumber: app.tradeLicenseNumber,
            nidNumber: app.nidNumber,
            status: app.status,
            adminNotes: app.adminNotes,
            reviewerId: reviewer ? reviewer.id : null,
            reviewer,
            reviewedAt,
          }),
        );
      }
    }

    // 2. Rider applications
    for (const app of SEED_RIDER_APPLICATIONS) {
      const user = userMap.get(app.userEmail);
      if (!user) continue;

      const existing = await this.riderAppRepo.findOne({
        where: [{ nidNumber: app.nidNumber }, { userId: user.id, phone: app.phone }],
      });

      if (!existing) {
        const reviewer =
          app.status === ApplicationStatus.APPROVED
            ? superAdmin
            : app.status === ApplicationStatus.REJECTED
              ? admin
              : null;
        const reviewedAt = app.reviewedDaysAgo
          ? new Date(Date.now() - app.reviewedDaysAgo * 24 * 60 * 60 * 1000)
          : null;

        await this.riderAppRepo.save(
          this.riderAppRepo.create({
            userId: user.id,
            user,
            fullName: app.fullName,
            phone: app.phone,
            email: app.email,
            nidNumber: app.nidNumber,
            vehicleType: app.vehicleType,
            vehiclePlateNumber: app.vehiclePlateNumber,
            drivingLicenseNumber: app.drivingLicenseNumber,
            preferredZone: app.preferredZone,
            emergencyContact: app.emergencyContact,
            status: app.status,
            adminNotes: app.adminNotes,
            reviewerId: reviewer ? reviewer.id : null,
            reviewer,
            reviewedAt,
          }),
        );
      }
    }

    this.logger.log('Seller & Rider applications seeded successfully.');
  }

  async seedProductRequests(customers: User[], admin: User, products: Product[]) {
    this.logger.log('Seeding customer product sourcing requests and history logs...');
    const custMap = new Map<string, User>();
    for (const c of customers) {
      if (c.email) custMap.set(c.email, c);
    }

    for (const reqItem of SEED_PRODUCT_REQUESTS) {
      const customer = custMap.get(reqItem.customerEmail) || customers[0];

      let req = await this.productRequestRepo.findOne({
        where: { userId: customer.id, requestedProductName: reqItem.requestedProductName },
        relations: ['statusHistory'],
      });

      if (!req) {
        const linkedProduct =
          reqItem.status === ProductRequestStatus.PRODUCT_ADDED && products.length > 0
            ? products[0]
            : null;

        req = await this.productRequestRepo.save(
          this.productRequestRepo.create({
            userId: customer.id,
            user: customer,
            requestedProductName: reqItem.requestedProductName,
            description: reqItem.description,
            preferredInformation: reqItem.preferredInformation,
            status: reqItem.status,
            linkedProductId: linkedProduct ? linkedProduct.id : null,
            linkedProduct,
            adminNotes: reqItem.adminNotes,
          }),
        );

        // Seed chronologically ordered history events
        for (const ev of reqItem.historyEvents) {
          const actor = ev.actorRole === 'ADMIN' ? admin : customer;
          const evDate = new Date(Date.now() - ev.daysAgo * 24 * 60 * 60 * 1000);

          await this.productRequestHistoryRepo.save(
            this.productRequestHistoryRepo.create({
              productRequestId: req.id,
              productRequest: req,
              status: ev.status,
              remark: ev.remark,
              changedByUserId: actor.id,
              changedByUser: actor,
              createdAt: evDate,
            }),
          );
        }
      }
    }
    this.logger.log('Product requests and audit history seeded successfully.');
  }

  async seedDisputes(orders: Order[], admin: User) {
    this.logger.log('Seeding realistic order disputes and communication logs...');
    if (orders.length === 0) return;

    for (const item of SEED_DISPUTES) {
      const orderIndex = item.orderIndex % orders.length;
      const order = orders[orderIndex];

      const existing = await this.disputeRepo.findOne({ where: { orderId: order.id } });
      if (!existing) {
        // Find seller from order items
        const orderItems = await this.orderItemRepo.find({
          where: { order: { id: order.id } },
          relations: ['sellerProduct', 'sellerProduct.shop', 'sellerProduct.shop.seller'],
        });

        const customer =
          order.user || (await this.userRepo.findOne({ where: { id: order.userId } })) || admin;
        const seller = orderItems[0]?.sellerProduct?.shop?.seller || admin;

        const dispute = await this.disputeRepo.save(
          this.disputeRepo.create({
            orderId: order.id,
            order,
            customerId: customer.id,
            customer,
            sellerId: seller.id,
            seller,
            reason: item.reason,
            description: item.description,
            evidenceImages: item.evidenceImages,
            status: item.status,
            adminDecision: item.adminDecision,
          }),
        );

        // Seed dispute messages
        const baseTime = new Date(order.createdAt).getTime();
        for (const msg of item.messages) {
          let sender = customer;
          if (msg.senderRole === 'SELLER') sender = seller;
          else if (msg.senderRole === 'ADMIN') sender = admin;

          await this.disputeMessageRepo.save(
            this.disputeMessageRepo.create({
              disputeId: dispute.id,
              dispute,
              senderId: sender.id,
              sender,
              senderRole: msg.senderRole,
              message: msg.message,
              attachment: msg.attachment || null,
              createdAt: new Date(baseTime + msg.minutesOffset * 60 * 1000),
            }),
          );
        }
      }
    }
    this.logger.log('Disputes and resolution dialogue seeded successfully.');
  }

  async seedCouponUsages(coupons: Coupon[], customers: User[], orders: Order[]) {
    this.logger.log('Seeding coupon redemption usage records...');
    if (coupons.length === 0 || orders.length === 0) return;

    const discountedOrders = orders.filter((o) => Number(o.discount) > 0);
    const primaryCoupon = coupons[0];

    for (let i = 0; i < Math.min(discountedOrders.length, 10); i++) {
      const order = discountedOrders[i];
      const customer =
        order.user ||
        (await this.userRepo.findOne({ where: { id: order.userId } })) ||
        customers[i % customers.length];
      const coupon = coupons[i % coupons.length] || primaryCoupon;

      const existing = await this.couponUsageRepo.findOne({
        where: { couponId: coupon.id, orderId: order.id },
      });

      if (!existing) {
        await this.couponUsageRepo.save(
          this.couponUsageRepo.create({
            couponId: coupon.id,
            coupon,
            userId: customer.id,
            user: customer,
            orderId: order.id,
            order,
            discountAmount: Number(order.discount),
            createdAt: order.createdAt,
          }),
        );
      }
    }
    this.logger.log('Coupon usage history seeded successfully.');
  }

  async seedPayoutRequests(sellers: User[]) {
    this.logger.log('Seeding merchant earnings payout requests...');
    for (const item of SEED_PAYOUT_REQUESTS) {
      const sellerIndex = item.sellerIndex % sellers.length;
      const seller = sellers[sellerIndex];

      const existing = await this.payoutRequestRepo.findOne({
        where: { sellerId: seller.id, method: item.method, amount: item.amount },
      });

      if (!existing) {
        await this.payoutRequestRepo.save(
          this.payoutRequestRepo.create({
            sellerId: seller.id,
            seller,
            amount: item.amount,
            method: item.method,
            accountDetails: item.accountDetails,
            status: item.status,
            adminNote: item.adminNote,
          }),
        );
      }
    }
    this.logger.log('Seller payout requests seeded successfully.');
  }

  async seedRiderProfilesAndEarnings(riders: User[]) {
    this.logger.log('Seeding rider operational profiles, earnings ledger and rider payouts...');

    // 1. Provision operational profiles from approved/known rider applications.
    for (const app of SEED_RIDER_APPLICATIONS) {
      const user = riders.find((r) => r.email === app.userEmail);
      if (!user) continue;

      let profile = await this.riderProfileRepo.findOne({ where: { userId: user.id } });
      if (!profile) profile = this.riderProfileRepo.create({ userId: user.id });

      profile.fullName = app.fullName;
      profile.nidNumber = app.nidNumber;
      profile.vehicleType = app.vehicleType;
      profile.vehiclePlateNumber = app.vehiclePlateNumber;
      profile.drivingLicenseNumber = app.drivingLicenseNumber;
      profile.preferredZone = app.preferredZone;
      profile.emergencyContact = app.emergencyContact;
      profile.address = `${app.preferredZone}, Panchagarh`;
      profile.isVerified = app.status === ApplicationStatus.APPROVED;
      await this.riderProfileRepo.save(profile);
    }

    // 2. Every rider gets an operational profile (lazy-created fallback).
    for (const user of riders) {
      const existing = await this.riderProfileRepo.findOne({ where: { userId: user.id } });
      if (existing) continue;
      await this.riderProfileRepo.save(
        this.riderProfileRepo.create({
          userId: user.id,
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Rider',
          isVerified: true,
          availability: RiderAvailability.OFFLINE,
        }),
      );
    }

    // 3. Spread availability across ONLINE / BUSY / OFFLINE for realistic dispatch testing.
    const availabilityPlan: RiderAvailability[] = [
      RiderAvailability.AVAILABLE,
      RiderAvailability.BUSY,
      RiderAvailability.OFFLINE,
      RiderAvailability.AVAILABLE,
      RiderAvailability.OFFLINE,
      RiderAvailability.AVAILABLE,
      RiderAvailability.OFFLINE,
    ];
    for (let i = 0; i < riders.length; i++) {
      const profile = await this.riderProfileRepo.findOne({ where: { userId: riders[i].id } });
      if (!profile) continue;
      profile.availability = availabilityPlan[i % availabilityPlan.length];
      if (profile.availability === RiderAvailability.AVAILABLE)
        profile.lastAvailableAt = new Date();
      await this.riderProfileRepo.save(profile);
    }

    // 4. Earnings ledger for every completed delivery.
    const deliveredDeliveries = await this.deliveryRepo.find({
      where: { status: DeliveryStatus.DELIVERED },
      relations: ['order'],
    });

    let earningsCreated = 0;
    for (const delivery of deliveredDeliveries) {
      if (!delivery.riderId) continue;
      const existing = await this.riderEarningRepo.findOne({
        where: { deliveryId: delivery.id },
      });
      if (existing) continue;

      await this.riderEarningRepo.save(
        this.riderEarningRepo.create({
          riderId: delivery.riderId,
          deliveryId: delivery.id,
          orderId: delivery.orderId,
          amount: Number(delivery.order?.deliveryFee) || 0,
          status: RiderEarningStatus.EARNED,
          createdAt: delivery.deliveryTime || delivery.createdAt,
        }),
      );
      earningsCreated++;
    }

    // 5. Small realistic rider payout history (one approved, one pending).
    const primaryRider = riders[0];
    if (primaryRider) {
      const existingPayout = await this.payoutRequestRepo.findOne({
        where: { riderId: primaryRider.id },
      });
      if (!existingPayout) {
        await this.payoutRequestRepo.save(
          this.payoutRequestRepo.create({
            riderId: primaryRider.id,
            amount: 100,
            method: PayoutMethod.BKASH,
            accountDetails: `bKash Personal: ${primaryRider.phone}`,
            status: PayoutStatus.APPROVED,
            adminNote: 'Approved and disbursed via bKash.',
          }),
        );
        await this.payoutRequestRepo.save(
          this.payoutRequestRepo.create({
            riderId: primaryRider.id,
            amount: 60,
            method: PayoutMethod.BKASH,
            accountDetails: `bKash Personal: ${primaryRider.phone}`,
            status: PayoutStatus.PENDING,
          }),
        );
      }
    }

    this.logger.log(
      `Rider profiles seeded for ${riders.length} riders, ${earningsCreated} earnings credited.`,
    );
  }

  async seedOtps() {
    this.logger.log('Seeding sample transient OTP tokens...');
    const sampleOtps = [
      { phone: '+8801700999881', code: '482910' },
      { phone: '+8801700999882', code: '817263' },
      { phone: '+8801700999883', code: '192837' },
    ];

    for (const o of sampleOtps) {
      const existing = await this.otpRepo.findOne({ where: { phone: o.phone } });
      if (!existing) {
        await this.otpRepo.save(
          this.otpRepo.create({
            phone: o.phone,
            code: o.code,
            attempts: 0,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          }),
        );
      }
    }
    this.logger.log('Sample OTP records seeded successfully.');
  }
}
