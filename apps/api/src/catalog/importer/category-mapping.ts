export interface CategoryTargetMapping {
  categorySlug: string;
  subCategorySlug: string;
}

export const DUMMYJSON_CATEGORY_MAP: Record<string, CategoryTargetMapping> = {
  // Groceries & Food
  groceries: { categorySlug: 'grocery', subCategorySlug: 'snacks' },
  'kitchen-accessories': { categorySlug: 'electronics', subCategorySlug: 'home-appliances' },

  // Electronics
  smartphones: { categorySlug: 'electronics', subCategorySlug: 'mobile-accessories' },
  laptops: { categorySlug: 'electronics', subCategorySlug: 'computer-accessories' },
  tablets: { categorySlug: 'electronics', subCategorySlug: 'computer-accessories' },
  'mobile-accessories': { categorySlug: 'electronics', subCategorySlug: 'mobile-accessories' },

  // Cosmetics / Beauty
  beauty: { categorySlug: 'cosmetics', subCategorySlug: 'skincare' },
  'skin-care': { categorySlug: 'cosmetics', subCategorySlug: 'skincare' },
  fragrances: { categorySlug: 'cosmetics', subCategorySlug: 'fragrance' },

  // Clothing & Fashion
  'mens-shirts': { categorySlug: 'clothing', subCategorySlug: 'mens' },
  'mens-shoes': { categorySlug: 'clothing', subCategorySlug: 'mens' },
  'mens-watches': { categorySlug: 'clothing', subCategorySlug: 'accessories' },
  'womens-dresses': { categorySlug: 'clothing', subCategorySlug: 'womens' },
  'womens-shoes': { categorySlug: 'clothing', subCategorySlug: 'womens' },
  'womens-watches': { categorySlug: 'clothing', subCategorySlug: 'accessories' },
  'womens-bags': { categorySlug: 'clothing', subCategorySlug: 'accessories' },
  'womens-jewellery': { categorySlug: 'clothing', subCategorySlug: 'accessories' },
  sunglasses: { categorySlug: 'clothing', subCategorySlug: 'accessories' },
  tops: { categorySlug: 'clothing', subCategorySlug: 'womens' },

  // Home
  'home-decoration': { categorySlug: 'electronics', subCategorySlug: 'lighting' },
  furniture: { categorySlug: 'electronics', subCategorySlug: 'home-appliances' },
};

export const OPENFOODFACTS_CATEGORY_MAP: Record<string, CategoryTargetMapping> = {
  beverages: { categorySlug: 'grocery', subCategorySlug: 'drinks' },
  drinks: { categorySlug: 'grocery', subCategorySlug: 'drinks' },
  biscuits: { categorySlug: 'grocery', subCategorySlug: 'biscuits' },
  snacks: { categorySlug: 'grocery', subCategorySlug: 'snacks' },
  spices: { categorySlug: 'grocery', subCategorySlug: 'spices' },
  rice: { categorySlug: 'grocery', subCategorySlug: 'rice' },
  dals: { categorySlug: 'grocery', subCategorySlug: 'dal' },
  lentils: { categorySlug: 'grocery', subCategorySlug: 'dal' },
  oils: { categorySlug: 'grocery', subCategorySlug: 'oil' },
  vegetables: { categorySlug: 'fresh-vegetables', subCategorySlug: 'vegetables' },
  fruits: { categorySlug: 'fresh-vegetables', subCategorySlug: 'fruits' },
  seafood: { categorySlug: 'fresh-vegetables', subCategorySlug: 'fish' },
  fish: { categorySlug: 'fresh-vegetables', subCategorySlug: 'fish' },
  meats: { categorySlug: 'fresh-vegetables', subCategorySlug: 'meat' },
  eggs: { categorySlug: 'fresh-vegetables', subCategorySlug: 'eggs' },
  dairy: { categorySlug: 'grocery', subCategorySlug: 'instant-food' },
  flours: { categorySlug: 'grocery', subCategorySlug: 'flour' },
  sugars: { categorySlug: 'grocery', subCategorySlug: 'sugar' },
  salts: { categorySlug: 'grocery', subCategorySlug: 'salt' },
};

export function resolveCategoryMapping(
  source: string,
  sourceCategory: string,
): CategoryTargetMapping | null {
  const normalizedKey = sourceCategory.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

  if (source === 'dummyjson') {
    return DUMMYJSON_CATEGORY_MAP[normalizedKey] || null;
  }

  if (source === 'openfoodfacts') {
    // Check direct match
    if (OPENFOODFACTS_CATEGORY_MAP[normalizedKey]) {
      return OPENFOODFACTS_CATEGORY_MAP[normalizedKey];
    }
    // Check partial tag matching
    for (const [key, mapping] of Object.entries(OPENFOODFACTS_CATEGORY_MAP)) {
      if (normalizedKey.includes(key) || key.includes(normalizedKey)) {
        return mapping;
      }
    }
  }

  return null;
}
