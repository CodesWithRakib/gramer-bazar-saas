export interface NormalizedProduct {
  source: string;
  sourceProductId: string;
  sourceUrl?: string;
  sourceCategory: string;
  nameEn: string;
  nameBn: string;
  descriptionEn?: string;
  descriptionBn?: string;
  brandName?: string;
  sku?: string;
  barcode?: string;
  sourcePrice?: number;
  sourceCurrency?: string;
  suggestedBdtPrice?: number;
  compareAtPrice?: number;
  unit?: string;
  imageUrls: string[];
  stock: number;
  rawAttributes?: Record<string, unknown>;
}

export interface ProductSourceAdapter {
  readonly sourceName: string;
  fetchProducts(options?: { limit?: number; skip?: number; category?: string }): Promise<NormalizedProduct[]>;
}
