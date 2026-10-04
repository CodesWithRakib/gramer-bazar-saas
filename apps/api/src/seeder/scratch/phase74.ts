import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module.js';
import { CatalogService } from '../../public/catalog/catalog.service.js';
import { DataSource } from 'typeorm';

async function bootstrap() {
  process.env.PERFORMANCE_DB = 'true';
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const catalogService = app.get(CatalogService);
  const dataSource = app.get(DataSource);

  console.log('--- PHASE 7.4 CORRECTNESS VALIDATION ---');

  // We will add all tests here
  // Test 1: Cursor Traversal Exhaustion (newest)
  console.log('\n[1] Cursor Traversal Exhaustion (newest)');
  let cursor = undefined;
  let totalItems = 0;
  let page = 1;
  const collectedIds = new Set<string>();

  while (true) {
    const res = await catalogService.search({
      limit: 100,
      sort: 'newest',
      cursor,
    });
    
    res.data.forEach(item => collectedIds.add(item.id));
    totalItems += res.data.length;
    
    if (page % 50 === 0) {
      console.log(`  Fetched page ${page}, total items: ${totalItems}`);
    }

    if (!res.meta.nextCursor) {
      break;
    }
    cursor = res.meta.nextCursor;
    page++;
  }

  console.log(`  Traversal complete.`);
  console.log(`  Total pages: ${page}`);
  console.log(`  Total items: ${totalItems}`);
  console.log(`  Unique IDs: ${collectedIds.size}`);
  
  if (totalItems === collectedIds.size) {
    console.log(`  ✅ Duplicate Check: PASSED (No duplicates)`);
  } else {
    console.error(`  ❌ Duplicate Check: FAILED (${totalItems - collectedIds.size} duplicates)`);
  }

  await app.close();
}

bootstrap().catch(console.error);
