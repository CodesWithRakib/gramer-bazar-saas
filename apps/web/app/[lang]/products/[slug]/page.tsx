import React from 'react';
import { ProductDetailsClient } from '@/components/catalog/ProductDetailsClient';
import { Metadata } from 'next';

// We fetch data directly on the server to populate SEO tags and pass down to client
async function getProductData(slug: string) {
  let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  // Use 127.0.0.1 instead of localhost for Node fetch to avoid IPv6 resolution issues (ECONNREFUSED)
  if (typeof window === 'undefined') {
    baseUrl = baseUrl.replace('localhost', '127.0.0.1');
  }

  try {
    const res = await fetch(`${baseUrl}/public/catalog/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch (err) {
    console.error(`Failed to fetch product data for ${slug}:`, err);
    return null;
  }
}

type Props = {
  params: Promise<{ lang: string; slug: string }>;
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { slug, lang } = await params;
  const products = await getProductData(slug);
  
  if (!products || products.length === 0) {
    return {
      title: 'Product Not Found - Gramer Bazar',
    };
  }

  const product = products[0];
  const isBn = lang === 'bn';
  const name = isBn ? (product.productVariant.nameBn || product.productVariant.product.nameBn) : (product.productVariant.nameEn || product.productVariant.product.nameEn);
  const description = isBn ? product.productVariant.product.descriptionBn : product.productVariant.product.descriptionEn;
  const image = product.productVariant.images?.[0] || '/placeholder.jpg';

  return {
    title: `${name} | Gramer Bazar`,
    description: description || `Buy ${name} at Gramer Bazar.`,
    openGraph: {
      title: name,
      description: description || `Buy ${name} at Gramer Bazar.`,
      images: [image],
    },
    alternates: {
      canonical: `/${lang}/products/${slug}`,
      languages: {
        'en-US': `/en/products/${slug}`,
        'bn-BD': `/bn/products/${slug}`,
      },
    },
  };
}

export default async function ProductDetailsPage({ params }: Props) {
  const { lang, slug } = await params;
  const products = await getProductData(slug);

  if (!products || products.length === 0) {
    const isBn = lang === 'bn';
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-muted/30 p-8 rounded-2xl flex flex-col items-center text-center max-w-md border shadow-sm">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">{isBn ? 'পণ্য পাওয়া যায়নি' : 'Product Not Found'}</h1>
          <p className="text-muted-foreground mb-8">
            {isBn 
              ? 'আপনি যে পণ্যটি খুঁজছেন তা বর্তমানে আমাদের স্টকে নেই অথবা সরিয়ে নেওয়া হয়েছে।' 
              : 'The product you are looking for is currently out of stock or has been removed from our catalog.'}
          </p>
          <a 
            href={`/${lang}/search`}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium transition-transform hover:scale-105 active:scale-95"
          >
            {isBn ? 'অন্য পণ্য খুঁজুন' : 'Explore Other Products'}
          </a>
        </div>
      </div>
    );
  }

  const product = products[0];
  const isBn = lang === 'bn';
  const name = isBn ? (product.productVariant.nameBn || product.productVariant.product.nameBn) : (product.productVariant.nameEn || product.productVariant.product.nameEn);
  const description = isBn ? product.productVariant.product.descriptionBn : product.productVariant.product.descriptionEn;
  const image = product.productVariant.images?.[0] || '/placeholder.jpg';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: name,
    image: image,
    description: description,
    sku: product.productVariant.sku,
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${lang}/products/${slug}`,
      priceCurrency: 'BDT',
      price: product.discountPrice ? Number(product.discountPrice) : Number(product.price),
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.inventory?.quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailsClient products={products} lang={lang} />
    </>
  );
}
