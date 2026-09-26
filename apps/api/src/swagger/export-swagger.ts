import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { createSwaggerDocument } from './swagger.config.js';
import * as fs from 'fs';
import * as path from 'path';

async function generateSwaggerSpec() {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('api/v1', {
    exclude: ['/', 'health', 'docs', 'favicon.ico'],
  });

  const document = createSwaggerDocument(app);
  const outputPath = path.resolve(process.cwd(), 'swagger-spec.json');
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2), 'utf8');
  console.log(`Swagger specification exported successfully to: ${outputPath}`);
  console.log(`Endpoints documented: ${Object.keys(document.paths || {}).length}`);
  console.log(`Component schemas: ${Object.keys(document.components?.schemas || {}).length}`);

  await app.close();
}

generateSwaggerSpec().catch((err) => {
  console.error('Failed to export Swagger specification:', err);
  process.exit(1);
});
