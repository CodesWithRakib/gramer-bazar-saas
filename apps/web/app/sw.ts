import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";
import { NetworkFirst, StaleWhileRevalidate } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      // Cache product and category API calls so browsing works offline
      matcher: ({ url }) => url.pathname.startsWith('/api/v1/public/catalog') || url.pathname.startsWith('/api/v1/public/categories'),
      handler: new NetworkFirst({
        cacheName: 'gramer-bazar-api-cache',
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {
              if (response && response.status === 200) {
                return response;
              }
              return null;
            },
          },
        ],
      }),
    },
    {
      // Cache images from our CDNs (S3, Cloudinary, etc.)
      matcher: ({ url }) => 
        url.hostname.includes('amazonaws.com') || 
        url.hostname.includes('cloudinary.com') ||
        url.hostname.includes('unsplash.com') ||
        url.hostname.includes('placehold.co'),
      handler: new StaleWhileRevalidate({
        cacheName: 'gramer-bazar-external-images',
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
