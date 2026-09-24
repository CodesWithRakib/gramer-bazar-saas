import axios from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { NormalizedProduct, ProductSourceAdapter } from './source-adapter.interface.js';

interface DummyJsonProduct {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage?: number;
  rating?: number;
  stock: number;
  tags?: string[];
  brand?: string;
  sku?: string;
  weight?: number;
  dimensions?: { width: number; height: number; depth: number };
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  images: string[];
  thumbnail: string;
}

interface DummyJsonResponse {
  products: DummyJsonProduct[];
  total: number;
  skip: number;
  limit: number;
}

@Injectable()
export class DummyJsonAdapter implements ProductSourceAdapter {
  readonly sourceName = 'dummyjson';
  private readonly logger = new Logger(DummyJsonAdapter.name);

  async fetchProducts(options?: {
    limit?: number;
    skip?: number;
    category?: string;
  }): Promise<NormalizedProduct[]> {
    const limit = options?.limit || 30;
    const skip = options?.skip || 0;
    const url = options?.category
      ? `https://dummyjson.com/products/category/${options.category}?limit=${limit}&skip=${skip}`
      : `https://dummyjson.com/products?limit=${limit}&skip=${skip}`;

    try {
      this.logger.log(`Fetching products from ${url}...`);
      const response = await axios.get<DummyJsonResponse>(url, { timeout: 10000 });
      const rawProducts = response.data.products || [];

      return rawProducts.map((p) => this.normalize(p));
    } catch (err: unknown) {
      this.logger.error(`Failed to fetch from DummyJSON: ${(err as Error).message}`);
      throw err;
    }
  }

  private normalize(raw: DummyJsonProduct): NormalizedProduct {
    // Collect all valid image URLs (prefer thumbnail first, then others)
    const rawImages = [raw.thumbnail, ...(raw.images || [])].filter(Boolean);
    const uniqueImages = Array.from(new Set(rawImages));

    // Determine unit
    let unit = 'piece';
    if (raw.category === 'groceries') {
      unit = 'pack';
    }

    return {
      source: this.sourceName,
      sourceProductId: String(raw.id),
      sourceUrl: `https://dummyjson.com/products/${raw.id}`,
      sourceCategory: raw.category,
      nameEn: raw.title,
      nameBn: raw.title, // Preserves original info; translations handled by user/admin
      descriptionEn: raw.description,
      descriptionBn: raw.description,
      brandName: raw.brand || undefined,
      sku: raw.sku || `DJ-${raw.id}`,
      barcode: undefined,
      sourcePrice: raw.price,
      sourceCurrency: 'USD',
      suggestedBdtPrice: undefined, // Needs admin review, not blindly fabricated
      compareAtPrice: raw.discountPercentage
        ? Math.round(raw.price * (1 + raw.discountPercentage / 100))
        : undefined,
      unit,
      imageUrls: uniqueImages,
      stock: raw.stock || 10,
      rawAttributes: {
        rating: raw.rating,
        tags: raw.tags,
        warrantyInformation: raw.warrantyInformation,
        shippingInformation: raw.shippingInformation,
        availabilityStatus: raw.availabilityStatus,
      },
    };
  }
}
