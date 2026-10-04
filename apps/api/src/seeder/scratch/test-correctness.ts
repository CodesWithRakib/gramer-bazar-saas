import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module.js';
import { CatalogService } from '../../public/catalog/catalog.service.js';
import assert from 'assert';

async function bootstrap() {
  process.env.PERFORMANCE_DB = 'true';
  process.env.NODE_ENV = 'production';
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const catalogService = app.get(CatalogService);

  console.log('--- PHASE 7.4 CORRECTNESS VALIDATION ---');

  const modes = ['newest', 'price_asc', 'price_desc', 'name_asc'];
  const testLimit = 1000;

  for (const mode of modes) {
    console.log(`\n[Testing Sort Mode: ${mode}]`);
    let cursor = undefined;
    let page = 1;
    let totalItems = 0;
    const collectedIds = new Set<string>();
    let lastItem = null;

    console.log(`  Paginating through up to 5 pages (limit ${testLimit})...`);

    for (let i = 0; i < 5; i++) {
      const res = await catalogService.search({
        limit: testLimit,
        sort: mode as any,
        cursor,
      });

      if (res.data.length === 0) break;

      if (lastItem) {
        const firstOfThisPage = res.data[0];
        if (mode === 'newest') {
          assert(new Date(lastItem.createdAt).getTime() >= new Date(firstOfThisPage.createdAt).getTime(), 'Newest order violated across pages');
        } else if (mode === 'price_asc') {
          assert(Number(lastItem.price) <= Number(firstOfThisPage.price), 'Price ASC order violated across pages');
        } else if (mode === 'price_desc') {
          assert(Number(lastItem.price) >= Number(firstOfThisPage.price), 'Price DESC order violated across pages');
        } else if (mode === 'name_asc') {
          const nameLast = lastItem.productVariant.product.nameEn;
          const nameFirst = firstOfThisPage.productVariant.product.nameEn;
          assert(nameLast <= nameFirst, 'Name ASC order violated across pages');
        }
      }

      for (let j = 0; j < res.data.length - 1; j++) {
        const a = res.data[j];
        const b = res.data[j+1];
        if (mode === 'newest') {
          if (new Date(a.createdAt).getTime() === new Date(b.createdAt).getTime()) {
            assert(a.id > b.id, 'Tiebreaker newest violated');
          }
        } else if (mode === 'price_asc') {
           if (Number(a.price) === Number(b.price)) {
             assert(a.id > b.id, 'Tiebreaker price_asc violated');
           }
        } else if (mode === 'price_desc') {
           if (Number(a.price) === Number(b.price)) {
             assert(a.id > b.id, 'Tiebreaker price_desc violated');
           }
        } else if (mode === 'name_asc') {
           if (a.productVariant.product.nameEn === b.productVariant.product.nameEn) {
             assert(a.id > b.id, 'Tiebreaker name_asc violated');
           }
        }
      }

      res.data.forEach((item: any) => {
        if (collectedIds.has(item.id)) {
           console.error(`❌ DUPLICATE FOUND in mode ${mode}: ${item.id}`);
           process.exit(1);
        }
        collectedIds.add(item.id);
      });

      totalItems += res.data.length;
      lastItem = res.data[res.data.length - 1];

      if (!res.meta.nextCursor) {
        break;
      }
      cursor = res.meta.nextCursor;
      page++;
    }

    console.log(`  ✅ Passed. Fetched ${totalItems} items. Order is correct. No duplicates.`);
  }

  console.log(`\n[Testing Filters with Cursor]`);
  const filterCursorRes = await catalogService.search({
      limit: 50,
      sort: 'price_asc',
      minPrice: 100,
      maxPrice: 500,
  });
  
  assert(filterCursorRes.data.length > 0, 'Should find products between 100 and 500');
  let validPrices = filterCursorRes.data.every((i: any) => Number(i.price) >= 100 && Number(i.price) <= 500);
  assert(validPrices, 'Prices must be strictly between 100 and 500');
  
  if (filterCursorRes.meta.nextCursor) {
      const nextRes = await catalogService.search({
          limit: 50,
          sort: 'price_asc',
          minPrice: 100,
          maxPrice: 500,
          cursor: filterCursorRes.meta.nextCursor
      });
      validPrices = nextRes.data.every((i: any) => Number(i.price) >= 100 && Number(i.price) <= 500);
      assert(validPrices, 'Page 2 Prices must be strictly between 100 and 500');
  }
  console.log(`  ✅ Passed price filter with cursor.`);

  console.log(`\n[Testing Invalid Cursor]`);
  const invalidRes = await catalogService.search({
      limit: 10,
      sort: 'newest',
      cursor: 'invalid_base64_string_xyz'
  });
  assert(invalidRes.data.length === 10, 'Should fall back to page 1');
  console.log(`  ✅ Passed invalid cursor fallback.`);

  console.log(`\n[Testing Limits]`);
  let limitRes = await catalogService.search({ limit: -5 } as any);
  assert(limitRes.data.length === 20, 'Should use default limit');
  
  limitRes = await catalogService.search({ limit: 1000000 } as any);
  console.log(`  Limit 1M fetched: ${limitRes.data.length} items`);

  console.log(`\n✅ ALL CORRECTNESS TESTS PASSED.`);
  await app.close();
}

bootstrap().catch(console.error);
