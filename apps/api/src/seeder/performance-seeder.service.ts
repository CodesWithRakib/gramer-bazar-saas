import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { UserStatus } from '../users/enums/user-status.enum.js';
import { Shop } from '../shops/entities/shop.entity.js';
import { Category } from '../catalog/entities/category.entity.js';
import { Brand } from '../catalog/entities/brand.entity.js';
import { Product } from '../catalog/entities/product.entity.js';
import { ProductStatus } from '../catalog/enums/product-status.enum.js';
import { ProductVariant } from '../catalog/entities/product-variant.entity.js';
import { SellerProduct } from '../inventory/entities/seller-product.entity.js';
import { Inventory } from '../inventory/entities/inventory.entity.js';
import { Review } from '../reviews/entities/review.entity.js';
import { slugify } from '../common/utils/slug.js';

@Injectable()
export class PerformanceSeederService {
  private readonly logger = new Logger(PerformanceSeederService.name);

  constructor(private readonly dataSource: DataSource) {}

  async seed(scale: number, randomSeed: number) {
    if (process.env.PERFORMANCE_DB !== 'true') {
      throw new Error(
        'Refusing to run performance seeder. PERFORMANCE_DB=true is required to prevent accidental data contamination.'
      );
    }

    this.logger.log(`Beginning performance seed with scale ${scale} and random seed ${randomSeed}...`);
    const startTime = Date.now();
    const stats: Record<string, number> = {};

    const rng = this.createRandomGenerator(randomSeed);
    
    // Config based on scale (scale = number of products)
    const numUsers = Math.max(10, Math.floor(scale / 10)); // e.g. 100K products -> 10K users
    const numSellers = Math.max(5, Math.floor(numUsers * 0.1)); // 10% of users are sellers
    const numBrands = Math.max(10, Math.floor(scale / 100)); // e.g. 100K products -> 1K brands
    
    // We will generate the data directly into DB in chunks of 5000.

    // 1. Generate Users & Sellers & Shops
    this.logger.log(`Generating ${numUsers} Users & Shops...`);
    const userIds = await this.generateUsersAndShops(numUsers, numSellers, rng);
    stats.users = numUsers;
    stats.sellers = numSellers;
    stats.shops = numSellers;

    // 2. Generate Categories
    this.logger.log(`Generating deep category tree...`);
    const categoryIds = await this.generateCategories(rng);
    stats.categories = categoryIds.length;

    // 3. Generate Brands
    this.logger.log(`Generating ${numBrands} Brands...`);
    const brandIds = await this.generateBrands(numBrands, rng);
    stats.brands = numBrands;

    // 4. Generate Products & Variants & SellerProducts & Inventory
    this.logger.log(`Generating ${scale} Products...`);
    const { productsCreated, variantsCreated, sellerProductsCreated } = await this.generateProducts(
      scale, 
      categoryIds, 
      brandIds, 
      userIds.sellers,
      userIds.shops,
      rng
    );
    stats.products = productsCreated;
    stats.variants = variantsCreated;
    stats.sellerProducts = sellerProductsCreated;

    // 5. Update Product Ratings directly from Reviews (Generate Reviews inside generateProducts)
    // We do it directly to save memory.
    
    this.logger.log('Updating PostgreSQL Statistics (ANALYZE)...');
    await this.dataSource.query('ANALYZE;');

    const durationMs = Date.now() - startTime;
    this.logger.log(`Performance seed completed in ${durationMs}ms`);

    return {
      stats: {
        ...stats,
        durationMs,
      },
    };
  }

  private async generateUsersAndShops(numUsers: number, numSellers: number, rng: () => number) {
    const BATCH_SIZE = 5000;
    const users: any[] = [];
    const shops: any[] = [];
    const userIds = { customers: [] as string[], sellers: [] as string[], shops: [] as string[] };

    const prefix = Date.now() % 10000;

    for (let i = 0; i < numUsers; i++) {
      const isSeller = i < numSellers;
      const id = crypto.randomUUID();
      // Use +88099 as a fake prefix for performance testing, perfectly unique per seed and index
      const phone = `+88099${prefix.toString().padStart(4, '0')}${i.toString().padStart(5, '0')}`;
      
      users.push({
        id,
        phone,
        firstName: `TestUser_${i}`,
        lastName: `LoadTest`,
        status: UserStatus.ACTIVE,
        isPhoneVerified: true,
      });

      if (isSeller) {
        userIds.sellers.push(id);
        const shopId = crypto.randomUUID();
        userIds.shops.push(shopId);
        shops.push({
          id: shopId,
          sellerId: id,
          nameEn: `Shop ${i} (Perf-${prefix})`,
          nameBn: `শপ ${prefix}-${i}`,
          slug: `shop-perf-${prefix}-${id}`,
          isActive: true,
        });
      } else {
        userIds.customers.push(id);
      }

      if (users.length >= BATCH_SIZE) {
        await this.dataSource.createQueryBuilder().insert().into(User).values(users).execute();
        if (shops.length > 0) {
          await this.dataSource.createQueryBuilder().insert().into(Shop).values(shops).execute();
          shops.length = 0;
        }
        users.length = 0;
      }
    }

    if (users.length > 0) {
      await this.dataSource.createQueryBuilder().insert().into(User).values(users).execute();
    }
    if (shops.length > 0) {
      await this.dataSource.createQueryBuilder().insert().into(Shop).values(shops).execute();
    }
    
    return userIds;
  }

  private async generateCategories(rng: () => number) {
    const prefix = Date.now() % 10000;
    // Generate a structured tree up to 4 levels deep
    // ~ 10 roots, each 5 children, each 5 children, each 5 children = 10 + 50 + 250 + 1250 = ~1500 categories
    const categories: any[] = [];
    const categoryIds: string[] = [];

    let counter = 0;
    const generateLevel = async (parentId: string | null, path: string, level: number, count: number) => {
      if (level > 4) return;
      const currentLevelIds: string[] = [];
      for (let i = 0; i < count; i++) {
        counter++;
        const id = crypto.randomUUID();
        const newPath = path ? `${path}${id}/` : `${id}/`;
        
        categories.push({
          id,
          nameEn: `Category L${level} - ${prefix}-${counter}`,
          nameBn: `ক্যাটাগরি ${prefix}-${counter}`,
          slug: `category-perf-${prefix}-${counter}`,
          parentId,
          path: newPath,
          isActive: true,
          level,
        });
        currentLevelIds.push(id);
        categoryIds.push(id);
      }

      // Save chunk if needed
      if (categories.length >= 1000) {
        await this.dataSource.createQueryBuilder().insert().into(Category).values(categories).execute();
        categories.length = 0;
      }

      for (const id of currentLevelIds) {
        const childCount = Math.floor(rng() * 5) + 2; // 2 to 6 children
        await generateLevel(id, path ? `${path}${id}/` : `${id}/`, level + 1, childCount);
      }
    };

    await generateLevel(null, '', 1, 10);
    if (categories.length > 0) {
      await this.dataSource.createQueryBuilder().insert().into(Category).values(categories).execute();
    }

    return categoryIds;
  }

  private async generateBrands(numBrands: number, rng: () => number) {
    const prefix = Date.now() % 10000;
    const BATCH_SIZE = 2000;
    const brands: any[] = [];
    const brandIds: string[] = [];

    for (let i = 0; i < numBrands; i++) {
      const id = crypto.randomUUID();
      brands.push({
        id,
        nameEn: `Brand Perf ${prefix}-${i}`,
        nameBn: `ব্র্যান্ড ${prefix}-${i}`,
        slug: `brand-perf-${prefix}-${i}`,
        isActive: true,
      });
      brandIds.push(id);

      if (brands.length >= BATCH_SIZE) {
        await this.dataSource.createQueryBuilder().insert().into(Brand).values(brands).execute();
        brands.length = 0;
      }
    }
    if (brands.length > 0) {
      await this.dataSource.createQueryBuilder().insert().into(Brand).values(brands).execute();
    }
    return brandIds;
  }

  private async generateProducts(
    scale: number, 
    categoryIds: string[], 
    brandIds: string[], 
    sellerIds: string[], 
    shopIds: string[],
    rng: () => number
  ) {
    const prefix = Date.now() % 10000;
    const BATCH_SIZE = 1000;
    let productsCreated = 0;
    let variantsCreated = 0;
    let sellerProductsCreated = 0;
    let reviewsCreated = 0;
    
    const ADJ_EN = ['Smart', 'Wireless', 'Gaming', 'Ergonomic', 'Portable', 'Professional', 'Digital', 'Organic', 'Premium'];
    const NOUN_EN = ['Phone', 'Laptop', 'Mouse', 'Keyboard', 'Headphones', 'Monitor', 'Rice Cooker', 'Shoes', 'Watch'];
    const ADJ_BN = ['স্মার্ট', 'ওয়্যারলেস', 'গেমিং', 'আরামদায়ক', 'পোর্টেবল', 'প্রফেশনাল', 'ডিজিটাল', 'অর্গানিক', 'প্রিমিয়াম'];
    const NOUN_BN = ['ফোন', 'ল্যাপটপ', 'মাউস', 'কিবোর্ড', 'হেডফোন', 'মনিটর', 'রাইস কুকার', 'জুতো', 'ঘড়ি'];

    const products: any[] = [];
    const variants: any[] = [];
    const sellerProducts: any[] = [];
    const inventories: any[] = [];
    const reviews: any[] = [];

    for (let i = 0; i < scale; i++) {
      const adjIdx = Math.floor(rng() * ADJ_EN.length);
      const nounIdx = Math.floor(rng() * NOUN_EN.length);
      const randHex = Math.floor(rng() * 99999).toString(16);
      
      const nameEn = `${ADJ_EN[adjIdx]} ${NOUN_EN[nounIdx]} ${randHex}`;
      const nameBn = `${ADJ_BN[adjIdx]} ${NOUN_BN[nounIdx]} ${randHex}`;
      
      const productId = crypto.randomUUID();
      const categoryId = categoryIds[Math.floor(rng() * categoryIds.length)];
      const brandId = brandIds[Math.floor(rng() * brandIds.length)];
      
      // Determine reviews upfront for denormalization sync
      const reviewCountRand = rng();
      const numReviews = reviewCountRand > 0.95 ? Math.floor(rng() * 100) + 10 : (reviewCountRand > 0.7 ? Math.floor(rng() * 5) + 1 : 0);
      let totalRating = 0;
      
      for (let r = 0; r < numReviews; r++) {
        const rating = Math.floor(rng() * 5) + 1; // 1 to 5
        totalRating += rating;
        reviews.push({
          id: crypto.randomUUID(),
          productId: productId,
          userId: sellerIds[Math.floor(rng() * sellerIds.length)], // just reuse sellerIds as random users for speed
          rating,
          comment: `Performance test review ${r}`,
          isApproved: true,
        });
        reviewsCreated++;
      }
      
      const averageRating = numReviews > 0 ? (totalRating / numReviews).toFixed(2) : 0;

      products.push({
        id: productId,
        nameEn,
        nameBn,
        slug: slugify(`${nameEn}-${prefix}-${i}`),
        categoryId,
        brandId,
        status: ProductStatus.PUBLISHED,
        totalReviews: numReviews,
        averageRating: averageRating,
      });
      productsCreated++;

      const variantId = crypto.randomUUID();
      variants.push({
        id: variantId,
        productId,
        nameEn: `${nameEn} - Base Variant`,
        nameBn: `${nameBn} - বেস ভেরিয়েন্ট`,
        sku: `SKU-PERF-${i}`,
      });
      variantsCreated++;

      // Create 1 to 3 seller products
      const numSellersForProduct = Math.floor(rng() * 3) + 1;
      for (let j = 0; j < numSellersForProduct; j++) {
        const sellerProductId = crypto.randomUUID();
        const shopIndex = Math.floor(rng() * shopIds.length);
        const shopId = shopIds[shopIndex];
        const price = Math.floor(rng() * 10000) + 100;

        sellerProducts.push({
          id: sellerProductId,
          productVariantId: variantId,
          shopId,
          price,
          isActive: true,
        });
        sellerProductsCreated++;

        inventories.push({
          id: crypto.randomUUID(),
          sellerProductId,
          quantity: Math.floor(rng() * 500), // some stock
        });
      }

      if (products.length >= BATCH_SIZE) {
        await this.flushChunks(products, variants, sellerProducts, inventories, reviews);
      }
    }

    if (products.length > 0) {
      await this.flushChunks(products, variants, sellerProducts, inventories, reviews);
    }

    return { productsCreated, variantsCreated, sellerProductsCreated, reviewsCreated };
  }

  private async flushChunks(products: any[], variants: any[], sellerProducts: any[], inventories: any[], reviews: any[]) {
    await this.dataSource.transaction(async manager => {
      if (products.length > 0) {
        await manager.createQueryBuilder().insert().into(Product).values(products).execute();
        products.length = 0;
      }
      if (variants.length > 0) {
        await manager.createQueryBuilder().insert().into(ProductVariant).values(variants).execute();
        variants.length = 0;
      }
      if (sellerProducts.length > 0) {
        await manager.createQueryBuilder().insert().into(SellerProduct).values(sellerProducts).execute();
        sellerProducts.length = 0;
      }
      if (inventories.length > 0) {
        await manager.createQueryBuilder().insert().into(Inventory).values(inventories).execute();
        inventories.length = 0;
      }
      if (reviews.length > 0) {
        // chunk reviews further because they can be a lot
        const chunkSize = 2000;
        for (let i = 0; i < reviews.length; i += chunkSize) {
          const chunk = reviews.slice(i, i + chunkSize);
          await manager.createQueryBuilder().insert().into(Review).values(chunk).execute();
        }
        reviews.length = 0;
      }
    });
  }

  // Simple deterministic random generator based on mulberry32
  private createRandomGenerator(seed: number) {
    return function() {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
}
