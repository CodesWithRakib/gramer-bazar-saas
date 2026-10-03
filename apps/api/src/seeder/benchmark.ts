import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { DataSource } from 'typeorm';
import { Product } from '../catalog/entities/product.entity.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const dataSource = app.get(DataSource);
    
    console.log(`\n==========================================`);
    console.log(`🚀 STARTING BASELINE BENCHMARKS`);
    console.log(`==========================================\n`);

    const runExplain = async (name: string, queryBuilder: any) => {
      console.log(`\n--- BENCHMARK: ${name} ---`);
      
      const sql = queryBuilder.getQuery();
      const params = queryBuilder.getParameters();
      
      // Convert TypeORM query+params to raw execution string for explain analyze
      let rawSql = sql;
      Object.keys(params).forEach((key, idx) => {
        // Simple replacement for named params, only for simple string/numbers
        let val = params[key];
        if (typeof val === 'string') val = `'${val}'`;
        if (val instanceof Date) val = `'${val.toISOString()}'`;
        // regex replace $1 or @param with actual value for raw query analysis
      });

      const explainQuery = `EXPLAIN (ANALYZE, BUFFERS) ${sql}`;
      // In TypeORM with postgres, queryBuilder.getQueryAndParameters() returns [sql, paramsArray]
      const [finalSql, finalParams] = queryBuilder.getQueryAndParameters();
      const finalExplain = `EXPLAIN (ANALYZE, BUFFERS) ${finalSql}`;
      
      try {
        const result = await dataSource.query(finalExplain, finalParams);
        result.forEach((row: any) => console.log(row['QUERY PLAN']));
      } catch (e: any) {
        console.error('Failed to run explain:', e.message);
      }
    };

    const repo = dataSource.getRepository(Product);

    // 1. Catalog Newest (First page)
    const q1 = repo.createQueryBuilder('p')
      .leftJoinAndSelect('p.variants', 'v')
      .leftJoinAndSelect('v.sellerProducts', 'sp')
      .where('p.status = :status', { status: 'PUBLISHED' })
      .orderBy('sp.createdAt', 'DESC')
      .addOrderBy('sp.id', 'DESC')
      .take(20);
    await runExplain('Catalog Newest (First Page)', q1);

    // 2. Price Ascending (Deep cursor)
    const q2 = repo.createQueryBuilder('p')
      .leftJoinAndSelect('p.variants', 'v')
      .leftJoinAndSelect('v.sellerProducts', 'sp')
      .where('p.status = :status', { status: 'PUBLISHED' })
      .andWhere('(sp.price > :priceCursor OR (sp.price = :priceCursor AND sp.id < :idCursor))', { priceCursor: 5000, idCursor: '00000000-0000-0000-0000-000000000000' })
      .orderBy('sp.price', 'ASC')
      .addOrderBy('sp.id', 'DESC')
      .take(20);
    await runExplain('Price Ascending (Deep Cursor)', q2);

    // 3. Search (English Trigram)
    const q3 = repo.createQueryBuilder('p')
      .leftJoinAndSelect('p.variants', 'v')
      .leftJoinAndSelect('v.sellerProducts', 'sp')
      .where('p.status = :status', { status: 'PUBLISHED' })
      .andWhere('p.nameEn ILIKE :q', { q: '%Smart Laptop%' })
      .orderBy('sp.id', 'DESC')
      .take(20);
    await runExplain('Search (English Trigram)', q3);

    // 4. Search (Bangla Trigram)
    const q4 = repo.createQueryBuilder('p')
      .leftJoinAndSelect('p.variants', 'v')
      .leftJoinAndSelect('v.sellerProducts', 'sp')
      .where('p.status = :status', { status: 'PUBLISHED' })
      .andWhere('p.nameBn ILIKE :q', { q: '%স্মার্ট ল্যাপটপ%' })
      .orderBy('sp.id', 'DESC')
      .take(20);
    await runExplain('Search (Bangla Trigram)', q4);

    // 5. Deep Category Filter
    // We assume a category path lookup
    const q5 = repo.createQueryBuilder('p')
      .innerJoin('categories', 'c', 'c.id = p.categoryId')
      .leftJoinAndSelect('p.variants', 'v')
      .leftJoinAndSelect('v.sellerProducts', 'sp')
      .where('p.status = :status', { status: 'PUBLISHED' })
      .andWhere('c.path LIKE :path', { path: '%f3850203-6288-4a0a-a6e3-3b8b062cfb46/%' })
      .orderBy('sp.id', 'DESC')
      .take(20);
    await runExplain('Deep Category Filter', q5);

  } catch (error) {
    console.error('\n❌ BENCHMARK FAILED:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

void bootstrap();
