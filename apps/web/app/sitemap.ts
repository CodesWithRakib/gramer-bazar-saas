import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  // Use 127.0.0.1 instead of localhost for Node fetch to avoid IPv6 resolution issues (ECONNREFUSED)
  if (typeof window === 'undefined') {
    apiUrl = apiUrl.replace('localhost', '127.0.0.1');
  }

  let products: Array<{ productVariant?: { product?: { slug?: string } } }> = [];
  let categories: Array<{ slug?: string }> = [];

  try {
    const prodRes = await fetch(`${apiUrl}/public/catalog/search?limit=1000`, { 
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(2500),
    });
    if (prodRes.ok) {
      const data = await prodRes.json();
      products = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
    }
  } catch (error) {
    console.warn('Failed to fetch products for sitemap', error);
  }

  try {
    const catRes = await fetch(`${apiUrl}/public/categories`, { 
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(2500),
    });
    if (catRes.ok) {
      const catData = await catRes.json();
      categories = Array.isArray(catData) ? catData : (Array.isArray(catData?.data) ? catData.data : []);
    }
  } catch (error) {
    console.warn('Failed to fetch categories for sitemap', error);
  }

  const basePaths = ['', '/login', '/register', '/search', '/categories', '/cart'];
  
  const routes = basePaths.map((route) => ({
    url: `${baseUrl}/en${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));
  
  const bnRoutes = basePaths.map((route) => ({
    url: `${baseUrl}/bn${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const safeProducts = Array.isArray(products) ? products : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  const productRoutes = safeProducts.flatMap((product) => {
    const slug = product.productVariant?.product?.slug;
    if (!slug) return [];
    return [
      {
        url: `${baseUrl}/en/products/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/bn/products/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      }
    ];
  });

  const categoryRoutes = safeCategories.flatMap((cat) => {
    if (!cat.slug) return [];
    return [
      {
        url: `${baseUrl}/en/catalog?category=${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/bn/catalog?category=${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }
    ];
  });

  return [...routes, ...bnRoutes, ...productRoutes, ...categoryRoutes];
}
