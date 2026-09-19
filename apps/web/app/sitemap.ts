import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  let products = [];
  let categories = [];

  try {
    const prodRes = await fetch(`${apiUrl}/public/catalog/search?limit=1000`, { next: { revalidate: 3600 } });
    if (prodRes.ok) {
      const data = await prodRes.json();
      products = data.data || [];
    }
  } catch (error) {
    console.warn('Failed to fetch products for sitemap', error);
  }

  try {
    const catRes = await fetch(`${apiUrl}/public/categories`, { next: { revalidate: 3600 } });
    if (catRes.ok) {
      categories = await catRes.json();
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

  const productRoutes = products.flatMap((product: any) => {
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

  const categoryRoutes = categories.flatMap((cat: any) => {
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
