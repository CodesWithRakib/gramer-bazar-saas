import axios from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { NormalizedProduct, ProductSourceAdapter } from './source-adapter.interface.js';

interface OpenFoodFactsProduct {
  code: string;
  product_name?: string;
  product_name_en?: string;
  generic_name?: string;
  brands?: string;
  categories_tags?: string[];
  image_url?: string;
  image_front_url?: string;
  quantity?: string;
}

interface OpenFoodFactsResponse {
  count: number;
  products: OpenFoodFactsProduct[];
}

@Injectable()
export class OpenFoodFactsAdapter implements ProductSourceAdapter {
  readonly sourceName = 'openfoodfacts';
  private readonly logger = new Logger(OpenFoodFactsAdapter.name);

  async fetchProducts(options?: {
    limit?: number;
    category?: string;
  }): Promise<NormalizedProduct[]> {
    const limit = options?.limit || 20;
    const categoryTag = options?.category || 'beverages';
    const url = `https://world.openfoodfacts.org/api/v2/search?categories_tags_en=${encodeURIComponent(categoryTag)}&page_size=${limit}&fields=code,product_name,product_name_en,generic_name,brands,categories_tags,image_url,image_front_url,quantity`;

    try {
      this.logger.log(`Fetching products from Open Food Facts (${categoryTag})...`);
      const response = await axios.get<OpenFoodFactsResponse>(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'GramerBazar-CatalogImporter/1.0 (info@gramerbazar.com)',
        },
      });

      const rawProducts = response.data.products || [];
      return rawProducts
        .filter((p) => (p.product_name || p.product_name_en) && p.code)
        .map((p) => this.normalize(p, categoryTag));
    } catch (err: unknown) {
      this.logger.error(`Failed to fetch from Open Food Facts: ${(err as Error).message}`);
      return [];
    }
  }

  private normalize(raw: OpenFoodFactsProduct, fallbackCategory: string): NormalizedProduct {
    const name = raw.product_name_en || raw.product_name || 'Unnamed Food Product';
    const description = raw.generic_name || name;
    const images = [raw.image_front_url, raw.image_url].filter(Boolean) as string[];

    // Extract quantity / unit
    let unit = 'piece';
    if (raw.quantity) {
      const lowerQ = raw.quantity.toLowerCase();
      if (lowerQ.includes('kg')) unit = 'kg';
      else if (lowerQ.includes('g')) unit = 'gram';
      else if (lowerQ.includes('l')) unit = 'liter';
      else if (lowerQ.includes('ml')) unit = 'ml';
      else if (lowerQ.includes('pack')) unit = 'pack';
    }

    const category = raw.categories_tags && raw.categories_tags.length > 0
      ? raw.categories_tags[0].replace(/^en:/, '')
      : fallbackCategory;

    return {
      source: this.sourceName,
      sourceProductId: raw.code,
      sourceUrl: `https://world.openfoodfacts.org/product/${raw.code}`,
      sourceCategory: category,
      nameEn: name,
      nameBn: name,
      descriptionEn: description,
      descriptionBn: description,
      brandName: raw.brands?.split(',')[0]?.trim(),
      sku: `OFF-${raw.code}`,
      barcode: raw.code,
      sourcePrice: undefined,
      sourceCurrency: undefined,
      suggestedBdtPrice: undefined,
      unit,
      imageUrls: Array.from(new Set(images)),
      stock: 25,
      rawAttributes: {
        rawQuantity: raw.quantity,
        categories: raw.categories_tags,
      },
    };
  }
}
