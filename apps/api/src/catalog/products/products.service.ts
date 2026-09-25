import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity.js';
import { ProductVariant } from '../entities/product-variant.entity.js';
import { ProductImage } from '../entities/product-image.entity.js';
import { Brand } from '../entities/brand.entity.js';
import { SellerProduct } from '../../inventory/entities/seller-product.entity.js';
import { Shop } from '../../shops/entities/shop.entity.js';
import { Inventory } from '../../inventory/entities/inventory.entity.js';
import { CreateProductDto } from '../dto/create-product.dto.js';
import { UpdateProductDto } from '../dto/update-product.dto.js';
import { ProductStatus } from '../enums/product-status.enum.js';

export interface ProductFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  subCategoryId?: string;
  brandId?: string;
  status?: ProductStatus;
  isActive?: boolean;
  isFeatured?: boolean;
  sort?: string;
}

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantsRepository: Repository<ProductVariant>,
    @InjectRepository(ProductImage)
    private readonly imagesRepository: Repository<ProductImage>,
    @InjectRepository(Brand)
    private readonly brandsRepository: Repository<Brand>,
    @InjectRepository(SellerProduct)
    private readonly sellerProductsRepository: Repository<SellerProduct>,
    @InjectRepository(Shop)
    private readonly shopsRepository: Repository<Shop>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  private async validateBrandCategory(brandId: string, categoryId: string): Promise<void> {
    const brand = await this.brandsRepository.findOne({
      where: { id: brandId },
      relations: ['categories'],
    });
    if (brand && brand.categories && brand.categories.length > 0) {
      const isAssociated = brand.categories.some((c) => c.id === categoryId);
      if (!isAssociated) {
        throw new BadRequestException(
          `Brand "${brand.nameEn}" is not associated with the selected category.`,
        );
      }
    }
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    if (createProductDto.brandId && createProductDto.categoryId) {
      await this.validateBrandCategory(createProductDto.brandId, createProductDto.categoryId);
    }

    const product = this.productsRepository.create({
      ...createProductDto,
      status: createProductDto.status || ProductStatus.DRAFT,
      stock: createProductDto.stock ?? 0,
      isFeatured: createProductDto.isFeatured ?? false,
      isActive: createProductDto.isActive ?? true,
    });

    const savedProduct = await this.productsRepository.save(product);

    // Create default variant for this product
    const variantSku = savedProduct.sku || `${savedProduct.slug}-def`;
    const defaultVariant = this.variantsRepository.create({
      productId: savedProduct.id,
      nameEn: savedProduct.nameEn,
      nameBn: savedProduct.nameBn,
      sku: variantSku,
      isActive: savedProduct.isActive,
      images: [],
    });
    const savedVariant = await this.variantsRepository.save(defaultVariant);

    // Automatically create a SellerProduct for the primary shop so it is immediately
    // accessible in storefront search, product details, cart, and orders
    await this.syncSellerProduct(savedProduct, savedVariant);

    return this.findOne(savedProduct.id);
  }

  async findAll(options: ProductFilterOptions = {}) {
    const {
      page,
      limit,
      search,
      categoryId,
      subCategoryId,
      brandId,
      status,
      isActive,
      isFeatured,
      sort = 'newest',
    } = options;

    const query = this.productsRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.subCategory', 'subCategory')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.variants', 'variants');

    if (search) {
      query.andWhere(
        '(product.nameEn ILIKE :search OR product.nameBn ILIKE :search OR product.slug ILIKE :search OR product.sku ILIKE :search OR product.barcode ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (categoryId) {
      query.andWhere(
        '(product.categoryId = :categoryId OR product.subCategoryId = :categoryId)',
        { categoryId },
      );
    }

    if (subCategoryId) {
      query.andWhere('product.subCategoryId = :subCategoryId', { subCategoryId });
    }

    if (brandId) {
      query.andWhere('product.brandId = :brandId', { brandId });
    }

    if (status) {
      query.andWhere('product.status = :status', { status });
    }

    if (isActive !== undefined) {
      query.andWhere('product.isActive = :isActive', { isActive });
    }

    if (isFeatured !== undefined) {
      query.andWhere('product.isFeatured = :isFeatured', { isFeatured });
    }

    switch (sort) {
      case 'price_asc':
        query.orderBy('product.price', 'ASC');
        break;
      case 'price_desc':
        query.orderBy('product.price', 'DESC');
        break;
      case 'name_asc':
        query.orderBy('product.nameEn', 'ASC');
        break;
      case 'oldest':
        query.orderBy('product.createdAt', 'ASC');
        break;
      case 'newest':
      default:
        query.orderBy('product.createdAt', 'DESC');
        break;
    }

    if (!page || !limit) {
      const data = await query.getMany();
      return {
        data,
        meta: {
          total: data.length,
          page: 1,
          limit: data.length,
          totalPages: 1,
        },
      };
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

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['category', 'subCategory', 'brand', 'images', 'variants'],
      order: {
        images: {
          isPrimary: 'DESC',
          sortOrder: 'ASC',
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { slug },
      relations: ['category', 'subCategory', 'brand', 'images', 'variants'],
      order: {
        images: {
          isPrimary: 'DESC',
          sortOrder: 'ASC',
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    const effectiveBrandId = updateProductDto.brandId !== undefined ? updateProductDto.brandId : product.brandId;
    const effectiveCategoryId = updateProductDto.categoryId !== undefined ? updateProductDto.categoryId : product.categoryId;
    if (effectiveBrandId && effectiveCategoryId) {
      await this.validateBrandCategory(effectiveBrandId, effectiveCategoryId);
    }

    Object.assign(product, updateProductDto);

    const saved = await this.productsRepository.save(product);

    // Update variant SKU and images if modified
    const defaultVariant = await this.variantsRepository.findOne({
      where: { productId: id },
    });

    if (defaultVariant) {
      if (updateProductDto.sku) {
        defaultVariant.sku = updateProductDto.sku;
      }
      if (updateProductDto.nameEn) {
        defaultVariant.nameEn = updateProductDto.nameEn;
      }
      if (updateProductDto.nameBn) {
        defaultVariant.nameBn = updateProductDto.nameBn;
      }
      await this.variantsRepository.save(defaultVariant);
      await this.syncSellerProduct(saved, defaultVariant);
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);

    // Soft delete / archive to protect existing orders and relations
    product.isActive = false;
    product.status = ProductStatus.ARCHIVED;
    await this.productsRepository.save(product);

    // Also deactivate variants and seller products
    await this.variantsRepository.update({ productId: id }, { isActive: false });
    const variants = await this.variantsRepository.find({ where: { productId: id } });
    for (const v of variants) {
      await this.sellerProductsRepository.update({ productVariantId: v.id }, { isActive: false });
    }
  }

  /**
   * Helper to ensure a SellerProduct and Inventory record exist for this product
   * so that storefront customers can browse, view details, and add to cart.
   */
  private async syncSellerProduct(product: Product, variant: ProductVariant): Promise<void> {
    try {
      const defaultShop = await this.shopsRepository.findOne({
        where: { isActive: true },
        order: { createdAt: 'ASC' },
      });

      if (!defaultShop) {
        return;
      }

      let sellerProduct = await this.sellerProductsRepository.findOne({
        where: { productVariantId: variant.id, shopId: defaultShop.id },
        relations: ['inventory'],
      });

      const price = Number(product.price ?? 0);
      const discountPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;

      if (!sellerProduct) {
        sellerProduct = this.sellerProductsRepository.create({
          shopId: defaultShop.id,
          productVariantId: variant.id,
          price,
          discountPrice,
          sellerSku: variant.sku,
          isActive: product.isActive,
          isRegulatedApproved: true,
        });
        sellerProduct = await this.sellerProductsRepository.save(sellerProduct);
      } else {
        sellerProduct.price = price;
        sellerProduct.discountPrice = discountPrice;
        sellerProduct.isActive = product.isActive;
        sellerProduct = await this.sellerProductsRepository.save(sellerProduct);
      }

      // Sync inventory quantity
      const stock = product.stock ?? 0;
      let inventory = await this.inventoryRepository.findOne({
        where: { sellerProductId: sellerProduct.id },
      });

      if (!inventory) {
        inventory = this.inventoryRepository.create({
          sellerProductId: sellerProduct.id,
          quantity: stock,
          lowStockThreshold: 5,
        });
      } else {
        inventory.quantity = stock;
      }
      await this.inventoryRepository.save(inventory);
    } catch (err: unknown) {
      this.logger.warn(`Could not sync seller product for product ${product.id}: ${(err as Error).message}`);
    }
  }
}
