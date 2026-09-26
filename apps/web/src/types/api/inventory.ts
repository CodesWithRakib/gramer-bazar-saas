import type { Schema } from './common.js';

export type SellerProduct = Schema<'SellerProductResponseDto'>;
export type InventorySummary = Schema<'InventorySummaryDto'>;
export type ShopProductsResponse = Schema<'ShopProductsResponseDto'>;

export type CreateSellerProductRequest = Schema<'CreateSellerProductDto'>;
export type AddSellerProductRequest = Schema<'AddSellerProductDto'>;
export type UpdateSellerProductRequest = Schema<'UpdateSellerProductDto'>;
export type AdjustStockRequest = Schema<'UpdateInventoryDto'>;
