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
import { SellerProduct } from '../inventory/entities/seller-product.entity.js';
import { Inventory } from '../inventory/entities/inventory.entity.js';
import { Review } from '../reviews/entities/review.entity.js';
import { Country } from '../locations/entities/country.entity.js';
import { Division } from '../locations/entities/division.entity.js';
import { District } from '../locations/entities/district.entity.js';
import { Upazila } from '../locations/entities/upazila.entity.js';
import { Union } from '../locations/entities/union.entity.js';
import { Area } from '../locations/entities/area.entity.js';

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
    @InjectRepository(SellerProduct) private sellerProductRepo: Repository<SellerProduct>,
    @InjectRepository(Inventory) private inventoryRepo: Repository<Inventory>,
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(Country) private countryRepo: Repository<Country>,
    @InjectRepository(Division) private divisionRepo: Repository<Division>,
    @InjectRepository(District) private districtRepo: Repository<District>,
    @InjectRepository(Upazila) private upazilaRepo: Repository<Upazila>,
    @InjectRepository(Union) private unionRepo: Repository<Union>,
    @InjectRepository(Area) private areaRepo: Repository<Area>,
  ) {}

  async seed() {
    this.logger.log('--- Seeding Process Started ---');

    await this.cleanDatabase();
    await this.seedRoles();
    await this.seedLocations();
    const users = await this.seedUsersAndShops();
    const catalog = await this.seedCatalog();
    await this.seedInventory(users, catalog.productVariants, catalog.products);
    
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
    
    const adminRole = await this.roleRepo.findOne({ where: { name: Role.SUPER_ADMIN } });
    const sellerRole = await this.roleRepo.findOne({ where: { name: Role.SELLER } });
    const customerRole = await this.roleRepo.findOne({ where: { name: Role.CUSTOMER } });

    const passwordHash = await bcrypt.hash('123456', 10);

    // Admin
    const admin = await this.userRepo.save(this.userRepo.create({
      firstName: 'Super', lastName: 'Admin', email: 'admin@gramerbazar.com', phone: '01700000000',
      passwordHash, roles: [adminRole as RoleEntity],
      status: 'ACTIVE' as any, isEmailVerified: true
    }));

    // Customer
    const customer = await this.userRepo.save(this.userRepo.create({
      firstName: 'Regular', lastName: 'Customer', email: 'customer@test.com', phone: '01800000000',
      passwordHash, roles: [customerRole as RoleEntity],
      status: 'ACTIVE' as any, isEmailVerified: true
    }));

    // Sellers
    const seller1 = await this.userRepo.save(this.userRepo.create({
      firstName: 'Rahim', lastName: 'Uddin', email: 'rahim@test.com', phone: '01900000001',
      passwordHash, roles: [sellerRole as RoleEntity],
      status: 'ACTIVE' as any, isEmailVerified: true
    }));

    const seller2 = await this.userRepo.save(this.userRepo.create({
      firstName: 'Karim', lastName: 'Mia', email: 'karim@test.com', phone: '01900000002',
      passwordHash, roles: [sellerRole as RoleEntity],
      status: 'ACTIVE' as any, isEmailVerified: true
    }));

    // Shops
    await this.shopRepo.save([
      this.shopRepo.create({ nameEn: 'Rahim Traders', nameBn: 'রহিম ট্রেডার্স', slug: 'rahim-traders', seller: seller1 }),
      this.shopRepo.create({ nameEn: 'Karim Groceries', nameBn: 'করিম গ্রোসারিজ', slug: 'karim-groceries', seller: seller2 }),
    ]);

    return { admin, customer, sellers: [seller1, seller2] };
  }

  private async seedCatalog() {
    this.logger.log('Seeding catalog (categories, brands, products)...');

    // Categories
    const categories = await this.categoryRepo.save([
      this.categoryRepo.create({ nameEn: 'Rice & Grains', nameBn: 'চাল ও শস্য', slug: 'rice-grains', isActive: true }),
      this.categoryRepo.create({ nameEn: 'Fresh Vegetables', nameBn: 'তাজা শাকসবজি', slug: 'fresh-vegetables', isActive: true }),
      this.categoryRepo.create({ nameEn: 'Spices', nameBn: 'মসলা', slug: 'spices', isActive: true }),
      this.categoryRepo.create({ nameEn: 'Fish & Meat', nameBn: 'মাছ ও মাংস', slug: 'fish-meat', isActive: true }),
      this.categoryRepo.create({ nameEn: 'Oils', nameBn: 'তেল', slug: 'oils', isActive: true }),
      this.categoryRepo.create({ nameEn: 'Dairy & Eggs', nameBn: 'দুধ ও ডিম', slug: 'dairy-eggs', isActive: true }),
      this.categoryRepo.create({ nameEn: 'Snacks', nameBn: 'স্ন্যাকস', slug: 'snacks', isActive: true }),
    ]);

    // Brands
    const brands = await this.brandRepo.save([
      this.brandRepo.create({ nameEn: 'Pran', nameBn: 'প্রাণ', slug: 'pran', isActive: true }),
      this.brandRepo.create({ nameEn: 'Radhuni', nameBn: 'রাঁধুনী', slug: 'radhuni', isActive: true }),
      this.brandRepo.create({ nameEn: 'Teer', nameBn: 'তীর', slug: 'teer', isActive: true }),
      this.brandRepo.create({ nameEn: 'Fresh', nameBn: 'ফ্রেশ', slug: 'fresh', isActive: true }),
      this.brandRepo.create({ nameEn: 'Aarong', nameBn: 'আড়ং', slug: 'aarong', isActive: true }),
      this.brandRepo.create({ nameEn: 'Local', nameBn: 'স্থানীয়', slug: 'local', isActive: true }),
    ]);

    // Products
    const findCat = (slug: string) => categories.find(c => c.slug === slug);
    const findBrand = (slug: string) => brands.find(b => b.slug === slug);

    const productData = [
      { name: 'Miniket Rice 50kg', bnName: 'মিনিকেট চাল ৫০ কেজি', slug: 'miniket-rice-50kg', cat: 'rice-grains', brand: 'local', image: 'https://chaldn.com/_mpimage/miniket-rice-premium-50-kg?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D118167&q=best&v=1' },
      { name: 'Radhuni Beef Masala 100g', bnName: 'রাঁধুনী গরুর মাংসের মসলা ১০০ গ্রাম', slug: 'radhuni-beef-masala-100g', cat: 'spices', brand: 'radhuni', image: 'https://chaldn.com/_mpimage/radhuni-beef-masala-100-gm?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D123164&q=low&v=1' },
      { name: 'Fresh Soybean Oil 5L', bnName: 'ফ্রেশ সয়াবিন তেল ৫ লিটার', slug: 'fresh-soybean-oil-5l', cat: 'oils', brand: 'fresh', image: 'https://chaldn.com/_mpimage/fresh-soybean-oil-5-ltr?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D152528&q=low&v=1' },
      { name: 'Deshi Onion 1kg', bnName: 'দেশি পেঁয়াজ ১ কেজি', slug: 'deshi-onion-1kg', cat: 'fresh-vegetables', brand: 'local', image: 'https://chaldn.com/_mpimage/onion-local-deshi-peyaj-1-kg?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D133379&q=low&v=1' },
      { name: 'Farm Fresh Brown Eggs 12pcs', bnName: 'ফার্ম ফ্রেশ লাল ডিম ১২ পিস', slug: 'farm-fresh-brown-eggs-12pcs', cat: 'dairy-eggs', brand: 'local', image: 'https://chaldn.com/_mpimage/egg-layer-chicken-brown-12-pcs?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D133405&q=low&v=1' },
      { name: 'Pran Chanachur Spicy 300g', bnName: 'প্রাণ চানাচুর ঝাল ৩০০ গ্রাম', slug: 'pran-chanachur-spicy-300g', cat: 'snacks', brand: 'pran', image: 'https://chaldn.com/_mpimage/pran-hot-spicy-chanachur-300-gm?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D116410&q=low&v=1' },
      { name: 'Teer Advanced Soyabean Oil 2L', bnName: 'তীর সয়াবিন তেল ২ লিটার', slug: 'teer-soyabean-oil-2l', cat: 'oils', brand: 'teer', image: 'https://chaldn.com/_mpimage/teer-advanced-soyabean-oil-2-ltr?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D117973&q=low&v=1' },
      { name: 'Aarong Dairy Liquid Milk 1L', bnName: 'আড়ং ডেইরি তরল দুধ ১ লিটার', slug: 'aarong-dairy-liquid-milk-1l', cat: 'dairy-eggs', brand: 'aarong', image: 'https://chaldn.com/_mpimage/aarong-dairy-uht-liquid-milk-1-ltr?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D134268&q=low&v=1' },
    ];

    const products = [];
    const productVariants = [];
    for (const p of productData) {
      const prod = await this.productRepo.save(this.productRepo.create({
        nameEn: p.name, nameBn: p.bnName, slug: p.slug, category: findCat(p.cat) as Category, brand: findBrand(p.brand) as Brand,
        descriptionEn: `Premium quality ${p.name}.`, descriptionBn: `উন্নত মানের ${p.bnName}।`,
        isActive: true,
      }));
      products.push(prod);

      const variant = await this.variantRepo.save(this.variantRepo.create({
        product: prod, nameEn: 'Default', nameBn: 'ডিফল্ট', sku: `${p.slug}-def`,
        images: [p.image], isActive: true,
      }));
      productVariants.push(variant);
    }

    return { categories, brands, products, productVariants };
  }

  private async seedInventory(users: { customer: User; sellers: User[] }, variants: ProductVariant[], products: Product[]) {
    this.logger.log('Seeding seller products & inventory...');
    
    // Assign random products to Seller 1 and 2
    let flip = true;
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      const prod = products[i];
      const seller = flip ? users.sellers[0] : users.sellers[1];
      const shop = await this.shopRepo.findOne({ where: { seller: { id: seller.id } } });

      const price = Math.floor(Math.random() * 500) + 50;

      const sp: SellerProduct = await this.sellerProductRepo.save(this.sellerProductRepo.create({
        productVariant: variant, shop: shop as Shop, 
        price, isActive: true, isRegulatedApproved: true
      }));

      // Inventory
      await this.inventoryRepo.save(this.inventoryRepo.create({
        sellerProduct: sp, quantity: Math.floor(Math.random() * 200) + 20, 
        lowStockThreshold: 5
      }));

      // A mock review
      await this.reviewRepo.save(this.reviewRepo.create({
        product: prod, user: users.customer,
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 star
        comment: 'Very good quality product. Fast delivery!',
      }));

      flip = !flip;
    }
  }
}
