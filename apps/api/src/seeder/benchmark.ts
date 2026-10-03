import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { DataSource } from 'typeorm';
import { SellerProduct } from '../inventory/entities/seller-product.entity.js';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const dataSource = app.get(DataSource);
    const repo = dataSource.getRepository(SellerProduct);
    
    console.log(`\n==========================================`);
    console.log(`🚀 STARTING CATALOG QUERY DEEP DIVE`);
    console.log(`==========================================\n`);

    const testCases = [
      { name: 'newest', sort: 'newest' },
      { name: 'price_asc', sort: 'price_asc' },
      { name: 'price_desc', sort: 'price_desc' },
      { name: 'name_asc', sort: 'name_asc' },
    ];

    for (const tc of testCases) {
      const query = repo
        .createQueryBuilder('sp')
        .leftJoinAndSelect('sp.productVariant', 'pv')
        .leftJoinAndSelect('pv.product', 'p')
        .leftJoinAndSelect('p.category', 'cat')
        .leftJoinAndSelect('p.subCategory', 'subCat')
        .leftJoinAndSelect('p.images', 'images')
        .leftJoinAndSelect('p.brand', 'b')
        .leftJoinAndSelect('sp.shop', 'shop')
        .leftJoinAndSelect('sp.inventory', 'inv')
        .where('sp.isActive = :isActive', { isActive: true })
        .andWhere('pv.isActive = :isActive', { isActive: true })
        .andWhere('p.isActive = :isActive', { isActive: true })
        .andWhere('shop.isActive = :isActive', { isActive: true });

      switch (tc.sort) {
        case 'price_asc':
          query.orderBy('sp.price', 'ASC').addOrderBy('sp.id', 'DESC');
          break;
        case 'price_desc':
          query.orderBy('sp.price', 'DESC').addOrderBy('sp.id', 'DESC');
          break;
        case 'name_asc':
          query.orderBy('p.nameEn', 'ASC').addOrderBy('sp.id', 'DESC');
          break;
        case 'newest':
        default:
          query.orderBy('sp.createdAt', 'DESC').addOrderBy('sp.id', 'DESC');
          break;
      }

      query.take(20);

      const [sql, params] = query.getQueryAndParameters();
      console.log(`\n--- BENCHMARK: EXACT CATALOG QUERY (${tc.name}) ---`);
      
      try {
        const explainSql = `EXPLAIN (ANALYZE, BUFFERS, VERBOSE, FORMAT JSON) ${sql}`;
        const explainResult = await dataSource.query(explainSql, params);
        const planStr = JSON.stringify(explainResult[0]['QUERY PLAN'], null, 2);
        
        fs.writeFileSync(`C:/Users/RAKIB/.gemini/antigravity-ide/brain/97577330-a2ae-4ded-9a70-1a264f286ef3/scratch/plan_exact_${tc.name}.json`, planStr);
        
        const plan = explainResult[0]['QUERY PLAN'][0]['Plan'];
        console.log(`Execution plan saved to scratch/plan_exact_${tc.name}.json`);
        console.log(`Execution Time: ${explainResult[0]['QUERY PLAN'][0]['Execution Time'] ?? plan['Actual Total Time']} ms`);
        console.log(`Planning Time: ${explainResult[0]['QUERY PLAN'][0]['Planning Time']} ms`);
      } catch (err) {
        console.error('Error running EXPLAIN:', err);
      }
    }
    
    console.log('\n--- Test Row Multiplication ---');
    const counts = await dataSource.query(`
      SELECT
        (SELECT COUNT(*) FROM products) as p_count,
        (SELECT COUNT(*) FROM product_variants) as pv_count,
        (SELECT COUNT(*) FROM seller_products) as sp_count,
        (SELECT COUNT(*) FROM (
          SELECT sp.id
          FROM seller_products sp
          JOIN product_variants pv ON sp.product_variant_id = pv.id
          JOIN products p ON pv.product_id = p.id
          JOIN shops shop ON sp.shop_id = shop.id
          WHERE sp.is_active = true AND pv.is_active = true AND p.is_active = true AND shop.is_active = true
        ) x) as active_joined_count
    `);
    console.log('Counts:', counts[0]);
    
    console.log('\n--- Test Without Joins ---');
    const noJoinCases = [
      { name: 'sp_price_asc', sql: 'SELECT id, price FROM seller_products WHERE is_active = true ORDER BY price ASC, id DESC LIMIT 20' },
      { name: 'sp_newest', sql: 'SELECT id, created_at FROM seller_products WHERE is_active = true ORDER BY created_at DESC, id DESC LIMIT 20' },
      { name: 'p_newest', sql: 'SELECT id, created_at FROM products WHERE is_active = true ORDER BY created_at DESC, id DESC LIMIT 20' }
    ];
    
    for (const tc of noJoinCases) {
       console.log(`\n--- NO JOIN BENCHMARK: ${tc.name} ---`);
       try {
         const explainSql = `EXPLAIN (ANALYZE, BUFFERS, VERBOSE, FORMAT JSON) ${tc.sql}`;
         const explainResult = await dataSource.query(explainSql);
         const planStr = JSON.stringify(explainResult[0]['QUERY PLAN'], null, 2);
         fs.writeFileSync(`C:/Users/RAKIB/.gemini/antigravity-ide/brain/97577330-a2ae-4ded-9a70-1a264f286ef3/scratch/plan_nojoin_${tc.name}.json`, planStr);
         const plan = explainResult[0]['QUERY PLAN'][0]['Plan'];
         console.log(`Execution plan saved to scratch/plan_nojoin_${tc.name}.json`);
         console.log(`Execution Time: ${explainResult[0]['QUERY PLAN'][0]['Execution Time'] ?? plan['Actual Total Time']} ms`);
       } catch(err) {
         console.error(err);
       }
    }

    // ── TWO-PHASE QUERY BENCHMARK ──
    console.log('\n--- TWO-PHASE QUERY BENCHMARK ---');
    const twoPhaseTestCases = [
      { name: 'newest', sort: 'newest' },
      { name: 'price_asc', sort: 'price_asc' },
      { name: 'price_desc', sort: 'price_desc' },
      { name: 'name_asc', sort: 'name_asc' },
    ];

    for (const tc of twoPhaseTestCases) {
      console.log(`\n--- TWO-PHASE: ${tc.name} ---`);
      const t0 = performance.now();

      // Phase 1: ID-only
      const idQuery = repo
        .createQueryBuilder('sp')
        .select('sp.id', 'sp_id')
        .innerJoin('sp.productVariant', 'pv')
        .innerJoin('pv.product', 'p')
        .innerJoin('sp.shop', 'shop')
        .where('sp.isActive = :isActive', { isActive: true })
        .andWhere('pv.isActive = :isActive', { isActive: true })
        .andWhere('p.isActive = :isActive', { isActive: true })
        .andWhere('shop.isActive = :isActive', { isActive: true });

      switch (tc.sort) {
        case 'price_asc':
          idQuery.orderBy('sp.price', 'ASC').addOrderBy('sp.id', 'DESC');
          break;
        case 'price_desc':
          idQuery.orderBy('sp.price', 'DESC').addOrderBy('sp.id', 'DESC');
          break;
        case 'name_asc':
          idQuery.orderBy('p.nameEn', 'ASC').addOrderBy('sp.id', 'DESC');
          break;
        case 'newest':
        default:
          idQuery.orderBy('sp.createdAt', 'DESC').addOrderBy('sp.id', 'DESC');
          break;
      }

      const rawIds = await idQuery.limit(31).getRawMany();
      const t1 = performance.now();
      const ids = rawIds.slice(0, 30).map((r: any) => r.sp_id);

      // Phase 2: Hydrate
      const hydrateQuery = repo
        .createQueryBuilder('sp')
        .leftJoinAndSelect('sp.productVariant', 'pv')
        .leftJoinAndSelect('pv.product', 'p')
        .leftJoinAndSelect('p.category', 'cat')
        .leftJoinAndSelect('p.subCategory', 'subCat')
        .leftJoinAndSelect('p.images', 'images')
        .leftJoinAndSelect('p.brand', 'b')
        .leftJoinAndSelect('sp.shop', 'shop')
        .leftJoinAndSelect('sp.inventory', 'inv')
        .where('sp.id IN (:...ids)', { ids });

      switch (tc.sort) {
        case 'price_asc':
          hydrateQuery.orderBy('sp.price', 'ASC').addOrderBy('sp.id', 'DESC');
          break;
        case 'price_desc':
          hydrateQuery.orderBy('sp.price', 'DESC').addOrderBy('sp.id', 'DESC');
          break;
        case 'name_asc':
          hydrateQuery.orderBy('p.nameEn', 'ASC').addOrderBy('sp.id', 'DESC');
          break;
        case 'newest':
        default:
          hydrateQuery.orderBy('sp.createdAt', 'DESC').addOrderBy('sp.id', 'DESC');
          break;
      }

      const items = await hydrateQuery.getMany();
      const t2 = performance.now();

      console.log(`Phase 1 (IDs): ${(t1 - t0).toFixed(1)} ms (${rawIds.length} IDs)`);
      console.log(`Phase 2 (Hydrate): ${(t2 - t1).toFixed(1)} ms (${items.length} items)`);
      console.log(`TOTAL: ${(t2 - t0).toFixed(1)} ms`);
    }

    console.log('\n--- Offset vs Cursor (Exact Equivalent) ---');
    const qOffset = repo.createQueryBuilder('sp')
        .leftJoinAndSelect('sp.productVariant', 'pv')
        .leftJoinAndSelect('pv.product', 'p')
        .leftJoinAndSelect('p.category', 'cat')
        .leftJoinAndSelect('p.subCategory', 'subCat')
        .leftJoinAndSelect('p.images', 'images')
        .leftJoinAndSelect('p.brand', 'b')
        .leftJoinAndSelect('sp.shop', 'shop')
        .leftJoinAndSelect('sp.inventory', 'inv')
        .where('sp.isActive = :isActive', { isActive: true })
        .andWhere('pv.isActive = :isActive', { isActive: true })
        .andWhere('p.isActive = :isActive', { isActive: true })
        .andWhere('shop.isActive = :isActive', { isActive: true })
        .orderBy('sp.createdAt', 'DESC').addOrderBy('sp.id', 'DESC')
        .skip(5000)
        .take(20);
    const [sqlOff, paramsOff] = qOffset.getQueryAndParameters();
    try {
        const resultOff = await dataSource.query(`EXPLAIN (ANALYZE, FORMAT JSON) ${sqlOff}`, paramsOff);
        console.log(`Offset 5000: ${resultOff[0]['QUERY PLAN'][0]['Execution Time']} ms`);
    } catch(err) {}

    const qCursor = repo.createQueryBuilder('sp')
        .leftJoinAndSelect('sp.productVariant', 'pv')
        .leftJoinAndSelect('pv.product', 'p')
        .leftJoinAndSelect('p.category', 'cat')
        .leftJoinAndSelect('p.subCategory', 'subCat')
        .leftJoinAndSelect('p.images', 'images')
        .leftJoinAndSelect('p.brand', 'b')
        .leftJoinAndSelect('sp.shop', 'shop')
        .leftJoinAndSelect('sp.inventory', 'inv')
        .where('sp.isActive = :isActive', { isActive: true })
        .andWhere('pv.isActive = :isActive', { isActive: true })
        .andWhere('p.isActive = :isActive', { isActive: true })
        .andWhere('shop.isActive = :isActive', { isActive: true })
        .andWhere('(sp.createdAt < :createdAtCursor OR (sp.createdAt = :createdAtCursor AND sp.id < :idCursor))', { 
            createdAtCursor: new Date(), 
            idCursor: '00000000-0000-0000-0000-000000000000' 
        })
        .orderBy('sp.createdAt', 'DESC').addOrderBy('sp.id', 'DESC')
        .take(20);
    const [sqlCur, paramsCur] = qCursor.getQueryAndParameters();
    try {
        const resultCur = await dataSource.query(`EXPLAIN (ANALYZE, FORMAT JSON) ${sqlCur}`, paramsCur);
        console.log(`Cursor Equiv: ${resultCur[0]['QUERY PLAN'][0]['Execution Time']} ms`);
    } catch(err) {}

    console.log('--- END BENCHMARK ---');

  } catch (error) {
    console.error('\n❌ BENCHMARK FAILED:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

void bootstrap();
