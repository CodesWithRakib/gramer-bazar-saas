import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { ReviewsService } from '../reviews/reviews.service.js';
import { DataSource } from 'typeorm';
import { Product } from '../catalog/entities/product.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Order } from '../orders/entities/order.entity.js';
import { OrderItem } from '../orders/entities/order-item.entity.js';
import { SellerProduct } from '../inventory/entities/seller-product.entity.js';
import { ProductVariant } from '../catalog/entities/product-variant.entity.js';
import { OrderStatus, PaymentMethod } from '../orders/enums/order-status.enum.js';
import { Address } from '../addresses/entities/address.entity.js';

function generateRandomString(length: number = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
}

async function bootstrap() {
  console.log('Starting Review Concurrency Test...');
  process.env.PERFORMANCE_DB = 'true'; // Allow operations on DB
  
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const reviewsService = app.get(ReviewsService);
  const dataSource = app.get(DataSource);

  let successCount = 0;
  let failCount = 0;
  let deadlocks = 0;

  try {
    // 1. Setup mock data
    console.log('Setting up mock product and users...');
    const product = await dataSource.getRepository(Product).findOne({
      where: { isActive: true },
    });
    
    if (!product) throw new Error('No product found for test');

    const productId = product.id;
    
    // We need some users who have "purchased" this product to pass the validation check in addReview
    const users: User[] = [];
    const concurrency = 20;

    // We'll insert users directly
    for (let i = 0; i < concurrency; i++) {
      const user = await dataSource.getRepository(User).save({
        email: `testuser_${generateRandomString()}@example.com`,
        password: 'password',
        firstName: 'Test',
        lastName: `User${i}`,
        phone: `+88017${Math.floor(10000000 + Math.random() * 90000000)}`,
      });
      users.push(user);
    }

    // Give them a completed order for this product so they can review it
    // First, find a variant and seller product for this product
    const pv = await dataSource.getRepository(ProductVariant).findOne({ where: { productId } });
    if (!pv) throw new Error('No product variant found');
    
    const sp = await dataSource.getRepository(SellerProduct).findOne({ where: { productVariantId: pv.id } });
    if (!sp) throw new Error('No seller product found');

    const countries = await dataSource.query('SELECT id FROM countries LIMIT 1');
    const countryId = countries[0]?.id || '00000000-0000-0000-0000-000000000000'; // Fallback if no country found

    for (const user of users) {
      const address = await dataSource.getRepository(Address).save({
        userId: user.id,
        title: 'Home',
        contactName: 'Test',
        contactPhone: '01700000000',
        streetAddress: '123 Test St',
        city: 'Dhaka',
        zone: 'Gulshan',
        countryId: countryId,
        phone: '01700000000',
        isDefault: true,
      });

      const order = await dataSource.getRepository(Order).save({
        userId: user.id,
        status: OrderStatus.DELIVERED,
        subtotal: 100,
        total: 100,
        totalAmount: 100,
        currency: 'BDT',
        addressId: address.id,
        paymentMethod: PaymentMethod.COD,
      });
      
      await dataSource.getRepository(OrderItem).save({
        orderId: order.id,
        sellerProductId: sp.id,
        shopId: sp.shopId,
        quantity: 1,
        unitPrice: 100,
        subtotal: 100,
      });
    }

    // 2. Fire concurrent requests
    console.log(`Firing ${concurrency} concurrent addReview requests...`);
    const promises = users.map(async (user) => {
      try {
        await reviewsService.addReview(
          user.id,
          productId,
          Math.floor(Math.random() * 5) + 1, // Random rating 1-5
          'Great product!',
        );
        successCount++;
      } catch (err: any) {
        if (err.message?.includes('deadlock') || err.message?.includes('serialization')) {
          deadlocks++;
        }
        failCount++;
      }
    });

    await Promise.all(promises);

    console.log(`Operations completed. Success: ${successCount}, Failed: ${failCount}, Deadlocks: ${deadlocks}`);

    // 3. Verify Integrity
    console.log('Verifying integrity...');
    const finalProduct = await dataSource.getRepository(Product).findOne({ where: { id: productId } });
    
    const [{ total, average }] = await dataSource.query(`
      SELECT 
        COUNT(*)::int as total, 
        COALESCE(ROUND(AVG(rating)::numeric, 2), 0) as average 
      FROM reviews 
      WHERE product_id = $1 AND is_approved = true
    `, [productId]);

    console.log('--- Result ---');
    console.log(`Denormalized  -> total_reviews: ${finalProduct?.totalReviews}, average_rating: ${finalProduct?.averageRating}`);
    console.log(`Authoritative -> total_reviews: ${total}, average_rating: ${average}`);

    if (finalProduct?.totalReviews === total && Number(finalProduct?.averageRating) === Number(average)) {
      console.log('✅ Aggregate Mismatch: false');
    } else {
      console.log('❌ Aggregate Mismatch: TRUE');
    }

    // 4. Test Rollback
    console.log('\\nTesting Rollback...');
    // We will simulate a failure in recalculate by forcing an error or we can just test if invalid review fails.
    // Since addReview is inside a transaction, if we throw after save, the review should roll back.
    // To test this easily, we can try to add a duplicate review from the same user. The duplicate check runs first, so no mutation happens.
    // Let's create a custom transaction that fails.
    
    let rollbackSuccess = false;
    const userForRollback = users[0];
    const initialReviews = await dataSource.query(`SELECT COUNT(*) FROM reviews WHERE user_id = $1`, [userForRollback.id]);

    try {
      await dataSource.transaction(async (manager) => {
        // Mutate review
        await manager.query(`INSERT INTO reviews (id, product_id, user_id, rating, is_approved) VALUES (gen_random_uuid(), $1, $2, 5, true)`, [productId, userForRollback.id]);
        
        // Update product aggregate
        await manager.query(`UPDATE products SET total_reviews = 9999 WHERE id = $1`, [productId]);

        // Throw error
        throw new Error('INTENTIONAL_ROLLBACK_ERROR');
      });
    } catch (e: any) {
      if (e.message === 'INTENTIONAL_ROLLBACK_ERROR') {
        rollbackSuccess = true;
      }
    }

    const finalReviews = await dataSource.query(`SELECT COUNT(*) FROM reviews WHERE user_id = $1`, [userForRollback.id]);
    const finalProduct2 = await dataSource.getRepository(Product).findOne({ where: { id: productId } });

    console.log(`Rollback Integrity: review count unchanged? ${initialReviews[0].count === finalReviews[0].count}`);
    console.log(`Rollback Integrity: aggregate unchanged? ${finalProduct?.totalReviews === finalProduct2?.totalReviews}`);
    
  } catch (err) {
    console.error('Test failed with error:', err);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
