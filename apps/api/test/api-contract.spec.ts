import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('OpenAPI / Swagger Contract Validation', () => {
  const specPath = path.resolve(process.cwd(), 'swagger-spec.json');

  it('should have a generated swagger-spec.json file', () => {
    expect(fs.existsSync(specPath)).toBe(true);
  });

  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));

  it('should have valid OpenAPI 3.0 info metadata', () => {
    expect(spec.openapi).toMatch(/^3\./);
    expect(spec.info).toBeDefined();
    expect(spec.info.title).toContain('Gramer Bazar');
    expect(spec.info.version).toBe('1.0.0');
  });

  it('should document all controllers and have at least 160 endpoints', () => {
    const paths = Object.keys(spec.paths || {});
    expect(paths.length).toBeGreaterThanOrEqual(160);
  });

  it('every endpoint should have operations with summary and documented responses', () => {
    const paths = spec.paths || {};
    const methods = ['get', 'post', 'put', 'patch', 'delete'];

    let totalOperations = 0;
    for (const [routePath, pathItem] of Object.entries(paths)) {
      for (const method of methods) {
        const op = (pathItem as any)[method];
        if (op) {
          totalOperations++;
          // Must have summary
          expect(op.summary, `Missing summary for ${method.toUpperCase()} ${routePath}`).toBeDefined();
          expect(typeof op.summary).toBe('string');
          expect(op.summary.length).toBeGreaterThan(0);

          // Must have tags
          expect(op.tags, `Missing tags for ${method.toUpperCase()} ${routePath}`).toBeDefined();
          expect(op.tags.length).toBeGreaterThan(0);

          // Must have responses
          expect(op.responses, `Missing responses for ${method.toUpperCase()} ${routePath}`).toBeDefined();
          const statusCodes = Object.keys(op.responses);
          expect(statusCodes.length, `No response status codes for ${method.toUpperCase()} ${routePath}`).toBeGreaterThan(0);

          // Must document at least one 2xx or 3xx status
          const hasSuccessStatus = statusCodes.some((code) => code.startsWith('2') || code.startsWith('3'));
          expect(hasSuccessStatus, `No 2xx/3xx response for ${method.toUpperCase()} ${routePath}`).toBe(true);
        }
      }
    }
    expect(totalOperations).toBeGreaterThanOrEqual(160);
  });

  it('every component schema $ref should resolve to an existing schema without broken references', () => {
    const schemas = spec.components?.schemas || {};
    expect(Object.keys(schemas).length).toBeGreaterThanOrEqual(140);

    // Recursively check all $ref in the spec
    function checkRefs(obj: any, currentPath = '') {
      if (!obj || typeof obj !== 'object') return;
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => checkRefs(item, `${currentPath}[${index}]`));
        return;
      }

      for (const [key, val] of Object.entries(obj)) {
        if (key === '$ref' && typeof val === 'string') {
          const match = val.match(/^#\/components\/schemas\/(.+)$/);
          if (match) {
            const schemaName = match[1];
            expect(
              schemas[schemaName],
              `Broken reference ${val} at ${currentPath}`,
            ).toBeDefined();
          }
        } else {
          checkRefs(val, `${currentPath}.${key}`);
        }
      }
    }

    checkRefs(spec);
  });

  it('should include core domain response DTO schemas', () => {
    const schemas = spec.components?.schemas || {};
    const expectedSchemas = [
      'ApiResponseDto',
      'PaginationMetaDto',
      'ApiErrorResponseDto',
      'ProductResponseDto',
      'CategoryResponseDto',
      'BrandResponseDto',
      'ShopResponseDto',
      'OrderResponseDto',
      'PaymentResponseDto',
      'DeliveryResponseDto',
      'CouponResponseDto',
      'DisputeResponseDto',
      'FlashSaleResponseDto',
      'SellerApplicationResponseDto',
      'RiderApplicationResponseDto',
      'WalletResponseDto',
      'PayoutResponseDto',
      'PlatformSettingsResponseDto',
    ];

    for (const schemaName of expectedSchemas) {
      expect(schemas[schemaName], `Missing expected core schema ${schemaName}`).toBeDefined();
    }
  });
});
