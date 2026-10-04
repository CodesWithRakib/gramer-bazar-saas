// Temporary inventory generator: parses the committed swagger-spec.json and
// emits a grouped endpoint inventory (method, path, tags, security, params).
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const spec = JSON.parse(readFileSync(resolve(__dirname, '../../../apps/api/swagger-spec.json'), 'utf8'));

const METHODS = ['get', 'post', 'put', 'patch', 'delete'];
const rows = [];
for (const [path, ops] of Object.entries(spec.paths || {})) {
  for (const [method, op] of Object.entries(ops)) {
    if (!METHODS.includes(method)) continue;
    const sec = (op.security || []).map((s) => Object.keys(s)[0]);
    rows.push({
      method: method.toUpperCase(),
      path,
      tags: op.tags || [],
      security: sec.length ? sec.join(',') : 'public',
      summary: op.summary || '',
      queryParams: (op.parameters || [])
        .filter((p) => p.in === 'query')
        .map((p) => p.name),
      pathParams: (op.parameters || [])
        .filter((p) => p.in === 'path')
        .map((p) => p.name),
    });
  }
}

// Derive auth classification from path prefixes (documented in QA audit).
function classify(r) {
  const p = r.path;
  if (r.security === 'public' || r.security === '') {
    if (p.includes('/auth/')) return 'Authentication';
    if (p.includes('/payments/')) return 'Payment (callback)';
    return 'Public';
  }
  if (p.startsWith('/api/v1/super-admin/')) return 'Super Admin';
  if (p.startsWith('/api/v1/admin/') || p.includes('/admin/')) return 'Admin';
  if (p.startsWith('/api/v1/seller-portal/') || p.startsWith('/api/v1/seller/')) return 'Seller';
  if (p.startsWith('/api/v1/deliveries/rider/') || p.startsWith('/api/v1/riders/')) return 'Rider';
  if (p.includes('/analytics/')) return 'Analytics';
  if (p.includes('/notifications/')) return 'Notification';
  if (p.includes('/payments/')) return 'Payment';
  if (p.includes('/auth/')) return 'Authentication';
  return 'Authenticated (customer/general)';
}

const byCategory = {};
for (const r of rows) {
  const c = classify(r);
  (byCategory[c] ||= []).push(r);
}

const counts = Object.fromEntries(Object.entries(byCategory).map(([k, v]) => [k, v.length]));

console.log('Total operations:', rows.length);
console.log('By category:', JSON.stringify(counts, null, 2));

const out = { totalOperations: rows.length, counts, byCategory };
writeFileSync(resolve(__dirname, '../../../performance-reports/_api-inventory.json'), JSON.stringify(out, null, 2));
console.log('wrote performance-reports/_api-inventory.json');
