import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module.js';
import { AuthService } from '../auth/auth.service.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const dataSource = app.get(DataSource);
    const authService = app.get(AuthService);

    console.log('\n==========================================');
    console.log('🔍 GRAMER BAZAR DATABASE VERIFICATION AUDIT');
    console.log('==========================================\n');

    // 1. Table Counts Audit
    const tables = [
      { name: 'users', query: 'SELECT COUNT(*) as count FROM users' },
      { name: 'roles', query: 'SELECT COUNT(*) as count FROM roles' },
      { name: 'user_roles', query: 'SELECT COUNT(*) as count FROM user_roles' },
      { name: 'shops', query: 'SELECT COUNT(*) as count FROM shops' },
      { name: 'categories', query: 'SELECT COUNT(*) as count FROM categories' },
      { name: 'brands', query: 'SELECT COUNT(*) as count FROM brands' },
      { name: 'products', query: 'SELECT COUNT(*) as count FROM products' },
      { name: 'product_variants', query: 'SELECT COUNT(*) as count FROM product_variants' },
      { name: 'product_images', query: 'SELECT COUNT(*) as count FROM product_images' },
      { name: 'seller_products', query: 'SELECT COUNT(*) as count FROM seller_products' },
      { name: 'inventory', query: 'SELECT COUNT(*) as count FROM inventory' },
      { name: 'addresses', query: 'SELECT COUNT(*) as count FROM addresses' },
      { name: 'orders', query: 'SELECT COUNT(*) as count FROM orders' },
      { name: 'order_items', query: 'SELECT COUNT(*) as count FROM order_items' },
      { name: 'order_status_history', query: 'SELECT COUNT(*) as count FROM order_status_history' },
      { name: 'payments', query: 'SELECT COUNT(*) as count FROM payments' },
      { name: 'deliveries', query: 'SELECT COUNT(*) as count FROM deliveries' },
      { name: 'delivery_status_history', query: 'SELECT COUNT(*) as count FROM delivery_status_history' },
      { name: 'reviews', query: 'SELECT COUNT(*) as count FROM reviews' },
      { name: 'wishlist_items', query: 'SELECT COUNT(*) as count FROM wishlist_items' },
      { name: 'coupons', query: 'SELECT COUNT(*) as count FROM coupons' },
      { name: 'notifications', query: 'SELECT COUNT(*) as count FROM notifications' },
      { name: 'conversations', query: 'SELECT COUNT(*) as count FROM conversations' },
      { name: 'messages', query: 'SELECT COUNT(*) as count FROM messages' },
      { name: 'wallets', query: 'SELECT COUNT(*) as count FROM wallets' },
      { name: 'wallet_transactions', query: 'SELECT COUNT(*) as count FROM wallet_transactions' },
      { name: 'demand_events', query: 'SELECT COUNT(*) as count FROM demand_events' },
      { name: 'banners', query: 'SELECT COUNT(*) as count FROM banners' },
      { name: 'flash_sales', query: 'SELECT COUNT(*) as count FROM flash_sales' },
      { name: 'permissions', query: 'SELECT COUNT(*) as count FROM permissions' },
      { name: 'role_permissions', query: 'SELECT COUNT(*) as count FROM role_permissions' },
      { name: 'category_brands', query: 'SELECT COUNT(*) as count FROM category_brands' },
      { name: 'seller_applications', query: 'SELECT COUNT(*) as count FROM seller_applications' },
      { name: 'rider_applications', query: 'SELECT COUNT(*) as count FROM rider_applications' },
      { name: 'product_requests', query: 'SELECT COUNT(*) as count FROM product_requests' },
      { name: 'product_request_history', query: 'SELECT COUNT(*) as count FROM product_request_history' },
      { name: 'disputes', query: 'SELECT COUNT(*) as count FROM disputes' },
      { name: 'dispute_messages', query: 'SELECT COUNT(*) as count FROM dispute_messages' },
      { name: 'coupon_usages', query: 'SELECT COUNT(*) as count FROM coupon_usages' },
      { name: 'payout_requests', query: 'SELECT COUNT(*) as count FROM payout_requests' },
      { name: 'otps', query: 'SELECT COUNT(*) as count FROM otps' },
    ];

    console.log('--- 1. TABLE RECORD COUNTS ---');
    const counts: Record<string, number> = {};
    for (const t of tables) {
      try {
        const res = await dataSource.query(t.query);
        const count = parseInt(res[0]?.count || '0', 10);
        counts[t.name] = count;
        console.log(`  ✓ ${t.name.padEnd(25)}: ${count} records`);
      } catch (err) {
        console.warn(`  ⚠ ${t.name.padEnd(25)}: [Table not queried or error: ${(err as Error).message}]`);
      }
    }

    // 2. Data Integrity Verification
    console.log('\n--- 2. DATA INTEGRITY CHECKS ---');
    // Check orphan order items
    const orphanItems = await dataSource.query(
      'SELECT COUNT(*) as count FROM order_items oi LEFT JOIN orders o ON oi.order_id = o.id WHERE o.id IS NULL',
    );
    console.log(`  ✓ Orphan Order Items: ${orphanItems[0]?.count || 0}`);

    // Check orphan orders
    const orphanOrders = await dataSource.query(
      'SELECT COUNT(*) as count FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE u.id IS NULL',
    );
    console.log(`  ✓ Orphan Orders without User: ${orphanOrders[0]?.count || 0}`);

    // Check order total mathematical consistency
    const invalidTotals = await dataSource.query(
      'SELECT COUNT(*) as count FROM orders WHERE total != (subtotal + delivery_fee - discount)',
    );
    console.log(`  ✓ Orders with Inconsistent Totals: ${invalidTotals[0]?.count || 0}`);

    // Check orphan disputes
    const orphanDisputes = await dataSource.query(
      'SELECT COUNT(*) as count FROM disputes d LEFT JOIN orders o ON d."orderId" = o.id WHERE o.id IS NULL',
    );
    console.log(`  ✓ Orphan Disputes without Order: ${orphanDisputes[0]?.count || 0}`);

    // Check orphan dispute messages
    const orphanDisputeMsgs = await dataSource.query(
      'SELECT COUNT(*) as count FROM dispute_messages dm LEFT JOIN disputes d ON dm."disputeId" = d.id WHERE d.id IS NULL',
    );
    console.log(`  ✓ Orphan Dispute Messages: ${orphanDisputeMsgs[0]?.count || 0}`);

    // Check orphan product request history
    const orphanReqHistory = await dataSource.query(
      'SELECT COUNT(*) as count FROM product_request_history prh LEFT JOIN product_requests pr ON prh.product_request_id = pr.id WHERE pr.id IS NULL',
    );
    console.log(`  ✓ Orphan Product Request History: ${orphanReqHistory[0]?.count || 0}`);

    // Check orphan payout requests
    const orphanPayouts = await dataSource.query(
      'SELECT COUNT(*) as count FROM payout_requests pr LEFT JOIN users u ON pr.seller_id = u.id WHERE u.id IS NULL',
    );
    console.log(`  ✓ Orphan Payout Requests without User: ${orphanPayouts[0]?.count || 0}`);

    // Check orphan coupon usages
    const orphanCouponUsages = await dataSource.query(
      'SELECT COUNT(*) as count FROM coupon_usages cu LEFT JOIN coupons c ON cu.coupon_id = c.id WHERE c.id IS NULL',
    );
    console.log(`  ✓ Orphan Coupon Usages without Coupon: ${orphanCouponUsages[0]?.count || 0}`);

    // 3. Real Authentication Flow Test
    console.log('\n--- 3. AUTHENTICATION FLOW VERIFICATION ---');
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@GramerBazar2026!';
    const shopPassword = process.env.SEED_SHOP_OWNER_PASSWORD || 'Shop@GramerBazar2026!';
    const customerPassword = process.env.SEED_CUSTOMER_PASSWORD || 'Customer@GramerBazar2026!';
    const deliveryPassword = process.env.SEED_DELIVERY_PASSWORD || 'Rider@GramerBazar2026!';

    const accountsToTest = [
      { role: 'Admin', email: 'admin@gramerbazar.example', pass: adminPassword },
      { role: 'Admin (System/E2E)', email: 'admin@gramerbazar.com', pass: 'password123' },
      { role: 'Shop Owner', email: 'shop1@gramerbazar.example', pass: shopPassword },
      { role: 'Shop Owner (Alt)', email: 'seller1@gramerbazar.com', pass: shopPassword },
      { role: 'Customer', email: 'customer1@gramerbazar.example', pass: customerPassword },
      { role: 'Customer (Alt)', email: 'customer1@gramerbazar.com', pass: customerPassword },
      { role: 'Rider / Delivery', email: 'rider1@gramerbazar.example', pass: deliveryPassword },
      { role: 'Rider / Delivery (Alt)', email: 'rider1@gramerbazar.com', pass: deliveryPassword },
    ];

    for (const acc of accountsToTest) {
      try {
        const tokens = await authService.loginWithPassword(acc.email, acc.pass);
        if (tokens && tokens.accessToken) {
          console.log(`  ✅ [${acc.role}] Login successful for ${acc.email} (JWT Token Issued)`);
        } else {
          console.error(`  ❌ [${acc.role}] Login failed for ${acc.email} (No token returned)`);
        }
      } catch (err) {
        console.error(`  ❌ [${acc.role}] Login failed for ${acc.email}: ${(err as Error).message}`);
      }
    }

    console.log('\n==========================================');
    console.log('✅ DATABASE VERIFICATION COMPLETE');
    console.log('==========================================\n');
  } catch (error) {
    console.error('Verification failed:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

void bootstrap();
