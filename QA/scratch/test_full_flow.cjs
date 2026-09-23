const API = 'http://localhost:4000/api/v1';

async function fetchJSON(url, options = {}) {
  const res = await fetch(API + url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers }
  });
  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`HTTP Error: ${res.status} on ${url}\nBody: ${errorBody}`);
    throw new Error(`HTTP Error: ${res.status}`);
  }
  return res.json();
}

async function runTest() {
  console.log("--- Starting E2E Flow Test ---\n");

  // 1. Customer Login
  console.log("1. Customer logging in...");
  const custLogin = await fetchJSON('/auth/login', { method: 'POST', body: JSON.stringify({ emailOrPhone: '01800000000', password: '123456' }) });
  const custToken = custLogin.accessToken;
  console.log("Customer logged in successfully.");

  // Get Customer Addresses
  const addresses = await fetchJSON('/addresses', { headers: { 'Authorization': `Bearer ${custToken}` } });
  if (addresses.length === 0) {
    console.error("Customer has no address setup. Test failed.");
    return;
  }
  const addressId = addresses[0].id;
  
  // 2. Customer places order
  console.log("2. Customer placing order...");
  // Let's get a product first
  const prods = await fetchJSON('/inventory');
  const productId = prods[0].sellerProductId;
  
  const checkoutData = await fetchJSON('/orders/checkout', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${custToken}` },
    body: JSON.stringify({
      addressId,
      paymentMethod: "COD",
      items: [{ sellerProductId: productId, quantity: 1 }]
    })
  });
  const orderId = checkoutData.order.id;
  console.log(`Order placed successfully. Order ID: ${orderId}`);

  // 3. Admin Login
  console.log("\n3. Super Admin logging in...");
  const adminLogin = await fetchJSON('/auth/login', { method: 'POST', body: JSON.stringify({ emailOrPhone: '01700000000', password: '123456' }) });
  const adminToken = adminLogin.accessToken;
  
  // Admin confirms order
  console.log("Admin changing order status to CONFIRMED...");
  await fetchJSON(`/orders/admin/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'CONFIRMED' })
  });

  // Admin gets rider
  console.log("Admin fetching riders list...");
  const riders = await fetchJSON('/deliveries/admin/riders', { headers: { 'Authorization': `Bearer ${adminToken}` } });
  const testRider = riders.find(r => r.phone === '01500000000');
  if (!testRider) {
    console.error("Test rider not found!");
    return;
  }

  // Admin assigns rider
  console.log(`Admin assigning rider ${testRider.firstName} to order...`);
  const delivery = await fetchJSON('/deliveries/admin/assign', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ orderId, riderId: testRider.id })
  });
  const deliveryId = delivery.id;
  console.log(`Order assigned successfully. Delivery ID: ${deliveryId}`);

  // 4. Rider Login
  console.log("\n4. Rider logging in...");
  const riderLogin = await fetchJSON('/auth/login', { method: 'POST', body: JSON.stringify({ emailOrPhone: '01500000000', password: '123456' }) });
  const riderToken = riderLogin.accessToken;

  // Rider accepts & picks up
  console.log("Rider accepting delivery...");
  await fetchJSON(`/deliveries/rider/${deliveryId}/status`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${riderToken}` },
    body: JSON.stringify({ status: 'ACCEPTED' })
  });
  
  console.log("Rider picked up the order...");
  await fetchJSON(`/deliveries/rider/${deliveryId}/status`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${riderToken}` },
    body: JSON.stringify({ status: 'PICKED_UP' })
  });

  console.log("Rider is out for delivery...");
  await fetchJSON(`/deliveries/rider/${deliveryId}/status`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${riderToken}` },
    body: JSON.stringify({ status: 'OUT_FOR_DELIVERY' })
  });
  
  console.log("Rider delivered the package...");
  await fetchJSON(`/deliveries/rider/${deliveryId}/status`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${riderToken}` },
    body: JSON.stringify({ status: 'DELIVERED' })
  });

  // 5. Customer verifies
  console.log("\n5. Customer verifying final order state...");
  const finalOrder = await fetchJSON(`/orders/${orderId}`, { headers: { 'Authorization': `Bearer ${custToken}` } });
  
  console.log(`Final Order Status: ${finalOrder.status}`);
  console.log(`Final Payment Status: ${finalOrder.paymentStatus}`);
  
  if (finalOrder.status === 'DELIVERED' && finalOrder.paymentStatus === 'PAID') {
    console.log("\n✅ E2E FLOW TEST PASSED PERFECTLY! ✅");
  } else {
    console.log("\n❌ TEST FAILED. Statuses didn't sync correctly. ❌");
  }
}

runTest().catch(console.error);
