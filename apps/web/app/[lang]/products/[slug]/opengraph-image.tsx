import { ImageResponse } from 'next/og';
 
// Route segment config
export const runtime = 'edge';
 
// Image metadata
export const alt = 'Product Image';
export const size = {
  width: 1200,
  height: 630,
};
 
export const contentType = 'image/png';
 
export default async function Image({ params }: { params: { slug: string; lang: string } }) {
  const { slug, lang } = params;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const res = await fetch(`${baseUrl}/public/catalog/${slug}`, { next: { revalidate: 60 } });
    const products = await res.json();
    
    if (!products || products.length === 0) {
      throw new Error('Not found');
    }

    const product = products[0];
    const isBn = lang === 'bn';
    const name = isBn ? (product.productVariant.nameBn || product.productVariant.product.nameBn) : (product.productVariant.nameEn || product.productVariant.product.nameEn);
    const price = product.discountPrice ? Number(product.discountPrice) : Number(product.price);
    const image = product.productVariant.images?.[0] || 'https://via.placeholder.com/600';

    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(to bottom right, #f0fdf4, #bbf7d0)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '80px',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', width: '50%' }}>
            <div style={{ fontSize: 32, color: '#16a34a', fontWeight: 'bold', marginBottom: 20 }}>
              Gramer Bazar
            </div>
            <div
              style={{
                fontSize: 64,
                fontWeight: 'bold',
                color: '#1f2937',
                lineHeight: 1.2,
                marginBottom: 40,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {name}
            </div>
            <div
              style={{
                fontSize: 48,
                color: '#16a34a',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              ৳ {price.toLocaleString()}
            </div>
          </div>
          
          <div style={{ display: 'flex', width: '40%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={image.startsWith('http') ? image : `http://localhost:3000${image}`} 
              alt={name}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '16px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              }}
            />
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  } catch (e) {
    return new ImageResponse(
      (
        <div
          style={{
            background: '#16a34a',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 64,
            color: 'white',
            fontWeight: 'bold',
          }}
        >
          Gramer Bazar
        </div>
      ),
      {
        ...size,
      }
    );
  }
}
