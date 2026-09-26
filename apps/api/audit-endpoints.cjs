const fs = require('fs');
const path = require('path');

const controllers = [
  'src/app.controller.ts',
  'src/auth/auth.controller.ts',
  'src/users/users.controller.ts',
  'src/otp/dev-otp.controller.ts',
  'src/locations/locations.controller.ts',
  'src/addresses/addresses.controller.ts',
  'src/catalog/categories/categories.controller.ts',
  'src/catalog/brands/brands.controller.ts',
  'src/catalog/products/products.controller.ts',
  'src/catalog/product-variants/product-variants.controller.ts',
  'src/catalog/importer/product-importer.controller.ts',
  'src/public/catalog/catalog.controller.ts',
  'src/public/categories/categories.controller.ts',
  'src/public/cart/cart.controller.ts',
  'src/shops/shops/shops.controller.ts',
  'src/inventory/seller-products/seller-products.controller.ts',
  'src/inventory/inventory/inventory.controller.ts',
  'src/reviews/reviews.controller.ts',
  'src/orders/orders.controller.ts',
  'src/product-requests/product-requests.controller.ts',
  'src/seller-portal/seller-portal.controller.ts',
  'src/deliveries/deliveries.controller.ts',
  'src/wishlists/wishlists.controller.ts',
  'src/notifications/notifications.controller.ts',
  'src/analytics/analytics.controller.ts',
  'src/coupons/coupons.controller.ts',
  'src/chat/chat.controller.ts',
  'src/payments/payments.controller.ts',
  'src/seeder/seeder.controller.ts',
  'src/banners/banners.controller.ts',
  'src/wallets/wallets.controller.ts',
  'src/payouts/payouts.controller.ts',
  'src/disputes/disputes.controller.ts',
  'src/flash-sales/flash-sales.controller.ts',
  'src/audit-logs/audit-logs.controller.ts',
  'src/settings/settings.controller.ts',
  'src/applications/applications.controller.ts'
];

let totalEndpoints = 0;
const results = [];

for (const c of controllers) {
  const filePath = path.join(__dirname, c);
  if (!fs.existsSync(filePath)) {
    console.error('Missing file:', c);
    continue;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const controllerMatch = content.match(/@Controller\((?:['"](.*?)['"])?\)/);
  const prefix = controllerMatch && controllerMatch[1] ? controllerMatch[1] : '';
  const lines = content.split(/\r?\n/);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const m = line.match(/^@(Get|Post|Put|Patch|Delete)\((?:['"](.*?)['"])?\)/);
    if (m) {
      totalEndpoints++;
      const verb = m[1].toUpperCase();
      const subPath = m[2] || '';
      let fullPath = '/' + [prefix, subPath].filter(Boolean).join('/');
      if (!fullPath.startsWith('/')) fullPath = '/' + fullPath;
      if (fullPath === '') fullPath = '/';

      // Find method name and decorators
      let fnName = '';
      let hasApiOperation = false;
      let hasApiResponse = false;
      let hasApiOkResponse = false;
      let hasBearerAuth = false;
      let hasRoles = false;
      let hasPermissions = false;

      // Scan surrounding lines
      for (let j = Math.max(0, i - 10); j <= Math.min(lines.length - 1, i + 10); j++) {
        if (lines[j].includes('@ApiOperation')) hasApiOperation = true;
        if (lines[j].includes('@ApiResponse')) hasApiResponse = true;
        if (lines[j].includes('@ApiOkResponse')) hasApiOkResponse = true;
        if (lines[j].includes('@ApiBearerAuth') || content.includes('@ApiBearerAuth()') && j === i) hasBearerAuth = true;
        if (lines[j].includes('@Roles(')) hasRoles = true;
        if (lines[j].includes('@Permissions(')) hasPermissions = true;
      }

      for (let j = i + 1; j < Math.min(i + 15, lines.length); j++) {
        const fnMatch = lines[j].match(/(?:async\s+)?([a-zA-Z0-9_]+)\s*\(/);
        if (fnMatch && !lines[j].trim().startsWith('@')) {
          fnName = fnMatch[1];
          break;
        }
      }

      results.push({
        controller: c,
        verb,
        path: fullPath,
        fn: fnName,
        hasApiOperation,
        hasApiResponse,
        hasApiOkResponse,
        hasBearerAuth: hasBearerAuth || content.includes('@ApiBearerAuth()'),
        hasRoles,
        hasPermissions
      });
    }
  }
}

console.log('Total controllers audited:', controllers.length);
console.log('Total endpoints found:', totalEndpoints);
fs.writeFileSync(path.join(__dirname, 'endpoints-inventory.json'), JSON.stringify(results, null, 2));
console.log('Saved to endpoints-inventory.json');
