import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/en/profile/', '/bn/profile/', '/en/cart/', '/bn/cart/', '/admin/', '/seller/', '/rider/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
