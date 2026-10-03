import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { PerformanceSeederService } from './performance-seeder.service.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  try {
    const scale = parseInt(process.env.SCALE || '10000', 10);
    const seed = parseInt(process.env.SEED || '12345', 10);

    const seederService = app.get(PerformanceSeederService);
    const runId = Date.now() % 100000;
    
    console.log(`\n==========================================`);
    console.log(`🚀 STARTING PERFORMANCE SEED`);
    console.log(`Scale (Target Products): ${scale}`);
    console.log(`Random Seed: ${seed}`);
    console.log(`Run ID (Namespace): ${runId}`);
    console.log(`==========================================\n`);

    const result = await seederService.seed(scale, seed, runId);

    console.log('\n==========================================');
    console.log('✅ PERFORMANCE SEED COMPLETED SUCCESSFULLY');
    console.log('==========================================');
    console.log(JSON.stringify(result.stats, null, 2));
    console.log('==========================================\n');
  } catch (error) {
    console.error('\n❌ PERFORMANCE SEED FAILED:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

void bootstrap();
