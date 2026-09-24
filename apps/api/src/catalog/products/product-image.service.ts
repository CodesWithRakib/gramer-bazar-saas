import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductImage } from '../entities/product-image.entity.js';
import { Product } from '../entities/product.entity.js';
import { ProductVariant } from '../entities/product-variant.entity.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class ProductImageService {
  private readonly logger = new Logger(ProductImageService.name);

  constructor(
    @InjectRepository(ProductImage)
    private readonly imageRepository: Repository<ProductImage>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
  ) {}

  /**
   * Validate image magic bytes to ensure file is legitimate JPEG, PNG, or WEBP.
   */
  validateImageBuffer(buffer: Buffer): { isValid: boolean; mimeType: string; ext: string } {
    if (!buffer || buffer.length < 12) {
      return { isValid: false, mimeType: '', ext: '' };
    }

    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return { isValid: true, mimeType: 'image/jpeg', ext: '.jpg' };
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    ) {
      return { isValid: true, mimeType: 'image/png', ext: '.png' };
    }

    // WEBP: 'RIFF'....'WEBP'
    if (
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP'
    ) {
      return { isValid: true, mimeType: 'image/webp', ext: '.webp' };
    }

    return { isValid: false, mimeType: '', ext: '' };
  }

  /**
   * Generates a safe storage path organized by Year/Month
   * E.g. uploads/products/2026/09/uuid.webp
   */
  getStorageDetails(ext: string): {
    relativeStoragePath: string;
    publicUrl: string;
    absoluteFilePath: string;
    filename: string;
  } {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const filename = `${randomUUID()}${ext}`;

    const relativeFolder = path.join('products', year, month);
    const relativeStoragePath = path.join(relativeFolder, filename).replace(/\\/g, '/');
    const publicUrl = `/uploads/${relativeStoragePath}`;
    const absoluteFilePath = path.join(process.cwd(), 'uploads', relativeFolder, filename);

    return { relativeStoragePath, publicUrl, absoluteFilePath, filename };
  }

  /**
   * Upload multiple images for a product
   */
  async uploadImages(productId: string, files: Express.Multer.File[]): Promise<ProductImage[]> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['images', 'variants'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    if (!files || files.length === 0) {
      throw new BadRequestException('No image files provided');
    }

    const maxFileSize = Number(process.env.MAX_IMAGE_SIZE_BYTES || 5 * 1024 * 1024); // 5MB default
    const existingImagesCount = await this.imageRepository.count({ where: { productId } });
    const savedImages: ProductImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > maxFileSize) {
        throw new BadRequestException(`File ${file.originalname} exceeds max allowed size of ${maxFileSize / (1024 * 1024)}MB`);
      }

      const validation = this.validateImageBuffer(file.buffer);
      if (!validation.isValid) {
        throw new BadRequestException(`File ${file.originalname} is not a valid JPEG, PNG, or WebP image`);
      }

      const { relativeStoragePath, publicUrl, absoluteFilePath, filename } = this.getStorageDetails(validation.ext);

      // Ensure directory exists
      await fs.mkdir(path.dirname(absoluteFilePath), { recursive: true });

      // Save file buffer locally
      await fs.writeFile(absoluteFilePath, file.buffer);

      const isPrimary = existingImagesCount === 0 && i === 0;
      const sortOrder = existingImagesCount + i;

      const imageEntity = this.imageRepository.create({
        productId,
        url: publicUrl,
        storagePath: relativeStoragePath,
        filename,
        originalFilename: file.originalname.slice(0, 255),
        mimeType: validation.mimeType,
        sizeBytes: file.size,
        isPrimary,
        sortOrder,
        altText: product.nameEn,
      });

      const saved = await this.imageRepository.save(imageEntity);
      savedImages.push(saved);
    }

    // Sync image URLs with default variant
    await this.syncVariantImages(productId);

    return savedImages;
  }

  /**
   * Set primary image for a product
   */
  async setPrimaryImage(productId: string, imageId: string): Promise<ProductImage> {
    const targetImage = await this.imageRepository.findOne({
      where: { id: imageId, productId },
    });

    if (!targetImage) {
      throw new NotFoundException(`Image with ID ${imageId} for product ${productId} not found`);
    }

    // Reset all images of this product to not primary
    await this.imageRepository.update({ productId }, { isPrimary: false });

    // Set target image to primary
    targetImage.isPrimary = true;
    const updated = await this.imageRepository.save(targetImage);

    // Sync image URLs with default variant
    await this.syncVariantImages(productId);

    return updated;
  }

  /**
   * Delete product image from local disk and database
   */
  async deleteImage(productId: string, imageId: string): Promise<void> {
    const targetImage = await this.imageRepository.findOne({
      where: { id: imageId, productId },
    });

    if (!targetImage) {
      throw new NotFoundException(`Image with ID ${imageId} not found`);
    }

    // Remove file from disk
    const absolutePath = path.join(process.cwd(), 'uploads', targetImage.storagePath);
    try {
      await fs.unlink(absolutePath);
    } catch (err: unknown) {
      this.logger.warn(`Could not delete file at ${absolutePath}: ${(err as Error).message}`);
    }

    const wasPrimary = targetImage.isPrimary;
    await this.imageRepository.remove(targetImage);

    // If deleted image was primary, set another image as primary
    if (wasPrimary) {
      const remainingImage = await this.imageRepository.findOne({
        where: { productId },
        order: { sortOrder: 'ASC' },
      });
      if (remainingImage) {
        remainingImage.isPrimary = true;
        await this.imageRepository.save(remainingImage);
      }
    }

    // Sync image URLs with default variant
    await this.syncVariantImages(productId);
  }

  /**
   * Reorder product images
   */
  async reorderImages(productId: string, imageIds: string[]): Promise<ProductImage[]> {
    for (let i = 0; i < imageIds.length; i++) {
      await this.imageRepository.update(
        { id: imageIds[i], productId },
        { sortOrder: i },
      );
    }

    await this.syncVariantImages(productId);

    return this.imageRepository.find({
      where: { productId },
      order: { sortOrder: 'ASC' },
    });
  }

  /**
   * Synchronize images array on the product variants so that storefront queries
   * that inspect productVariant.images work seamlessly.
   */
  async syncVariantImages(productId: string): Promise<void> {
    const images = await this.imageRepository.find({
      where: { productId },
      order: { isPrimary: 'DESC', sortOrder: 'ASC' },
    });

    const imageUrls = images.map((img) => img.url);

    // Update variants of this product
    const variants = await this.variantRepository.find({
      where: { productId },
    });

    for (const v of variants) {
      v.images = imageUrls;
      await this.variantRepository.save(v);
    }
  }

  /**
   * Save a local file from a raw Buffer (used by external importer)
   */
  async saveImageBuffer(
    productId: string,
    buffer: Buffer,
    originalName: string,
    sourceUrl?: string,
    sourceAttribution?: string,
  ): Promise<ProductImage> {
    const validation = this.validateImageBuffer(buffer);
    if (!validation.isValid) {
      throw new BadRequestException('Remote file is not a valid JPEG, PNG, or WebP image');
    }

    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    const { relativeStoragePath, publicUrl, absoluteFilePath, filename } = this.getStorageDetails(validation.ext);

    await fs.mkdir(path.dirname(absoluteFilePath), { recursive: true });
    await fs.writeFile(absoluteFilePath, buffer);

    const existingCount = await this.imageRepository.count({ where: { productId } });

    const image = this.imageRepository.create({
      productId,
      url: publicUrl,
      storagePath: relativeStoragePath,
      filename,
      originalFilename: originalName.slice(0, 255),
      mimeType: validation.mimeType,
      sizeBytes: buffer.length,
      isPrimary: existingCount === 0,
      sortOrder: existingCount,
      altText: product.nameEn,
      sourceUrl,
      sourceAttribution,
    });

    const saved = await this.imageRepository.save(image);
    await this.syncVariantImages(productId);
    return saved;
  }
}
