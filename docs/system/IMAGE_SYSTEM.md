# Image System & Asset Handling

## Image Pipeline

Product images, shop banners, and profile avatars follow a multi-tier fallback storage pipeline:

```text
Upload Request
   │
   ├─► 1. Supabase Cloud Bucket (if credentials configured)
   │
   └─► 2. Local File System Fallback (apps/api/uploads/)
          Served statically via NestJS ServeStaticModule at http://localhost:4000/uploads
```

---

## Allowed Remote Image Domains (`next.config.ts`)

- `http://localhost:4000` & `http://127.0.0.1:4000` (Local API uploads)
- `*.supabase.co` (Supabase Cloud Storage)
- `placehold.co` (Placeholder imagery)
- `images.unsplash.com` & `plus.unsplash.com` (Curated marketplace imagery)
- `chaldn.com`, `ghorerbazarbd.com`, `khaasfood.com` (Catalog import sources)

---

## Client Image Optimization

- All components consume Next.js `<Image>` component (`next/image`) with `sizes` attributes for responsive srcset generation.
- Placeholder fallbacks are rendered gracefully on image load error (`/placeholder.jpg`).
