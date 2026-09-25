import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User } from '../users/entities/user.entity.js';
import { RoleEntity } from '../roles/entities/role.entity.js';
import { Role } from '../roles/enums/role.enum.js';
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
  ) {}

  async seed() {
    this.logger.log('--- Seeding Process Started ---');

    await this.cleanDatabase();
    await this.seedRoles();
    await this.seedLocations();
    const users = await this.seedUsersAndShops();
    const catalog = await this.seedCatalog();
    const sellerProducts = await this.seedInventory(users, catalog.productVariants, catalog.products);
    await this.seedMarketing(sellerProducts);
    
    this.logger.log('--- Seeding Process Finished ---');
    return {
      message: 'Successfully seeded database',
    };
  }

  private async cleanDatabase() {
    this.logger.log('Dropping and synchronizing database schema...');
    await this.dataSource.synchronize(true);
    this.logger.log('Database wiped and schema recreated.');
  }

  private async seedRoles() {
    this.logger.log('Seeding roles...');
    for (const name of Object.values(Role)) {
      await this.roleRepo.save(this.roleRepo.create({ name, description: name }));
    }
  }

  private async seedLocations() {
    this.logger.log('Seeding locations...');
    const { bdDivisions, bdDistricts, bdUpazilas, bdUnions } = await import('./data/locations.data.js');
    
    const country = await this.countryRepo.save(this.countryRepo.create({ nameEn: 'Bangladesh', nameBn: 'বাংলাদেশ', isActive: true }));
    
    // Seed Divisions
    this.logger.log(`Seeding ${bdDivisions.length} divisions...`);
    const divisionMap = new Map();
    for (const div of bdDivisions) {
      const division = await this.divisionRepo.save(this.divisionRepo.create({
        nameEn: div.name,
        nameBn: div.bn_name,
        country
      }));
      divisionMap.set(div.id, division);
    }

    // Seed Districts
    this.logger.log(`Seeding ${bdDistricts.length} districts...`);
    const districtMap = new Map();
    for (const dist of bdDistricts) {
      const district = await this.districtRepo.save(this.districtRepo.create({
        nameEn: dist.name,
        nameBn: dist.bn_name,
        division: divisionMap.get(dist.division_id)
      }));
      districtMap.set(dist.id, district);
    }

    // Seed Upazilas
    this.logger.log(`Seeding ${bdUpazilas.length} upazilas...`);
    const upazilaMap = new Map();
    const upazilaEntities = bdUpazilas.map(up => {
      const entity = this.upazilaRepo.create({
        nameEn: up.name,
        nameBn: up.bn_name,
        district: districtMap.get(up.district_id)
      });
      // We need to keep track of the original id to link unions later
      // So we store them in the map temporarily (we need the saved entity later)
      return { id: up.id, entity };
    });
    
    const chunkSize = 100;
    for (let i = 0; i < upazilaEntities.length; i += chunkSize) {
      const chunk = upazilaEntities.slice(i, i + chunkSize);
      const savedChunk = await this.upazilaRepo.save(chunk.map(c => c.entity));
      // Map the original Nuhil ID to the saved DB entity
      for (let j = 0; j < chunk.length; j++) {
        upazilaMap.set(chunk[j].id, savedChunk[j]);
      }
    }

    // Seed Unions & Areas
    this.logger.log(`Seeding ${bdUnions.length} unions and areas...`);
    const unionEntities = bdUnions.map(un => {
      const entity = this.unionRepo.create({
        nameEn: un.name,
        nameBn: un.bn_name,
        upazila: upazilaMap.get(un.upazilla_id) // Note: Nuhil JSON uses "upazilla_id"
      });
      return { id: un.id, entity };
    });

    // Save Unions in chunks
    const areaEntities = [];
    for (let i = 0; i < unionEntities.length; i += chunkSize) {
      const chunk = unionEntities.slice(i, i + chunkSize);
      const savedChunk = await this.unionRepo.save(chunk.map(c => c.entity));
      
      // For each union, create a default "All Areas" area since we don't have village data
      for (const savedUnion of savedChunk) {
        areaEntities.push(this.areaRepo.create({
          nameEn: 'All Areas / Villages',
          nameBn: 'সকল এলাকা / গ্রাম',
          union: savedUnion,
          deliveryFee: 60
        }));
      }
    }

    // Save Areas in chunks
    this.logger.log(`Seeding ${areaEntities.length} areas...`);
    for (let i = 0; i < areaEntities.length; i += chunkSize) {
      const chunk = areaEntities.slice(i, i + chunkSize);
      await this.areaRepo.save(chunk);
    }
  }

  private async seedUsersAndShops() {
    this.logger.log('Seeding users and shops...');
    const superAdminRole = await this.roleRepo.findOne({ where: { name: Role.SUPER_ADMIN } });
    const adminRole = await this.roleRepo.findOne({ where: { name: Role.ADMIN } });
    const customerRole = await this.roleRepo.findOne({ where: { name: Role.CUSTOMER } });
    const sellerRole = await this.roleRepo.findOne({ where: { name: Role.SELLER } });
    const riderRole = await this.roleRepo.findOne({ where: { name: Role.RIDER } });

    const passwordHash = await bcrypt.hash('password123', 10);

    const superAdmin = await this.userRepo.save(this.userRepo.create({
      phone: '+8801767476724', email: 'codeswithrakib@gmail.com', passwordHash,
      firstName: 'Rakib', lastName: 'SuperAdmin', roles: [superAdminRole as RoleEntity],
      status: 'ACTIVE' as any, isEmailVerified: true
    }));

    const admin = await this.userRepo.save(this.userRepo.create({
      phone: '+8801952879249', email: 'admin@gramerbazar.com', passwordHash,
      firstName: 'System', lastName: 'Admin', roles: [adminRole as RoleEntity],
      status: 'ACTIVE' as any, isEmailVerified: true
    }));

    const customer = await this.userRepo.save(this.userRepo.create({
      phone: '+8801700000002', email: 'customer@gramerbazar.com', passwordHash,
      firstName: 'Rahim', lastName: 'Uddin', roles: [customerRole as RoleEntity],
      status: 'ACTIVE' as any, isEmailVerified: true
    }));

    const seller1 = await this.userRepo.save(this.userRepo.create({
      phone: '+8801700000003', email: 'seller1@gramerbazar.com', passwordHash,
      firstName: 'Abdul', lastName: 'Kader', roles: [sellerRole as RoleEntity],
      status: 'ACTIVE' as any, isEmailVerified: true
    }));

    const seller2 = await this.userRepo.save(this.userRepo.create({
      phone: '+8801700000004', email: 'seller2@gramerbazar.com', passwordHash,
      firstName: 'Jamal', lastName: 'Hossain', roles: [sellerRole as RoleEntity],
      status: 'ACTIVE' as any, isEmailVerified: true
    }));

    const rider1 = await this.userRepo.save(this.userRepo.create({
      phone: '+8801700000005', email: 'rider1@gramerbazar.com', passwordHash,
      firstName: 'Babul', lastName: 'Mia', roles: [riderRole as RoleEntity],
      status: 'ACTIVE' as any, isEmailVerified: true
    }));

    const rider2 = await this.userRepo.save(this.userRepo.create({
      phone: '+8801700000006', email: 'rider2@gramerbazar.com', passwordHash,
      firstName: 'Kamal', lastName: 'Sheikh', roles: [riderRole as RoleEntity],
      status: 'ACTIVE' as any, isEmailVerified: true
    }));

    // Shops
    await this.shopRepo.save([
      this.shopRepo.create({ nameEn: 'Rahim Traders', nameBn: 'রহিম ট্রেডার্স', slug: 'rahim-traders', seller: seller1 }),
      this.shopRepo.create({ nameEn: 'Karim Groceries', nameBn: 'করিম গ্রোসারিজ', slug: 'karim-groceries', seller: seller2 }),
    ]);

    return { superAdmin, admin, customer, sellers: [seller1, seller2], riders: [rider1, rider2] };
  }

  private async seedCatalog() {
    this.logger.log('Seeding primary category & subcategory catalog with local images...');

    const fs = await import('fs');
    const path = await import('path');
    const catalogPath = path.resolve(process.cwd(), 'src', 'seeder', 'data', 'catalog_seed.json');
    const catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

    const categoryMap = new Map<string, Category>();

    // 1. Seed Categories & Subcategories
    for (const catData of catalogData.categories) {
      const rootCat = await this.categoryRepo.save(
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
      categoryMap.set(catData.slug, rootCat);

      for (const subData of catData.subcategories) {
        const subCat = await this.categoryRepo.save(
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
        categoryMap.set(`${catData.slug}/${subData.slug}`, subCat);
      }
    }

    // 2. Seed Brands
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
    ];

    for (const bName of brandNames) {
      const bSlug = bName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const savedBrand = await this.brandRepo.save(
        this.brandRepo.create({
          nameEn: bName,
          nameBn: bName,
          slug: bSlug,
          isActive: true,
        }),
      );
      brandMap.set(bName, savedBrand);
    }

    // 3. Seed Products with Local Images and Subcategories
    const products: Product[] = [];
    const productVariants: ProductVariant[] = [];

    for (const p of catalogData.products) {
      const rootCat = categoryMap.get(p.categorySlug);
      const subCat = categoryMap.get(`${p.categorySlug}/${p.subCategorySlug}`);
      const brand = brandMap.get(p.brand) || brandMap.get('Local Farmer');

      const pSlug = p.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      const prod = await this.productRepo.save(
        this.productRepo.create({
          categoryId: rootCat ? rootCat.id : (await this.categoryRepo.find())[0].id,
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
      products.push(prod);

      // Local image
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

      const variant = await this.variantRepo.save(
        this.variantRepo.create({
          product: prod,
          nameEn: 'Default',
          nameBn: 'ডিফল্ট',
          sku: p.sku,
          images: [imageUrl],
          isActive: true,
        }),
      );
      productVariants.push(variant);
    }

    return { categories: Array.from(categoryMap.values()), brands: Array.from(brandMap.values()), products, productVariants };
  }

  private async seedInventory(users: { customer: User; sellers: User[] }, variants: ProductVariant[], products: Product[]) {
    this.logger.log('Seeding seller products & inventory...');

    let flip = true;
    const sellerProducts: SellerProduct[] = [];

    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      const prod = products[i];
      const seller = flip ? users.sellers[0] : users.sellers[1];
      const shop = await this.shopRepo.findOne({ where: { seller: { id: seller.id } } });

      const price = prod.price ?? 100;
      const discountPrice = prod.compareAtPrice ?? null;

      const sp: SellerProduct = await this.sellerProductRepo.save(
        this.sellerProductRepo.create({
          productVariant: variant,
          shop: shop as Shop,
          price,
          discountPrice,
          sellerSku: variant.sku,
          isActive: true,
          isRegulatedApproved: true,
        }),
      );
      sellerProducts.push(sp);

      // Inventory
      await this.inventoryRepo.save(
        this.inventoryRepo.create({
          sellerProduct: sp,
          quantity: prod.stock || 50,
          lowStockThreshold: 5,
        }),
      );

      // A review
      await this.reviewRepo.save(
        this.reviewRepo.create({
          product: prod,
          user: users.customer,
          rating: 5,
          comment: 'খুব ভালো কোয়ালিটির পণ্য। দ্রুত ডেলিভারি পেয়েছি।',
        }),
      );

      flip = !flip;
    }

    return sellerProducts;
  }

  private async seedMarketing(sellerProducts: SellerProduct[]) {
    this.logger.log('Seeding marketing (Banners and Flash Sales)...');
    
    // Seed Banners
    await this.bannerRepo.save([
      this.bannerRepo.create({
        title: 'Organic Food Mega Sale',
        imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1920&q=80',
        linkUrl: '/products',
        isActive: true,
        displayOrder: 1
      }),
      this.bannerRepo.create({
        title: 'Pure Honey Fest',
        imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1920&q=80',
        linkUrl: '/categories/honey',
        isActive: true,
        displayOrder: 2
      })
    ]);

    // Seed Flash Sale
    const flashSale = await this.flashSaleRepo.save(this.flashSaleRepo.create({
      name: 'Weekend Dhamaka',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Ends in 7 days
      isActive: true,
      bannerImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1920&q=80'
    }));

    // Add 4 random products to flash sale
    for (let i = 0; i < Math.min(4, sellerProducts.length); i++) {
      const sp = sellerProducts[i];
      await this.flashSaleItemRepo.save(this.flashSaleItemRepo.create({
        flashSale,
        sellerProduct: sp,
        discountPrice: Math.floor(Number(sp.price) * 0.8), // 20% discount
        quantityAvailable: 50,
        quantitySold: 5
      }));
    }
  }
}
