import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface StorageUploadResult {
  path: string;
  publicUrl: string;
}

export interface ImageValidationResult {
  isValid: boolean;
  mimeType: string;
  ext: string;
}

@Injectable()
export class SupabaseStorageService {
  private readonly logger = new Logger(SupabaseStorageService.name);
  private readonly supabaseClient: SupabaseClient | null = null;
  private readonly bucketName: string;
  private readonly maxFileSizeBytes = 5 * 1024 * 1024; // 5 MB max per requirement
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('supabase.url');
    const supabaseSecretKey = this.configService.get<string>('supabase.secretKey');
    this.bucketName = this.configService.get<string>('supabase.bucket') || 'gramer-bazar';

    if (supabaseUrl && supabaseSecretKey) {
      this.supabaseClient = createClient(supabaseUrl, supabaseSecretKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      this.logger.log(`Initialized Supabase Storage for bucket "${this.bucketName}"`);
    } else {
      this.logger.warn(
        'SUPABASE_URL or SUPABASE_SECRET_KEY not configured. Falling back to local storage.',
      );
    }
  }

  /**
   * Check if Supabase client is configured and active
   */
  isConfigured(): boolean {
    return this.supabaseClient !== null;
  }

  /**
   * Validate image buffer magic bytes and size
   */
  validateImage(buffer: Buffer, declaredMime?: string): ImageValidationResult {
    if (!buffer || buffer.length === 0) {
      throw new BadRequestException('File buffer is empty');
    }

    if (buffer.length > this.maxFileSizeBytes) {
      throw new BadRequestException(
        `File size (${(buffer.length / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowed 5 MB`,
      );
    }

    // Verify magic bytes
    let detectedMime = '';
    let ext = '';

    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      detectedMime = 'image/jpeg';
      ext = '.jpg';
    }
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    else if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    ) {
      detectedMime = 'image/png';
      ext = '.png';
    }
    // WEBP: 'RIFF'....'WEBP'
    else if (
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP'
    ) {
      detectedMime = 'image/webp';
      ext = '.webp';
    }

    if (!detectedMime || !this.allowedMimeTypes.includes(detectedMime)) {
      throw new BadRequestException(
        `Unsupported image format. Allowed MIME types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    if (declaredMime && declaredMime !== detectedMime) {
      // Disallow MIME spoofing
      if (declaredMime.toLowerCase() !== detectedMime) {
        this.logger.warn(`MIME mismatch: declared=${declaredMime}, detected=${detectedMime}`);
      }
    }

    return { isValid: true, mimeType: detectedMime, ext };
  }

  /**
   * Compatibility alias for validateImage
   */
  validateImageBuffer(buffer: Buffer): { isValid: boolean; mimeType: string; ext: string } {
    return this.validateImage(buffer);
  }

  /**
   * Normalize storage path by trimming leading/trailing slashes and directory traversal
   */
  normalizePath(rawPath: string): string {
    return rawPath
      .replace(/\\/g, '/')
      .replace(/^\/+/, '')
      .replace(/\/+$/, '')
      .replace(/\.\./g, '');
  }

  /**
   * Upload an image to Supabase Storage (with fallback to local uploads)
   */
  async uploadImage(
    storagePath: string,
    buffer: Buffer,
    declaredMime?: string,
    upsert = true,
  ): Promise<StorageUploadResult> {
    const validation = this.validateImage(buffer, declaredMime);
    const normalized = this.normalizePath(storagePath);

    if (this.supabaseClient) {
      const { data, error } = await this.supabaseClient.storage
        .from(this.bucketName)
        .upload(normalized, buffer, {
          contentType: validation.mimeType,
          upsert,
        });

      if (error) {
        this.logger.error(`Supabase upload failed for ${normalized}: ${error.message}`);
        throw new BadRequestException(`Storage upload failed: ${error.message}`);
      }

      const { data: urlData } = this.supabaseClient.storage
        .from(this.bucketName)
        .getPublicUrl(data?.path || normalized);

      return {
        path: data?.path || normalized,
        publicUrl: urlData.publicUrl,
      };
    }

    // Local disk fallback
    const absolutePath = path.join(process.cwd(), 'uploads', normalized);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, buffer);

    const publicUrl = `/uploads/${normalized}`;
    return {
      path: normalized,
      publicUrl,
    };
  }

  /**
   * Delete an image from Supabase Storage (or local disk)
   */
  async deleteImage(storagePath: string): Promise<boolean> {
    if (!storagePath) return false;

    // Handle full public URLs or relative paths
    const cleanedPath = this.extractStoragePath(storagePath);
    if (!cleanedPath) return false;

    if (this.supabaseClient) {
      const { error } = await this.supabaseClient.storage
        .from(this.bucketName)
        .remove([cleanedPath]);

      if (error) {
        this.logger.warn(`Supabase delete failed for ${cleanedPath}: ${error.message}`);
        return false;
      }
      return true;
    }

    // Local disk delete
    try {
      const absolutePath = path.join(process.cwd(), 'uploads', cleanedPath);
      await fs.unlink(absolutePath);
      return true;
    } catch (err: unknown) {
      this.logger.warn(`Local file delete failed for ${cleanedPath}: ${(err as Error).message}`);
      return false;
    }
  }

  /**
   * Safe replacement: uploads the new image first, and only removes the old image when safe
   */
  async replaceImage(
    oldStoragePath: string | null | undefined,
    newStoragePath: string,
    buffer: Buffer,
    declaredMime?: string,
  ): Promise<StorageUploadResult> {
    // 1. Upload new image first
    const uploadResult = await this.uploadImage(newStoragePath, buffer, declaredMime, true);

    // 2. Remove old image when safe and distinct from new path
    if (oldStoragePath) {
      const oldCleaned = this.extractStoragePath(oldStoragePath);
      const newCleaned = this.normalizePath(newStoragePath);
      if (oldCleaned && oldCleaned !== newCleaned) {
        await this.deleteImage(oldCleaned).catch((err: unknown) => {
          this.logger.warn(`Could not delete replaced image ${oldCleaned}: ${(err as Error).message}`);
        });
      }
    }

    return uploadResult;
  }

  /**
   * Get public URL for a given path
   */
  getPublicUrl(storagePath: string): string {
    const cleaned = this.normalizePath(storagePath);
    if (this.supabaseClient) {
      const { data } = this.supabaseClient.storage
        .from(this.bucketName)
        .getPublicUrl(cleaned);
      return data.publicUrl;
    }
    return `/uploads/${cleaned}`;
  }

  /**
   * Extract relative storage path from a full Supabase URL or local /uploads/ URL
   */
  extractStoragePath(urlOrPath: string): string {
    if (!urlOrPath) return '';

    // If it's a Supabase public URL: .../object/public/gramer-bazar/<path>
    const supabasePattern = new RegExp(`/object/public/${this.bucketName}/(.+)$`);
    const match = urlOrPath.match(supabasePattern);
    if (match && match[1]) {
      return this.normalizePath(match[1]);
    }

    // If it starts with /uploads/
    if (urlOrPath.startsWith('/uploads/')) {
      return this.normalizePath(urlOrPath.replace(/^\/uploads\//, ''));
    }

    return this.normalizePath(urlOrPath);
  }

  /**
   * Standardized storage path conventions
   */
  getShopImagePath(shopId: string, type: 'profile' | 'cover', ext = '.webp'): string {
    const normalizedType = type === 'profile' ? 'profile' : 'cover';
    return `shops/${shopId}/${normalizedType}${ext}`;
  }

  getProductImagePath(productId: string, imageId: string, ext = '.webp'): string {
    return `products/${productId}/${imageId}${ext}`;
  }

  getCategoryImagePath(categoryId: string, imageId: string, ext = '.webp'): string {
    return `categories/${categoryId}/${imageId}${ext}`;
  }

  getUserAvatarPath(userId: string, ext = '.webp'): string {
    return `users/${userId}/profile${ext}`;
  }

  getUserProfilePath(userId: string, ext = '.webp'): string {
    return this.getUserAvatarPath(userId, ext);
  }
}
