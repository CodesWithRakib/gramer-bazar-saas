import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SellerProductsService } from './seller-products.service.js';
import { Shop } from '../shops/entities/shop.entity.js';
import { SellerProduct } from '../inventory/entities/seller-product.entity.js';
import { Inventory } from '../inventory/entities/inventory.entity.js';
import { Product } from '../catalog/entities/product.entity.js';
import { ProductVariant } from '../catalog/entities/product-variant.entity.js';
import { ProductImage } from '../catalog/entities/product-image.entity.js';
import { Category } from '../catalog/entities/category.entity.js';
import { Brand } from '../catalog/entities/brand.entity.js';
import { ProductImageService } from '../catalog/products/product-image.service.js';

describe('SellerProductsService', () => {
  let service: SellerProductsService;

  const shopRepository = { findOne: vi.fn() };
  const sellerProductRepository = { findOne: vi.fn(), find: vi.fn() };
  const categoryRepository = { findOne: vi.fn(), find: vi.fn() };
  const brandRepository = { findOne: vi.fn(), find: vi.fn() };
  const productImageService = {
    uploadImages: vi.fn(),
    setPrimaryImage: vi.fn(),
    reorderImages: vi.fn(),
    deleteImage: vi.fn(),
  };

  const ownedListing = {
    id: 'listing-1',
    shopId: 'shop-1',
    productVariantId: 'variant-1',
    price: 100,
    discountPrice: null,
    isActive: true,
    productVariant: {
      id: 'variant-1',
      sku: 'SKU-1',
      product: {
        id: 'product-1',
        ownerShopId: 'shop-1',
        nameEn: 'Owned Product',
        nameBn: 'নিজের পণ্য',
        category: { id: 'cat-1', nameEn: 'Cat', nameBn: 'ক্যাট' },
        images: [],
      },
    },
    inventory: { id: 'inv-1', quantity: 10, reservedQuantity: 0, lowStockThreshold: 5 },
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    shopRepository.findOne.mockResolvedValue({ id: 'shop-1', sellerId: 'seller-1', isActive: true });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SellerProductsService,
        { provide: getRepositoryToken(Shop), useValue: shopRepository },
        { provide: getRepositoryToken(SellerProduct), useValue: sellerProductRepository },
        { provide: getRepositoryToken(Inventory), useValue: {} },
        { provide: getRepositoryToken(Product), useValue: {} },
        { provide: getRepositoryToken(ProductVariant), useValue: {} },
        {
          provide: getRepositoryToken(ProductImage),
          useValue: { find: vi.fn(), count: vi.fn() },
        },
        { provide: getRepositoryToken(Category), useValue: categoryRepository },
        { provide: getRepositoryToken(Brand), useValue: brandRepository },
        { provide: ProductImageService, useValue: productImageService },
        { provide: DataSource, useValue: { query: vi.fn(), transaction: vi.fn() } },
      ],
    }).compile();

    service = module.get<SellerProductsService>(SellerProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects reading a listing that belongs to another shop', async () => {
    sellerProductRepository.findOne.mockResolvedValue(null);

    await expect(service.getProduct('seller-1', 'someone-elses-listing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('scopes the listing lookup to the seller shop', async () => {
    sellerProductRepository.findOne.mockResolvedValue(null);

    await service.getProduct('seller-1', 'listing-1').catch(() => undefined);

    expect(sellerProductRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'listing-1', shopId: 'shop-1' } }),
    );
  });

  it('forbids editing catalog fields on a platform-owned product', async () => {
    sellerProductRepository.findOne.mockResolvedValue({
      ...ownedListing,
      productVariant: {
        ...ownedListing.productVariant,
        product: { ...ownedListing.productVariant.product, ownerShopId: null },
      },
    });

    await expect(
      service.updateProduct('seller-1', 'listing-1', { nameEn: 'Hijacked name' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('forbids uploading images to a platform-owned product', async () => {
    sellerProductRepository.findOne.mockResolvedValue({
      ...ownedListing,
      productVariant: {
        ...ownedListing.productVariant,
        product: { ...ownedListing.productVariant.product, ownerShopId: 'another-shop' },
      },
    });

    await expect(
      service.uploadImages('seller-1', 'listing-1', [
        { buffer: Buffer.from('x'), mimetype: 'image/webp', size: 1, originalname: 'a.webp' },
      ] as Express.Multer.File[]),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(productImageService.uploadImages).not.toHaveBeenCalled();
  });

  it('rejects a discount price that is not below the regular price', async () => {
    sellerProductRepository.findOne.mockResolvedValue(ownedListing);

    await expect(
      service.updateProduct('seller-1', 'listing-1', { price: 100, discountPrice: 100 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects negative quantities from bulk stock updates', async () => {
    sellerProductRepository.find.mockResolvedValue([]);

    await expect(
      service.bulkUpdateStock('seller-1', [{ id: 'listing-1', quantity: -5 }]),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
