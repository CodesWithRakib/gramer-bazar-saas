import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '@/app.module.js';
import { Product } from '@/catalog/entities/product.entity.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const dataSource = app.get(DataSource);

    console.log(`\n==========================================`);
    console.log(`🚀 STARTING BASELINE BENCHMARKS`);
    console.log(`==========================================\n`);

    const measureDbSize = async () => {
      console.log(`\n--- DATABASE SIZE ---`);
      const sizes = await dataSource.query(`
        SELECT 
          pg_size_pretty(pg_database_size(current_database())) as db_size,
          pg_size_pretty(pg_total_relation_size('products')) as products_size,
          pg_size_pretty(pg_total_relation_size('seller_products')) as seller_products_size,
          pg_size_pretty(pg_total_relation_size('categories')) as categories_size,
          pg_size_pretty(pg_total_relation_size('reviews')) as reviews_size
      `);
      console.log(sizes[0]);

      const indexSizes = await dataSource.query(`
        SELECT 
          indexname, 
          pg_size_pretty(pg_relation_size(indexrelid::regclass)) as index_size
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public' 
          AND relname IN ('products', 'seller_products', 'categories')
        ORDER BY pg_relation_size(indexrelid::regclass) DESC;
      `);
      console.log(`\nINDEX SIZES:`);
      indexSizes.forEach((idx: any) => console.log(`${idx.indexname}: ${idx.index_size}`));
    };

    await measureDbSize();

    const runExplain = async (name: string, queryBuilder: any) => {
      console.log(`\n--- BENCHMARK: ${name} ---`);

      const [finalSql, finalParams] = queryBuilder.getQueryAndParameters();
      const finalExplain = `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${finalSql}`;

      try {
        const result = await dataSource.query(finalExplain, finalParams);
        const plan = result[0]['QUERY PLAN'][0]['Plan'];
        console.log(
          `Execution Time: ${plan['Actual Total Time'] ?? result[0]['QUERY PLAN'][0]['Execution Time']} ms`,
        );
        console.log(`Planning Time: ${result[0]['QUERY PLAN'][0]['Planning Time']} ms`);
        console.log(`Node Type: ${plan['Node Type']}`);
        if (plan['Plans']) {
          console.log(`Child Node Type 1: ${plan['Plans'][0]['Node Type']}`);
        }
      } catch (e: any) {
        console.error('Failed to run explain:', e.message);
      }
    };

    const repo = dataSource.getRepository(Product);

    // 10. Public Catalog — First Page (Newest)
    const q1 = repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.variants', 'v')
      .leftJoinAndSelect('v.sellerProducts', 'sp')
      .where('p.status = :status', { status: 'PUBLISHED' })
      .orderBy('sp.createdAt', 'DESC')
      .addOrderBy('sp.id', 'DESC')
      .take(20);
    await runExplain('10. Catalog Newest (First Page)', q1);

    // 11. Cursor Traversal (Deep)
    const q2 = repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.variants', 'v')
      .leftJoinAndSelect('v.sellerProducts', 'sp')
      .where('p.status = :status', { status: 'PUBLISHED' })
      .andWhere(
        '(sp.createdAt < :createdAtCursor OR (sp.createdAt = :createdAtCursor AND sp.id < :idCursor))',
        {
          createdAtCursor: new Date(),
          idCursor: '00000000-0000-0000-0000-000000000000',
        },
      )
      .orderBy('sp.createdAt', 'DESC')
      .addOrderBy('sp.id', 'DESC')
      .take(20);
    await runExplain('11. Catalog Newest (Deep Cursor)', q2);

    // 12. Sort Benchmarks
    const qSortPriceAsc = repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.variants', 'v')
      .leftJoinAndSelect('v.sellerProducts', 'sp')
      .where('p.status = :status', { status: 'PUBLISHED' })
      .orderBy('sp.price', 'ASC')
      .addOrderBy('sp.id', 'DESC')
      .take(20);
    await runExplain('12. Sort: Price Ascending (First Page)', qSortPriceAsc);

    const qSortNameAsc = repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.variants', 'v')
      .leftJoinAndSelect('v.sellerProducts', 'sp')
      .where('p.status = :status', { status: 'PUBLISHED' })
      .orderBy('p.nameEn', 'ASC')
      .addOrderBy('sp.id', 'DESC')
      .take(20);
    await runExplain('12. Sort: Name Ascending (First Page)', qSortNameAsc);

    // 16. Search Benchmarks
    const runSearch = async (name: string, term: string, lang: 'En' | 'Bn') => {
      const q = repo
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.variants', 'v')
        .leftJoinAndSelect('v.sellerProducts', 'sp')
        .where('p.status = :status', { status: 'PUBLISHED' })
        .andWhere(`p.name${lang} ILIKE :q`, { q: `%${term}%` })
        .orderBy('sp.id', 'DESC')
        .take(20);
      await runExplain(`16. Search: ${name} ('${term}')`, q);
    };

    await runSearch('English Common', 'Smart', 'En');
    await runSearch('Bangla Common', 'স্মার্ট', 'Bn');
    await runSearch('Partial English', 'lap', 'En');
    await runSearch('Short English', 'a', 'En');
    await runSearch('Typo English', 'lpatop', 'En');

    // 13. Filter Combinations
    const qFilterCatBrand = repo
      .createQueryBuilder('p')
      .innerJoin('categories', 'c', 'c.id = p.categoryId')
      .leftJoinAndSelect('p.variants', 'v')
      .leftJoinAndSelect('v.sellerProducts', 'sp')
      .where('p.status = :status', { status: 'PUBLISHED' })
      .andWhere('c.path LIKE :path', { path: '%f3850203-6288-4a0a-a6e3-3b8b062cfb46/%' })
      .andWhere('p.brandId = :brandId', { brandId: '00000000-0000-0000-0000-000000000000' })
      .orderBy('sp.id', 'DESC')
      .take(20);
    await runExplain('13. Filter: Category + Brand', qFilterCatBrand);

    // 19. Offset vs Cursor Benchmark
    const qOffset = repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.variants', 'v')
      .leftJoinAndSelect('v.sellerProducts', 'sp')
      .where('p.status = :status', { status: 'PUBLISHED' })
      .orderBy('sp.createdAt', 'DESC')
      .addOrderBy('sp.id', 'DESC')
      .skip(5000)
      .take(20);
    await runExplain('19. Pagination: OFFSET 5000', qOffset);

    const qCursorEquiv = repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.variants', 'v')
      .leftJoinAndSelect('v.sellerProducts', 'sp')
      .where('p.status = :status', { status: 'PUBLISHED' })
      .andWhere(
        '(sp.createdAt < :createdAtCursor OR (sp.createdAt = :createdAtCursor AND sp.id < :idCursor))',
        {
          createdAtCursor: new Date('2025-01-01'),
          idCursor: '00000000-0000-0000-0000-000000000000',
        },
      )
      .orderBy('sp.createdAt', 'DESC')
      .addOrderBy('sp.id', 'DESC')
      .take(20);
    await runExplain('19. Pagination: CURSOR Equivalent to Deep Page', qCursorEquiv);
  } catch (error) {
    console.error('\n❌ BENCHMARK FAILED:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

void bootstrap();
