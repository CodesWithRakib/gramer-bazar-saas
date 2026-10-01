import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, In, Repository } from 'typeorm';
import { Product } from '../catalog/entities/product.entity.js';
import { ProductVariant } from '../catalog/entities/product-variant.entity.js';
import { ProductImage } from '../catalog/entities/product-image.entity.js';
import { Category } from '../catalog/entities/category.entity.js';
import { Brand } from '../catalog/entities/brand.entity.js';
import { ProductStatus } from '../catalog/enums/product-status.enum.js';
import { SellerProduct } from '../inventory/entities/seller-product.entity.js';
import { Inventory } from '../inventory/entities/inventory.entity.js';
import { Shop } from '../shops/entities/shop.entity.js';
import { ProductImageService } from '../catalog/products/product-image.service.js';
import { CreateSellerProductDto } from './dto/create-seller-product.dto.js';
import { UpdateSellerProductDto } from './dto/update-seller-product.dto.js';
import { SellerProductQueryDto } from './dto/seller-query.dto.js';
import { SellerProductDetailDto, SellerProductListDto } from './dto/seller-product-response.dto.js';
import { slugify, slugifyUnique } from '../common/utils/slug.js';

/** Internal projection of a listing joined with everything the API returns. */
interface ListingRow {
  sellerProduct: SellerProduct;
  product: Product | null;
  variant: ProductVariant | null;
  category: Category | null;
  subCategory: Category | null;
  brand: Brand | null;
}

@Injectable()
export class SellerProductsService {
  constructor(
    @InjectRepository(SellerProduct)
    private readonly sellerProductRepository: Repository<SellerProduct>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(ProductImage)
    private readonly imageRepository: Repository<ProductImage>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    private readonly productImageService: ProductImageService,
    private readonly dataSource: DataSource,
  ) {}

  // ---------------------------------------------------------------- helpers

  async getShopForSeller(sellerId: string, assertActive = false): Promise<Shop> {
    const shop = await this.shopRepository.findOne({ where: { sellerId } });
    if (!shop) {
      throw new NotFoundException('Shop not found for this seller');
    }
    if (assertActive && !shop.isActive) {
      throw new ForbiddenException(
        'Your shop has been deactivated or suspended by platform administration.',
      );
    }
    return shop;
  }

  /**
   * Loads a listing by id and asserts it belongs to the seller's shop.
   * Every public method funnels through here so no seller can reach another
   * shop's product by guessing a UUID.
   */
  private async loadOwnedListing(
    sellerId: string,
    listingId: string,
    assertActive = false,
  ): Promise<{ shop: Shop; listing: SellerProduct; product: Product | null }> {
    const shop = await this.getShopForSeller(sellerId, assertActive);

    const listing = await this.sellerProductRepository.findOne({
      where: { id: listingId, shopId: shop.id },
      relations: [
        'inventory',
        'productVariant',
        'productVariant.product',
        'productVariant.product.category',
        'productVariant.product.subCategory',
        'productVariant.product.brand',
      ],
    });

    if (!listing) {
      // Either it does not exist or it belongs to another shop — never reveal which.
      throw new NotFoundException('Product not found in your shop');
    }

    return { shop, listing, product: listing.productVariant?.product ?? null };
  }

  /** Catalog/media writes are only allowed on products the shop itself created. */
  private assertOwnsCatalogProduct(
    product: Product | null,
    shopId: string,
  ): asserts product is Product {
    if (!product || product.ownerShopId !== shopId) {
      throw new ForbiddenException(
        'This product belongs to the platform catalog. You can update your price and stock, but not its catalog details or images.',
      );
    }
  }

  private validatePricing(price: number, discountPrice?: number | null): void {
    if (!Number.isFinite(price) || price <= 0) {
      throw new BadRequestException('Price must be greater than zero');
    }
    if (discountPrice !== undefined && discountPrice !== null) {
      if (!Number.isFinite(discountPrice) || discountPrice < 0) {
        throw new BadRequestException('Discount price cannot be negative');
      }
      if (discountPrice >= price) {
        throw new BadRequestException('Discount price must be lower than the regular price');
      }
    }
  }

  private stockState(available: number, threshold: number): 'OUT_OF_STOCK' | 'LOW' | 'IN_STOCK' {
    if (available <= 0) return 'OUT_OF_STOCK';
    if (available <= threshold) return 'LOW';
    return 'IN_STOCK';
  }

  private async buildListingRows(listings: SellerProduct[]): Promise<ListingRow[]> {
    return listings.map((sellerProduct) => ({
      sellerProduct,
      product: sellerProduct.productVariant?.product ?? null,
      variant: sellerProduct.productVariant ?? null,
      category: sellerProduct.productVariant?.product?.category ?? null,
      subCategory: sellerProduct.productVariant?.product?.subCategory ?? null,
      brand: sellerProduct.productVariant?.product?.brand ?? null,
    }));
  }

  private async unitsSoldByListing(listingIds: string[]): Promise<Map<string, number>> {
    if (listingIds.length === 0) return new Map();

    const rows: Array<{ seller_product_id: string; quantity: string }> =
      await this.dataSource.query(
        `SELECT oi.seller_product_id, COALESCE(SUM(oi.quantity), 0)::int AS quantity
           FROM order_items oi
           JOIN orders o ON o.id = oi.order_id
          WHERE oi.seller_product_id = ANY($1::uuid[])
            AND o.status NOT IN ('CANCELLED', 'FAILED')
          GROUP BY oi.seller_product_id`,
        [listingIds],
      );

    return new Map(rows.map((r) => [r.seller_product_id, Number(r.quantity)]));
  }

  private async imagesByProduct(productIds: string[]): Promise<Map<string, ProductImage[]>> {
    if (productIds.length === 0) return new Map();

    const images = await this.imageRepository.find({
      where: { productId: In(productIds) },
      order: { isPrimary: 'DESC', sortOrder: 'ASC' },
    });

    const map = new Map<string, ProductImage[]>();
    for (const image of images) {
      const list = map.get(image.productId) ?? [];
      list.push(image);
      map.set(image.productId, list);
    }
    return map;
  }

  private toDetailDto(
    row: ListingRow,
    images: ProductImage[],
    totalSold: number,
    shopId: string,
  ): SellerProductDetailDto {
    const { sellerProduct, product, variant, category, subCategory, brand } = row;
    const inventory = sellerProduct.inventory;
    const quantity = inventory?.quantity ?? 0;
    const reserved = inventory?.reservedQuantity ?? 0;
    const threshold = inventory?.lowStockThreshold ?? 5;
    const available = Math.max(0, quantity - reserved);
    const price = Number(sellerProduct.price ?? 0);
    const discountPrice =
      sellerProduct.discountPrice === null || sellerProduct.discountPrice === undefined
        ? null
        : Number(sellerProduct.discountPrice);

    return {
      id: sellerProduct.id,
      shopId: sellerProduct.shopId,
      productVariantId: sellerProduct.productVariantId,
      productId: product?.id ?? '',
      isOwned: !!product && product.ownerShopId === shopId,
      nameEn: product?.nameEn ?? variant?.nameEn ?? '',
      nameBn: product?.nameBn ?? variant?.nameBn ?? '',
      shortDescriptionEn: product?.shortDescriptionEn ?? null,
      shortDescriptionBn: product?.shortDescriptionBn ?? null,
      descriptionEn: product?.descriptionEn ?? null,
      descriptionBn: product?.descriptionBn ?? null,
      slug: product?.slug ?? null,
      sku: variant?.sku ?? null,
      sellerSku: sellerProduct.sellerSku,
      unit: product?.unit ?? null,
      categoryId: product?.categoryId ?? null,
      categoryNameEn: category?.nameEn ?? null,
      categoryNameBn: category?.nameBn ?? null,
      subCategoryId: product?.subCategoryId ?? null,
      subCategoryNameEn: subCategory?.nameEn ?? null,
      subCategoryNameBn: subCategory?.nameBn ?? null,
      brandId: product?.brandId ?? null,
      brandNameEn: brand?.nameEn ?? null,
      brandNameBn: brand?.nameBn ?? null,
      price,
      discountPrice,
      effectivePrice: discountPrice !== null && discountPrice > 0 ? discountPrice : price,
      isActive: sellerProduct.isActive,
      quantity,
      reservedQuantity: reserved,
      lowStockThreshold: threshold,
      stockState: this.stockState(available, threshold),
      isLowStock: available <= threshold,
      images: images.map((image) => ({
        id: image.id,
        url: image.url,
        storagePath: image.storagePath,
        filename: image.filename,
        mimeType: image.mimeType,
        sizeBytes: image.sizeBytes,
        isPrimary: image.isPrimary,
        sortOrder: image.sortOrder,
        altText: image.altText,
      })),
      totalSold,
      createdAt: sellerProduct.createdAt?.toISOString?.() ?? String(sellerProduct.createdAt),
      updatedAt: sellerProduct.updatedAt?.toISOString?.() ?? String(sellerProduct.updatedAt),
    };
  }

  // ------------------------------------------------------------------ reads

  async listProducts(
    sellerId: string,
    query: SellerProductQueryDto,
  ): Promise<SellerProductListDto> {
    const shop = await this.getShopForSeller(sellerId);
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

    const qb = this.sellerProductRepository
      .createQueryBuilder('sp')
      .leftJoinAndSelect('sp.inventory', 'inventory')
      .leftJoinAndSelect('sp.productVariant', 'variant')
      .leftJoinAndSelect('variant.product', 'product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.subCategory', 'subCategory')
      .leftJoinAndSelect('product.brand', 'brand')
      .where('sp.shopId = :shopId', { shopId: shop.id });

    const search = query.search?.trim();
    if (search) {
      qb.andWhere(
        new Brackets((w) => {
          w.where('product.nameEn ILIKE :search', { search: `%${search}%` })
            .orWhere('product.nameBn ILIKE :search', { search: `%${search}%` })
            .orWhere('variant.sku ILIKE :search', { search: `%${search}%` })
            .orWhere('sp.sellerSku ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    const status = query.status ?? 'ALL';
    if (status === 'ACTIVE') qb.andWhere('sp.isActive = true');
    if (status === 'INACTIVE') qb.andWhere('sp.isActive = false');

    if (query.categoryId) {
      qb.andWhere('(product.categoryId = :categoryId OR product.subCategoryId = :categoryId)', {
        categoryId: query.categoryId,
      });
    }

    const stock = query.stock ?? 'ALL';
    if (stock === 'OUT_OF_STOCK') {
      qb.andWhere('(inventory.quantity - inventory.reservedQuantity) <= 0');
    } else if (stock === 'LOW_STOCK') {
      qb.andWhere(
        '(inventory.quantity - inventory.reservedQuantity) <= inventory.lowStockThreshold',
      );
    } else if (stock === 'IN_STOCK') {
      qb.andWhere(
        '(inventory.quantity - inventory.reservedQuantity) > inventory.lowStockThreshold',
      );
    }

    switch (query.sort) {
      case 'oldest':
        qb.orderBy('sp.createdAt', 'ASC');
        break;
      case 'price_asc':
        qb.orderBy('sp.price', 'ASC');
        break;
      case 'price_desc':
        qb.orderBy('sp.price', 'DESC');
        break;
      default:
        qb.orderBy('sp.createdAt', 'DESC');
        break;
    }

    const [listings, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const rows = await this.buildListingRows(listings);
    const productIds = rows.map((r) => r.product?.id).filter((id): id is string => !!id);
    const [images, soldMap, stats] = await Promise.all([
      this.imagesByProduct(productIds),
      this.unitsSoldByListing(rows.map((r) => r.sellerProduct.id)),
      this.inventoryStats(shop.id),
    ]);

    const data = rows.map((row) =>
      this.toDetailDto(
        row,
        row.product ? (images.get(row.product.id) ?? []) : [],
        soldMap.get(row.sellerProduct.id) ?? 0,
        shop.id,
      ),
    );

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      lowStockCount: stats.lowStockCount,
      outOfStockCount: stats.outOfStockCount,
    };
  }

  private async inventoryStats(shopId: string): Promise<{
    lowStockCount: number;
    outOfStockCount: number;
  }> {
    const row: { low_stock: string; out_of_stock: string } | undefined =
      await this.dataSource.query(
        `SELECT
           COUNT(*) FILTER (
             WHERE (inv.quantity - inv.reserved_quantity) > 0
               AND (inv.quantity - inv.reserved_quantity) <= inv.low_stock_threshold
           )::int AS low_stock,
           COUNT(*) FILTER (WHERE (inv.quantity - inv.reserved_quantity) <= 0)::int AS out_of_stock
         FROM seller_products sp
         JOIN inventory inv ON inv.seller_product_id = sp.id
        WHERE sp.shop_id = $1 AND sp.is_active = true`,
        [shopId],
      );

    return {
      lowStockCount: Number(row?.low_stock ?? 0),
      outOfStockCount: Number(row?.out_of_stock ?? 0),
    };
  }

  async getProduct(sellerId: string, listingId: string): Promise<SellerProductDetailDto> {
    const { shop, listing, product } = await this.loadOwnedListing(sellerId, listingId);
    const [images, soldMap] = await Promise.all([
      product ? this.imagesByProduct([product.id]) : Promise.resolve(new Map()),
      this.unitsSoldByListing([listing.id]),
    ]);

    const row: ListingRow = {
      sellerProduct: listing,
      product,
      variant: listing.productVariant ?? null,
      category: listing.productVariant?.product?.category ?? null,
      subCategory: listing.productVariant?.product?.subCategory ?? null,
      brand: listing.productVariant?.product?.brand ?? null,
    };

    return this.toDetailDto(
      row,
      product ? (images.get(product.id) ?? []) : [],
      soldMap.get(listing.id) ?? 0,
      shop.id,
    );
  }

  async listCategories() {
    return this.categoryRepository.find({
      where: { isActive: true },
      order: { nameEn: 'ASC' },
    });
  }

  async listBrands() {
    return this.brandRepository.find({ where: { isActive: true }, order: { nameEn: 'ASC' } });
  }

  // ----------------------------------------------------------------- writes

  async createProduct(
    sellerId: string,
    dto: CreateSellerProductDto,
  ): Promise<SellerProductDetailDto> {
    const shop = await this.getShopForSeller(sellerId, true);
    this.validatePricing(dto.price, dto.discountPrice ?? null);

    const category = await this.categoryRepository.findOne({ where: { id: dto.categoryId } });
    if (!category) {
      throw new BadRequestException('Selected category does not exist');
    }

    if (dto.subCategoryId) {
      const subCategory = await this.categoryRepository.findOne({
        where: { id: dto.subCategoryId },
      });
      if (!subCategory) {
        throw new BadRequestException('Selected sub-category does not exist');
      }
    }

    if (dto.brandId) {
      const brand = await this.brandRepository.findOne({ where: { id: dto.brandId } });
      if (!brand) {
        throw new BadRequestException('Selected brand does not exist');
      }
    }

    const listingId = await this.dataSource.transaction(async (manager) => {
      const product = manager.create(Product, {
        ownerShopId: shop.id,
        categoryId: dto.categoryId,
        subCategoryId: dto.subCategoryId ?? null,
        brandId: dto.brandId ?? null,
        nameEn: dto.nameEn.trim(),
        nameBn: dto.nameBn.trim(),
        slug: slugifyUnique(dto.nameEn, 'product', 90),
        shortDescriptionEn: dto.shortDescriptionEn ?? null,
        shortDescriptionBn: dto.shortDescriptionBn ?? null,
        descriptionEn: dto.descriptionEn ?? null,
        descriptionBn: dto.descriptionBn ?? null,
        sku: dto.sku ?? null,
        price: dto.price,
        compareAtPrice: dto.discountPrice ?? null,
        stock: dto.quantity,
        unit: dto.unit ?? null,
        status: dto.isActive === false ? ProductStatus.DRAFT : ProductStatus.PUBLISHED,
        isActive: dto.isActive ?? true,
        source: 'seller',
      });

      const savedProduct = await manager.save(Product, product);

      const variantSku =
        dto.sku?.trim() || `${slugify(dto.nameEn, 'product', 40)}-${Date.now().toString(36)}`;

      const variant = manager.create(ProductVariant, {
        productId: savedProduct.id,
        nameEn: savedProduct.nameEn,
        nameBn: savedProduct.nameBn,
        sku: variantSku,
        isActive: savedProduct.isActive,
        images: [],
      });
      const savedVariant = await manager.save(ProductVariant, variant);

      const sellerProduct = manager.create(SellerProduct, {
        shopId: shop.id,
        productVariantId: savedVariant.id,
        price: dto.price,
        discountPrice: dto.discountPrice ?? null,
        sellerSku: dto.sku ?? null,
        isActive: dto.isActive ?? true,
      });
      const savedListing = await manager.save(SellerProduct, sellerProduct);

      const inventory = manager.create(Inventory, {
        sellerProductId: savedListing.id,
        quantity: dto.quantity,
        reservedQuantity: 0,
        lowStockThreshold: dto.lowStockThreshold ?? 5,
      });
      await manager.save(Inventory, inventory);

      return savedListing.id;
    });

    return this.getProduct(sellerId, listingId);
  }

  async updateProduct(
    sellerId: string,
    listingId: string,
    dto: UpdateSellerProductDto,
  ): Promise<SellerProductDetailDto> {
    const { shop, listing, product } = await this.loadOwnedListing(sellerId, listingId, true);

    const nextPrice = dto.price ?? Number(listing.price);
    const nextDiscount =
      dto.discountPrice !== undefined
        ? dto.discountPrice
        : listing.discountPrice !== null && listing.discountPrice !== undefined
          ? Number(listing.discountPrice)
          : null;

    if (dto.price !== undefined || dto.discountPrice !== undefined) {
      this.validatePricing(nextPrice, nextDiscount);
    }

    const catalogFields = [
      'nameEn',
      'nameBn',
      'categoryId',
      'subCategoryId',
      'brandId',
      'shortDescriptionEn',
      'shortDescriptionBn',
      'descriptionEn',
      'descriptionBn',
      'unit',
    ] as const;
    const touchesCatalog = catalogFields.some((key) => dto[key] !== undefined);
    if (touchesCatalog) {
      this.assertOwnsCatalogProduct(product, shop.id);
    }

    await this.dataSource.transaction(async (manager) => {
      const current = await manager.findOne(SellerProduct, {
        where: { id: listing.id, shopId: shop.id },
        relations: ['inventory'],
      });
      if (!current) {
        throw new NotFoundException('Product not found in your shop');
      }

      if (dto.price !== undefined) current.price = dto.price;
      if (dto.discountPrice !== undefined) current.discountPrice = dto.discountPrice;
      if (dto.sellerSku !== undefined) current.sellerSku = dto.sellerSku;
      if (dto.isActive !== undefined) current.isActive = dto.isActive;
      await manager.save(SellerProduct, current);

      if (dto.quantity !== undefined || dto.lowStockThreshold !== undefined) {
        const inventory = current.inventory;
        if (!inventory) {
          throw new NotFoundException('Inventory record missing for this product');
        }
        if (dto.quantity !== undefined) {
          if (dto.quantity < (inventory.reservedQuantity ?? 0)) {
            throw new BadRequestException(
              `Stock cannot be set below the reserved quantity (${inventory.reservedQuantity})`,
            );
          }
          inventory.quantity = dto.quantity;
        }
        if (dto.lowStockThreshold !== undefined) {
          inventory.lowStockThreshold = dto.lowStockThreshold;
        }
        await manager.save(Inventory, inventory);
      }

      if (touchesCatalog && product) {
        const catalog = await manager.findOne(Product, { where: { id: product.id } });
        if (catalog) {
          if (dto.nameEn !== undefined) catalog.nameEn = dto.nameEn;
          if (dto.nameBn !== undefined) catalog.nameBn = dto.nameBn;
          if (dto.categoryId !== undefined) catalog.categoryId = dto.categoryId;
          if (dto.subCategoryId !== undefined) catalog.subCategoryId = dto.subCategoryId;
          if (dto.brandId !== undefined) catalog.brandId = dto.brandId;
          if (dto.shortDescriptionEn !== undefined)
            catalog.shortDescriptionEn = dto.shortDescriptionEn;
          if (dto.shortDescriptionBn !== undefined)
            catalog.shortDescriptionBn = dto.shortDescriptionBn;
          if (dto.descriptionEn !== undefined) catalog.descriptionEn = dto.descriptionEn;
          if (dto.descriptionBn !== undefined) catalog.descriptionBn = dto.descriptionBn;
          if (dto.unit !== undefined) catalog.unit = dto.unit;
          if (dto.quantity !== undefined) catalog.stock = dto.quantity;
          if (dto.isActive !== undefined) {
            catalog.isActive = dto.isActive;
            catalog.status = dto.isActive ? ProductStatus.PUBLISHED : ProductStatus.DRAFT;
          }
          await manager.save(Product, catalog);

          const variant = await manager.findOne(ProductVariant, {
            where: { id: listing.productVariantId },
          });
          if (variant) {
            if (dto.nameEn !== undefined) variant.nameEn = dto.nameEn;
            if (dto.nameBn !== undefined) variant.nameBn = dto.nameBn;
            if (dto.isActive !== undefined) variant.isActive = dto.isActive;
            await manager.save(ProductVariant, variant);
          }
        }
      }
    });

    return this.getProduct(sellerId, listingId);
  }

  /**
   * Soft-archives a listing. Seller-created products are also unpublished so
   * they disappear from the storefront, while reused platform catalog products
   * stay intact for other shops.
   */
  async archiveProduct(sellerId: string, listingId: string): Promise<SellerProductDetailDto> {
    const { shop, listing, product } = await this.loadOwnedListing(sellerId, listingId, true);

    await this.dataSource.transaction(async (manager) => {
      await manager.update(SellerProduct, { id: listing.id }, { isActive: false });

      if (product && product.ownerShopId === shop.id) {
        await manager.update(
          Product,
          { id: product.id },
          { isActive: false, status: ProductStatus.ARCHIVED },
        );
        await manager.update(ProductVariant, { id: listing.productVariantId }, { isActive: false });
      }
    });

    return this.getProduct(sellerId, listingId);
  }

  // ----------------------------------------------------------------- images

  async uploadImages(
    sellerId: string,
    listingId: string,
    files: Express.Multer.File[],
  ): Promise<SellerProductDetailDto> {
    const { shop, product } = await this.loadOwnedListing(sellerId, listingId, true);
    this.assertOwnsCatalogProduct(product, shop.id);

    if (!files || files.length === 0) {
      throw new BadRequestException('At least one image file is required');
    }

    await this.productImageService.uploadImages(product.id, files, {
      storageNamespace: 'seller',
      altText: product.nameEn,
    });

    return this.getProduct(sellerId, listingId);
  }

  async setPrimaryImage(
    sellerId: string,
    listingId: string,
    imageId: string,
  ): Promise<SellerProductDetailDto> {
    const { shop, product } = await this.loadOwnedListing(sellerId, listingId, true);
    this.assertOwnsCatalogProduct(product, shop.id);

    await this.productImageService.setPrimaryImage(product.id, imageId);
    return this.getProduct(sellerId, listingId);
  }

  async reorderImages(
    sellerId: string,
    listingId: string,
    imageIds: string[],
  ): Promise<SellerProductDetailDto> {
    const { shop, product } = await this.loadOwnedListing(sellerId, listingId, true);
    this.assertOwnsCatalogProduct(product, shop.id);

    const owned = await this.imageRepository.find({ where: { productId: product.id } });
    const ownedIds = new Set(owned.map((image) => image.id));
    if (imageIds.some((id) => !ownedIds.has(id))) {
      throw new ForbiddenException('One or more images do not belong to this product');
    }

    await this.productImageService.reorderImages(product.id, imageIds);
    return this.getProduct(sellerId, listingId);
  }

  async deleteImage(
    sellerId: string,
    listingId: string,
    imageId: string,
  ): Promise<SellerProductDetailDto> {
    const { shop, product } = await this.loadOwnedListing(sellerId, listingId, true);
    this.assertOwnsCatalogProduct(product, shop.id);

    await this.productImageService.deleteImage(product.id, imageId);
    return this.getProduct(sellerId, listingId);
  }

  // -------------------------------------------------------------- inventory

  async updateStock(
    sellerId: string,
    listingId: string,
    quantity: number,
    lowStockThreshold?: number,
  ): Promise<SellerProductDetailDto> {
    return this.updateProduct(sellerId, listingId, {
      quantity,
      lowStockThreshold,
    });
  }

  /** Bulk stock update used by the inventory workspace. */
  async bulkUpdateStock(
    sellerId: string,
    updates: Array<{ id: string; quantity: number; lowStockThreshold?: number }>,
  ): Promise<{ updated: number }> {
    const shop = await this.getShopForSeller(sellerId, true);

    const uniqueIds = [...new Set(updates.map((u) => u.id))];
    const listings = await this.sellerProductRepository.find({
      where: { id: In(uniqueIds), shopId: shop.id },
      relations: ['inventory', 'productVariant'],
    });

    if (listings.length !== uniqueIds.length) {
      throw new ForbiddenException('One or more products do not belong to your shop');
    }

    await this.dataSource.transaction(async (manager) => {
      for (const update of updates) {
        const listing = listings.find((l) => l.id === update.id);
        if (!listing?.inventory) continue;

        const reserved = listing.inventory.reservedQuantity ?? 0;
        if (update.quantity < reserved) {
          throw new BadRequestException(
            `Stock for one product cannot be set below its reserved quantity (${reserved})`,
          );
        }

        listing.inventory.quantity = update.quantity;
        if (update.lowStockThreshold !== undefined) {
          listing.inventory.lowStockThreshold = update.lowStockThreshold;
        }
        await manager.save(Inventory, listing.inventory);

        // Keep the platform catalog stock mirror in sync for seller-owned products.
        const productId = listing.productVariant?.productId;
        if (productId) {
          await manager
            .createQueryBuilder()
            .update(Product)
            .set({ stock: update.quantity })
            .where('id = :productId AND owner_shop_id = :shopId', {
              productId,
              shopId: shop.id,
            })
            .execute();
        }
      }
    });

    return { updated: listings.length };
  }
}
