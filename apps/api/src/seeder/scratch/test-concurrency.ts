import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module.js';
import { CatalogService } from '../../public/catalog/catalog.service.js';
import { SearchCatalogDto } from '../../public/catalog/dto/search-catalog.dto.js';

async function bootstrap() {
  process.env.PERFORMANCE_DB = 'true';
  process.env.NODE_ENV = 'production';
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const catalogService = app.get(CatalogService);

  console.log('--- PHASE 7.4 CONCURRENCY VALIDATION ---');

  const concurrencyLevels = [20, 50, 100];
  const queryTypes: SearchCatalogDto[] = [
    { sort: 'newest', limit: 20 },
    { sort: 'price_asc', limit: 20 },
    { sort: 'name_asc', limit: 20 },
  ];

  for (const concurrency of concurrencyLevels) {
    for (const query of queryTypes) {
      console.log(`\n[Testing ${concurrency} concurrent requests for sort: ${query.sort}]`);
      const start = Date.now();
      
      const promises = [];
      for (let i = 0; i < concurrency; i++) {
        promises.push(catalogService.search({ ...query }));
      }
      
      try {
        await Promise.all(promises);
        const duration = Date.now() - start;
        console.log(`  ✅ Passed. Total time: ${duration}ms (${Math.round(duration / concurrency)}ms/req avg)`);
      } catch (err) {
        console.error(`  ❌ Failed during concurrency test:`, err);
      }
    }
  }

  await app.close();
}

bootstrap().catch(console.error);
