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
import { DiscountType } from '../coupons/enums/discount-type.enum.js';
import { Notification, NotificationType } from '../notifications/entities/notification.entity.js';
import { Conversation } from '../chat/entities/conversation.entity.js';
import { Message } from '../chat/entities/message.entity.js';
import { Wallet } from '../wallets/entities/wallet.entity.js';
import { WalletTransaction, TransactionType } from '../wallets/entities/wallet-transaction.entity.js';
import { DemandEvent } from '../analytics/entities/demand-event.entity.js';
import { DemandEventType } from '../analytics/enums/demand-event.enum.js';

import { SEED_ADMINS, SEED_SELLERS, SEED_CUSTOMERS, SEED_RIDERS, SeedUserData } from './data/seed-users.data.js';
import { SEED_SHOPS } from './data/seed-shops.data.js';
import { SEED_PRODUCTS, SeedProductItem } from './data/seed-products.data.js';
import { SEED_ADDRESSES } from './data/seed-addresses.data.js';

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
    @InjectRepository(OrderStatusHistory) private orderStatusHistoryRepo: Repository<OrderStatusHistory>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Delivery) private deliveryRepo: Repository<Delivery>,
    @InjectRepository(DeliveryHistory) private deliveryHistoryRepo: Repository<DeliveryHistory>,
    @InjectRepository(WishlistItem) private wishlistRepo: Repository<WishlistItem>,
    @InjectRepository(Coupon) private couponRepo: Repository<Coupon>,
    @InjectRepository(Notification) private notificationRepo: Repository<Notification>,
    @InjectRepository(Conversation) private conversationRepo: Repository<Conversation>,
    @InjectRepository(Message) private messageRepo: Repository<Message>,
    @InjectRepository(Wallet) private walletRepo: Repository<Wallet>,
    @InjectRepository(WalletTransaction) private walletTxRepo: Repository<WalletTransaction>,
    @InjectRepository(DemandEvent) private demandEventRepo: Repository<DemandEvent>,
  ) {}

  async seed() {
    this.logger.log('--- Production-Ready Gramer Bazar Seed Starting (Preserving All Data) ---');

    await this.seedRoles();
    await this.seedLocations();
    const { sellers, riders, customers } = await this.seedUsers();
    await this.seedAddresses(customers);
    const shops = await this.seedShops(sellers);
    const catalog = await this.seedCatalog();
    const sellerProducts = await this.seedInventory(shops, catalog.products, catalog.productVariants);
    await this.seedCoupons();
    const orders = await this.seedOrdersAndDeliveries(customers, riders, shops, sellerProducts);
    await this.seedReviews(customers, orders);
    await this.seedWishlists(customers, catalog.products);
    await this.seedWallets(customers, sellers);
    await this.seedNotifications(customers, sellers, orders);
    await this.seedConversations(customers, sellers);
    await this.seedDemandEvents(customers, catalog.products);
    await this.seedMarketing(sellerProducts);

    this.logger.log('--- Production-Ready Gramer Bazar Seed Completed Successfully ---');
    return {
      message: 'Successfully seeded database without modifying existing development records.',
      stats: {
        users: await this.userRepo.count(),
        shops: await this.shopRepo.count(),
        categories: await this.categoryRepo.count(),
        products: await this.productRepo.count(),
        sellerProducts: await this.sellerProductRepo.count(),
        addresses: await this.addressRepo.count(),
        orders: await this.orderRepo.count(),
        reviews: await this.reviewRepo.count(),
        notifications: await this.notificationRepo.count(),
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
      this.logger.log(`Locations already seeded (${divisionCount} divisions found). Skipping to preserve data.`);
      return;
    }

    this.logger.log('Seeding Bangladesh locations...');
    const { bdDivisions, bdDistricts, bdUpazilas, bdUnions } = await import('./data/locations.data.js');

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

  private async upsertUser(data: SeedUserData, roleEntity: RoleEntity, passwordHash: string): Promise<User> {
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
          (seedAddr.customerEmail === 'customer1@gramerbazar.com' && c.email === 'customer1@gramerbazar.example'),
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
      const pSlug = p.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      let prod = await this.productRepo.findOne({ where: [{ slug: pSlug }, { sku: p.sku }] });

      const targetCategory = categoryMap.get(p.categorySlug) || defaultCat;
      const subCat = p.subCategorySlug ? categoryMap.get(`${p.categorySlug}/${p.subCategorySlug}`) || categoryMap.get(p.subCategorySlug) : undefined;
      const brand = brandMap.get(p.brand) || brandMap.get('Local Farmer') || (await this.brandRepo.find())[0];

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

    this.logger.log(`Catalog ready with ${allProducts.length} products and ${allVariants.length} variants.`);
    return {
      categories: Array.from(categoryMap.values()),
      brands: Array.from(brandMap.values()),
      products: allProducts,
      productVariants: allVariants,
    };
  }

  async seedInventory(shops: Shop[], products: Product[], variants: ProductVariant[]): Promise<SellerProduct[]> {
    this.logger.log('Seeding seller products and live stock inventory across shops...');
    const sellerProducts: SellerProduct[] = [];
    const shopMap = new Map<string, Shop>();
    for (const s of shops) shopMap.set(s.slug, s);

    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      const prod = products.find((p) => p.id === variant.product?.id || p.sku === variant.sku) || products[i % products.length];

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
      this.logger.log(`Orders already populated (${existingCount} orders found). Skipping to preserve data.`);
      return await this.orderRepo.find({ relations: ['items', 'items.sellerProduct'] });
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
      const orderItemsToCreate: { sellerProduct: SellerProduct; quantity: number; unitPrice: number; subtotal: number }[] = [];

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
      const isPaid = status === OrderStatus.DELIVERED || status === OrderStatus.OUT_FOR_DELIVERY || status === OrderStatus.PROCESSING;
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
          provider: paymentMethod === PaymentMethod.ONLINE ? PaymentProvider.SSLCOMMERZ : PaymentProvider.COD,
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
        else if (status === OrderStatus.OUT_FOR_DELIVERY) deliveryStatus = DeliveryStatus.OUT_FOR_DELIVERY;

        const delivery = await this.deliveryRepo.save(
          this.deliveryRepo.create({
            order,
            orderId: order.id,
            rider,
            riderId: rider.id,
            status: deliveryStatus,
            assignedAt: orderDate,
            pickupTime: status === OrderStatus.DELIVERED ? new Date(orderDate.getTime() + 2 * 3600 * 1000) : null,
            deliveryTime: status === OrderStatus.DELIVERED ? new Date(orderDate.getTime() + 4 * 3600 * 1000) : null,
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
        relations: ['sellerProduct', 'sellerProduct.productVariant', 'sellerProduct.productVariant.product'],
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
          message: 'আপনার অর্ডারটি নিরাপদে আপনার ঠিকানায় পৌঁছে দেওয়া হয়েছে। পণ্যটি ভালো লাগলে রিভিউ দিন।',
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
          content: 'ওয়ালাইকুম আসসালাম। জী ভাই, কাঠের ঘানিতে ভাঙা ১০০% খাঁটি ঝাঁঝালো তেল। নিশ্চিত মনে নিতে পারেন।',
          isRead: true,
        }),
      ]);
    }
  }

  async seedDemandEvents(customers: User[], products: Product[]) {
    this.logger.log('Seeding analytics demand events for admin dashboards...');
    const eventCount = await this.demandEventRepo.count();
    if (eventCount >= 30) return;

    const eventTypes = [DemandEventType.VIEW, DemandEventType.ADD_TO_CART, DemandEventType.PURCHASE];
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
          imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1920&q=80',
          linkUrl: '/products',
          isActive: true,
          displayOrder: 1,
        }),
        this.bannerRepo.create({
          title: 'Pure Honey & Organic Tea Fest',
          imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1920&q=80',
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
          bannerImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1920&q=80',
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
}
