import { AttributeDataType } from '../../catalog/enums/attribute-data-type.enum.js';

export interface SeedAttributeOption {
  value: string;
  valueBn?: string;
}

export interface SeedAttribute {
  slug: string;
  nameEn: string;
  nameBn: string;
  dataType: AttributeDataType;
  unit?: string;
  isFilterable?: boolean;
  isVariantAxis?: boolean;
  options?: SeedAttributeOption[];
}

export interface SeedProductType {
  slug: string;
  attributes: string[];
  nameEn?: string;
  nameBn?: string;
}

export interface SeedTaxonomyNode {
  slug: string;
  nameEn: string;
  nameBn: string;
  icon?: string;
  descriptionEn?: string;
  descriptionBn?: string;
  /** Regulated verticals (pharmacy, restricted goods) flag their subtree. */
  isRegulated?: boolean;
  productTypes?: SeedProductType[];
  children?: SeedTaxonomyNode[];
}

export interface SeedBrand {
  name: string;
  /** Optional manufacturer this brand belongs to (resolved by name). */
  manufacturer?: string;
}

export interface SeedManufacturer {
  name: string;
  nameBn?: string;
  country?: string;
  website?: string;
}

/** Structured active-ingredient strength for one product. */
export interface SeedProductIngredient {
  ingredient: string;
  strengthValue?: number;
  strengthUnit?: string;
  percentage?: number;
}

export interface SeedProductBatch {
  batchNumber: string;
  /** ISO date (YYYY-MM-DD). */
  expiryDate: string;
  quantity: number;
  manufacturingDate?: string;
  supplier?: string;
  /** Defaults to ACTIVE. */
  status?: 'ACTIVE' | 'EXPIRED' | 'BLOCKED' | 'DEPLETED';
}

export interface SeedVerticalVariant {
  nameEn: string;
  nameBn: string;
  sku: string;
  /** Variant axis values keyed by attribute slug (e.g. { strength: '500 mg' }). */
  attributes?: Record<string, string>;
  price?: number;
  compareAtPrice?: number;
  stock?: number;
  batches?: SeedProductBatch[];
}

export interface SeedVerticalProduct {
  categoryPath: string;
  productTypeSlug: string;
  nameEn: string;
  nameBn: string;
  slug: string;
  sku: string;
  brand: string;
  manufacturer?: string;
  shortDescriptionEn: string;
  shortDescriptionBn: string;
  descriptionEn?: string;
  descriptionBn?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  unit?: string;
  isFeatured?: boolean;
  requiresPrescription?: boolean;
  /** Structured specs keyed by attribute slug (option value, number or boolean). */
  specs?: Record<string, string | number | boolean>;
  ingredients?: SeedProductIngredient[];
  /** Product-level batches applied to the default variant. */
  batches?: SeedProductBatch[];
  variants?: SeedVerticalVariant[];
}

/** A complete, data-driven catalog vertical (Electronics, Medicine, …). */
export interface SeedVertical {
  key: string;
  root: SeedTaxonomyNode;
  attributes: SeedAttribute[];
  brands: SeedBrand[];
  manufacturers?: SeedManufacturer[];
  products: SeedVerticalProduct[];
}
