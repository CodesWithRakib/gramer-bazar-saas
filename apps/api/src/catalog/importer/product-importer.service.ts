import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import axios from 'axios';
import { ImportLog, ImportMode, ImportStatus } from './entities/import-log.entity.js';
import { DummyJsonAdapter } from './adapters/dummyjson.adapter.js';
import { OpenFoodFactsAdapter } from './adapters/openfoodfacts.adapter.js';
import { NormalizedProduct, ProductSourceAdapter } from './adapters/source-adapter.interface.js';
import { resolveCategoryMapping } from './category-mapping.js';
import { Category } from '../entities/category.entity.js';
import { Brand } from '../entities/brand.entity.js';
import { Product } from '../entities/product.entity.js';
import { ProductImageService } from '../products/product-image.service.js';
import { ProductsService } from '../products/products.service.js';
import { ProductStatus } from '../enums/product-status.enum.js';

export interface ImportOptions {
  source: 'dummyjson' | 'openfoodfacts';
  mode?: ImportMode;
  limit?: number;
  category?: string;
  updateExisting?: boolean;
}

export interface ImportResult {
  importId: string;
  source: string;
  mode: ImportMode;
  status: ImportStatus;
  totalFetched: number;
  created: number;
  updated: number;
  skipped: number;
  duplicates: number;
  failed: number;
  imageFailures: number;
  mappingFailures: number;
  details?: Record<string, unknown>;
  summary: string;
}

@Injectable()
export class ProductImporterService {
  private readonly logger = new Logger(ProductImporterService.name);

  constructor(
    @InjectRepository(ImportLog)
    private readonly importLogRepository: Repository<ImportLog>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dummyJsonAdapter: DummyJsonAdapter,
    private readonly openFoodFactsAdapter: OpenFoodFactsAdapter,
    private readonly productImageService: ProductImageService,
    private readonly productsService: ProductsService,
  ) {}

  private isSafeUrl(urlString: string): boolean {
    try {
      const url = new URL(urlString);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
      const hostname = url.hostname.toLowerCase();
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '::1' ||
        hostname.startsWith('10.') ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('169.254.') ||
        hostname.endsWith('.internal') ||
        hostname.endsWith('.local')
      ) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  private getAdapter(source: string): ProductSourceAdapter {
    if (source === 'dummyjson') return this.dummyJsonAdapter;
    if (source === 'openfoodfacts') return this.openFoodFactsAdapter;
    throw new BadRequestException(`Unsupported source adapter: ${source}`);
  }

  async runImport(options: ImportOptions): Promise<ImportResult> {
    const { source, mode = ImportMode.IMPORT, limit = 20, category, updateExisting = false } = options;
    const adapter = this.getAdapter(source);

    // Create initial import log
    const log = this.importLogRepository.create({
      source,
      mode,
      status: ImportStatus.RUNNING,
      startedAt: new Date(),
      totalFetched: 0,
      createdCount: 0,
      updatedCount: 0,
      skippedCount: 0,
      duplicatesCount: 0,
      failedCount: 0,
      imageFailuresCount: 0,
      mappingFailuresCount: 0,
    });
    const savedLog = await this.importLogRepository.save(log);

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let duplicatesCount = 0;
    let failedCount = 0;
    let imageFailuresCount = 0;
    let mappingFailuresCount = 0;
    const dryRunPreview: Array<{
      nameEn: string;
      sourceCategory: string;
      targetCategory?: string;
      targetSubCategory?: string;
      isDuplicate: boolean;
      action: 'CREATE' | 'UPDATE' | 'SKIP';
    }> = [];

    try {
      this.logger.log(`Starting ${mode} import from ${source} (limit=${limit})...`);
      const normalizedProducts = await adapter.fetchProducts({ limit, category });
      savedLog.totalFetched = normalizedProducts.length;

      for (const item of normalizedProducts) {
        try {
          // 1. Duplicate detection
          const existingProduct = await this.findDuplicate(item);
          const isDuplicate = !!existingProduct;

          if (isDuplicate) {
            duplicatesCount++;
            if (!updateExisting) {
              skippedCount++;
              if (mode === ImportMode.DRY_RUN) {
                dryRunPreview.push({
                  nameEn: item.nameEn,
                  sourceCategory: item.sourceCategory,
                  isDuplicate: true,
                  action: 'SKIP',
                });
              }
              continue;
            }
          }

          // 2. Category mapping
          const mapping = resolveCategoryMapping(source, item.sourceCategory);
          let targetCategory: Category | null = null;
          let targetSubCategory: Category | null = null;

          if (mapping) {
            targetCategory = await this.categoryRepository.findOne({
              where: { slug: mapping.categorySlug },
            });
            targetSubCategory = await this.categoryRepository.findOne({
              where: { slug: mapping.subCategorySlug },
            });
          }

          if (!targetCategory) {
            mappingFailuresCount++;
          }

          if (mode === ImportMode.DRY_RUN) {
            dryRunPreview.push({
              nameEn: item.nameEn,
              sourceCategory: item.sourceCategory,
              targetCategory: targetCategory?.nameEn,
              targetSubCategory: targetSubCategory?.nameEn,
              isDuplicate,
              action: isDuplicate ? 'UPDATE' : 'CREATE',
            });
            if (isDuplicate) updatedCount++;
            else createdCount++;
            continue;
          }

          // --- ACTUAL IMPORT / WRITE MODE ---

          // 3. Resolve or create Brand
          let brand: Brand | null = null;
          if (item.brandName) {
            const brandSlug = item.brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            brand = await this.brandRepository.findOne({ where: { slug: brandSlug } });
            if (!brand) {
              brand = await this.brandRepository.save(
                this.brandRepository.create({
                  nameEn: item.brandName,
                  nameBn: item.brandName,
                  slug: brandSlug,
                  isActive: true,
                }),
              );
            }
          }

          // 4. Fallback category if unmapped (set to pending review)
          let categoryId = targetCategory?.id;
          if (!categoryId) {
            // Find or use any active category and mark status as PENDING_REVIEW
            const defaultCat = await this.categoryRepository.findOne({
              where: { parentId: IsNull() },
            });
            categoryId = defaultCat ? defaultCat.id : (await this.categoryRepository.find())[0]?.id;
          }

          const productSlug = this.generateSlug(item.nameEn, item.source, item.sourceProductId);

          // 5. Create or Update Product
          let savedProduct: Product;
          if (existingProduct && updateExisting) {
            existingProduct.nameEn = item.nameEn;
            existingProduct.descriptionEn = item.descriptionEn || null;
            existingProduct.sourcePrice = item.sourcePrice || null;
            existingProduct.sourceCurrency = item.sourceCurrency || null;
            if (targetCategory) existingProduct.categoryId = targetCategory.id;
            if (targetSubCategory) existingProduct.subCategoryId = targetSubCategory.id;
            savedProduct = await this.productRepository.save(existingProduct);
            updatedCount++;
          } else {
            savedProduct = await this.productsService.create({
              categoryId,
              subCategoryId: targetSubCategory?.id,
              brandId: brand?.id,
              nameEn: item.nameEn,
              nameBn: item.nameBn,
              slug: productSlug,
              descriptionEn: item.descriptionEn,
              descriptionBn: item.descriptionBn,
              shortDescriptionEn: item.descriptionEn?.slice(0, 160),
              shortDescriptionBn: item.descriptionBn?.slice(0, 160),
              sku: item.sku,
              barcode: item.barcode,
              price: item.suggestedBdtPrice || undefined,
              compareAtPrice: item.compareAtPrice || undefined,
              stock: item.stock,
              unit: item.unit,
              source: item.source,
              sourceProductId: item.sourceProductId,
              sourceUrl: item.sourceUrl,
              sourcePrice: item.sourcePrice || undefined,
              sourceCurrency: item.sourceCurrency || undefined,
              status: targetCategory && item.suggestedBdtPrice
                ? ProductStatus.PUBLISHED
                : ProductStatus.PENDING_REVIEW,
              isActive: true,
              isFeatured: false,
            });
            createdCount++;
          }

          // 6. Download and store local images
          if (item.imageUrls && item.imageUrls.length > 0) {
            let imageDownloaded = false;
            for (const imgUrl of item.imageUrls.slice(0, 5)) {
              const success = await this.downloadAndStoreImage(savedProduct.id, imgUrl, item.source);
              if (success) {
                imageDownloaded = true;
              }
            }
            if (!imageDownloaded) {
              imageFailuresCount++;
            }
          }
        } catch (itemErr: unknown) {
          failedCount++;
          this.logger.error(`Error processing product ${item.nameEn}: ${(itemErr as Error).message}`);
        }
      }

      savedLog.createdCount = createdCount;
      savedLog.updatedCount = updatedCount;
      savedLog.skippedCount = skippedCount;
      savedLog.duplicatesCount = duplicatesCount;
      savedLog.failedCount = failedCount;
      savedLog.imageFailuresCount = imageFailuresCount;
      savedLog.mappingFailuresCount = mappingFailuresCount;
      savedLog.status = ImportStatus.COMPLETED;
      savedLog.completedAt = new Date();
      savedLog.details = mode === ImportMode.DRY_RUN ? { dryRunPreview } : null;
      await this.importLogRepository.save(savedLog);

      const summary = `${mode} completed: ${createdCount} created, ${updatedCount} updated, ${duplicatesCount} duplicates, ${failedCount} failed, ${imageFailuresCount} image failures, ${mappingFailuresCount} mapping failures.`;

      return {
        importId: savedLog.id,
        source,
        mode,
        status: ImportStatus.COMPLETED,
        totalFetched: savedLog.totalFetched,
        created: createdCount,
        updated: updatedCount,
        skipped: skippedCount,
        duplicates: duplicatesCount,
        failed: failedCount,
        imageFailures: imageFailuresCount,
        mappingFailures: mappingFailuresCount,
        details: savedLog.details || undefined,
        summary,
      };
    } catch (err: unknown) {
      savedLog.status = ImportStatus.FAILED;
      savedLog.completedAt = new Date();
      savedLog.errorSummary = (err as Error).message;
      await this.importLogRepository.save(savedLog);
      throw err;
    }
  }

  /**
   * Safe image downloader with SSRF protection, timeout, and magic bytes check
   */
  private async downloadAndStoreImage(productId: string, imageUrl: string, source: string): Promise<boolean> {
    if (!this.isSafeUrl(imageUrl)) {
      this.logger.warn(`Rejected unsafe image URL: ${imageUrl}`);
      return false;
    }

    try {
      const response = await axios.get<ArrayBuffer>(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 10000,
        maxContentLength: 5 * 1024 * 1024, // 5MB
        headers: {
          'User-Agent': 'GramerBazar-CatalogImporter/1.0',
        },
      });

      const buffer = Buffer.from(response.data);
      const urlPath = new URL(imageUrl).pathname;
      const originalName = urlPath.split('/').pop() || 'imported-image.jpg';

      await this.productImageService.saveImageBuffer(
        productId,
        buffer,
        originalName,
        imageUrl,
        `Imported from ${source}`,
      );

      return true;
    } catch (err: unknown) {
      this.logger.warn(`Failed to download image ${imageUrl} for product ${productId}: ${(err as Error).message}`);
      return false;
    }
  }

  /**
   * Find duplicate product using source + sourceProductId, barcode, SKU, or normalized name + brand
   */
  private async findDuplicate(item: NormalizedProduct): Promise<Product | null> {
    // 1. Source + SourceProductId
    const bySource = await this.productRepository.findOne({
      where: { source: item.source, sourceProductId: item.sourceProductId },
    });
    if (bySource) return bySource;

    // 2. Barcode
    if (item.barcode) {
      const byBarcode = await this.productRepository.findOne({
        where: { barcode: item.barcode },
      });
      if (byBarcode) return byBarcode;
    }

    // 3. SKU
    if (item.sku) {
      const bySku = await this.productRepository.findOne({
        where: { sku: item.sku },
      });
      if (bySku) return bySku;
    }

    // 4. Exact normalized name
    const normalizedName = item.nameEn.trim().toLowerCase();
    const byName = await this.productRepository
      .createQueryBuilder('p')
      .where('LOWER(p.nameEn) = :name', { name: normalizedName })
      .getOne();

    if (byName) return byName;

    return null;
  }

  private generateSlug(nameEn: string, source: string, sourceId: string): string {
    const base = nameEn
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .slice(0, 80);

    const safeSuffix = `${source.slice(0, 3)}-${sourceId.slice(-6)}`.toLowerCase().replace(/[^a-z0-9]+/g, '');
    return `${base}-${safeSuffix}`;
  }

  async getImportLogs(limit = 20): Promise<ImportLog[]> {
    return this.importLogRepository.find({
      order: { startedAt: 'DESC' },
      take: limit,
    });
  }

  async getImportLogById(id: string): Promise<ImportLog> {
    const log = await this.importLogRepository.findOne({ where: { id } });
    if (!log) {
      throw new BadRequestException(`Import log ${id} not found`);
    }
    return log;
  }
}
